import { neon } from '@neondatabase/serverless';
import type { Product1WizardConfig, NeonOrderRow, OrderStatus } from '../src/types/shop.ts';
import {
  validateAndCalculateOrder,
  verifySignedOrderCode,
} from './_shopRules.ts';

// In-memory fallback cache for development/test environments when DATABASE_URL is not configured
const memoryOrdersTable = new Map<string, NeonOrderRow>();

/**
 * Returns a Neon SQL execution instance, or null if DATABASE_URL is unset.
 */
function getNeonSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !dbUrl.trim()) {
    return null;
  }
  return neon(dbUrl);
}

/**
 * Initializes the orders table schema on Neon PostgreSQL if not already present.
 */
async function ensureOrdersTable() {
  const sql = getNeonSql();
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      customer_name VARCHAR(150) NOT NULL,
      config JSONB NOT NULL,
      price_snapshot_inr INTEGER NOT NULL,
      promo_used VARCHAR(50) DEFAULT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export interface ConfirmOrderInput {
  orderCode: string;
  customerName: string;
  config: Product1WizardConfig;
  status?: OrderStatus;
}

export interface OrderOperationResult {
  success: boolean;
  order?: NeonOrderRow;
  orders?: NeonOrderRow[];
  error?: string;
}

/**
 * Confirms an order into the Neon orders database.
 * Admin-only operation. Verifies the cryptographic HMAC signature in the order code,
 * verifies full configuration compatibility and price consistency, and commits to the database.
 */
export async function confirmOrder(input: ConfirmOrderInput): Promise<OrderOperationResult> {
  const { orderCode, customerName, config, status = 'pending' } = input;

  if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
    return { success: false, error: 'Customer name is required' };
  }
  const cleanCustomerName = customerName.trim();

  const allowedStatuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];
  if (!allowedStatuses.includes(status)) {
    return { success: false, error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` };
  }

  // 1. Verify the cryptographic HMAC signature on the order code
  const codeVerification = verifySignedOrderCode(orderCode);
  if (!codeVerification.valid || !codeVerification.orderId || codeVerification.priceInr === undefined) {
    return {
      success: false,
      error: codeVerification.error || 'Invalid or tampered order code',
    };
  }

  // 2. Validate the hardware configuration and recalculate authoritative price
  const configCalculation = validateAndCalculateOrder(config);
  if (!configCalculation.valid) {
    return {
      success: false,
      error: `Invalid hardware configuration: ${configCalculation.error}`,
    };
  }

  // 3. Verify that the configuration hash matches the code's embedded configHash
  if (configCalculation.bill.configHash !== codeVerification.configHash) {
    return {
      success: false,
      error: 'Security Violation: Configuration hash mismatch. The submitted config does not match the signed order code.',
    };
  }

  // 4. Verify that the price in the signed order code matches server-calculated total
  if (configCalculation.bill.finalTotalInr !== codeVerification.priceInr) {
    return {
      success: false,
      error: `Security Violation: Price mismatch. Code carries ₹${codeVerification.priceInr}, but calculated total is ₹${configCalculation.bill.finalTotalInr}.`,
    };
  }

  const orderId = codeVerification.orderId;
  const priceSnapshotInr = codeVerification.priceInr;
  const promoUsed = codeVerification.promoUsed || null;

  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureOrdersTable();

      // Check if order already exists in Neon
      const existing = await sql`
        SELECT id FROM orders WHERE id = ${orderId} LIMIT 1
      `;
      if (existing.length > 0) {
        return { success: false, error: `Order with ID "${orderId}" has already been confirmed.` };
      }

      const rows = await sql`
        INSERT INTO orders (
          id,
          customer_name,
          config,
          price_snapshot_inr,
          promo_used,
          status,
          created_at
        ) VALUES (
          ${orderId},
          ${cleanCustomerName},
          ${JSON.stringify(configCalculation.config)},
          ${priceSnapshotInr},
          ${promoUsed},
          ${status},
          NOW()
        )
        RETURNING id, customer_name, config, price_snapshot_inr, promo_used, status, created_at
      `;

      return {
        success: true,
        order: rows[0] as NeonOrderRow,
      };
    } catch (err: unknown) {
      console.error('[Neon Orders] Failed to insert order:', err);
      return { success: false, error: 'Database error while saving order to Neon PostgreSQL' };
    }
  }

  // Fallback memory store when DATABASE_URL is not set in local dev
  if (memoryOrdersTable.has(orderId)) {
    return { success: false, error: `Order with ID "${orderId}" has already been confirmed.` };
  }

  const newOrder: NeonOrderRow = {
    id: orderId,
    customer_name: cleanCustomerName,
    config: configCalculation.config,
    price_snapshot_inr: priceSnapshotInr,
    promo_used: promoUsed,
    status,
    created_at: new Date().toISOString(),
  };

  memoryOrdersTable.set(orderId, newOrder);
  return { success: true, order: newOrder };
}

/**
 * Lists all orders from the Neon database.
 * Sorted by urgency: paid -> pending -> shipped -> delivered, then created_at DESC.
 */
export async function listOrders(): Promise<OrderOperationResult> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureOrdersTable();
      const rows = await sql`
        SELECT id, customer_name, config, price_snapshot_inr, promo_used, status, created_at
        FROM orders
        ORDER BY
          CASE status
            WHEN 'paid' THEN 1
            WHEN 'pending' THEN 2
            WHEN 'shipped' THEN 3
            WHEN 'delivered' THEN 4
            ELSE 5
          END ASC,
          created_at DESC
      `;
      return { success: true, orders: rows as NeonOrderRow[] };
    } catch (err: unknown) {
      console.error('[Neon Orders] Failed to query orders:', err);
      return { success: false, error: 'Database error while querying Neon orders' };
    }
  }

  const statusPriority: Record<OrderStatus, number> = {
    paid: 1,
    pending: 2,
    shipped: 3,
    delivered: 4,
  };

  const orders = Array.from(memoryOrdersTable.values()).sort((a, b) => {
    const pA = statusPriority[a.status] || 5;
    const pB = statusPriority[b.status] || 5;
    if (pA !== pB) return pA - pB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return { success: true, orders };
}

/**
 * Updates the fulfillment status of an existing order in Neon.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderOperationResult> {
  const allowedStatuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];
  if (!allowedStatuses.includes(status)) {
    return { success: false, error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` };
  }

  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureOrdersTable();
      const rows = await sql`
        UPDATE orders
        SET status = ${status}
        WHERE id = ${orderId}
        RETURNING id, customer_name, config, price_snapshot_inr, promo_used, status, created_at
      `;
      if (rows.length === 0) {
        return { success: false, error: `Order "${orderId}" not found` };
      }
      return { success: true, order: rows[0] as NeonOrderRow };
    } catch (err: unknown) {
      console.error('[Neon Orders] Failed to update status:', err);
      return { success: false, error: 'Database error while updating order status in Neon' };
    }
  }

  const order = memoryOrdersTable.get(orderId);
  if (!order) {
    return { success: false, error: `Order "${orderId}" not found` };
  }

  order.status = status;
  memoryOrdersTable.set(orderId, order);
  return { success: true, order };
}

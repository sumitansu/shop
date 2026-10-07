import crypto from 'crypto';
import type {
  FirmwareVersion,
  AntennaModuleQuality,
  AntennaType,
  Product1WizardConfig,
  CalculatedBillItem,
  ServerCalculatedBill,
} from '../src/types/shop.ts';

/**
 * STAGE 8 - Core Security Rules for DoRaemon's Shop:
 * 1. Prices, totals and option costs are computed server-side ONLY. Client prices are never accepted.
 * 2. Wizard choices are validated against strict server-side allow-lists & hardware compatibility constraints.
 * 3. Orders get cryptographically secure server-generated IDs.
 * 4. Hosted payment provider rule: Never accept or store credit card / PAN / CVV data.
 */

// Official Server-Side Price Table (INR)
export const SHOP_PRICES_INR = {
  CORE_MODULE_KIT: 700,
  FIRMWARE: {
    v1: 100,
    v2: 300,
  },
  DISPLAY: {
    no: 0,
    yes: 300,
  },
  WIRELESS_CONTROL: {
    no: 0,
    yes: 700, // V2 only
  },
  V2_ANTENNA_BASE_PRICE: 50, // Per antenna on V2
  ANTENNA_MODULE: {
    normal: 200,
    powerful: 700,
  },
  ANTENNA_TYPE: {
    '0dbi': 100, // Free if coupled with normal module
    '6dbi': 150,
    '12dbi': 450,
  },
} as const;

// Allow-Lists
export const ALLOWED_FIRMWARE: readonly FirmwareVersion[] = ['v1', 'v2'];
export const ALLOWED_MODULES: readonly AntennaModuleQuality[] = ['normal', 'powerful'];
export const ALLOWED_ANTENNA_TYPES: readonly AntennaType[] = ['0dbi', '6dbi', '12dbi'];

export interface ValidationSuccess {
  valid: true;
  config: Product1WizardConfig;
  bill: ServerCalculatedBill;
}

export interface ValidationFailure {
  valid: false;
  error: string;
}

export type WizardValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates a wizard payload against server allow-lists, checks hardware compatibility,
 * and computes the authoritative itemized bill entirely on the server.
 */
export function validateAndCalculateOrder(payload: unknown): WizardValidationResult {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Order payload must be a JSON object' };
  }

  const data = payload as Record<string, unknown>;

  // Security Rule 4: Reject any sensitive cardholder data immediately
  if (
    'cardNumber' in data ||
    'pan' in data ||
    'cvv' in data ||
    'cvc' in data ||
    'expiry' in data ||
    'cardholder' in data
  ) {
    return {
      valid: false,
      error: 'Security Violation: Card data cannot be submitted. All transactions must use a hosted payment provider.',
    };
  }

  if (data.productId !== 'product-1-2.4ghz') {
    return { valid: false, error: 'Invalid or unsupported productId' };
  }

  // Validate Firmware
  if (typeof data.firmware !== 'string' || !ALLOWED_FIRMWARE.includes(data.firmware as FirmwareVersion)) {
    return { valid: false, error: `Invalid firmware. Allowed: ${ALLOWED_FIRMWARE.join(', ')}` };
  }
  const firmware = data.firmware as FirmwareVersion;

  // Validate Display
  if (typeof data.hasDisplay !== 'boolean') {
    return { valid: false, error: 'hasDisplay must be a boolean' };
  }
  const hasDisplay = data.hasDisplay;

  // Validate Wireless Control
  if (typeof data.hasWirelessControl !== 'boolean') {
    return { valid: false, error: 'hasWirelessControl must be a boolean' };
  }
  const hasWirelessControl = data.hasWirelessControl;

  // Hardware Compatibility Rule: V1 cannot have wireless control
  if (firmware === 'v1' && hasWirelessControl) {
    return {
      valid: false,
      error: 'Incompatible configuration: Wireless Control requires Firmware V2. Upgrade to V2 to enable wireless control.',
    };
  }

  // Validate Antenna Count
  if (typeof data.antennaCount !== 'number' || !Number.isInteger(data.antennaCount)) {
    return { valid: false, error: 'antennaCount must be an integer' };
  }
  const antennaCount = data.antennaCount;

  // Hardware Compatibility Rule: V1 is fixed at 2 antennas
  if (firmware === 'v1' && antennaCount !== 2) {
    return {
      valid: false,
      error: 'Incompatible configuration: Firmware V1 supports exactly 2 antennas. Upgrade to V2 for 1 to 4 antennas.',
    };
  }

  if (firmware === 'v2' && (antennaCount < 1 || antennaCount > 4)) {
    return { valid: false, error: 'Firmware V2 supports between 1 and 4 antennas' };
  }

  // Validate Antennas Array
  if (!Array.isArray(data.antennas) || data.antennas.length !== antennaCount) {
    const currentLength = Array.isArray(data.antennas) ? data.antennas.length : 0;
    return {
      valid: false,
      error: `Antennas array length (${currentLength}) must match antennaCount (${antennaCount})`,
    };
  }

  const cleanAntennas = [];
  for (let i = 0; i < antennaCount; i++) {
    const ant = data.antennas[i];
    if (!ant || typeof ant !== 'object') {
      return { valid: false, error: `Antenna #${i + 1} must be an object with module and type` };
    }

    if (!ALLOWED_MODULES.includes(ant.module as AntennaModuleQuality)) {
      return { valid: false, error: `Antenna #${i + 1} module must be one of: ${ALLOWED_MODULES.join(', ')}` };
    }

    if (!ALLOWED_ANTENNA_TYPES.includes(ant.type as AntennaType)) {
      return { valid: false, error: `Antenna #${i + 1} type must be one of: ${ALLOWED_ANTENNA_TYPES.join(', ')}` };
    }

    cleanAntennas.push({
      module: ant.module as AntennaModuleQuality,
      type: ant.type as AntennaType,
    });
  }

  const cleanConfig: Product1WizardConfig = {
    productId: 'product-1-2.4ghz',
    firmware,
    hasDisplay,
    hasWirelessControl,
    antennaCount,
    antennas: cleanAntennas,
  };

  // =========================================================================
  // Server-Authoritative Price Calculation (Zero trust in client prices)
  // =========================================================================
  const lineItems: CalculatedBillItem[] = [];

  // 1. Mandatory Core Module Kit
  lineItems.push({
    key: 'core_kit',
    name: 'Core module kit',
    unitPriceInr: SHOP_PRICES_INR.CORE_MODULE_KIT,
    quantity: 1,
    totalPriceInr: SHOP_PRICES_INR.CORE_MODULE_KIT,
    note: 'Mandatory standard components kit',
  });

  // 2. Firmware
  const fwPrice = SHOP_PRICES_INR.FIRMWARE[firmware];
  lineItems.push({
    key: `firmware_${firmware}`,
    name: `Firmware (${firmware.toUpperCase()})`,
    unitPriceInr: fwPrice,
    quantity: 1,
    totalPriceInr: fwPrice,
  });

  // 3. Display
  if (hasDisplay) {
    lineItems.push({
      key: 'display',
      name: 'OLED Display Module',
      unitPriceInr: SHOP_PRICES_INR.DISPLAY.yes,
      quantity: 1,
      totalPriceInr: SHOP_PRICES_INR.DISPLAY.yes,
    });
  }

  // 4. Wireless Control (V2 only)
  if (hasWirelessControl && firmware === 'v2') {
    lineItems.push({
      key: 'wireless_control',
      name: 'Wireless Control Module',
      unitPriceInr: SHOP_PRICES_INR.WIRELESS_CONTROL.yes,
      quantity: 1,
      totalPriceInr: SHOP_PRICES_INR.WIRELESS_CONTROL.yes,
    });
  }

  // 5. Antennas Base Count (For V2, ₹50 each)
  if (firmware === 'v2') {
    lineItems.push({
      key: 'antenna_mounts',
      name: `Antenna Hardware Mounts (${antennaCount}x)`,
      unitPriceInr: SHOP_PRICES_INR.V2_ANTENNA_BASE_PRICE,
      quantity: antennaCount,
      totalPriceInr: SHOP_PRICES_INR.V2_ANTENNA_BASE_PRICE * antennaCount,
    });
  }

  // 6. Antenna Quality Modules & Types (Per Antenna)
  cleanAntennas.forEach((ant, idx) => {
    // Module quality
    const modPrice = SHOP_PRICES_INR.ANTENNA_MODULE[ant.module];
    lineItems.push({
      key: `ant_${idx + 1}_mod_${ant.module}`,
      name: `Antenna #${idx + 1} Module (${ant.module.charAt(0).toUpperCase() + ant.module.slice(1)})`,
      unitPriceInr: modPrice,
      quantity: 1,
      totalPriceInr: modPrice,
    });

    // Antenna type (0dbi is ₹0 if module is normal)
    let typePrice: number = SHOP_PRICES_INR.ANTENNA_TYPE[ant.type];
    let note: string | undefined;
    if (ant.type === '0dbi' && ant.module === 'normal') {
      typePrice = 0;
      note = 'Complimentary with Normal Module';
    }

    lineItems.push({
      key: `ant_${idx + 1}_type_${ant.type}`,
      name: `Antenna #${idx + 1} Type (${ant.type})`,
      unitPriceInr: typePrice,
      quantity: 1,
      totalPriceInr: typePrice,
      note,
    });
  });

  const baseTotalInr = lineItems.reduce((acc, item) => acc + item.totalPriceInr, 0);
  const discountInr = 0; // Promo engine applied separately on server
  const finalTotalInr = Math.max(0, baseTotalInr - discountInr);

  // Security Rule 3: Cryptographically secure server-generated Order ID
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const configHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(cleanConfig))
    .digest('hex')
    .slice(0, 16);

  const promoUsed = typeof data.promoCode === 'string' ? data.promoCode.trim().toUpperCase() : null;
  const orderCodeSignature = createOrderHmac(orderId, finalTotalInr, configHash, promoUsed || '');
  const promoSlug = promoUsed ? promoUsed : 'NOPROMO';
  const orderCode = `ORDCODE_${orderId}_${finalTotalInr}_${configHash}_${promoSlug}_${orderCodeSignature}`;

  const bill: ServerCalculatedBill = {
    orderId,
    orderCode,
    productId: 'product-1-2.4ghz',
    currency: 'INR',
    baseTotalInr,
    discountInr,
    finalTotalInr,
    lineItems,
    shippingNotice: 'shipping charges may apply',
    configHash,
    createdAt: new Date().toISOString(),
  };

  return {
    valid: true,
    config: cleanConfig,
    bill,
  };
}

export const ORDER_SIGNING_SECRET =
  process.env.ORDER_SIGNING_SECRET ||
  process.env.BLOB_READ_WRITE_TOKEN ||
  'doraemon-shop-secure-hmac-salt-key-2026';

export function createOrderHmac(
  orderId: string,
  priceInr: number,
  configHash: string,
  promo: string = ''
): string {
  const data = `${orderId}:${priceInr}:${configHash}:${promo}`;
  return crypto.createHmac('sha256', ORDER_SIGNING_SECRET).update(data).digest('hex').slice(0, 16);
}

export interface VerifyOrderCodeResult {
  valid: boolean;
  orderId?: string;
  priceInr?: number;
  configHash?: string;
  promoUsed?: string | null;
  error?: string;
}

export function verifySignedOrderCode(orderCode: string): VerifyOrderCodeResult {
  if (!orderCode || typeof orderCode !== 'string') {
    return { valid: false, error: 'Order code is required and must be a string' };
  }

  const parts = orderCode.trim().split('_');
  if (parts.length !== 6 || parts[0] !== 'ORDCODE') {
    return { valid: false, error: 'Invalid order code format (expected ORDCODE_<id>_<price>_<hash>_<promo>_<sig>)' };
  }

  const [, orderId, priceStr, configHash, promoSlug, receivedSignature] = parts;
  const priceInr = parseInt(priceStr, 10);
  if (isNaN(priceInr) || priceInr < 0) {
    return { valid: false, error: 'Invalid price encoded in order code' };
  }

  const promo = promoSlug === 'NOPROMO' ? '' : promoSlug;
  const expectedSignature = createOrderHmac(orderId, priceInr, configHash, promo);

  if (receivedSignature !== expectedSignature) {
    return {
      valid: false,
      error: 'Security Violation: Order code signature mismatch. The price or configuration has been tampered with.',
    };
  }

  return {
    valid: true,
    orderId,
    priceInr,
    configHash,
    promoUsed: promo || null,
  };
}

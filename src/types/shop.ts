/**
 * DoRaemon's Shop - Product & Order Data Types
 * Security Directive Stage 8: Server-authoritative pricing and allow-list schemas.
 */

export type FirmwareVersion = 'v1' | 'v2';
export type AntennaModuleQuality = 'normal' | 'powerful';
export type AntennaType = '0dbi' | '6dbi' | '12dbi';

export interface AntennaConfig {
  module: AntennaModuleQuality;
  type: AntennaType;
}

export interface Product1WizardConfig {
  productId: 'product-1-2.4ghz';
  firmware: FirmwareVersion;
  hasDisplay: boolean;
  hasWirelessControl: boolean;
  antennaCount: number;
  antennas: AntennaConfig[];
}

export interface CalculatedBillItem {
  key: string;
  name: string;
  unitPriceInr: number;
  quantity: number;
  totalPriceInr: number;
  note?: string;
}

export interface ServerCalculatedBill {
  orderId: string;
  productId: string;
  currency: 'INR';
  baseTotalInr: number;
  discountInr: number;
  finalTotalInr: number;
  lineItems: CalculatedBillItem[];
  shippingNotice: string;
  configHash: string;
  createdAt: string;
}

export interface ServerOrderRecord {
  orderId: string;
  userId?: string;
  customerSessionHash: string;
  config: Product1WizardConfig;
  bill: ServerCalculatedBill;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  createdAt: string;
}

// ============================================================
// SHARED TYPES
// ============================================================

export type EnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Quotation Sent'
  | 'Negotiation'
  | 'Confirmed'
  | 'Rejected'
  | 'Completed';

export interface PricingSnapshot {
  buses: number;
  months: number;
  videoDurationSeconds: number;
  standardPrice: number;
  packagePrice: number;
  savings: number;
  savingsPercentage: number;
  durationMultiplier: number;
  durationDiscountRate: number;
  pricingMethod: string;
  pricePerBusCampaign: number;
  pricePerBusMonth: number;
  pricePerBusDay: number;
  pricePerSecondBusMonth?: number;
  pricePerSecondBusCampaign?: number;
}

export interface CustomerDetails {
  businessName: string;
  contactName: string;
  phone: string;
  email?: string;
  businessCategory?: string;
  campaignStartDate?: string;
  notes?: string;
}

export interface Enquiry {
  id: string;
  status: EnquiryStatus;
  customerDetails: CustomerDetails;
  pricingSnapshot: PricingSnapshot;
  quotationId?: string;
  adminNotes?: string;
  negotiatedPrice?: number;
  negotiationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  enquiryId?: string;
  customerDetails: CustomerDetails;
  pricingSnapshot: PricingSnapshot;
  validUntil: string;
  createdAt: string;
  taxAmount?: number;
  taxRate?: number;
  totalWithTax?: number;
}

export interface BusRecord {
  id: string;
  busNumber: number;
  internalName: string;
  route: string;
  available: boolean;
  notes: string;
}

export interface Fleet {
  totalBuses: number;
  buses: BusRecord[];
}

export interface PricingSettings {
  standardRatePerSecond: number;
  standardRatePerBusPerMonth30s: number;
  maxBuses: number;
  maxMonths: number;
  quotationValidityDays: number;
  taxEnabled: boolean;
  taxRate: number;
  taxLabel: string;
  taxInclusive: boolean;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  revenueTarget: number;
  revenueTargetPeriodLabel: string;
  updatedAt: string;
}

export interface CampaignConfig {
  buses: number;
  months: number;
  videoDurationSeconds: number;
  startDate?: string;
}

// ============================================================
// SHARED TYPES — CATGORITHM BUS ADVERTISING PLATFORM
// ============================================================

export type EnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Quotation Sent'
  | 'Negotiation'
  | 'Confirmed'
  | 'Rejected'
  | 'Completed';

export type CampaignStatus = 'Scheduled' | 'Active' | 'Completed' | 'Archived';

export interface CampaignTheme {
  primaryColor: string;       // e.g. '#070B14' (midnight navy)
  secondaryColor: string;     // e.g. '#0F172A'
  accentColor: string;        // e.g. '#D4AF37' (champagne gold)
  goldColor?: string;         // e.g. '#F3C669'
  textColor: string;          // e.g. '#F8FAFC'
  coverBadge?: string;        // e.g. 'SEASONAL SPOTLIGHT'
  style: 'standard' | 'winter-spotlight' | 'custom';
}

export interface CampaignMessaging {
  headline: string;           // 'WINTER SPOTLIGHT 2026–27'
  subheadline: string;        // 'CATGORITHM PRESENTS'
  tagline: string;            // 'Your Brand. The Season. The Spotlight.'
  seasonalThemes?: string[];  // ['Black Friday', 'Christmas', 'New Year', 'End-of-Season Sales']
  supportingCopy: string;     // 'Make your brand part of the season with Catgorithm\'s bus-screen advertising packages.'
  additionalCopy?: string;    // 'One campaign. A season full of opportunities.'
  offerTitle: string;         // 'Winter Spotlight Special Package'
}

export interface CampaignQuotationSettings {
  enableSeasonalCover: boolean;
  coverTitle: string;
  quotationValidityDays: number;
}

export interface Campaign {
  id: string;                 // 'winter-spotlight-2026' or 'standard'
  slug: string;
  name: string;               // 'Winter Spotlight 2026–27'
  tagline: string;
  description: string;
  startDate: string;          // '2026-11-20'
  endDate: string;            // '2027-01-20'
  defaultBilledMonths: number;// 2
  status: CampaignStatus;
  theme: CampaignTheme;
  messaging: CampaignMessaging;
  quotationSettings: CampaignQuotationSettings;
  isDefault?: boolean;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  campaignEndDate?: string;
  notes?: string;
}

export interface Enquiry {
  id: string;
  status: EnquiryStatus;
  customerDetails: CustomerDetails;
  pricingSnapshot: PricingSnapshot;
  quotationId?: string;
  campaignId?: string;
  campaignName?: string;
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
  campaignId?: string;
  campaignName?: string;
  campaignStartDate?: string;
  campaignEndDate?: string;
  billedMonths?: number;
  campaignThemeSnapshot?: CampaignTheme;
  campaignMessagingSnapshot?: CampaignMessaging;
  validUntil: string;
  createdAt: string;
  taxAmount?: number;
  taxRate?: number;
  totalWithTax?: number;
}

export interface SlotBooking {
  id: string;
  clientName: string;
  slotsCount: number;         // e.g. 1 to 10
  videoDurationSeconds?: number; // 30s per slot standard
  campaignName?: string;
  startDate: string;          // ISO date YYYY-MM-DD
  endDate: string;            // ISO date YYYY-MM-DD
  notes?: string;
  createdAt?: string;
}

export interface BusRecord {
  id: string;
  busNumber: string;        // Registration / Bus Plate No: e.g. 'KL-02-AB-1234'
  busName: string;          // Bus Name: e.g. 'Royal Travels'
  routeStart: string;       // Route origin / start: e.g. 'Kollam KSRTC'
  routeEnd: string;         // Route destination / end: e.g. 'Karunagappally'
  intermediateStops: string;// Major intermediate stops: e.g. 'Chavara, Neendakara, Titanium'
  route?: string;           // Formatted summary route: e.g. 'Kollam ➔ Karunagappally'
  internalName?: string;    // Backward compatibility
  available: boolean;
  totalSlots: number;       // Total ad slots per loop (Default: 10 slots, 30s each)
  slotBookings?: SlotBooking[];
  notes?: string;
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
  campaignId: string;
  startDate: string;
  endDate: string;
}

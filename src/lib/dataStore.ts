// ============================================================
// DATA STORE — In-memory persistence layer
// Replaces Supabase when credentials aren't configured.
// The interface matches a Supabase-compatible API so the
// real backend can be swapped in without touching the UI.
// ============================================================

import type { Enquiry, Quotation, PricingSettings, Fleet } from '../types';

// Dev mode flag — set true when Supabase is not configured
export const IS_DEV_MODE = true;

// ============================================================
// IN-MEMORY STORE
// ============================================================
let enquiries: Enquiry[] = [];
let quotations: Quotation[] = [];
let pricingSettings: PricingSettings = getDefaultPricingSettings();
let fleet: Fleet = getDefaultFleet();
let idCounter = 1000;

function nextId(): string {
  return `CAT-${String(++idCounter).padStart(5, '0')}`;
}

// ============================================================
// DEFAULT SETTINGS
// ============================================================
export function getDefaultPricingSettings(): PricingSettings {
  return {
    standardRatePerBusPerMonth30s: 2000,
    maxBuses: 10,
    maxMonths: 12,
    quotationValidityDays: 30,
    taxEnabled: false,
    taxRate: 0,
    taxLabel: 'GST',
    taxInclusive: false,
    contactEmail: 'hello@catgorithm.com',
    contactPhone: '+91 98765 43210',
    contactAddress: 'Kollam, Kerala, India',
    revenueTarget: 300000,
    revenueTargetPeriodLabel: 'Oct–Nov 2026',
    updatedAt: new Date().toISOString(),
  };
}

export function getDefaultFleet(): Fleet {
  return {
    totalBuses: 10,
    buses: Array.from({ length: 10 }, (_, i) => ({
      id: `BUS-${String(i + 1).padStart(3, '0')}`,
      busNumber: i + 1,
      internalName: `Bus ${i + 1}`,
      route: '',
      available: true,
      notes: '',
    })),
  };
}

// ============================================================
// ENQUIRY OPERATIONS
// ============================================================
export async function createEnquiry(data: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Enquiry> {
  const enquiry: Enquiry = {
    ...data,
    id: nextId(),
    status: 'New',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  enquiries = [enquiry, ...enquiries];
  return enquiry;
}

export async function getEnquiries(): Promise<Enquiry[]> {
  return [...enquiries];
}

export async function getEnquiryById(id: string): Promise<Enquiry | null> {
  return enquiries.find((e) => e.id === id) ?? null;
}

export async function updateEnquiryStatus(id: string, status: Enquiry['status'], note?: string): Promise<Enquiry | null> {
  const idx = enquiries.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  enquiries[idx] = {
    ...enquiries[idx],
    status,
    adminNotes: note ? `${enquiries[idx].adminNotes ?? ''}\n[${new Date().toLocaleDateString('en-IN')}] ${note}`.trim() : enquiries[idx].adminNotes,
    updatedAt: new Date().toISOString(),
  };
  return enquiries[idx];
}

// ============================================================
// QUOTATION OPERATIONS
// ============================================================
export async function createQuotation(data: Omit<Quotation, 'id' | 'createdAt'>): Promise<Quotation> {
  const quotation: Quotation = {
    ...data,
    id: `QUO-${nextId().replace('CAT-', '')}`,
    createdAt: new Date().toISOString(),
  };
  quotations = [quotation, ...quotations];
  return quotation;
}

export async function getQuotations(): Promise<Quotation[]> {
  return [...quotations];
}

// ============================================================
// PRICING SETTINGS
// ============================================================
export async function getPricingSettings(): Promise<PricingSettings> {
  return { ...pricingSettings };
}

export async function updatePricingSettings(updates: Partial<PricingSettings>): Promise<PricingSettings> {
  pricingSettings = { ...pricingSettings, ...updates, updatedAt: new Date().toISOString() };
  return { ...pricingSettings };
}

// ============================================================
// FLEET MANAGEMENT
// ============================================================
export async function getFleet(): Promise<Fleet> {
  return JSON.parse(JSON.stringify(fleet));
}

export async function updateFleet(updates: Partial<Fleet>): Promise<Fleet> {
  fleet = { ...fleet, ...updates };
  return JSON.parse(JSON.stringify(fleet));
}

// ============================================================
// ADMIN ANALYTICS
// ============================================================
export async function getAdminStats() {
  const confirmed = enquiries.filter((e) => e.status === 'Confirmed');
  const completed = enquiries.filter((e) => e.status === 'Completed');
  const revenue = [...confirmed, ...completed].reduce((sum, e) => sum + (e.pricingSnapshot?.packagePrice ?? 0), 0);

  const busCounts: Record<number, number> = {};
  const monthCounts: Record<number, number> = {};
  for (const e of enquiries) {
    const b = e.pricingSnapshot?.buses ?? 0;
    const m = e.pricingSnapshot?.months ?? 0;
    busCounts[b] = (busCounts[b] ?? 0) + 1;
    monthCounts[m] = (monthCounts[m] ?? 0) + 1;
  }

  const popularBuses = Object.entries(busCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
  const popularMonths = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';

  return {
    totalEnquiries: enquiries.length,
    newEnquiries: enquiries.filter((e) => e.status === 'New').length,
    quotationsGenerated: quotations.length,
    confirmedCampaigns: confirmed.length,
    completedCampaigns: completed.length,
    confirmedRevenue: revenue,
    averageCampaignValue: enquiries.length > 0 ? revenue / Math.max(confirmed.length + completed.length, 1) : 0,
    popularBusCount: popularBuses,
    popularCampaignDuration: popularMonths,
    revenueTarget: pricingSettings.revenueTarget,
    revenueTargetLabel: pricingSettings.revenueTargetPeriodLabel,
  };
}

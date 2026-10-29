// ============================================================
// DATA STORE — Supabase + LocalStorage Hybrid Persistence
// Connects to Supabase with automatic local fallback so
// quotations and enquiries are never lost even if offline
// or before table migrations are run.
// ============================================================

import type { Enquiry, Quotation, PricingSettings, Fleet } from '../types';
import { supabase } from './supabase';

const LOCAL_ENQUIRIES_KEY = 'catgorithm_enquiries_v2';
const LOCAL_QUOTATIONS_KEY = 'catgorithm_quotations_v2';
const LOCAL_SETTINGS_KEY = 'catgorithm_settings_v2';
const LOCAL_FLEET_KEY = 'catgorithm_fleet_v2';

export const COMPANY_DETAILS = {
  name: 'Catgorithm',
  tagline: 'Bus Screen Advertising · Digital Growth',
  address: 'Parayathumukku, Umayanalloor, Kollam, Keralam 691020',
  phone: '+91 97463 36175',
  email: 'teamcatgorithm@gmail.com',
  website: 'https://blackarmourr.github.io/CATGORITHM/',
};

// Safe localStorage access
function loadLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

function nextId(prefix: string): string {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${rand}`;
}

// Default settings with official Catgorithm details
export function getDefaultPricingSettings(): PricingSettings {
  return {
    standardRatePerSecond: 75,
    standardRatePerBusPerMonth30s: 2250,
    maxBuses: 10,
    maxMonths: 12,
    quotationValidityDays: 30,
    taxEnabled: false,
    taxRate: 0,
    taxLabel: 'GST',
    taxInclusive: false,
    contactEmail: COMPANY_DETAILS.email,
    contactPhone: COMPANY_DETAILS.phone,
    contactAddress: COMPANY_DETAILS.address,
    revenueTarget: 300000,
    revenueTargetPeriodLabel: 'Monthly / Bi-monthly Target',
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
// QUOTATION OPERATIONS
// ============================================================
export async function createQuotation(data: Omit<Quotation, 'id' | 'createdAt'>): Promise<Quotation> {
  const quotation: Quotation = {
    ...data,
    id: nextId('QUO'),
    createdAt: new Date().toISOString(),
  };

  // 1. Save locally immediately
  const existing = loadLocal<Quotation[]>(LOCAL_QUOTATIONS_KEY, []);
  const updated = [quotation, ...existing];
  saveLocal(LOCAL_QUOTATIONS_KEY, updated);

  // 2. Persist to Supabase asynchronously
  try {
    const { error } = await supabase.from('quotations').insert({
      id: quotation.id,
      customer_details: quotation.customerDetails,
      pricing_snapshot: quotation.pricingSnapshot,
      valid_until: quotation.validUntil,
      created_at: quotation.createdAt,
    });
    if (error) {
      console.warn('Supabase quotation sync notice (saved locally):', error.message);
    }
  } catch (err) {
    console.warn('Supabase offline or table pending (saved locally):', err);
  }

  return quotation;
}

export async function getQuotations(): Promise<Quotation[]> {
  const localList = loadLocal<Quotation[]>(LOCAL_QUOTATIONS_KEY, []);

  try {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      // Map remote rows to Quotation objects
      const remoteList: Quotation[] = data.map((row: any) => ({
        id: row.id,
        customerDetails: row.customer_details ?? row.customerDetails,
        pricingSnapshot: row.pricing_snapshot ?? row.pricingSnapshot,
        validUntil: row.valid_until ?? row.validUntil,
        createdAt: row.created_at ?? row.createdAt,
      }));

      // Merge remote and local (avoid duplicate IDs)
      const mergedMap = new Map<string, Quotation>();
      localList.forEach((q) => mergedMap.set(q.id, q));
      remoteList.forEach((q) => mergedMap.set(q.id, q));
      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch {
    // fallback to local
  }

  return localList;
}

// ============================================================
// ENQUIRY OPERATIONS
// ============================================================
export async function createEnquiry(data: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Enquiry> {
  const enquiry: Enquiry = {
    ...data,
    id: nextId('CAT'),
    status: 'New',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save locally
  const existing = loadLocal<Enquiry[]>(LOCAL_ENQUIRIES_KEY, []);
  const updated = [enquiry, ...existing];
  saveLocal(LOCAL_ENQUIRIES_KEY, updated);

  // 2. Persist to Supabase asynchronously
  try {
    const { error } = await supabase.from('enquiries').insert({
      id: enquiry.id,
      status: enquiry.status,
      customer_details: enquiry.customerDetails,
      pricing_snapshot: enquiry.pricingSnapshot,
      created_at: enquiry.createdAt,
      updated_at: enquiry.updatedAt,
    });
    if (error) {
      console.warn('Supabase enquiry sync notice (saved locally):', error.message);
    }
  } catch (err) {
    console.warn('Supabase offline or table pending (saved locally):', err);
  }

  return enquiry;
}

export async function getEnquiries(): Promise<Enquiry[]> {
  const localList = loadLocal<Enquiry[]>(LOCAL_ENQUIRIES_KEY, []);

  try {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const remoteList: Enquiry[] = data.map((row: any) => ({
        id: row.id,
        status: row.status,
        customerDetails: row.customer_details ?? row.customerDetails,
        pricingSnapshot: row.pricing_snapshot ?? row.pricingSnapshot,
        quotationId: row.quotation_id ?? row.quotationId,
        adminNotes: row.admin_notes ?? row.adminNotes,
        negotiatedPrice: row.negotiated_price ?? row.negotiatedPrice,
        negotiationReason: row.negotiation_reason ?? row.negotiationReason,
        createdAt: row.created_at ?? row.createdAt,
        updatedAt: row.updated_at ?? row.updatedAt,
      }));

      const mergedMap = new Map<string, Enquiry>();
      localList.forEach((e) => mergedMap.set(e.id, e));
      remoteList.forEach((e) => mergedMap.set(e.id, e));
      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch {
    // fallback
  }

  return localList;
}

export async function getEnquiryById(id: string): Promise<Enquiry | null> {
  const enquiries = await getEnquiries();
  return enquiries.find((e) => e.id === id) ?? null;
}

export async function updateEnquiryStatus(id: string, status: Enquiry['status'], note?: string): Promise<Enquiry | null> {
  const list = loadLocal<Enquiry[]>(LOCAL_ENQUIRIES_KEY, []);
  const idx = list.findIndex((e) => e.id === id);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      status,
      adminNotes: note ? `${list[idx].adminNotes ?? ''}\n[${new Date().toLocaleDateString('en-IN')}] ${note}`.trim() : list[idx].adminNotes,
      updatedAt: new Date().toISOString(),
    };
    saveLocal(LOCAL_ENQUIRIES_KEY, list);
  }

  // Update Supabase
  try {
    await supabase.from('enquiries').update({
      status,
      admin_notes: list[idx]?.adminNotes,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
  } catch {
    // local already saved
  }

  return list[idx] ?? null;
}

// ============================================================
// PRICING SETTINGS
// ============================================================
export async function getPricingSettings(): Promise<PricingSettings> {
  return loadLocal<PricingSettings>(LOCAL_SETTINGS_KEY, getDefaultPricingSettings());
}

export async function updatePricingSettings(updates: Partial<PricingSettings>): Promise<PricingSettings> {
  const current = await getPricingSettings();
  const next = { ...current, ...updates, updatedAt: new Date().toISOString() };
  saveLocal(LOCAL_SETTINGS_KEY, next);
  return next;
}

// ============================================================
// FLEET MANAGEMENT
// ============================================================
export async function getFleet(): Promise<Fleet> {
  return loadLocal<Fleet>(LOCAL_FLEET_KEY, getDefaultFleet());
}

export async function updateFleet(updates: Partial<Fleet>): Promise<Fleet> {
  const current = await getFleet();
  const next = { ...current, ...updates };
  saveLocal(LOCAL_FLEET_KEY, next);
  return next;
}

// ============================================================
// ADMIN ANALYTICS
// ============================================================
export async function getAdminStats() {
  const enquiries = await getEnquiries();
  const quotations = await getQuotations();
  const settings = await getPricingSettings();

  const confirmed = enquiries.filter((e) => e.status === 'Confirmed');
  const completed = enquiries.filter((e) => e.status === 'Completed');
  const revenue = [...confirmed, ...completed].reduce(
    (sum, e) => sum + (e.negotiatedPrice ?? e.pricingSnapshot?.packagePrice ?? 0),
    0
  );

  const busCounts: Record<number, number> = {};
  const monthCounts: Record<number, number> = {};
  for (const e of enquiries) {
    const b = e.pricingSnapshot?.buses ?? 0;
    const m = e.pricingSnapshot?.months ?? 0;
    busCounts[b] = (busCounts[b] ?? 0) + 1;
    monthCounts[m] = (monthCounts[m] ?? 0) + 1;
  }

  const popularBuses = Object.entries(busCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '10 Buses';
  const popularMonths = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '3 Months';

  return {
    totalEnquiries: enquiries.length,
    newEnquiries: enquiries.filter((e) => e.status === 'New').length,
    quotationsGenerated: quotations.length,
    confirmedCampaigns: confirmed.length,
    completedCampaigns: completed.length,
    confirmedRevenue: revenue,
    averageCampaignValue: (confirmed.length + completed.length) > 0 ? Math.round(revenue / (confirmed.length + completed.length)) : 0,
    popularBusCount: popularBuses,
    popularCampaignDuration: popularMonths,
    revenueTarget: settings.revenueTarget,
    revenueTargetLabel: settings.revenueTargetPeriodLabel,
  };
}

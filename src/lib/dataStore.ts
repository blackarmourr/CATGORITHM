// ============================================================
// DATA STORE — Supabase + LocalStorage Hybrid Persistence
// Connects to Supabase with automatic local fallback so
// quotations, enquiries, and campaigns are never lost.
// ============================================================

import type { Enquiry, Quotation, PricingSettings, Fleet, Campaign, CampaignStatus } from '../types';
import { supabase } from './supabase';

const LOCAL_ENQUIRIES_KEY = 'catgorithm_enquiries_v2';
const LOCAL_QUOTATIONS_KEY = 'catgorithm_quotations_v2';
const LOCAL_SETTINGS_KEY = 'catgorithm_settings_v2';
const LOCAL_FLEET_KEY = 'catgorithm_fleet_v2';
const LOCAL_CAMPAIGNS_KEY = 'catgorithm_campaigns_v2';

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

// Compute dynamic campaign status based on current date
export function computeCampaignStatus(startDate: string, endDate: string, isArchived?: boolean): CampaignStatus {
  if (isArchived) return 'Archived';
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (now < start) return 'Scheduled';
  if (now > end) return 'Completed';
  return 'Active';
}

// Initial configured campaigns
export function getDefaultCampaigns(): Campaign[] {
  return [
    {
      id: 'winter-spotlight-2026',
      slug: 'winter-spotlight-2026',
      name: 'Winter Spotlight 2026–27',
      tagline: 'Your Brand. The Season. The Spotlight.',
      description: 'A seasonal advertising campaign by Catgorithm, designed to help businesses promote their brands and seasonal offers during the festive and year-end shopping period.',
      startDate: '2026-11-20',
      endDate: '2027-01-20',
      defaultBilledMonths: 2,
      status: computeCampaignStatus('2026-11-20', '2027-01-20'),
      theme: {
        primaryColor: '#070B14',
        secondaryColor: '#0F172A',
        accentColor: '#D4AF37',
        goldColor: '#F3C669',
        textColor: '#F8FAFC',
        coverBadge: 'SEASONAL SPOTLIGHT',
        style: 'winter-spotlight',
      },
      messaging: {
        headline: 'WINTER SPOTLIGHT 2026–27',
        subheadline: 'CATGORITHM PRESENTS',
        tagline: 'Your Brand. The Season. The Spotlight.',
        seasonalThemes: ['Black Friday', 'Christmas', 'New Year', 'End-of-Season Sales'],
        supportingCopy: "Make your brand part of the season with Catgorithm's bus-screen advertising packages.",
        additionalCopy: 'One campaign. A season full of opportunities.',
        offerTitle: 'Winter Spotlight Special Package',
      },
      quotationSettings: {
        enableSeasonalCover: true,
        coverTitle: 'Winter Spotlight 2026–27',
        quotationValidityDays: 30,
      },
      isDefault: false,
      isArchived: false,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-29T00:00:00.000Z',
    },
    {
      id: 'standard',
      slug: 'standard',
      name: 'Standard Campaign',
      tagline: 'Transparent Bus Screen Advertising',
      description: 'Year-round digital advertising network across private buses in Kollam, Kerala.',
      startDate: '2026-01-01',
      endDate: '2027-12-31',
      defaultBilledMonths: 1,
      status: 'Active',
      theme: {
        primaryColor: '#111827',
        secondaryColor: '#1F2937',
        accentColor: '#A0354E',
        textColor: '#111827',
        coverBadge: 'STANDARD FLEET',
        style: 'standard',
      },
      messaging: {
        headline: 'Catgorithm Bus Screen Network',
        subheadline: 'OFFICIAL ADVERTISING PROPOSAL',
        tagline: 'Transparent Bus Screen Advertising',
        supportingCopy: 'Reach commuters across major Kollam bus routes daily with high-impact screen advertising.',
        additionalCopy: 'Premium internal bus digital screens with transparent pricing.',
        offerTitle: 'Standard Advertising Package',
      },
      quotationSettings: {
        enableSeasonalCover: false,
        coverTitle: 'Standard Campaign Quotation',
        quotationValidityDays: 30,
      },
      isDefault: true,
      isArchived: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-10-29T00:00:00.000Z',
    },
  ];
}

// ============================================================
// CAMPAIGN OPERATIONS
// ============================================================
export async function getCampaigns(): Promise<Campaign[]> {
  const localList = loadLocal<Campaign[]>(LOCAL_CAMPAIGNS_KEY, getDefaultCampaigns());

  // Dynamically compute statuses based on current dates
  const updatedList = localList.map((c) => ({
    ...c,
    status: computeCampaignStatus(c.startDate, c.endDate, c.isArchived),
  }));

  // Ensure default campaigns exist
  const defaults = getDefaultCampaigns();
  for (const def of defaults) {
    if (!updatedList.some((c) => c.id === def.id)) {
      updatedList.push(def);
    }
  }

  saveLocal(LOCAL_CAMPAIGNS_KEY, updatedList);
  return updatedList;
}

export async function getCampaignById(id: string): Promise<Campaign | undefined> {
  const campaigns = await getCampaigns();
  return campaigns.find((c) => c.id === id);
}

export async function createCampaign(
  data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Campaign> {
  const id = `camp-${Date.now().toString(36)}`;
  const campaign: Campaign = {
    ...data,
    id,
    status: computeCampaignStatus(data.startDate, data.endDate),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existing = await getCampaigns();
  const updated = [campaign, ...existing];
  saveLocal(LOCAL_CAMPAIGNS_KEY, updated);
  return campaign;
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
  const campaigns = await getCampaigns();
  const index = campaigns.findIndex((c) => c.id === id);
  if (index === -1) throw new Error(`Campaign ${id} not found`);

  const updatedCampaign: Campaign = {
    ...campaigns[index],
    ...updates,
    status: computeCampaignStatus(
      updates.startDate ?? campaigns[index].startDate,
      updates.endDate ?? campaigns[index].endDate,
      updates.isArchived ?? campaigns[index].isArchived
    ),
    updatedAt: new Date().toISOString(),
  };

  campaigns[index] = updatedCampaign;
  saveLocal(LOCAL_CAMPAIGNS_KEY, campaigns);
  return updatedCampaign;
}

export async function duplicateCampaign(id: string): Promise<Campaign> {
  const original = await getCampaignById(id);
  if (!original) throw new Error(`Campaign ${id} not found`);

  const copy = await createCampaign({
    ...original,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${Math.floor(Math.random() * 1000)}`,
    isDefault: false,
    isArchived: false,
  });

  return copy;
}

export async function archiveCampaign(id: string): Promise<Campaign> {
  return updateCampaign(id, { isArchived: true });
}

export async function getCampaignQuotationsCount(campaignId: string): Promise<number> {
  const quotes = await getQuotations();
  return quotes.filter((q) => q.campaignId === campaignId).length;
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
      campaign_id: quotation.campaignId,
      campaign_name: quotation.campaignName,
      campaign_start_date: quotation.campaignStartDate,
      campaign_end_date: quotation.campaignEndDate,
      billed_months: quotation.billedMonths,
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
      const remoteList: Quotation[] = data.map((row: any) => ({
        id: row.id,
        customerDetails: row.customer_details ?? row.customerDetails,
        pricingSnapshot: row.pricing_snapshot ?? row.pricingSnapshot,
        campaignId: row.campaign_id ?? row.campaignId,
        campaignName: row.campaign_name ?? row.campaignName,
        campaignStartDate: row.campaign_start_date ?? row.campaignStartDate,
        campaignEndDate: row.campaign_end_date ?? row.campaignEndDate,
        billedMonths: row.billed_months ?? row.billedMonths,
        campaignThemeSnapshot: row.campaign_theme_snapshot ?? row.campaignThemeSnapshot,
        validUntil: row.valid_until ?? row.validUntil,
        createdAt: row.created_at ?? row.createdAt,
      }));

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
      campaign_id: enquiry.campaignId,
      campaign_name: enquiry.campaignName,
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
        campaignId: row.campaign_id ?? row.campaignId,
        campaignName: row.campaign_name ?? row.campaignName,
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
  const popularMonths = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '2 Months';

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

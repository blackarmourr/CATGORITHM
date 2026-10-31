// ============================================================
// DATA STORE — Supabase + LocalStorage Hybrid Persistence
// Connects to Supabase with automatic local fallback so
// quotations, enquiries, and campaigns are never lost.
// ============================================================

import type { Enquiry, EnquiryStatus, Quotation, PricingSettings, Fleet, BusRecord, Campaign, CampaignStatus, SlotBooking } from '../types';
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
      updatedAt: '2026-10-30T00:00:00.000Z',
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

export async function deleteCampaign(id: string): Promise<boolean> {
  const campaigns = await getCampaigns();
  const updated = campaigns.filter((c) => c.id !== id);
  saveLocal(LOCAL_CAMPAIGNS_KEY, updated);
  return true;
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
  const defaultBuses: BusRecord[] = [
    {
      id: 'BUS-001',
      busNumber: 'KL-02-AB-1011',
      busName: 'St. Antony Travels',
      routeStart: 'Kollam KSRTC',
      routeEnd: 'Karunagappally',
      intermediateStops: 'Chinnakada, Ramankulangara, Neendakara, Chavara, Titanium, Sankaramangalam',
      route: 'Kollam ➔ Karunagappally',
      available: true,
      totalSlots: 10,
      notes: 'Heavy morning/evening coastal commuter belt',
      slotBookings: [
        {
          id: 'SB-001-A',
          clientName: 'Malabar Gold & Diamonds',
          slotsCount: 3,
          videoDurationSeconds: 30,
          campaignName: 'Winter Fest 2026',
          startDate: '2026-10-20',
          endDate: '2026-11-20',
          notes: 'Screen ad loop prime slot',
        },
        {
          id: 'SB-001-B',
          clientName: 'Muthoot Finance',
          slotsCount: 3,
          videoDurationSeconds: 30,
          campaignName: 'Gold Loan Campaign',
          startDate: '2026-10-15',
          endDate: '2026-12-15',
          notes: '2-month continuous display',
        },
      ],
    },
    {
      id: 'BUS-002',
      busNumber: 'KL-02-AC-2022',
      busName: 'Kollam Express',
      routeStart: 'Kollam KSRTC',
      routeEnd: 'Kottarakkara',
      intermediateStops: 'Kilikolloor, Chandanathope, Kundara, Ezhukone, Pulamon',
      route: 'Kollam ➔ Kottarakkara',
      available: true,
      totalSlots: 10,
      notes: 'Key student & government office route',
      slotBookings: [
        {
          id: 'SB-002-A',
          clientName: 'Kalyan Silks',
          slotsCount: 4,
          videoDurationSeconds: 30,
          campaignName: 'Wedding Season 2026',
          startDate: '2026-10-01',
          endDate: '2026-11-30',
          notes: 'High visibility morning runs',
        },
        {
          id: 'SB-002-B',
          clientName: 'Oxygen Digital Shop',
          slotsCount: 3,
          videoDurationSeconds: 30,
          campaignName: 'Mobile Expo',
          startDate: '2026-10-25',
          endDate: '2026-12-25',
        },
      ],
    },
    {
      id: 'BUS-003',
      busNumber: 'KL-02-AD-3033',
      busName: 'Royal Star',
      routeStart: 'Kollam Chinnakada',
      routeEnd: 'Paravoor',
      intermediateStops: 'Polayathodu, Eravipuram, Mayyanad, Kottiyam, Chathannoor',
      route: 'Kollam ➔ Paravoor',
      available: true,
      totalSlots: 10,
      notes: 'High visibility south district corridor',
      slotBookings: [
        {
          id: 'SB-003-A',
          clientName: 'Lulu Daily Supermarket',
          slotsCount: 3,
          videoDurationSeconds: 30,
          campaignName: 'Weekend Savings',
          startDate: '2026-10-10',
          endDate: '2026-12-10',
        },
        {
          id: 'SB-003-B',
          clientName: 'Jos Alukkas',
          slotsCount: 2,
          videoDurationSeconds: 30,
          campaignName: 'Festival Spotlight',
          startDate: '2026-11-05',
          endDate: '2027-01-05',
        },
      ],
    },
    {
      id: 'BUS-004',
      busNumber: 'KL-02-AE-4044',
      busName: 'Prince Super',
      routeStart: 'Kollam Bus Stand',
      routeEnd: 'Adoor',
      intermediateStops: 'Kundara, Bharanikkavu, Sasthamcotta, Kadampanad',
      route: 'Kollam ➔ Adoor',
      available: true,
      totalSlots: 10,
      notes: 'Inter-district commercial commuter corridor',
      slotBookings: [
        {
          id: 'SB-004-A',
          clientName: 'Travancore Medicity',
          slotsCount: 4,
          videoDurationSeconds: 30,
          campaignName: 'Healthcare Awareness',
          startDate: '2026-10-05',
          endDate: '2026-12-05',
        },
      ],
    },
    {
      id: 'BUS-005',
      busNumber: 'KL-02-AF-5055',
      busName: 'Holy Grace',
      routeStart: 'Kollam Chinnakada',
      routeEnd: 'Oachira',
      intermediateStops: 'Neendakara, Chavara, Karunagappally, Vavvakkavu',
      route: 'Kollam ➔ Oachira',
      available: true,
      totalSlots: 10,
      notes: 'NH 66 trunk route passing major markets',
      slotBookings: [
        {
          id: 'SB-005-A',
          clientName: 'Kalyan Jewellers',
          slotsCount: 5,
          videoDurationSeconds: 30,
          campaignName: 'Grand Fest',
          startDate: '2026-10-25',
          endDate: '2026-11-25',
        },
        {
          id: 'SB-005-B',
          clientName: 'Supreme Food Court',
          slotsCount: 3,
          videoDurationSeconds: 30,
          campaignName: 'Highway Dine In',
          startDate: '2026-10-20',
          endDate: '2026-12-20',
        },
      ],
    },
    {
      id: 'BUS-006',
      busNumber: 'KL-02-AG-6066',
      busName: 'City Rider',
      routeStart: 'Kollam Port',
      routeEnd: 'Kottiyam Junction',
      intermediateStops: 'Asramam, Kadappakada, Polayathodu, Thattamala, Umayanalloor',
      route: 'Kollam ➔ Kottiyam',
      available: true,
      totalSlots: 10,
      notes: 'Prime city center & shopping hub connection',
      slotBookings: [
        {
          id: 'SB-006-A',
          clientName: 'MyG Future Store',
          slotsCount: 4,
          videoDurationSeconds: 30,
          campaignName: 'Diwali & New Year Deals',
          startDate: '2026-10-12',
          endDate: '2026-12-12',
        },
        {
          id: 'SB-006-B',
          clientName: 'Sankar Institute of Commerce',
          slotsCount: 2,
          videoDurationSeconds: 30,
          campaignName: 'Admissions 2027',
          startDate: '2026-11-15',
          endDate: '2027-01-15',
        },
      ],
    },
    {
      id: 'BUS-007',
      busNumber: 'KL-02-AH-7077',
      busName: 'Golden Arrow',
      routeStart: 'Kollam KSRTC',
      routeEnd: 'Punalur',
      intermediateStops: 'Kundara, Kottarakkara, Valakom, Anchal',
      route: 'Kollam ➔ Punalur',
      available: true,
      totalSlots: 10,
      notes: 'Long-distance eastern highway commuter run',
      slotBookings: [
        {
          id: 'SB-007-A',
          clientName: 'Canara Bank',
          slotsCount: 3,
          videoDurationSeconds: 30,
          campaignName: 'MSME Loan Scheme',
          startDate: '2026-10-18',
          endDate: '2026-12-18',
        },
        {
          id: 'SB-007-B',
          clientName: 'Nandilath G-Mart',
          slotsCount: 2,
          videoDurationSeconds: 30,
          campaignName: 'Mega Home Appliances',
          startDate: '2026-11-20',
          endDate: '2027-01-20',
        },
      ],
    },
    {
      id: 'BUS-008',
      busNumber: 'KL-02-AJ-8088',
      busName: 'Silver Star',
      routeStart: 'Kollam Chinnakada',
      routeEnd: 'Kayamkulam',
      intermediateStops: 'Chavara, Karunagappally, Oachira, Krishnapuram',
      route: 'Kollam ➔ Kayamkulam',
      available: true,
      totalSlots: 10,
      notes: 'Northbound commercial transit link',
      slotBookings: [
        {
          id: 'SB-008-A',
          clientName: 'Seematti Textiles',
          slotsCount: 4,
          videoDurationSeconds: 30,
          campaignName: 'Bridal Launch',
          startDate: '2026-10-28',
          endDate: '2026-11-28',
        },
        {
          id: 'SB-008-B',
          clientName: 'Bheema Jewellers',
          slotsCount: 3,
          videoDurationSeconds: 30,
          campaignName: 'Wedding Diamonds',
          startDate: '2026-10-30',
          endDate: '2026-12-30',
        },
      ],
    },
    {
      id: 'BUS-009',
      busNumber: 'KL-02-AK-9099',
      busName: 'Catgorithm Shuttle',
      routeStart: 'Kollam Beach',
      routeEnd: 'Anchalummoodu',
      intermediateStops: 'Collectorate, Cutcherry, Thevally, Kadavoor, Perumon',
      route: 'Kollam ➔ Anchalummoodu',
      available: true,
      totalSlots: 10,
      notes: 'Dense college and residential route',
      slotBookings: [
        {
          id: 'SB-009-A',
          clientName: 'KIMS Health Hospital',
          slotsCount: 3,
          videoDurationSeconds: 30,
          campaignName: 'Super Specialty Care',
          startDate: '2026-11-08',
          endDate: '2027-01-08',
        },
      ],
    },
    {
      id: 'BUS-010',
      busNumber: 'KL-02-AL-1010',
      busName: 'Venture Express',
      routeStart: 'Kollam Chinnakada',
      routeEnd: 'Ayur',
      intermediateStops: 'Kottiyam, Chathannoor, Parippally, Nilamel',
      route: 'Kollam ➔ Ayur',
      available: true,
      totalSlots: 10,
      notes: 'Southern MC Road feeder route',
      slotBookings: [
        {
          id: 'SB-010-A',
          clientName: 'Federal Bank',
          slotsCount: 4,
          videoDurationSeconds: 30,
          campaignName: 'Digital Savings Account',
          startDate: '2026-10-22',
          endDate: '2026-12-22',
        },
      ],
    },
  ];

  return {
    totalBuses: defaultBuses.length,
    buses: defaultBuses,
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
    // Pack all campaign metadata into customer_details JSONB so it safely persists
    // even if dedicated columns have not been added to Supabase.
    const enrichedCustomerDetails = {
      ...quotation.customerDetails,
      campaignId: quotation.campaignId,
      campaignName: quotation.campaignName,
      campaignStartDate: quotation.campaignStartDate,
      campaignEndDate: quotation.campaignEndDate,
      billedMonths: quotation.billedMonths,
      campaignThemeSnapshot: quotation.campaignThemeSnapshot,
      campaignMessagingSnapshot: quotation.campaignMessagingSnapshot,
    };

    const payload: Record<string, any> = {
      id: quotation.id,
      customer_details: enrichedCustomerDetails,
      pricing_snapshot: quotation.pricingSnapshot,
      valid_until: quotation.validUntil,
      created_at: quotation.createdAt,
      campaign_id: quotation.campaignId || null,
      campaign_name: quotation.campaignName || null,
      campaign_start_date: quotation.campaignStartDate || null,
      campaign_end_date: quotation.campaignEndDate || null,
      billed_months: quotation.billedMonths || null,
    };

    // If table has optional columns, Supabase will accept them if present
    const { error } = await supabase.from('quotations').insert(payload);
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
      const remoteList: Quotation[] = data.map((row: any) => {
        const cd = row.customer_details ?? row.customerDetails ?? {};
        return {
          id: row.id,
          customerDetails: cd,
          pricingSnapshot: row.pricing_snapshot ?? row.pricingSnapshot,
          campaignId: row.campaign_id ?? cd.campaignId,
          campaignName: row.campaign_name ?? cd.campaignName,
          campaignStartDate: row.campaign_start_date ?? cd.campaignStartDate,
          campaignEndDate: row.campaign_end_date ?? cd.campaignEndDate,
          billedMonths: row.billed_months ?? cd.billedMonths,
          campaignThemeSnapshot: row.campaign_theme_snapshot ?? cd.campaignThemeSnapshot,
          campaignMessagingSnapshot: row.campaign_messaging_snapshot ?? cd.campaignMessagingSnapshot,
          validUntil: row.valid_until ?? row.validUntil,
          createdAt: row.created_at ?? row.createdAt,
        };
      });

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

export async function deleteQuotation(id: string): Promise<boolean> {
  // 1. Delete locally
  const existing = loadLocal<Quotation[]>(LOCAL_QUOTATIONS_KEY, []);
  const updated = existing.filter((q) => q.id !== id);
  saveLocal(LOCAL_QUOTATIONS_KEY, updated);

  // 2. Delete from Supabase
  try {
    const { error } = await supabase.from('quotations').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete quotation notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase delete notice:', err);
  }

  return true;
}

// ============================================================
// ENQUIRY OPERATIONS
// ============================================================
export async function createEnquiry(
  data: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: EnquiryStatus }
): Promise<Enquiry> {
  const enquiry: Enquiry = {
    ...data,
    id: nextId('CAT'),
    status: data.status || 'New',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save locally
  const existing = loadLocal<Enquiry[]>(LOCAL_ENQUIRIES_KEY, []);
  const updated = [enquiry, ...existing];
  saveLocal(LOCAL_ENQUIRIES_KEY, updated);

  // 2. Persist to Supabase asynchronously
  try {
    const enrichedCustomerDetails = {
      ...enquiry.customerDetails,
      campaignId: enquiry.campaignId,
      campaignName: enquiry.campaignName,
    };

    const payload: Record<string, any> = {
      id: enquiry.id,
      status: enquiry.status,
      customer_details: enrichedCustomerDetails,
      pricing_snapshot: enquiry.pricingSnapshot,
      quotation_id: enquiry.quotationId,
      admin_notes: enquiry.adminNotes,
      negotiated_price: enquiry.negotiatedPrice,
      negotiation_reason: enquiry.negotiationReason,
      created_at: enquiry.createdAt,
      updated_at: enquiry.updatedAt,
      campaign_id: enquiry.campaignId || null,
      campaign_name: enquiry.campaignName || null,
    };

    const { error } = await supabase.from('enquiries').insert(payload);
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
      const remoteList: Enquiry[] = data.map((row: any) => {
        const cd = row.customer_details ?? row.customerDetails ?? {};
        return {
          id: row.id,
          status: row.status,
          customerDetails: cd,
          pricingSnapshot: row.pricing_snapshot ?? row.pricingSnapshot,
          quotationId: row.quotation_id ?? row.quotationId,
          campaignId: row.campaign_id ?? cd.campaignId,
          campaignName: row.campaign_name ?? cd.campaignName,
          adminNotes: row.admin_notes ?? row.adminNotes,
          negotiatedPrice: row.negotiated_price ?? row.negotiatedPrice,
          negotiationReason: row.negotiation_reason ?? row.negotiationReason,
          createdAt: row.created_at ?? row.createdAt,
          updatedAt: row.updated_at ?? row.updatedAt,
        };
      });

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

export async function deleteEnquiry(id: string): Promise<boolean> {
  const existing = loadLocal<Enquiry[]>(LOCAL_ENQUIRIES_KEY, []);
  const updated = existing.filter((e) => e.id !== id);
  saveLocal(LOCAL_ENQUIRIES_KEY, updated);

  try {
    const { error } = await supabase.from('enquiries').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete enquiry notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase delete notice:', err);
  }

  return true;
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
// FLEET MANAGEMENT & SLOT METRICS
// ============================================================
export function getBusSlotMetrics(bus: BusRecord) {
  const totalSlots = bus.totalSlots || 10;
  const bookings = bus.slotBookings || [];
  const bookedSlots = bookings.reduce((sum, b) => sum + (b.slotsCount || 0), 0);
  const availableSlots = Math.max(0, totalSlots - bookedSlots);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const activeBookings = bookings.filter((b) => {
    const end = new Date(b.endDate);
    end.setHours(23, 59, 59, 999);
    return end >= now;
  });

  const sortedByExpiry = [...activeBookings].sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  );

  const earliestExpiry = sortedByExpiry[0] || null;

  return {
    totalSlots,
    bookedSlots,
    availableSlots,
    occupancyPercent: Math.min(100, Math.round((bookedSlots / totalSlots) * 100)),
    activeBookingsCount: activeBookings.length,
    nextFreesUpDate: earliestExpiry ? earliestExpiry.endDate : null,
    nextFreesUpClient: earliestExpiry ? earliestExpiry.clientName : null,
    nextFreesUpSlotsCount: earliestExpiry ? earliestExpiry.slotsCount : 0,
  };
}

export async function getFleet(): Promise<Fleet> {
  const defaultFleet = getDefaultFleet();
  const rawFleet = loadLocal<Fleet>(LOCAL_FLEET_KEY, defaultFleet);

  // Try fetching remote fleet from Supabase if table exists
  try {
    const { data, error } = await supabase
      .from('fleet')
      .select('buses, total_buses')
      .eq('id', 'kollam_fleet')
      .maybeSingle();

    if (!error && data && Array.isArray(data.buses) && data.buses.length > 0) {
      const remoteFleet: Fleet = {
        totalBuses: data.total_buses || data.buses.length,
        buses: data.buses,
      };
      saveLocal(LOCAL_FLEET_KEY, remoteFleet);
      return remoteFleet;
    }
  } catch {
    // fallback to local storage
  }

  // Migration safeguard: Ensure every bus has totalSlots=10 and slotBookings populated
  const updatedBuses = (rawFleet.buses && rawFleet.buses.length > 0 ? rawFleet.buses : defaultFleet.buses).map((bus, idx) => {
    const defaultBus = defaultFleet.buses[idx] || defaultFleet.buses[0];
    const totalSlots = bus.totalSlots || 10;
    const slotBookings = (bus.slotBookings && bus.slotBookings.length > 0)
      ? bus.slotBookings
      : (defaultBus ? defaultBus.slotBookings || [] : []);

    return {
      ...bus,
      totalSlots,
      slotBookings,
    };
  });

  const fleet: Fleet = {
    totalBuses: updatedBuses.length,
    buses: updatedBuses,
  };

  return fleet;
}

export async function updateFleet(updates: Partial<Fleet>): Promise<Fleet> {
  const current = await getFleet();
  const next = { ...current, ...updates };
  saveLocal(LOCAL_FLEET_KEY, next);

  // Attempt to sync to Supabase if table exists
  try {
    await supabase.from('fleet').upsert({
      id: 'kollam_fleet',
      total_buses: next.totalBuses,
      buses: next.buses,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Ignore if table does not exist
  }

  return next;
}

export async function bookBusSlots(
  busId: string,
  booking: Omit<SlotBooking, 'id' | 'createdAt'>
): Promise<Fleet> {
  const fleet = await getFleet();
  const busIndex = fleet.buses.findIndex((b) => b.id === busId);
  if (busIndex === -1) throw new Error(`Bus ${busId} not found`);

  const newBooking: SlotBooking = {
    ...booking,
    id: `SLOT-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
    videoDurationSeconds: booking.videoDurationSeconds || 30,
    createdAt: new Date().toISOString(),
  };

  const currentBookings = fleet.buses[busIndex].slotBookings || [];
  fleet.buses[busIndex] = {
    ...fleet.buses[busIndex],
    slotBookings: [...currentBookings, newBooking],
  };

  saveLocal(LOCAL_FLEET_KEY, fleet);
  return fleet;
}

export async function releaseBusSlot(
  busId: string,
  bookingId: string
): Promise<Fleet> {
  const fleet = await getFleet();
  const busIndex = fleet.buses.findIndex((b) => b.id === busId);
  if (busIndex === -1) throw new Error(`Bus ${busId} not found`);

  const currentBookings = fleet.buses[busIndex].slotBookings || [];
  fleet.buses[busIndex] = {
    ...fleet.buses[busIndex],
    slotBookings: currentBookings.filter((b) => b.id !== bookingId),
  };

  saveLocal(LOCAL_FLEET_KEY, fleet);
  return fleet;
}

export async function bookFleetWideSlots(
  busIds: string[],
  booking: Omit<SlotBooking, 'id' | 'createdAt'>
): Promise<Fleet> {
  const fleet = await getFleet();
  const timestamp = Date.now().toString(36);

  fleet.buses = fleet.buses.map((bus, idx) => {
    if (!busIds.includes(bus.id)) return bus;
    const newBooking: SlotBooking = {
      ...booking,
      id: `FLEET-SLOT-${timestamp}-${idx}`,
      videoDurationSeconds: booking.videoDurationSeconds || 30,
      createdAt: new Date().toISOString(),
    };
    return {
      ...bus,
      slotBookings: [...(bus.slotBookings || []), newBooking],
    };
  });

  saveLocal(LOCAL_FLEET_KEY, fleet);
  return fleet;
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

// ============================================================
// DATA STORE — Supabase + LocalStorage Hybrid Persistence
// Connects to Supabase with automatic local fallback so
// quotations, enquiries, and campaigns are never lost.
// ============================================================

import type { Enquiry, EnquiryStatus, Quotation, PricingSettings, Fleet, BusRecord, Campaign, CampaignStatus, SlotBooking, AdvertisementBooking } from '../types';
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

// Core Advertising Loop Configuration (12-minute loop)
export const TOTAL_LOOP_DURATION = 720; // 12 minutes (720 seconds)
export const SONG_ENTERTAINMENT_DURATION = 180; // 180 seconds
export const PASSENGER_ANNOUNCEMENT_DURATION = 90; // 90 seconds

// Advertising Capacity Allocation per bus per loop:
export const PHYSICAL_AD_CAPACITY = 450; // Physical advertising capacity (seconds)
export const RESERVED_BUFFER = 30; // Reserved buffer (seconds)
export const BOOKABLE_CAPACITY = 420; // Normal bookable capacity (seconds)

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
      physicalAdCapacity: 450,
      normalAdCapacity: 420,
      bufferAdCapacity: 30,
      totalSlots: 10,
      notes: 'Heavy morning/evening coastal commuter belt',
      advertisements: [
        {
          id: 'AD-001-A',
          clientName: 'Malabar Gold & Diamonds',
          durationSeconds: 90,
          campaignName: 'Winter Fest 2026',
          startDate: '2026-10-20',
          endDate: '2026-11-20',
          calculatedPrice: 6750,
          notes: 'Screen ad loop prime slot (90s)',
        },
        {
          id: 'AD-001-B',
          clientName: 'Muthoot Finance',
          durationSeconds: 90,
          campaignName: 'Gold Loan Campaign',
          startDate: '2026-10-15',
          endDate: '2026-12-15',
          calculatedPrice: 10500,
          notes: '2-month continuous display (90s)',
        },
        {
          id: 'AD-001-C',
          clientName: 'Elite Supermarket',
          durationSeconds: 60,
          campaignName: 'Fresh Grocery Mega Offer',
          startDate: '2026-10-25',
          endDate: '2026-11-25',
          calculatedPrice: 4500,
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
      physicalAdCapacity: 450,
      normalAdCapacity: 420,
      bufferAdCapacity: 30,
      totalSlots: 10,
      notes: 'Key student & government office route',
      advertisements: [
        {
          id: 'AD-002-A',
          clientName: 'Kalyan Silks',
          durationSeconds: 120,
          campaignName: 'Wedding Season 2026',
          startDate: '2026-10-01',
          endDate: '2026-11-30',
          calculatedPrice: 16400,
          notes: 'High visibility morning runs (120s)',
        },
        {
          id: 'AD-002-B',
          clientName: 'Oxygen Digital Shop',
          durationSeconds: 90,
          campaignName: 'Mobile Expo',
          startDate: '2026-10-25',
          endDate: '2026-12-25',
          calculatedPrice: 10500,
        },
        {
          id: 'AD-002-C',
          clientName: 'Kollam Medicity',
          durationSeconds: 60,
          campaignName: 'Health Checkup Package',
          startDate: '2026-10-20',
          endDate: '2026-12-20',
          calculatedPrice: 7000,
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
      physicalAdCapacity: 450,
      normalAdCapacity: 420,
      bufferAdCapacity: 30,
      totalSlots: 10,
      notes: 'High visibility south district corridor',
      advertisements: [
        {
          id: 'AD-003-A',
          clientName: 'Lulu Daily Supermarket',
          durationSeconds: 90,
          campaignName: 'Weekend Savings',
          startDate: '2026-10-10',
          endDate: '2026-12-10',
          calculatedPrice: 10500,
        },
        {
          id: 'AD-003-B',
          clientName: 'Jos Alukkas',
          durationSeconds: 60,
          campaignName: 'Festival Spotlight',
          startDate: '2026-11-05',
          endDate: '2027-01-05',
          calculatedPrice: 7000,
        },
        {
          id: 'AD-003-C',
          clientName: 'MyG Future Store',
          durationSeconds: 45,
          campaignName: 'Tech Deals',
          startDate: '2026-10-25',
          endDate: '2026-11-25',
          calculatedPrice: 3375,
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
      physicalAdCapacity: 450,
      normalAdCapacity: 420,
      bufferAdCapacity: 30,
      totalSlots: 10,
      notes: 'Inter-district commercial commuter corridor',
      advertisements: [
        {
          id: 'AD-004-A',
          clientName: 'Travancore Medicity',
          durationSeconds: 120,
          campaignName: 'Healthcare Awareness',
          startDate: '2026-10-05',
          endDate: '2026-12-05',
          calculatedPrice: 14000,
        },
        {
          id: 'AD-004-B',
          clientName: 'Canara Bank',
          durationSeconds: 60,
          campaignName: 'Home Loan Carnival',
          startDate: '2026-10-15',
          endDate: '2026-11-15',
          calculatedPrice: 4500,
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
      physicalAdCapacity: 450,
      normalAdCapacity: 420,
      bufferAdCapacity: 30,
      totalSlots: 10,
      notes: 'NH 66 trunk route passing major markets',
      advertisements: [
        {
          id: 'AD-005-A',
          clientName: 'Kalyan Jewellers',
          durationSeconds: 150,
          campaignName: 'Grand Fest',
          startDate: '2026-10-25',
          endDate: '2026-11-25',
          calculatedPrice: 11250,
        },
        {
          id: 'AD-005-B',
          clientName: 'Supreme Food Court',
          durationSeconds: 90,
          campaignName: 'Highway Dine In',
          startDate: '2026-10-20',
          endDate: '2026-12-20',
          calculatedPrice: 10500,
        },
        {
          id: 'AD-005-C',
          clientName: 'Bheema Jewellers',
          durationSeconds: 120,
          campaignName: 'Diamond Fest',
          startDate: '2026-10-28',
          endDate: '2026-12-28',
          calculatedPrice: 14000,
        },
        {
          id: 'AD-005-D',
          clientName: 'VKC Pride Footwear',
          durationSeconds: 70,
          campaignName: 'Walk of Comfort',
          startDate: '2026-10-26',
          endDate: '2026-11-26',
          calculatedPrice: 5250,
          usesBuffer: true,
          bufferSecondsUsed: 10,
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
      physicalAdCapacity: 450,
      normalAdCapacity: 420,
      bufferAdCapacity: 30,
      totalSlots: 10,
      notes: 'Prime city center & shopping hub connection',
      advertisements: [
        {
          id: 'AD-006-A',
          clientName: 'MyG Future Store',
          durationSeconds: 120,
          campaignName: 'Diwali & New Year Deals',
          startDate: '2026-10-12',
          endDate: '2026-12-12',
          calculatedPrice: 14000,
        },
        {
          id: 'AD-006-B',
          clientName: 'Sankar Institute of Commerce',
          durationSeconds: 60,
          campaignName: 'Admissions 2027',
          startDate: '2026-11-15',
          endDate: '2027-01-15',
          calculatedPrice: 7000,
        },
        {
          id: 'AD-006-C',
          clientName: 'Pothys Textiles',
          durationSeconds: 45,
          campaignName: 'Grand Opening',
          startDate: '2026-10-20',
          endDate: '2026-11-20',
          calculatedPrice: 3375,
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
      physicalAdCapacity: 450,
      normalAdCapacity: 420,
      bufferAdCapacity: 30,
      totalSlots: 10,
      notes: 'Long-distance eastern highway commuter run',
      advertisements: [
        {
          id: 'AD-007-A',
          clientName: 'Canara Bank',
          durationSeconds: 90,
          campaignName: 'MSME Loan Scheme',
          startDate: '2026-10-18',
          endDate: '2026-12-18',
          calculatedPrice: 10500,
        },
        {
          id: 'AD-007-B',
          clientName: 'Nandilath G-Mart',
          durationSeconds: 60,
          campaignName: 'Mega Home Appliances',
          startDate: '2026-11-20',
          endDate: '2027-01-20',
          calculatedPrice: 7000,
        },
        {
          id: 'AD-007-C',
          clientName: 'Bismi Connect',
          durationSeconds: 30,
          campaignName: 'Smart Appliances',
          startDate: '2026-10-22',
          endDate: '2026-11-22',
          calculatedPrice: 2250,
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
      physicalAdCapacity: 450,
      normalAdCapacity: 420,
      bufferAdCapacity: 30,
      totalSlots: 10,
      notes: 'Northbound commercial transit link',
      advertisements: [
        {
          id: 'AD-008-A',
          clientName: 'Seematti Textiles',
          durationSeconds: 120,
          campaignName: 'Bridal Launch',
          startDate: '2026-10-28',
          endDate: '2026-11-28',
          calculatedPrice: 9000,
        },
        {
          id: 'AD-008-B',
          clientName: 'Bheema Jewellers',
          durationSeconds: 90,
          campaignName: 'Wedding Diamonds',
          startDate: '2026-10-30',
          endDate: '2026-12-30',
          calculatedPrice: 10500,
        },
        {
          id: 'AD-008-C',
          clientName: 'Joyalukkas',
          durationSeconds: 60,
          campaignName: 'Festive Gold Coins',
          startDate: '2026-10-25',
          endDate: '2026-11-25',
          calculatedPrice: 4500,
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
      physicalAdCapacity: 450,
      normalAdCapacity: 420,
      bufferAdCapacity: 30,
      totalSlots: 10,
      notes: 'Dense college and residential route',
      advertisements: [
        {
          id: 'AD-009-A',
          clientName: 'KIMS Health Hospital',
          durationSeconds: 90,
          campaignName: 'Super Specialty Care',
          startDate: '2026-11-08',
          endDate: '2027-01-08',
          calculatedPrice: 10500,
        },
        {
          id: 'AD-009-B',
          clientName: 'Federal Bank',
          durationSeconds: 60,
          campaignName: 'Easy NRI Banking',
          startDate: '2026-10-20',
          endDate: '2026-11-20',
          calculatedPrice: 4500,
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
      physicalAdCapacity: 450,
      normalAdCapacity: 420,
      bufferAdCapacity: 30,
      totalSlots: 10,
      notes: 'Southern MC Road feeder route',
      advertisements: [
        {
          id: 'AD-010-A',
          clientName: 'Federal Bank',
          durationSeconds: 120,
          campaignName: 'Digital Savings Account',
          startDate: '2026-10-22',
          endDate: '2026-12-22',
          calculatedPrice: 14000,
        },
        {
          id: 'AD-010-B',
          clientName: 'Atlas Jewellers',
          durationSeconds: 60,
          campaignName: 'Traditional Bangles',
          startDate: '2026-10-25',
          endDate: '2026-11-25',
          calculatedPrice: 4500,
        },
      ],
    },
  ];

  // Map backward compatibility slotBookings = advertisements for all default buses
  defaultBuses.forEach((b) => {
    b.slotBookings = b.advertisements;
  });

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
      enquiryId: quotation.enquiryId,
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
      enquiry_id: quotation.enquiryId || null,
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
          enquiryId: row.enquiry_id ?? cd.enquiryId,
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

export async function updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry | null> {
  const list = loadLocal<Enquiry[]>(LOCAL_ENQUIRIES_KEY, []);
  const idx = list.findIndex((e) => e.id === id);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveLocal(LOCAL_ENQUIRIES_KEY, list);
  }

  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;
    if (updates.quotationId !== undefined) payload.quotation_id = updates.quotationId;
    if (updates.negotiatedPrice !== undefined) payload.negotiated_price = updates.negotiatedPrice;
    if (updates.negotiationReason !== undefined) payload.negotiation_reason = updates.negotiationReason;
    if (updates.customerDetails !== undefined) payload.customer_details = updates.customerDetails;
    if (updates.pricingSnapshot !== undefined) payload.pricing_snapshot = updates.pricingSnapshot;
    if (updates.campaignId !== undefined) payload.campaign_id = updates.campaignId;
    if (updates.campaignName !== undefined) payload.campaign_name = updates.campaignName;

    await supabase.from('enquiries').update(payload).eq('id', id);
  } catch (err) {
    console.warn('Supabase update enquiry notice:', err);
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
// FLEET MANAGEMENT & TIME-BASED ADVERTISING INVENTORY LOGIC
// Loop Configuration: 720s loop = 450s ads + 180s song + 90s announcements
// Physical Ad Capacity: 450s per bus loop
// Normal Bookable Capacity: 420s per bus loop
// Emergency Buffer: 30s (420s to 450s) — auto-allocated when needed
// ============================================================

export interface BusTimeMetrics {
  totalLoopDuration: number;
  songEntertainmentDuration: number;
  passengerAnnouncementDuration: number;
  physicalAdCapacity: number;
  normalAdCapacity: number;
  reservedBuffer: number;
  bookedAdTime: number;
  availableAdTime: number;
  bufferTimeUsed: number;
  availableBufferTime: number;
  isBufferInUse: boolean;
  occupancyPercent: number;
  activeAdvertisementsCount: number;
  nextFreesUpDate: string | null;
  nextFreesUpClient: string | null;
  nextFreesUpDuration: number;
  // Backward compatibility fields
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  nextFreesUpSlotsCount: number;
}

export function getBusTimeMetrics(bus: BusRecord, targetDate?: Date | string): BusTimeMetrics {
  const physicalAdCapacity = bus.physicalAdCapacity || PHYSICAL_AD_CAPACITY; // 450
  const normalAdCapacity = bus.normalAdCapacity || BOOKABLE_CAPACITY;       // 420
  const reservedBuffer = bus.bufferAdCapacity || RESERVED_BUFFER;           // 30

  const ads = bus.advertisements || bus.slotBookings || [];

  const checkDate = targetDate ? new Date(targetDate) : new Date();
  checkDate.setHours(0, 0, 0, 0);

  // Active advertisements (running today or in the future)
  const activeAds = ads.filter((a) => {
    if (!a.endDate) return true;
    const end = new Date(a.endDate);
    end.setHours(23, 59, 59, 999);
    return end.getTime() >= checkDate.getTime();
  });

  const bookedAdTime = activeAds.reduce((sum, a) => {
    const dur = a.durationSeconds || a.videoDurationSeconds || ((a.slotsCount || 1) * 30);
    return sum + Number(dur || 0);
  }, 0);

  const availableAdTime = Math.max(0, normalAdCapacity - bookedAdTime);
  const isBufferInUse = bookedAdTime > normalAdCapacity;
  const bufferTimeUsed = isBufferInUse ? Math.min(reservedBuffer, bookedAdTime - normalAdCapacity) : 0;
  const availableBufferTime = Math.max(0, reservedBuffer - bufferTimeUsed);
  const occupancyPercent = Math.min(100, Math.round((bookedAdTime / normalAdCapacity) * 100));

  const sortedByExpiry = [...activeAds].sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  );
  const earliestExpiry = sortedByExpiry[0] || null;
  const earliestExpiryDur = earliestExpiry
    ? (earliestExpiry.durationSeconds || earliestExpiry.videoDurationSeconds || ((earliestExpiry.slotsCount || 1) * 30))
    : 0;

  return {
    totalLoopDuration: TOTAL_LOOP_DURATION,
    songEntertainmentDuration: SONG_ENTERTAINMENT_DURATION,
    passengerAnnouncementDuration: PASSENGER_ANNOUNCEMENT_DURATION,
    physicalAdCapacity,
    normalAdCapacity,
    reservedBuffer,
    bookedAdTime,
    availableAdTime,
    bufferTimeUsed,
    availableBufferTime,
    isBufferInUse,
    occupancyPercent,
    activeAdvertisementsCount: activeAds.length,
    nextFreesUpDate: earliestExpiry ? earliestExpiry.endDate : null,
    nextFreesUpClient: earliestExpiry ? earliestExpiry.clientName : null,
    nextFreesUpDuration: earliestExpiryDur,
    // Backward compatibility
    totalSlots: Math.round(normalAdCapacity / 30),
    bookedSlots: Math.ceil(bookedAdTime / 30),
    availableSlots: Math.floor(availableAdTime / 30),
    nextFreesUpSlotsCount: Math.ceil(earliestExpiryDur / 30),
  };
}

// Backward-compatible alias
export function getBusSlotMetrics(bus: BusRecord) {
  return getBusTimeMetrics(bus);
}

// Check availability for a specific booking date range on a single bus
export function checkBusAvailabilityForPeriod(
  bus: BusRecord,
  startDate: string,
  endDate: string,
  requestedDurationSeconds: number
): {
  isAvailable: boolean;
  canUseBuffer: boolean;
  bufferRequired: number;
  bookedDuringPeriod: number;
  availableDuringPeriod: number;
  shortageSeconds: number;
  reason?: string;
} {
  const normalCap = bus.normalAdCapacity || BOOKABLE_CAPACITY; // 420
  const physicalCap = bus.physicalAdCapacity || PHYSICAL_AD_CAPACITY; // 450

  const reqStart = new Date(startDate);
  reqStart.setHours(0, 0, 0, 0);
  const reqEnd = new Date(endDate);
  reqEnd.setHours(23, 59, 59, 999);

  const ads = bus.advertisements || bus.slotBookings || [];

  // Overlapping advertisements during requested period
  const overlappingAds = ads.filter((ad) => {
    const adStart = new Date(ad.startDate);
    adStart.setHours(0, 0, 0, 0);
    const adEnd = new Date(ad.endDate);
    adEnd.setHours(23, 59, 59, 999);
    return adStart <= reqEnd && adEnd >= reqStart;
  });

  const bookedDuringPeriod = overlappingAds.reduce((sum, ad) => {
    const dur = ad.durationSeconds || ad.videoDurationSeconds || ((ad.slotsCount || 1) * 30);
    return sum + Number(dur || 0);
  }, 0);

  const newTotal = bookedDuringPeriod + requestedDurationSeconds;

  if (newTotal <= normalCap) {
    return {
      isAvailable: true,
      canUseBuffer: false,
      bufferRequired: 0,
      bookedDuringPeriod,
      availableDuringPeriod: normalCap - bookedDuringPeriod,
      shortageSeconds: 0,
    };
  }

  if (newTotal <= physicalCap) {
    return {
      isAvailable: true,
      canUseBuffer: true,
      bufferRequired: newTotal - normalCap,
      bookedDuringPeriod,
      availableDuringPeriod: Math.max(0, normalCap - bookedDuringPeriod),
      shortageSeconds: 0,
    };
  }

  const shortage = newTotal - physicalCap;
  return {
    isAvailable: false,
    canUseBuffer: false,
    bufferRequired: 30,
    bookedDuringPeriod,
    availableDuringPeriod: Math.max(0, normalCap - bookedDuringPeriod),
    shortageSeconds: shortage,
    reason: `Requested ${requestedDurationSeconds}s exceeds total bus advertising capacity (Max 450s). Shortage: ${shortage}s.`,
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
      const remoteFleet = normalizeFleet({
        totalBuses: Math.max(data.total_buses || 0, data.buses.length),
        buses: data.buses,
      }, defaultFleet);
      saveLocal(LOCAL_FLEET_KEY, remoteFleet);
      return remoteFleet;
    }
  } catch {
    // fallback to local storage
  }

  return normalizeFleet(rawFleet, defaultFleet);
}

function normalizeFleet(fleetToNormalize: Fleet, defaultFleet: Fleet): Fleet {
  const existingBuses = fleetToNormalize.buses || [];
  const existingMap = new Map<string, BusRecord>();
  existingBuses.forEach((b) => {
    if (b && b.id) existingMap.set(b.id, b);
  });

  // Ensure all 10 default buses are represented
  const mergedBuses: BusRecord[] = [];
  defaultFleet.buses.forEach((defBus) => {
    if (existingMap.has(defBus.id)) {
      mergedBuses.push(existingMap.get(defBus.id)!);
      existingMap.delete(defBus.id);
    } else {
      mergedBuses.push(defBus);
    }
  });

  // Append any custom added buses (BUS-011, etc.)
  existingMap.forEach((customBus) => {
    mergedBuses.push(customBus);
  });

  const updatedBuses = mergedBuses.map((bus) => {
    const physicalAdCapacity = bus.physicalAdCapacity || PHYSICAL_AD_CAPACITY;
    const normalAdCapacity = bus.normalAdCapacity || BOOKABLE_CAPACITY;
    const bufferAdCapacity = bus.bufferAdCapacity || RESERVED_BUFFER;

    // CRITICAL FIX: If bus.advertisements is an array (even if empty []), PRESERVE IT!
    // Do NOT fall back to defaultBus if the user has released/emptied the ads!
    const rawAds = Array.isArray(bus.advertisements)
      ? bus.advertisements
      : Array.isArray(bus.slotBookings)
      ? bus.slotBookings
      : [];

    const advertisements = rawAds.map((ad) => {
      const dur = Number(ad.durationSeconds || ad.videoDurationSeconds || ((ad.slotsCount || 1) * 30));
      return {
        ...ad,
        durationSeconds: dur,
        videoDurationSeconds: dur,
        slotsCount: Math.ceil(dur / 30),
      };
    });

    return {
      ...bus,
      physicalAdCapacity,
      normalAdCapacity,
      bufferAdCapacity,
      totalSlots: Math.round(normalAdCapacity / 30),
      advertisements,
      slotBookings: advertisements, // mirror for backward compatibility
    };
  });

  return {
    totalBuses: updatedBuses.length,
    buses: updatedBuses,
  };
}

export async function updateFleet(updates: Partial<Fleet>): Promise<Fleet> {
  const current = loadLocal<Fleet>(LOCAL_FLEET_KEY, getDefaultFleet());
  const updatedBuses = (updates.buses || current.buses).map((bus) => {
    const ads = bus.advertisements ?? bus.slotBookings ?? [];
    return {
      ...bus,
      advertisements: ads,
      slotBookings: ads,
    };
  });

  const next: Fleet = {
    totalBuses: updates.totalBuses ?? updatedBuses.length,
    buses: updatedBuses,
  };

  // 1. Save locally immediately
  saveLocal(LOCAL_FLEET_KEY, next);

  // 2. Persist to Supabase asynchronously
  try {
    const { error } = await supabase.from('fleet').upsert({
      id: 'kollam_fleet',
      total_buses: next.totalBuses,
      buses: next.buses,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('Supabase fleet upsert error:', error.message);
    }
  } catch (err) {
    console.warn('Supabase offline or table error:', err);
  }

  return next;
}

export async function bookBusAdvertisement(
  busId: string,
  booking: Omit<AdvertisementBooking, 'id' | 'createdAt'>
): Promise<{ fleet: Fleet; usesBuffer: boolean; bufferSecondsUsed: number }> {
  const fleet = await getFleet();
  const busIndex = fleet.buses.findIndex((b) => b.id === busId);
  if (busIndex === -1) throw new Error(`Bus ${busId} not found`);

  const bus = fleet.buses[busIndex];
  const duration = Number(booking.durationSeconds || 30);

  const check = checkBusAvailabilityForPeriod(bus, booking.startDate, booking.endDate, duration);
  if (!check.isAvailable) {
    throw new Error(check.reason || `Duration ${duration}s exceeds physical capacity (450s max).`);
  }

  const newBooking: AdvertisementBooking = {
    ...booking,
    id: `AD-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
    durationSeconds: duration,
    videoDurationSeconds: duration,
    slotsCount: Math.ceil(duration / 30),
    usesBuffer: check.canUseBuffer,
    bufferSecondsUsed: check.bufferRequired,
    createdAt: new Date().toISOString(),
  };

  const currentAds = bus.advertisements || bus.slotBookings || [];
  const updatedAds = [...currentAds, newBooking];

  fleet.buses[busIndex] = {
    ...bus,
    advertisements: updatedAds,
    slotBookings: updatedAds,
  };

  await updateFleet(fleet);
  return { fleet, usesBuffer: check.canUseBuffer, bufferSecondsUsed: check.bufferRequired };
}

// Backward compatibility alias
export async function bookBusSlots(
  busId: string,
  booking: Omit<SlotBooking, 'id' | 'createdAt'>
): Promise<Fleet> {
  const dur = booking.durationSeconds || booking.videoDurationSeconds || ((booking.slotsCount || 1) * 30);
  const result = await bookBusAdvertisement(busId, {
    ...booking,
    durationSeconds: dur,
  });
  return result.fleet;
}

export async function releaseBusAdvertisement(
  busId: string,
  bookingId: string
): Promise<Fleet> {
  const fleet = await getFleet();
  const busIndex = fleet.buses.findIndex((b) => b.id === busId);
  if (busIndex === -1) throw new Error(`Bus ${busId} not found`);

  const currentAds = fleet.buses[busIndex].advertisements || fleet.buses[busIndex].slotBookings || [];
  const filteredAds = currentAds.filter((b) => b.id !== bookingId);

  fleet.buses[busIndex] = {
    ...fleet.buses[busIndex],
    advertisements: filteredAds,
    slotBookings: filteredAds,
  };

  const updatedFleet = await updateFleet(fleet);
  return updatedFleet;
}

// Backward compatibility alias
export async function releaseBusSlot(
  busId: string,
  bookingId: string
): Promise<Fleet> {
  return releaseBusAdvertisement(busId, bookingId);
}

export async function bookFleetWideAdvertisements(
  busIds: string[],
  booking: Omit<AdvertisementBooking, 'id' | 'createdAt'>
): Promise<Fleet> {
  const fleet = await getFleet();
  const duration = Number(booking.durationSeconds || 30);
  const timestamp = Date.now().toString(36);

  // Validate all targeted buses first
  for (const bId of busIds) {
    const b = fleet.buses.find((x) => x.id === bId);
    if (b) {
      const check = checkBusAvailabilityForPeriod(b, booking.startDate, booking.endDate, duration);
      if (!check.isAvailable) {
        throw new Error(`Cannot book across fleet: Bus ${b.busName || b.busNumber} exceeds capacity (${check.reason}).`);
      }
    }
  }

  fleet.buses = fleet.buses.map((bus, idx) => {
    if (!busIds.includes(bus.id)) return bus;
    const check = checkBusAvailabilityForPeriod(bus, booking.startDate, booking.endDate, duration);
    const newBooking: AdvertisementBooking = {
      ...booking,
      id: `FLEET-AD-${timestamp}-${idx}`,
      durationSeconds: duration,
      videoDurationSeconds: duration,
      slotsCount: Math.ceil(duration / 30),
      usesBuffer: check.canUseBuffer,
      bufferSecondsUsed: check.bufferRequired,
      createdAt: new Date().toISOString(),
    };
    const ads = [...(bus.advertisements || bus.slotBookings || []), newBooking];
    return {
      ...bus,
      advertisements: ads,
      slotBookings: ads,
    };
  });

  await updateFleet(fleet);
  return fleet;
}

// Backward compatibility alias
export async function bookFleetWideSlots(
  busIds: string[],
  booking: Omit<SlotBooking, 'id' | 'createdAt'>
): Promise<Fleet> {
  const dur = booking.durationSeconds || booking.videoDurationSeconds || ((booking.slotsCount || 1) * 30);
  return bookFleetWideAdvertisements(busIds, {
    ...booking,
    durationSeconds: dur,
  });
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

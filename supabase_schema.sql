-- ============================================================
-- CATGORITHM BUS SCREEN ADVERTISING — SUPABASE SQL SCHEMA
-- Time-Based Advertising Inventory, Fleet, Quotations & Enquiries
-- ============================================================

-- 1. FLEET INVENTORY & TIME-BASED ADVERTISING LOOPS
-- Stores the fleet configuration, route stops, and active advertisement bookings.
-- 12-minute loop (720s) = 450s physical ad capacity (420s normal + 30s buffer).
CREATE TABLE IF NOT EXISTS public.fleet (
    id TEXT PRIMARY KEY DEFAULT 'kollam_fleet',
    total_buses INTEGER NOT NULL DEFAULT 10,
    buses JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Allow public access for anon key operations
ALTER TABLE public.fleet ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read fleet" ON public.fleet;
CREATE POLICY "Allow anon read fleet" ON public.fleet
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon upsert fleet" ON public.fleet;
CREATE POLICY "Allow anon upsert fleet" ON public.fleet
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- 2. QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.quotations (
    id TEXT PRIMARY KEY,
    customer_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    pricing_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    campaign_id TEXT,
    campaign_name TEXT,
    campaign_start_date DATE,
    campaign_end_date DATE,
    billed_months INTEGER DEFAULT 1,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all quotations" ON public.quotations;
CREATE POLICY "Allow anon all quotations" ON public.quotations
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- 3. ENQUIRIES & PIPELINE CRM TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'New',
    customer_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    pricing_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    quotation_id TEXT REFERENCES public.quotations(id) ON DELETE SET NULL,
    campaign_id TEXT,
    campaign_name TEXT,
    admin_notes TEXT,
    negotiated_price NUMERIC,
    negotiation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all enquiries" ON public.enquiries;
CREATE POLICY "Allow anon all enquiries" ON public.enquiries
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- 4. OPTIONAL: DEDICATED ADVERTISEMENTS TABLE (FOR ADVANCED REPORTING)
-- For teams preferring normalized rows alongside the JSONB fleet store.
CREATE TABLE IF NOT EXISTS public.advertisement_bookings (
    id TEXT PRIMARY KEY,
    bus_id TEXT NOT NULL,
    bus_number TEXT,
    client_name TEXT NOT NULL,
    campaign_name TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 30,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    months INTEGER NOT NULL DEFAULT 1,
    calculated_price NUMERIC,
    uses_buffer BOOLEAN DEFAULT false,
    buffer_seconds_used INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.advertisement_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all advertisement_bookings" ON public.advertisement_bookings;
CREATE POLICY "Allow anon all advertisement_bookings" ON public.advertisement_bookings
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

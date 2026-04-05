-- NextLevel Scheduler — Database Schema
-- Run this in Supabase SQL Editor or via Management API

-- MAs (Medical Assistants)
CREATE TABLE IF NOT EXISTS mas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Providers (Doctors)
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Monthly passcodes
CREATE TABLE IF NOT EXISTS passcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  valid_month TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Schedule entries (one row per MA per day they work)
CREATE TABLE IF NOT EXISTS schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  ma_id UUID REFERENCES mas(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, ma_id)
);

-- Swap requests
CREATE TABLE IF NOT EXISTS swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_ma_id UUID REFERENCES mas(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  swap_type TEXT NOT NULL CHECK (swap_type IN ('1:1', 'leave')),
  note TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'closed')),
  accepted_by_ma_id UUID REFERENCES mas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE mas ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE passcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;

-- Open policies (no auth yet — tightened when passcode auth is added)
CREATE POLICY "allow_all_mas" ON mas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_providers" ON providers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_passcodes" ON passcodes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_schedule_entries" ON schedule_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_swap_requests" ON swap_requests FOR ALL USING (true) WITH CHECK (true);

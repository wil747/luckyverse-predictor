/*
# Create racing admin tables (single-tenant, no auth)

1. New Tables
- `race_results`: Records every completed race — winner, bet amounts, payouts, and the 15% house commission. Used for profit charts and history.
  - `id` (uuid, PK)
  - `race_number` (int) — sequential race identifier
  - `winner_name` (text) — winning horse name
  - `winner_odds` (numeric) — odds of the winner
  - `bet_amount` (int) — total GC wagered by the player
  - `payout` (int) — GC paid out to the player (0 if lost)
  - `house_commission` (int) — 15% of total wagered, retained by the house
  - `is_special` (bool, default false) — whether this was a special/classic race with doubled odds
  - `created_at` (timestamptz)
- `house_settings`: Single-row config table for the jackpot base amount and admin PIN.
  - `id` (int, PK, always 1)
  - `jackpot_base` (int, default 5000) — configurable base jackpot amount in GC
  - `admin_pin` (text, default '1234') — PIN to access the admin panel
- `special_races`: Scheduled special/classic races where odds and prizes are doubled.
  - `id` (uuid, PK)
  - `race_number` (int) — which race number will be special
  - `multiplier` (int, default 2) — odds/payout multiplier
  - `label` (text) — display name e.g. "Clásico del Verano"
  - `active` (bool, default true) — whether this special race is still pending
  - `created_at` (timestamptz)

2. Security
- Enable RLS on all tables.
- Allow anon + authenticated CRUD on all tables (single-tenant app, no sign-in screen).
- `USING (true)` is acceptable because the app has no login and the data is intentionally shared.

3. Important Notes
- The `house_settings` table is seeded with a single row (id=1, jackpot_base=5000, admin_pin='1234').
- The house commission is 15% of every bet placed, calculated client-side and stored per race.
- Special races double the odds multiplier; the admin can schedule them from the /admin panel.
*/

CREATE TABLE IF NOT EXISTS race_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_number int NOT NULL,
  winner_name text NOT NULL,
  winner_odds numeric NOT NULL,
  bet_amount int NOT NULL DEFAULT 0,
  payout int NOT NULL DEFAULT 0,
  house_commission int NOT NULL DEFAULT 0,
  is_special boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_race_results" ON race_results;
CREATE POLICY "anon_select_race_results" ON race_results FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_race_results" ON race_results;
CREATE POLICY "anon_insert_race_results" ON race_results FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_race_results" ON race_results;
CREATE POLICY "anon_update_race_results" ON race_results FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_race_results" ON race_results;
CREATE POLICY "anon_delete_race_results" ON race_results FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS house_settings (
  id int PRIMARY KEY DEFAULT 1,
  jackpot_base int NOT NULL DEFAULT 5000,
  admin_pin text NOT NULL DEFAULT '1234'
);

ALTER TABLE house_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_house_settings" ON house_settings;
CREATE POLICY "anon_select_house_settings" ON house_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_house_settings" ON house_settings;
CREATE POLICY "anon_update_house_settings" ON house_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_house_settings" ON house_settings;
CREATE POLICY "anon_insert_house_settings" ON house_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Seed the single settings row
INSERT INTO house_settings (id, jackpot_base, admin_pin)
VALUES (1, 5000, '1234')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS special_races (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_number int NOT NULL,
  multiplier int NOT NULL DEFAULT 2,
  label text NOT NULL DEFAULT 'Clásico',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE special_races ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_special_races" ON special_races;
CREATE POLICY "anon_select_special_races" ON special_races FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_special_races" ON special_races;
CREATE POLICY "anon_insert_special_races" ON special_races FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_special_races" ON special_races;
CREATE POLICY "anon_update_special_races" ON special_races FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_special_races" ON special_races;
CREATE POLICY "anon_delete_special_races" ON special_races FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_race_results_created_at ON race_results (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_race_results_race_number ON race_results (race_number);
CREATE INDEX IF NOT EXISTS idx_special_races_active ON special_races (active);

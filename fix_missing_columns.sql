-- Add missing columns to support the application code

-- 1. Add results_data to seller_sheets (Required for saving calculation results)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seller_sheets' AND column_name = 'results_data') THEN
        ALTER TABLE seller_sheets ADD COLUMN results_data jsonb;
    END IF;
END $$;

-- 2. Add last_calculated_at to leads (Used for tracking activity)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'last_calculated_at') THEN
        ALTER TABLE leads ADD COLUMN last_calculated_at timestamptz default now();
    END IF;
END $$;

-- 3. Ensure email column in leads is unique constraint (required for ON CONFLICT upsert)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_email_key') THEN
        ALTER TABLE leads ADD CONSTRAINT leads_email_key UNIQUE (email);
    END IF;
END $$;

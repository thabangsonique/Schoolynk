-- ============================================================
-- Create school_settings table if it doesn't exist
-- Run this ONCE in the Supabase SQL editor.
-- ============================================================

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.school_settings (
  id BIGSERIAL PRIMARY KEY,
  school_name VARCHAR(255) NOT NULL,
  geo_latitude DOUBLE PRECISION,
  geo_longitude DOUBLE PRECISION,
  geo_radius_meters INTEGER,
  clock_in_start TIME,
  clock_in_deadline TIME,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.school_settings;
DROP POLICY IF EXISTS "Allow write access for admins" ON public.school_settings;

-- Create RLS policies
-- Allow authenticated users to read school settings
CREATE POLICY "Allow read access for authenticated users" ON public.school_settings
  FOR SELECT TO authenticated
  USING (true);

-- Allow admins to update school settings (requires admin profile)
CREATE POLICY "Allow write access for admins" ON public.school_settings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to insert school settings
CREATE POLICY "Allow insert for admins" ON public.school_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create a function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-update the updated_at column
DROP TRIGGER IF EXISTS update_school_settings_updated_at ON public.school_settings;
CREATE TRIGGER update_school_settings_updated_at
  BEFORE UPDATE ON public.school_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions to authenticated users
GRANT SELECT ON public.school_settings TO authenticated;
GRANT UPDATE ON public.school_settings TO authenticated;
GRANT INSERT ON public.school_settings TO authenticated;

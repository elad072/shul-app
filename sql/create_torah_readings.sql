-- Create torah_readings table for managing weekly Torah reading assignments
CREATE TABLE IF NOT EXISTS torah_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gregorian_date DATE NOT NULL,
  hebrew_date TEXT NOT NULL,
  parasha_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_name TEXT, -- For display (either user's name or free-text)
  is_self_assigned BOOLEAN DEFAULT false,
  assigned_by_gabbai_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(gregorian_date, year)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_torah_readings_date ON torah_readings(gregorian_date);
CREATE INDEX IF NOT EXISTS idx_torah_readings_year ON torah_readings(year);
CREATE INDEX IF NOT EXISTS idx_torah_readings_user ON torah_readings(assigned_user_id);

-- Enable RLS
ALTER TABLE torah_readings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view (public access)
CREATE POLICY "Anyone can view torah readings"
  ON torah_readings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Members can self-assign (insert their own assignment)
CREATE POLICY "Members can self-assign"
  ON torah_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    assigned_user_id = auth.uid() AND
    is_self_assigned = true
  );

-- Policy: Members can update their own assignments
CREATE POLICY "Members can update own assignments"
  ON torah_readings
  FOR UPDATE
  TO authenticated
  USING (assigned_user_id = auth.uid() AND is_self_assigned = true)
  WITH CHECK (assigned_user_id = auth.uid() AND is_self_assigned = true);

-- Policy: Members can delete their own assignments
CREATE POLICY "Members can delete own assignments"
  ON torah_readings
  FOR DELETE
  TO authenticated
  USING (assigned_user_id = auth.uid() AND is_self_assigned = true);

-- Policy: Gabbais can do everything
CREATE POLICY "Gabbais can manage all assignments"
  ON torah_readings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_gabbai = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_gabbai = true
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_torah_readings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER torah_readings_updated_at
  BEFORE UPDATE ON torah_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_torah_readings_updated_at();

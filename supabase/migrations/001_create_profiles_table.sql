-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'invited', 'suspended')) DEFAULT 'active',
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'cashier', 'manager')) DEFAULT 'cashier',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read profiles
CREATE POLICY "Allow authenticated users to read profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert profiles
CREATE POLICY "Allow authenticated users to insert profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update profiles
CREATE POLICY "Allow authenticated users to update profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete profiles
CREATE POLICY "Allow authenticated users to delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert some sample data (optional - for testing)
-- INSERT INTO profiles (first_name, last_name, username, email, phone_number, status, role) VALUES
-- ('John', 'Doe', 'johndoe', 'john.doe@example.com', '+1234567890', 'active', 'admin'),
-- ('Jane', 'Smith', 'janesmith', 'jane.smith@example.com', '+1234567891', 'active', 'manager'),
-- ('Bob', 'Johnson', 'bobjohnson', 'bob.johnson@example.com', '+1234567892', 'inactive', 'cashier');


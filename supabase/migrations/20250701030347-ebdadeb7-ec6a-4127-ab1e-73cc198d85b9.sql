
-- Add additional columns to profiles table for vehicle owners and farmers
ALTER TABLE public.profiles 
ADD COLUMN address TEXT,
ADD COLUMN mobile_number TEXT,
ADD COLUMN license_number TEXT,
ADD COLUMN vehicle_number TEXT,
ADD COLUMN photo_url TEXT;

-- Create a table to store vehicle booking tasks
CREATE TYPE public.task_type AS ENUM ('ploughing', 'sowing', 'harvesting', 'manuring', 'cultivation', 'irrigation', 'other');

-- Update the existing vehicles table or create if it doesn't exist
-- (Since we're using mock data, let's create a proper vehicles table)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  price_per_hour DECIMAL(10,2) NOT NULL,
  location TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vehicles table
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicles table
CREATE POLICY "Anyone can view available vehicles" 
  ON public.vehicles 
  FOR SELECT 
  USING (is_available = true);

CREATE POLICY "Vehicle owners can manage their vehicles" 
  ON public.vehicles 
  FOR ALL 
  USING (owner_id = auth.uid());

-- Create bookings table to replace localStorage usage
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL,
  field_location TEXT NOT NULL,
  task task_type NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings table
CREATE POLICY "Farmers can view their own bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (farmer_id = auth.uid());

CREATE POLICY "Vehicle owners can view bookings for their vehicles" 
  ON public.bookings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles 
      WHERE vehicles.id = bookings.vehicle_id 
      AND vehicles.owner_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can create bookings" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Vehicle owners can update booking status" 
  ON public.bookings 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles 
      WHERE vehicles.id = bookings.vehicle_id 
      AND vehicles.owner_id = auth.uid()
    )
  );

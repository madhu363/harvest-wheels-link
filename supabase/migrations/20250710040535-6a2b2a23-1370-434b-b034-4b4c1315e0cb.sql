-- Add policy to allow vehicle owners to view farmer profiles for their bookings
CREATE POLICY "Vehicle owners can view farmer profiles for bookings" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.farmer_id = profiles.id 
    AND v.owner_id = auth.uid()
  )
);
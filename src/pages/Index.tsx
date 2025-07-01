
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Auth from '@/pages/Auth';
import { ProfileSetup } from '@/components/ProfileSetup';
import { FarmerDashboard } from '@/components/farmer/FarmerDashboard';
import { VehicleOwnerDashboard } from '@/components/owner/VehicleOwnerDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Tractor } from 'lucide-react';

const Index = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Tractor className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // Check if profile setup is needed
  if (profile) {
    const isProfileIncomplete = !profile.address || !profile.mobile_number || 
      (profile.role === 'vehicle_owner' && (!profile.license_number || !profile.vehicle_number));
    
    if (isProfileIncomplete) {
      return <ProfileSetup />;
    }
  }

  switch (user.role) {
    case 'farmer':
      return <FarmerDashboard />;
    case 'vehicle_owner':
      return <VehicleOwnerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Auth />;
  }
};

export default Index;

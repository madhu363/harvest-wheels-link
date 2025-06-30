
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Login } from '@/components/Login';
import { FarmerDashboard } from '@/components/farmer/FarmerDashboard';
import { VehicleOwnerDashboard } from '@/components/owner/VehicleOwnerDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  switch (user.role) {
    case 'farmer':
      return <FarmerDashboard />;
    case 'vehicle_owner':
      return <VehicleOwnerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Login />;
  }
};

export default Index;

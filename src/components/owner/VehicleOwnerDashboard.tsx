
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { BookingRequests } from './BookingRequests';
import { MyVehicles } from './MyVehicles';
import { Button } from '@/components/ui/button';
import { Inbox, Truck } from 'lucide-react';

export const VehicleOwnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'vehicles'>('requests');

  return (
    <Layout title="Vehicle Owner Dashboard">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome, Vehicle Owner!</h2>
          <p className="text-gray-600">Manage your vehicle bookings and requests.</p>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'requests' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('requests')}
            className="flex items-center space-x-2"
          >
            <Inbox className="h-4 w-4" />
            <span>Booking Requests</span>
          </Button>
          <Button
            variant={activeTab === 'vehicles' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('vehicles')}
            className="flex items-center space-x-2"
          >
            <Truck className="h-4 w-4" />
            <span>My Vehicles</span>
          </Button>
        </div>

        {activeTab === 'requests' && <BookingRequests />}
        {activeTab === 'vehicles' && <MyVehicles />}
      </div>
    </Layout>
  );
};

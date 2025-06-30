
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { VehicleList } from './VehicleList';
import { BookingHistory } from './BookingHistory';
import { Button } from '@/components/ui/button';
import { Tractor, History } from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'bookings'>('vehicles');

  return (
    <Layout title="Farmer Dashboard">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome, Farmer!</h2>
          <p className="text-gray-600">Book agricultural vehicles for your farming needs.</p>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'vehicles' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('vehicles')}
            className="flex items-center space-x-2"
          >
            <Tractor className="h-4 w-4" />
            <span>Available Vehicles</span>
          </Button>
          <Button
            variant={activeTab === 'bookings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('bookings')}
            className="flex items-center space-x-2"
          >
            <History className="h-4 w-4" />
            <span>My Bookings</span>
          </Button>
        </div>

        {activeTab === 'vehicles' && <VehicleList />}
        {activeTab === 'bookings' && <BookingHistory />}
      </div>
    </Layout>
  );
};

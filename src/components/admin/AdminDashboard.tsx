
import React from 'react';
import { Layout } from '@/components/Layout';
import { AllBookings } from './AllBookings';
import { UserManagement } from './UserManagement';
import { DashboardStats } from './DashboardStats';

export const AdminDashboard: React.FC = () => {
  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Dashboard</h2>
          <p className="text-gray-600">Monitor and manage the agricultural vehicle booking system.</p>
        </div>

        <DashboardStats />
        <AllBookings />
        <UserManagement />
      </div>
    </Layout>
  );
};

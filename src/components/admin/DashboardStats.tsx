
import React, { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { Users, Truck, Calendar, DollarSign } from 'lucide-react';

export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    acceptedBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const totalBookings = savedBookings.length;
    const pendingBookings = savedBookings.filter((b: Booking) => b.status === 'pending').length;
    const acceptedBookings = savedBookings.filter((b: Booking) => b.status === 'accepted').length;
    const totalRevenue = savedBookings
      .filter((b: Booking) => b.status === 'accepted')
      .reduce((sum: number, b: Booking) => sum + b.totalAmount, 0);

    setStats({
      totalBookings,
      pendingBookings,
      acceptedBookings,
      totalRevenue
    });
  }, []);

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingBookings,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Accepted Bookings',
      value: stats.acceptedBookings,
      icon: Truck,
      color: 'bg-green-500'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue}`,
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MapPin, DollarSign, Wrench } from 'lucide-react';

interface BookingWithVehicle {
  id: string;
  date: string;
  time: string;
  duration: number;
  field_location: string;
  task: string;
  status: string;
  total_amount: number;
  notes?: string;
  created_at: string;
  vehicles: {
    name: string;
  };
}

export const BookingHistory: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          date,
          time,
          duration,
          field_location,
          task,
          status,
          total_amount,
          notes,
          created_at,
          vehicles (
            name
          )
        `)
        .eq('farmer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTask = (task: string) => {
    return task.charAt(0).toUpperCase() + task.slice(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Loading bookings...</div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No bookings yet. Start by booking a vehicle!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Your Bookings</h3>
      
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-lg font-semibold text-gray-900">{booking.vehicles.name}</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(booking.date).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {booking.time} ({booking.duration}h)
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {booking.field_location}
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              ${Number(booking.total_amount).toFixed(2)}
            </div>
          </div>

          <div className="flex items-center mb-3">
            <Wrench className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Task: {formatTask(booking.task)}</span>
          </div>
          
          {booking.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">{booking.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

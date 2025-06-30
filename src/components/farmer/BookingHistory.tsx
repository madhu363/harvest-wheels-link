
import React, { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';

export const BookingHistory: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const userBookings = savedBookings.filter((booking: Booking) => booking.farmerId === user?.id);
    setBookings(userBookings);
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            <h4 className="text-lg font-semibold text-gray-900">{booking.vehicleName}</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {booking.date}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {booking.time} ({booking.duration}h)
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {booking.location}
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              ${booking.totalAmount}
            </div>
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

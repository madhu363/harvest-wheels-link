
import React, { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { Calendar, Clock, MapPin, DollarSign, User } from 'lucide-react';

export const AllBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    setBookings(savedBookings);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">All Bookings</h3>
      </div>
      
      <div className="p-6">
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{booking.vehicleName}</h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <User className="h-4 w-4 mr-1" />
                      {booking.farmerName}
                    </div>
                  </div>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

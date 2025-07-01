
import React, { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, DollarSign, User } from 'lucide-react';

export const BookingRequests: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    // Filter bookings for vehicles owned by this user
    const ownerBookings = savedBookings.filter((booking: Booking) => {
      // In a real app, we'd check if the vehicle belongs to this owner
      // For demo, we'll show all bookings to the owner
      return booking.status === 'pending';
    });
    setBookings(ownerBookings);
  }, [user]);

  const handleBookingAction = (bookingId: string, action: 'accepted' | 'rejected') => {
    const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = savedBookings.map((booking: Booking) => 
      booking.id === bookingId ? { ...booking, status: action } : booking
    );
    
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    
    // Update local state
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    
    toast({
      title: `Booking ${action}`,
      description: `You have ${action} the booking request.`,
      variant: action === 'accepted' ? 'default' : 'destructive',
    });
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No pending booking requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Pending Booking Requests</h3>
      
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{booking.vehicleName}</h4>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <User className="h-4 w-4 mr-1" />
                Requested by: {booking.farmerName}
              </div>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              PENDING
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
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
              {booking.fieldLocation}
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              ${booking.totalAmount}
            </div>
          </div>
          
          {booking.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600"><strong>Notes:</strong> {booking.notes}</p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button
              onClick={() => handleBookingAction(booking.id, 'rejected')}
              variant="outline"
              className="flex-1"
            >
              Reject
            </Button>
            <Button
              onClick={() => handleBookingAction(booking.id, 'accepted')}
              className="flex-1"
            >
              Accept
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

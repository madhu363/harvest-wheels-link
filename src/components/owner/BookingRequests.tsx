
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MapPin, DollarSign, User } from 'lucide-react';

interface BookingWithDetails {
  id: string;
  farmer_id: string;
  vehicle_id: string;
  date: string;
  time: string;
  duration: number;
  field_location: string;
  task: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  farmer_name: string;
  farmer_mobile: string;
  vehicle_name: string;
}

export const BookingRequests: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookingRequests();
    }
  }, [user]);

  const fetchBookingRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles!farmer_id(name, mobile_number),
          vehicles!vehicle_id(name, owner_id)
        `)
        .eq('vehicles.owner_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBookings: BookingWithDetails[] = data.map(booking => ({
        id: booking.id,
        farmer_id: booking.farmer_id,
        vehicle_id: booking.vehicle_id,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        field_location: booking.field_location,
        task: booking.task,
        status: booking.status,
        total_amount: Number(booking.total_amount),
        notes: booking.notes,
        created_at: booking.created_at,
        farmer_name: booking.profiles?.name || 'Unknown Farmer',
        farmer_mobile: booking.profiles?.mobile_number || '',
        vehicle_name: booking.vehicles?.name || 'Unknown Vehicle'
      }));

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      toast({
        title: "Error",
        description: "Failed to load booking requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (booking: BookingWithDetails, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: action })
        .eq('id', booking.id);

      if (error) throw error;

      // Send push notification to farmer
      if (booking.farmer_mobile) {
        const statusMessage = action === 'accepted' ? 'accepted' : 'rejected';
        const message = `Your booking request has been ${statusMessage}!\n\nVehicle: ${booking.vehicle_name}\nDate: ${booking.date} at ${booking.time}\nTask: ${booking.task}\nLocation: ${booking.field_location}\nAmount: $${booking.total_amount}${action === 'accepted' ? '\n\nPlease be ready at the scheduled time.' : ''}`;
        
        try {
          // Get farmer profile for email
          const { data: farmerProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', booking.farmer_id)
            .single();

          await supabase.functions.invoke('send-notification', {
            body: {
              to: {
                email: farmerProfile?.email || '',
                phone: booking.farmer_mobile
              },
              message: message,
              type: 'booking_status_update'
            }
          });
        } catch (notificationError) {
          console.error('Failed to send notification to farmer:', notificationError);
        }
      }

      toast({
        title: `Booking ${action}`,
        description: `You have ${action} the booking request. The farmer has been notified via push notification.`,
        variant: action === 'accepted' ? 'default' : 'destructive',
      });

      fetchBookingRequests();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Loading booking requests...</div>
      </div>
    );
  }

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
              <h4 className="text-lg font-semibold text-gray-900">{booking.vehicle_name}</h4>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <User className="h-4 w-4 mr-1" />
                Requested by: {booking.farmer_name}
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
              {booking.field_location}
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              ${booking.total_amount}
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600"><strong>Task:</strong> {booking.task}</p>
          </div>
          
          {booking.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600"><strong>Notes:</strong> {booking.notes}</p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button
              onClick={() => handleBookingAction(booking, 'rejected')}
              variant="outline"
              className="flex-1"
            >
              Reject
            </Button>
            <Button
              onClick={() => handleBookingAction(booking, 'accepted')}
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

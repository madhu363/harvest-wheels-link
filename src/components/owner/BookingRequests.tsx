
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
      console.log('Fetching booking requests for owner:', user.id);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          farmer_profile:profiles!farmer_id(name, mobile_number),
          vehicle_info:vehicles!vehicle_id(name, owner_id)
        `)
        .eq('vehicle_info.owner_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      console.log('Raw booking data from database:', data);

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
        farmer_name: booking.farmer_profile?.name || 'Unknown Farmer',
        farmer_mobile: booking.farmer_profile?.mobile_number || '',
        vehicle_name: booking.vehicle_info?.name || 'Unknown Vehicle'
      }));

      console.log('Formatted bookings with farmer mobile numbers:', formattedBookings.map(b => ({ 
        id: b.id, 
        farmer_name: b.farmer_name, 
        farmer_mobile: b.farmer_mobile 
      })));

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

      // Send SMS notification to farmer
      console.log('Checking farmer mobile number for booking:', booking.id, 'Mobile:', booking.farmer_mobile);
      
      if (booking.farmer_mobile) {
        const statusMessage = action === 'accepted' ? 'accepted' : 'rejected';
        const message = `Your booking request has been ${statusMessage}!\n\nVehicle: ${booking.vehicle_name}\nDate: ${booking.date} at ${booking.time}\nTask: ${booking.task}\nLocation: ${booking.field_location}\nAmount: $${booking.total_amount}${action === 'accepted' ? '\n\nPlease be ready at the scheduled time.' : ''}`;
        
        try {
          console.log('Sending SMS to farmer:', booking.farmer_mobile);
          const farmerSmsResponse = await supabase.functions.invoke('send-sms', {
            body: {
              to: booking.farmer_mobile,
              message: message
            }
          });

          console.log('Farmer SMS function response:', farmerSmsResponse);

          if (farmerSmsResponse.error) {
            console.error('SMS function returned error for farmer:', farmerSmsResponse.error);
          } else {
            console.log('SMS sent successfully to farmer');
          }
        } catch (smsError) {
          console.error('Failed to send SMS to farmer:', smsError);
        }
      } else {
        console.log('No mobile number found for farmer. Booking farmer_id:', booking.farmer_id);
      }

      toast({
        title: `Booking ${action}`,
        description: `You have ${action} the booking request. The farmer has been notified via SMS.`,
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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading booking requests...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Calendar className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Requests</h3>
        <p className="text-muted-foreground">You don't have any pending booking requests at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground">Pending Booking Requests</h3>
        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {bookings.length} Request{bookings.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-card rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-foreground">{booking.vehicle_name}</h4>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                <span className="font-medium">Requested by:</span>
                <span className="ml-1 text-foreground font-semibold">{booking.farmer_name}</span>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm font-semibold border border-amber-200 dark:border-amber-800">
                PENDING APPROVAL
              </span>
              <span className="text-2xl font-bold text-primary">${booking.total_amount}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Date</p>
                <p className="text-sm font-semibold text-foreground">{booking.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Time & Duration</p>
                <p className="text-sm font-semibold text-foreground">{booking.time} ({booking.duration}h)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Location</p>
                <p className="text-sm font-semibold text-foreground truncate">{booking.field_location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg">
              <div className="p-2 bg-primary/20 rounded-full">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-primary/80 font-medium">Total Amount</p>
                <p className="text-lg font-bold text-primary">${booking.total_amount}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-1 bg-blue-500 rounded">
                  <span className="text-xs text-white font-bold">TASK</span>
                </div>
              </div>
              <p className="text-blue-900 dark:text-blue-100 font-semibold capitalize">{booking.task}</p>
            </div>
            
            {booking.notes && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-1 bg-amber-500 rounded">
                    <span className="text-xs text-white font-bold">NOTES</span>
                  </div>
                </div>
                <p className="text-amber-900 dark:text-amber-100">{booking.notes}</p>
              </div>
            )}
          </div>
          
          <div className="flex space-x-4">
            <Button
              onClick={() => handleBookingAction(booking, 'rejected')}
              variant="destructive"
              size="lg"
              className="flex-1 h-12 font-semibold"
            >
              Reject Request
            </Button>
            <Button
              onClick={() => handleBookingAction(booking, 'accepted')}
              size="lg"
              className="flex-1 h-12 font-semibold bg-green-600 hover:bg-green-700 text-white"
            >
              Accept Request
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

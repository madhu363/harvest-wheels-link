
import React, { useState } from 'react';
import { Vehicle } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { X, Calendar, Clock, MapPin } from 'lucide-react';
import { MapLocationPicker } from './MapLocationPicker';

interface BookingModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ vehicle, isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [useMapLocation, setUseMapLocation] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 1,
    fieldLocation: '',
    fieldCoordinates: { lat: 0, lng: 0 },
    task: '',
    notes: ''
  });

  const taskOptions = [
    { value: 'ploughing', label: 'Ploughing' },
    { value: 'sowing', label: 'Sowing' },
    { value: 'harvesting', label: 'Harvesting' },
    { value: 'manuring', label: 'Manuring' },
    { value: 'cultivation', label: 'Cultivation' },
    { value: 'irrigation', label: 'Irrigation' },
    { value: 'other', label: 'Other' }
  ];

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      fieldLocation: location.address,
      fieldCoordinates: { lat: location.lat, lng: location.lng }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) return;

    setIsLoading(true);
    try {
      // Get vehicle owner details for notification
      const { data: vehicleOwner } = await supabase
        .from('profiles')
        .select('mobile_number, name, email')
        .eq('id', vehicle.ownerId)
        .single();

      const bookingData = {
        farmer_id: user.id,
        vehicle_id: vehicle.id,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        field_location: formData.fieldLocation,
        task: formData.task as any,
        total_amount: vehicle.pricePerHour * formData.duration,
        notes: formData.notes,
        status: 'pending'
      };

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) throw error;

      console.log('Booking created successfully, now sending notifications...');

      // Send push notification to vehicle owner
      if (vehicleOwner?.mobile_number) {
        try {
          console.log('Sending push notification to vehicle owner...');
          await supabase.functions.invoke('send-notification', {
            body: {
              to: {
                email: vehicleOwner.email,
                phone: vehicleOwner.mobile_number
              },
              message: `New booking request for ${vehicle.name}!\n\nFarmer: ${profile?.name}\nTask: ${formData.task}\nDate: ${formData.date} at ${formData.time}\nLocation: ${formData.fieldLocation}\nDuration: ${formData.duration} hours\nAmount: $${vehicle.pricePerHour * formData.duration}\n\nPlease check your dashboard to accept or reject this request.`,
              type: 'new_booking_request'
            }
          });
          console.log('Push notification sent to vehicle owner successfully');
        } catch (notificationError) {
          console.error('Failed to send notification to vehicle owner:', notificationError);
        }
      }

      // Send SMS confirmation to farmer
      if (profile?.mobile_number) {
        try {
          console.log('Attempting to send SMS to farmer:', profile.mobile_number);
          const smsResponse = await supabase.functions.invoke('send-sms', {
            body: {
              to: profile.mobile_number,
              message: `Booking Confirmation!\n\nYour booking request for ${vehicle.name} has been submitted.\n\nDetails:\nDate: ${formData.date} at ${formData.time}\nTask: ${formData.task}\nLocation: ${formData.fieldLocation}\nDuration: ${formData.duration} hours\nAmount: $${vehicle.pricePerHour * formData.duration}\n\nYou will receive another SMS when the owner accepts or rejects your request.`
            }
          });
          
          console.log('SMS function response:', smsResponse);
          
          if (smsResponse.error) {
            console.error('SMS function returned error:', smsResponse.error);
            toast({
              title: "SMS Failed",
              description: "Booking created but SMS confirmation failed. Please check your mobile number.",
              variant: "destructive",
            });
          } else {
            console.log('SMS sent successfully to farmer');
            toast({
              title: "Booking Request Sent",
              description: "Your booking request has been sent and SMS confirmation has been sent to your mobile number.",
            });
          }
        } catch (smsError) {
          console.error('Failed to send SMS to farmer:', smsError);
          toast({
            title: "SMS Failed",
            description: "Booking created but SMS confirmation failed. Please check your mobile number.",
            variant: "destructive",
          });
        }
      } else {
        console.log('No mobile number found for farmer, skipping SMS');
        toast({
          title: "Booking Request Sent",
          description: "Your booking request has been sent to the vehicle owner.",
        });
      }

      onClose();
      
      // Reset form
      setFormData({
        date: '',
        time: '',
        duration: 1,
        fieldLocation: '',
        fieldCoordinates: { lat: 0, lng: 0 },
        task: '',
        notes: ''
      });
      setUseMapLocation(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">Book {vehicle.name}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{vehicle.name}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {vehicle.location}
              </div>
              <div>${vehicle.pricePerHour}/hour</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration (hours) *</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="24"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Field Location *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUseMapLocation(!useMapLocation)}
              >
                {useMapLocation ? 'Use Text Input' : 'Use Map'}
              </Button>
            </div>
            
            {useMapLocation ? (
              <MapLocationPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={formData.fieldCoordinates.lat !== 0 ? formData.fieldCoordinates : undefined}
              />
            ) : (
              <Input
                value={formData.fieldLocation}
                onChange={(e) => handleInputChange('fieldLocation', e.target.value)}
                placeholder="Enter your field location"
                required
              />
            )}
            
            {formData.fieldLocation && (
              <p className="text-sm text-gray-600 mt-1">
                Selected location: {formData.fieldLocation}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="task">Task *</Label>
            <Select value={formData.task} onValueChange={(value) => handleInputChange('task', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select the task" />
              </SelectTrigger>
              <SelectContent>
                {taskOptions.map((task) => (
                  <SelectItem key={task.value} value={task.value}>
                    {task.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any special requirements or notes..."
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-lg font-semibold text-blue-600">
                ${vehicle.pricePerHour * formData.duration}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {formData.duration} hours × ${vehicle.pricePerHour}/hour
            </div>
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Booking Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

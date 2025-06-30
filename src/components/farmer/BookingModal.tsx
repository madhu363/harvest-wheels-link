
import React, { useState } from 'react';
import { Vehicle, Booking } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { X, Calendar, Clock, MapPin } from 'lucide-react';

interface BookingModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ vehicle, isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 1,
    location: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) return;

    const newBooking: Booking = {
      id: Date.now().toString(),
      farmerId: user.id,
      vehicleId: vehicle.id,
      farmerName: profile.name,
      vehicleName: vehicle.name,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      location: formData.location,
      status: 'pending',
      totalAmount: vehicle.pricePerHour * formData.duration,
      createdAt: new Date().toISOString(),
      notes: formData.notes
    };

    // Save to localStorage for demo
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));

    toast({
      title: "Booking Request Sent",
      description: "Your booking request has been sent to the vehicle owner for approval.",
    });

    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="date">Date</Label>
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
              <Label htmlFor="time">Time</Label>
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
            <Label htmlFor="duration">Duration (hours)</Label>
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
            <Label htmlFor="location">Your Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter your farm location"
              required
            />
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
            <Button type="submit" className="flex-1">
              Send Booking Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

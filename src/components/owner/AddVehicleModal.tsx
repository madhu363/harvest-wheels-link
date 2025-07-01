
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { X, Upload } from 'lucide-react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onVehicleAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    pricePerHour: '',
    location: '',
    imageUrl: ''
  });

  const vehicleTypes = [
    'Tractor',
    'Harvester',
    'Cultivator',
    'Plough',
    'Seeder',
    'Sprayer',
    'Thresher',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setIsLoading(true);
    try {
      const vehicleData = {
        owner_id: user.id,
        name: formData.name,
        type: formData.type,
        description: formData.description,
        price_per_hour: parseFloat(formData.pricePerHour),
        location: formData.location,
        image_url: formData.imageUrl || '/placeholder.svg',
        is_available: true
      };

      const { error } = await supabase
        .from('vehicles')
        .insert([vehicleData]);

      if (error) throw error;

      toast({
        title: "Vehicle Added",
        description: "Your vehicle has been added successfully and is now available for booking.",
      });

      setFormData({
        name: '',
        type: '',
        description: '',
        pricePerHour: '',
        location: '',
        imageUrl: ''
      });

      onVehicleAdded();
      onClose();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to add vehicle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">Add New Vehicle</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">Vehicle Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., John Deere 5075E"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Vehicle Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your vehicle and its capabilities..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="pricePerHour">Price per Hour ($) *</Label>
            <Input
              id="pricePerHour"
              type="number"
              min="0"
              step="0.01"
              value={formData.pricePerHour}
              onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
              placeholder="e.g., 50.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Farm Valley, City Name"
              required
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="https://example.com/vehicle-image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to use default placeholder image</p>
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

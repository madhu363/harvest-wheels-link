
import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AddVehicleModal } from './AddVehicleModal';
import { MapPin, DollarSign, Plus, Trash2, Edit } from 'lucide-react';

export const MyVehicles: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  const fetchVehicles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedVehicles: Vehicle[] = data.map(vehicle => ({
        id: vehicle.id,
        ownerId: vehicle.owner_id,
        name: vehicle.name,
        type: vehicle.type,
        description: vehicle.description || '',
        pricePerHour: Number(vehicle.price_per_hour),
        location: vehicle.location,
        isAvailable: vehicle.is_available,
        imageUrl: vehicle.image_url || '/placeholder.svg'
      }));

      setVehicles(formattedVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to load your vehicles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Vehicle Deleted",
        description: "Your vehicle has been removed successfully.",
      });

      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to delete vehicle. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (vehicleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ is_available: !currentStatus })
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Vehicle is now ${!currentStatus ? 'available' : 'unavailable'} for booking.`,
      });

      fetchVehicles();
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Loading your vehicles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">My Vehicles</h3>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </Button>
      </div>
      
      {vehicles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't added any vehicles yet.</p>
          <Button onClick={() => setIsAddModalOpen(true)}>Add Your First Vehicle</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={vehicle.imageUrl}
                alt={vehicle.name}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{vehicle.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{vehicle.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {vehicle.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${vehicle.pricePerHour}/hour
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => toggleAvailability(vehicle.id, vehicle.isAvailable)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {vehicle.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                  </Button>
                  <Button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onVehicleAdded={fetchVehicles}
      />
    </div>
  );
};

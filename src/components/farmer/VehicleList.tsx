
import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { BookingModal } from './BookingModal';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Clock, DollarSign } from 'lucide-react';

export const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          id,
          name,
          type,
          description,
          price_per_hour,
          location,
          is_available,
          image_url,
          owner_id
        `)
        .eq('is_available', true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleBookVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Available Vehicles</h3>
      
      {vehicles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No vehicles available at the moment.</p>
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
                
                <Button
                  onClick={() => handleBookVehicle(vehicle)}
                  disabled={!vehicle.isAvailable}
                  className="w-full"
                >
                  {vehicle.isAvailable ? 'Book Now' : 'Unavailable'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVehicle && (
        <BookingModal
          vehicle={selectedVehicle}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedVehicle(null);
          }}
        />
      )}
    </div>
  );
};

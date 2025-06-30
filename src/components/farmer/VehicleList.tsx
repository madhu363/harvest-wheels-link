
import React, { useState } from 'react';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { BookingModal } from './BookingModal';
import { MapPin, Clock, DollarSign } from 'lucide-react';

// Mock vehicles data
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    ownerId: '2',
    name: 'John Deere Tractor',
    type: 'Tractor',
    description: 'Heavy-duty tractor perfect for plowing and harvesting',
    pricePerHour: 50,
    location: 'Farm Valley',
    isAvailable: true,
    imageUrl: '/placeholder.svg'
  },
  {
    id: '2',
    ownerId: '2',
    name: 'Case IH Combine Harvester',
    type: 'Harvester',
    description: 'Efficient combine harvester for grain crops',
    pricePerHour: 100,
    location: 'Green Fields',
    isAvailable: true,
    imageUrl: '/placeholder.svg'
  },
  {
    id: '3',
    ownerId: '2',
    name: 'Kubota Cultivator',
    type: 'Cultivator',
    description: 'Precision cultivator for soil preparation',
    pricePerHour: 30,
    location: 'Sunny Acres',
    isAvailable: false,
    imageUrl: '/placeholder.svg'
  }
];

export const VehicleList: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Available Vehicles</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockVehicles.map((vehicle) => (
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

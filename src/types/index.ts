
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'farmer' | 'vehicle_owner' | 'admin';
  phone?: string;
  location?: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  description: string;
  pricePerHour: number;
  location: string;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface Booking {
  id: string;
  farmerId: string;
  vehicleId: string;
  farmerName: string;
  vehicleName: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  totalAmount: number;
  createdAt: string;
  notes?: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'farmer' | 'vehicle_owner' | 'admin';
  phone?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
}

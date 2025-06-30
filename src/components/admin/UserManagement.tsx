
import React from 'react';
import { User } from 'lucide-react';

// Mock users data
const mockUsers = [
  { id: '1', name: 'John Farmer', email: 'farmer@demo.com', role: 'farmer', status: 'active' },
  { id: '2', name: 'Mike Owner', email: 'owner@demo.com', role: 'vehicle_owner', status: 'active' },
  { id: '3', name: 'Sarah Admin', email: 'admin@demo.com', role: 'admin', status: 'active' }
];

export const UserManagement: React.FC = () => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'farmer': return 'bg-green-100 text-green-800';
      case 'vehicle_owner': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {mockUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role.replace('_', ' ').toUpperCase()}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {user.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

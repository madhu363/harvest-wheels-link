
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, Phone, CreditCard, Camera } from 'lucide-react';

export const ProfileSetup: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: profile?.address || '',
    mobile_number: profile?.mobile_number || '',
    license_number: profile?.license_number || '',
    vehicle_number: profile?.vehicle_number || '',
    photo_url: profile?.photo_url || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          address: formData.address,
          mobile_number: formData.mobile_number,
          license_number: formData.license_number,
          vehicle_number: formData.vehicle_number,
          photo_url: formData.photo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });

      // Refresh the page to reload the profile
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user || !profile) return null;

  // Check if profile is incomplete
  const isProfileIncomplete = !profile.address || !profile.mobile_number || 
    (profile.role === 'vehicle_owner' && (!profile.license_number || !profile.vehicle_number));

  if (!isProfileIncomplete) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Complete Your Profile</span>
            </CardTitle>
            <CardDescription>
              Please provide additional information to complete your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="address" className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>Address *</span>
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your complete address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="mobile_number" className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>Mobile Number *</span>
                </Label>
                <Input
                  id="mobile_number"
                  type="tel"
                  value={formData.mobile_number}
                  onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                  placeholder="Enter your mobile number"
                  required
                />
              </div>

              {profile.role === 'vehicle_owner' && (
                <>
                  <div>
                    <Label htmlFor="license_number" className="flex items-center space-x-1">
                      <CreditCard className="h-4 w-4" />
                      <span>License Number *</span>
                    </Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                      placeholder="Enter your driving license number"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="vehicle_number">Vehicle Number *</Label>
                    <Input
                      id="vehicle_number"
                      value={formData.vehicle_number}
                      onChange={(e) => handleInputChange('vehicle_number', e.target.value)}
                      placeholder="Enter your vehicle registration number"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="photo_url" className="flex items-center space-x-1">
                  <Camera className="h-4 w-4" />
                  <span>Photo URL (Optional)</span>
                </Label>
                <Input
                  id="photo_url"
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => handleInputChange('photo_url', e.target.value)}
                  placeholder="Enter photo URL"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

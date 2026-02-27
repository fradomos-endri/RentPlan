import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationPicker } from '@/components/LocationPicker';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, logout, getStoredToken, updateStoredUser, updateStoredToken } from '@/lib/auth';
import type { User } from '@/lib/auth';
import { Mail, Phone, MapPin, Calendar, User as UserIcon, LogOut, Edit2, Plus, Building2, Loader, Car, FileText, Clock, CheckCircle, XCircle, AlertCircle, Settings, Camera, MoreVertical, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

interface Business {
  business_id?: number;
  id?: number;
  business_name: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  vat_number: string;
  user_id: number;
  created_at: string;
  coverImageUrl?: string | null;
  cover_image?: string | null;
}

interface Booking {
  booking_id: number;
  car_id: number;
  start_date: string;
  end_date: string;
  total_price: number | string;
  status: string;
  created_at: string;
  car?: {
    car_id?: number;
    brand: string;
    model: string;
    year: number;
    license_plate: string;
    production_year?: number;
    color?: string;
    fuel_type?: string;
    transmission?: string;
    description?: string;
  };
  business?: {
    business_name: string;
  };
  coverImageUrl?: string;
}

type TabType = 'bookings' | 'businesses' | 'profile';

// Albanian city coordinates
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Tirana': { lat: 41.3275, lng: 19.8187 },
  'Durrës': { lat: 41.3231, lng: 19.4569 },
  'Vlorë': { lat: 40.4686, lng: 19.4914 },
  'Elbasan': { lat: 41.1125, lng: 20.0822 },
  'Shkodër': { lat: 42.0682, lng: 19.5126 },
  'Fier': { lat: 40.7239, lng: 19.5558 },
  'Korçë': { lat: 40.6186, lng: 20.7814 },
  'Berat': { lat: 40.7058, lng: 19.9522 },
  'Lushnjë': { lat: 40.9419, lng: 19.7028 },
  'Kavajë': { lat: 41.1850, lng: 19.5569 },
  'Pogradec': { lat: 40.9022, lng: 20.6522 },
  'Laç': { lat: 41.6353, lng: 19.7131 },
  'Kukës': { lat: 42.0772, lng: 20.4211 },
  'Lezhë': { lat: 41.7836, lng: 19.6436 },
  'Patos': { lat: 40.6833, lng: 19.6167 },
  'Krujë': { lat: 41.5092, lng: 19.7928 },
  'Kuçovë': { lat: 40.8006, lng: 19.9167 },
  'Burrel': { lat: 41.6103, lng: 20.0089 },
  'Cërrik': { lat: 41.0219, lng: 19.9808 },
  'Sarandë': { lat: 39.8753, lng: 20.0056 },
  'Gjirokastër': { lat: 40.0758, lng: 20.1389 },
  'Përmet': { lat: 40.2364, lng: 20.3517 },
  'Tepelenë': { lat: 40.2975, lng: 20.0194 },
  'Gramsh': { lat: 40.8697, lng: 20.1842 },
  'Librazhd': { lat: 41.1828, lng: 20.3169 },
  'Peshkopi': { lat: 41.6850, lng: 20.4289 },
  'Bulqizë': { lat: 41.4917, lng: 20.2208 },
};

export default function Profile() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const token = getStoredToken();
  const [user, setUser] = useState<User | null>(storedUser);
  const [isEditing, setIsEditing] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [businessData, setBusinessData] = useState({
    business_name: '',
    address: '',
    city: 'Tirana',
    latitude: 0,  // Will be set when user places pin on map
    longitude: 0, // Will be set when user places pin on map
    vat_number: '',
  });
  const [formData, setFormData] = useState<Partial<User>>(user || {});
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingPicture, setDeletingPicture] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [showCoverImageModal, setShowCoverImageModal] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deletingCover, setDeletingCover] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    } else {
      if (user.role === 'business') {
        fetchBusinesses();
      }
      fetchBookings();
      fetchProfilePicture();
      fetchCoverImage();
    }
  }, [user, navigate]);

  const fetchBusinesses = async () => {
    if (!user?.user_id) {
      console.error('Cannot fetch businesses: user_id is missing');
      return;
    }

    setLoadingBusinesses(true);
    try {
      const url = getApiUrl(`${API_ENDPOINTS.BUSINESSES_BY_USER}/${user.user_id}`);
      console.log('Fetching user businesses from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User businesses:', data);
        
        // Fetch cover images for all businesses
        const businessesWithImages = await Promise.all(
          data.map(async (business: Business) => {
            let coverImageUrl = null;
            
            const businessId = business.business_id || business.id;
            if (businessId) {
              try {
                const imageUrl = getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessId}/cover-image`);
                const imageResponse = await fetch(imageUrl, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
                
                if (imageResponse.ok) {
                  const contentType = imageResponse.headers.get('content-type');
                  
                  if (contentType && contentType.startsWith('image/')) {
                    const blob = await imageResponse.blob();
                    
                    if (blob.size > 0) {
                      coverImageUrl = URL.createObjectURL(blob);
                      console.log('✓ Cover image loaded for business:', businessId);
                    }
                  }
                }
              } catch (error) {
                console.error('✗ Error fetching business cover image:', error);
              }
            }

            return {
              ...business,
              coverImageUrl,
            };
          })
        );
        
        console.log('Businesses with cover images:', businessesWithImages);
        setBusinesses(businessesWithImages);
      } else {
        console.error('Failed to fetch businesses:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        toast.error('Failed to load businesses');
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Failed to load businesses');
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.BOOKINGS), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Fetch cover images for all cars in bookings
        const bookingsWithImages = await Promise.all(
          data.map(async (booking: Booking) => {
            if (booking.car?.car_id) {
              try {
                const imageResponse = await fetch(
                  getApiUrl(`${API_ENDPOINTS.CARS}/${booking.car.car_id}/cover-image`),
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  }
                );
                if (imageResponse.ok && imageResponse.status === 200) {
                  const blob = await imageResponse.blob();
                  if (blob.size > 0) {
                    const coverImageUrl = URL.createObjectURL(blob);
                    console.log('Cover image loaded for booking car:', booking.car.car_id, coverImageUrl);
                    return { ...booking, coverImageUrl };
                  }
                } else {
                  console.log('No cover image for booking car:', booking.car.car_id);
                }
              } catch (error) {
                console.error('Error fetching car cover image for booking:', error);
              }
            }
            return booking;
          })
        );
        
        console.log('Bookings with images:', bookingsWithImages);
        setBookings(bookingsWithImages);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchBookingDetails = async (bookingId: number) => {
    try {
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.BOOKINGS}/${bookingId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Fetch cover image for the car
        if (data.car?.car_id) {
          try {
            const imageResponse = await fetch(
              getApiUrl(`${API_ENDPOINTS.CARS}/${data.car.car_id}/cover-image`),
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );
            if (imageResponse.ok && imageResponse.status === 200) {
              const blob = await imageResponse.blob();
              if (blob.size > 0) {
                const coverImageUrl = URL.createObjectURL(blob);
                data.coverImageUrl = coverImageUrl;
                console.log('Cover image loaded for booking detail:', data.car.car_id);
              }
            }
          } catch (error) {
            console.error('Error fetching car cover image:', error);
          }
        }
        
        setSelectedBooking(data);
        setShowBookingModal(true);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    } as Partial<User>));
  };

  const handleSave = async () => {
    if (!user?.user_id) {
      toast.error('User ID not found');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.USERS}/${user.user_id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          birthdate: formData.birthdate,
          gender: formData.gender,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postal_code: formData.postal_code,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to update profile');
        return;
      }

      const updatedUser = await response.json();
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      updateStoredUser(newUser);
      setFormData(newUser);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCityChange = (city: string) => {
    // Only update the city, don't auto-set coordinates
    // User will manually place the pin on the map
    setBusinessData({
      ...businessData,
      city,
    });
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setBusinessData({
      ...businessData,
      latitude: lat,
      longitude: lng,
    });
  };

  const handleCreateBusiness = async () => {
    if (!businessData.business_name) {
      toast.error('Please enter business name');
      return;
    }

    if (!businessData.address) {
      toast.error('Please enter business address');
      return;
    }

    if (!businessData.vat_number) {
      toast.error('Please enter VAT number');
      return;
    }

    if (businessData.latitude === 0 || businessData.longitude === 0) {
      toast.error('Please select your business location on the map');
      return;
    }

    setBusinessLoading(true);

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.BUSINESSES), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(businessData),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to create business');
        return;
      }

      const data = await response.json();
      toast.success('Business created successfully!');
      setShowBusinessModal(false);
      setBusinessData({ 
        business_name: '', 
        address: '',
        city: 'Tirana',
        latitude: 0,
        longitude: 0,
        vat_number: '' 
      });
      
      // Refresh businesses list
      fetchBusinesses();
    } catch (error) {
      console.error('Error creating business:', error);
      toast.error('An error occurred while creating business');
    } finally {
      setBusinessLoading(false);
    }
  };

  const handleBusinessClick = (business: Business) => {
    const id = business.id || business.business_id;
    console.log('Full business object:', business);
    console.log('Extracted ID:', id);
    if (!id) {
      console.error('No valid ID found in business object');
      toast.error('Invalid business ID');
      return;
    }
    console.log('Navigating to:', `/business/${id}/cars`);
    navigate(`/business/${id}/cars`);
  };

  const handleUpgradeToBusiness = async () => {
    if (!user?.user_id) {
      toast.error('User ID not found');
      return;
    }

    setIsUpgrading(true);
    try {
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.UPGRADE_TO_BUSINESS.replace(':userId', user.user_id.toString())),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to upgrade account');
        return;
      }

      const data = await response.json();
      const upgradedUser = data.user;
      const newToken = data.token;

      setUser(upgradedUser);
      updateStoredUser(upgradedUser);
      updateStoredToken(newToken);
      
      toast.success(data.message || 'Account successfully upgraded to business account!');
      setShowActionsMenu(false);
      
      // Fetch businesses for the newly upgraded account
      if (upgradedUser.role === 'business') {
        fetchBusinesses();
      }
    } catch (error) {
      console.error('Error upgrading account:', error);
      toast.error('An error occurred while upgrading account');
    } finally {
      setIsUpgrading(false);
    }
  };

  const fetchProfilePicture = async () => {
    if (!user?.user_id) return;

    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.USERS}/${user.user_id}/profile-picture`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setProfilePicture(imageUrl);
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    }
  };

  const handleUploadProfilePicture = async (file: File) => {
    if (!user?.user_id) {
      toast.error('User ID not found');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.USERS}/${user.user_id}/profile-picture`),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to upload profile picture');
        return;
      }

      toast.success('Profile picture uploaded successfully!');
      setShowProfilePictureModal(false);
      
      // Refresh the profile picture
      await fetchProfilePicture();
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('An error occurred while uploading profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!user?.user_id) {
      toast.error('User ID not found');
      return;
    }

    setDeletingPicture(true);
    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.USERS}/${user.user_id}/profile-picture`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete profile picture');
        return;
      }

      toast.success('Profile picture deleted successfully!');
      setProfilePicture(null);
      setShowProfilePictureModal(false);
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      toast.error('An error occurred while deleting profile picture');
    } finally {
      setDeletingPicture(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadProfilePicture(file);
    }
  };

  const fetchCoverImage = async () => {
    if (!user?.user_id) return;

    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.USERS}/${user.user_id}/cover-image`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setCoverImage(imageUrl);
      }
    } catch (error) {
      console.error('Error fetching cover image:', error);
    }
  };

  const handleUploadCoverImage = async (file: File) => {
    if (!user?.user_id) {
      toast.error('User ID not found');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingCover(true);
    const formData = new FormData();
    formData.append('cover_image', file);

    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.USERS}/${user.user_id}/cover-image`),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to upload cover image');
        return;
      }

      toast.success('Cover image uploaded successfully!');
      setShowCoverImageModal(false);
      
      // Refresh the cover image
      await fetchCoverImage();
    } catch (error) {
      console.error('Error uploading cover image:', error);
      toast.error('An error occurred while uploading cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDeleteCoverImage = async () => {
    if (!user?.user_id) {
      toast.error('User ID not found');
      return;
    }

    setDeletingCover(true);
    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.USERS}/${user.user_id}/cover-image`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete cover image');
        return;
      }

      toast.success('Cover image deleted successfully!');
      setCoverImage(null);
      setShowCoverImageModal(false);
    } catch (error) {
      console.error('Error deleting cover image:', error);
      toast.error('An error occurred while deleting cover image');
    } finally {
      setDeletingCover(false);
    }
  };

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadCoverImage(file);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />

      <div className="container py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Banner & Profile Section */}
          <Card className="overflow-hidden border shadow-lg mb-6 bg-white">
            {/* Banner Image */}
            <div className="h-48 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 relative overflow-hidden">
              {coverImage ? (
                <img 
                  src={coverImage} 
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-white/10"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
                </>
              )}
              
              {/* Actions Menu */}
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="bg-white/90 hover:bg-white text-gray-800 backdrop-blur-sm shadow-md"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>

                {showActionsMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white border rounded-lg shadow-xl z-10">
                    <div className="py-2">
                      {user.role === 'user' && (
                        <>
                          <button
                            onClick={() => {
                              handleUpgradeToBusiness();
                              setShowActionsMenu(false);
                            }}
                            disabled={isUpgrading}
                            className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center gap-3 text-gray-700 disabled:opacity-50"
                          >
                            {isUpgrading ? (
                              <>
                                <Loader className="w-4 h-4 text-purple-500 animate-spin" />
                                <span>Upgrading...</span>
                              </>
                            ) : (
                              <>
                                <Building2 className="w-4 h-4 text-purple-500" />
                                <span>Upgrade to Business</span>
                              </>
                            )}
                          </button>
                          <div className="border-t my-2"></div>
                        </>
                      )}
                      {(user.role === 'user' || user.role === 'business') && (
                        <button
                          onClick={() => {
                            setShowBusinessModal(true);
                            setShowActionsMenu(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                        >
                          <Plus className="w-4 h-4 text-blue-500" />
                          <span>Add Business</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowActionsMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <Settings className="w-4 h-4 text-blue-500" />
                        <span>Settings</span>
                      </button>
                      <div className="border-t my-2"></div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowActionsMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-red-500"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload/Change cover button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCoverImageModal(true)}
                className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm gap-2"
              >
                <Camera className="w-4 h-4" />
                {coverImage ? 'Change Cover' : 'Add Cover'}
              </Button>
            </div>

            {/* Profile Info */}
            <div className="relative px-8 pb-6 bg-white">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                {/* Profile Picture */}
                <div className="relative -mt-16">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-300 flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-white overflow-hidden">
                    {profilePicture ? (
                      <img 
                        src={profilePicture} 
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.full_name.split(' ').map(n => n[0]).join('')
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowProfilePictureModal(true)}
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600 shadow-lg text-white"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="flex-1 md:pb-2">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {user.full_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'business' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {user.role === 'business' ? (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            Business Account
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            Personal Account
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-1 mt-6 pt-6 border-t border-gray-200 overflow-x-auto">
                <Button
                  variant={activeTab === 'bookings' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('bookings')}
                  className={`gap-2 ${activeTab === 'bookings' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-50'}`}
                >
                  <FileText className="w-4 h-4" />
                  My Bookings
                  {bookings.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                      {bookings.length}
                    </span>
                  )}
                </Button>

                {user.role === 'business' && (
                  <Button
                    variant={activeTab === 'businesses' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('businesses')}
                    className={`gap-2 ${activeTab === 'businesses' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-50'}`}
                  >
                    <Building2 className="w-4 h-4" />
                    My Businesses
                    {businesses.length > 0 && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                        {businesses.length}
                      </span>
                    )}
                  </Button>
                )}

                <Button
                  variant={activeTab === 'profile' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('profile')}
                  className={`gap-2 ${activeTab === 'profile' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-50'}`}
                >
                  <UserIcon className="w-4 h-4" />
                  Profile Details
                </Button>
              </div>
            </div>
          </Card>

          {/* Tab Content */}
          {activeTab === 'bookings' && (
            <Card className="p-6 border shadow-lg bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">My Bookings</h3>
                  <p className="text-sm text-gray-500">View and manage your rental history</p>
                </div>
              </div>
              
              {loadingBookings ? (
                <div className="flex justify-center py-16">
                  <Loader className="w-10 h-10 animate-spin text-blue-500" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                    <Car className="w-10 h-10 text-blue-400 opacity-50" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">No bookings yet</h4>
                  <p className="text-gray-500 mb-6">Start exploring our car collection!</p>
                  <Button 
                    onClick={() => navigate('/')}
                    className="bg-blue-500 hover:bg-blue-600 text-white gap-2 shadow-md"
                  >
                    <Car className="w-4 h-4" />
                    Browse Cars
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {bookings.map((booking) => (
                    <Card 
                      key={booking.booking_id}
                      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all border-2 hover:border-blue-300 hover:scale-[1.02] group bg-white"
                      onClick={() => fetchBookingDetails(booking.booking_id)}
                    >
                      {/* Car Cover Image */}
                      {booking.coverImageUrl ? (
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          <img 
                            src={booking.coverImageUrl} 
                            alt={`${booking.car?.brand} ${booking.car?.model}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 bg-white/90 rounded-full p-2 shadow-lg">
                            {getStatusIcon(booking.status)}
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <Car className="w-20 h-20 text-white/30" />
                          <div className="absolute top-2 right-2 bg-white/90 rounded-full p-2 shadow-lg">
                            {getStatusIcon(booking.status)}
                          </div>
                        </div>
                      )}

                      {/* Booking Info */}
                      <div className="p-5 space-y-3">
                        {/* Car Name */}
                        {booking.car ? (
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg line-clamp-1">
                              {booking.car.brand} {booking.car.model}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {booking.car.production_year || booking.car.year || 'Year N/A'}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg">Car Information</h4>
                            <p className="text-xs text-gray-500">Details unavailable</p>
                          </div>
                        )}

                        {/* Date Range */}
                        <div className="flex items-start gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="text-xs">
                            <p className="font-medium">
                              {new Date(booking.start_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })} - {new Date(booking.end_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Business Name */}
                        {booking.business && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs truncate">{booking.business.business_name}</span>
                          </div>
                        )}

                        {/* Status and Price */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            ${Number(booking.total_price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'businesses' && user.role === 'business' && (
            <Card className="p-6 border shadow-lg bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">My Businesses</h3>
                  <p className="text-sm text-gray-500">Manage your rental businesses and fleet</p>
                </div>
              </div>
              
              {loadingBusinesses ? (
                <div className="flex justify-center py-16">
                  <Loader className="w-10 h-10 animate-spin text-blue-500" />
                </div>
              ) : businesses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-blue-400 opacity-50" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">No businesses yet</h4>
                  <p className="text-gray-500 mb-6">Create your first rental business!</p>
                  <Button
                    onClick={() => setShowBusinessModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white gap-2 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Create Business
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {businesses.map((business) => {
                    const businessKey = business.id || business.business_id || 0;
                    return (
                      <Card 
                        key={businessKey}
                        className="overflow-hidden cursor-pointer hover:shadow-xl transition-all border-2 hover:border-blue-300 hover:scale-[1.02] group bg-white"
                        onClick={() => handleBusinessClick(business)}
                      >
                        {/* Business Cover Image */}
                        {business.coverImageUrl ? (
                          <div className="relative h-40 overflow-hidden bg-gray-100">
                            <img 
                              src={business.coverImageUrl} 
                              alt={business.business_name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="relative h-40 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Building2 className="w-16 h-16 text-white/30" />
                          </div>
                        )}

                        <div className="p-5 space-y-3">
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg line-clamp-1">{business.business_name}</h4>
                            {business.vat_number && (
                              <p className="text-xs text-gray-500">VAT: {business.vat_number}</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {new Date(business.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                            <Car className="w-5 h-5 text-blue-500" />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'profile' && (
            <Card className="p-6 border shadow-lg bg-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Profile Details</h3>
                    <p className="text-sm text-gray-500">Manage your personal information</p>
                  </div>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </div>

              {isEditing ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Birthdate
                      </label>
                      <input
                        type="date"
                        name="birthdate"
                        value={formData.birthdate?.split('T')[0] || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(user);
                      }}
                      className="border-gray-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                      <p className="text-gray-800">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                      <p className="text-gray-800">{user.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Birthdate</p>
                      <p className="text-gray-800">
                        {user.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Gender</p>
                      <p className="text-gray-800 capitalize">{user.gender || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                      <p className="text-gray-800">{user.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">City</p>
                      <p className="text-gray-800">{user.city || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Country</p>
                      <p className="text-gray-800">{user.country || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Member Since</p>
                      <p className="text-gray-800">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Booking Details Modal - Enhanced */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBookingModal(false)}>
          <Card className="w-full max-w-3xl shadow-2xl border bg-white max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBookingModal(false)}
                  className="hover:bg-red-50 text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Car Cover Image */}
              {selectedBooking.coverImageUrl && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img 
                    src={selectedBooking.coverImageUrl} 
                    alt={`${selectedBooking.car?.brand} ${selectedBooking.car?.model}`}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              <div className="space-y-6">
                {/* Status and ID */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedBooking.status)}
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-gray-800 capitalize">{selectedBooking.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-mono text-gray-800">#{selectedBooking.booking_id}</p>
                  </div>
                </div>

                {/* Car Details */}
                <div className="p-5 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                      <Car className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {selectedBooking.car?.brand} {selectedBooking.car?.model}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedBooking.car?.year || selectedBooking.car?.production_year}
                        {selectedBooking.car?.license_plate && ` • ${selectedBooking.car?.license_plate}`}
                      </p>
                    </div>
                  </div>

                  {/* Car Specifications */}
                  {(selectedBooking.car?.color || selectedBooking.car?.fuel_type || selectedBooking.car?.transmission) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t">
                      {selectedBooking.car?.color && (
                        <div className="text-sm">
                          <p className="text-gray-500 mb-1">Color</p>
                          <p className="font-semibold text-gray-800 capitalize">{selectedBooking.car.color}</p>
                        </div>
                      )}
                      {selectedBooking.car?.fuel_type && (
                        <div className="text-sm">
                          <p className="text-gray-500 mb-1">Fuel Type</p>
                          <p className="font-semibold text-gray-800 capitalize">{selectedBooking.car.fuel_type}</p>
                        </div>
                      )}
                      {selectedBooking.car?.transmission && (
                        <div className="text-sm">
                          <p className="text-gray-500 mb-1">Transmission</p>
                          <p className="font-semibold text-gray-800 capitalize">{selectedBooking.car.transmission}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Car Description */}
                  {selectedBooking.car?.description && (
                    <div className="pt-4 border-t mt-4">
                      <p className="text-sm text-gray-500 mb-2">Description</p>
                      <p className="text-gray-700 text-sm">{selectedBooking.car.description}</p>
                    </div>
                  )}

                  {/* Business Info */}
                  {selectedBooking.business && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t mt-4">
                      <Building2 className="w-4 h-4" />
                      <span>{selectedBooking.business.business_name}</span>
                    </div>
                  )}
                </div>

                {/* Rental Period */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <p className="text-sm font-medium text-gray-600">Start Date</p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {new Date(selectedBooking.start_date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <p className="text-sm font-medium text-gray-600">End Date</p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {new Date(selectedBooking.end_date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Total Price</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ${Number(selectedBooking.total_price).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Booking Time */}
                <div className="text-center text-sm text-gray-500 pt-4 border-t">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Booked on {new Date(selectedBooking.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Business Creation Modal */}
      {showBusinessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBusinessModal(false)}>
          <Card className="w-full max-w-3xl shadow-2xl border bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 p-6 z-10">
                <h2 className="text-2xl font-bold text-white">Create Business</h2>
                <p className="text-sm text-white/90 mt-1">Set up your car rental business</p>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Business Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={businessData.business_name}
                        onChange={(e) => setBusinessData({ ...businessData, business_name: e.target.value })}
                        placeholder="Premium Car Rentals"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        VAT Number *
                      </label>
                      <input
                        type="text"
                        value={businessData.vat_number}
                        onChange={(e) => setBusinessData({ ...businessData, vat_number: e.target.value })}
                        placeholder="J61234567A"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={businessData.address}
                        onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                        placeholder="Rruga Nene Tereza 15"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <Select value={businessData.city} onValueChange={handleCityChange}>
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(CITY_COORDINATES).sort().map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Location Picker */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Exact Location *
                      </label>
                      {businessData.latitude !== 0 && businessData.longitude !== 0 && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Location set
                        </span>
                      )}
                    </div>
                    <LocationPicker
                      city={businessData.city}
                      initialLat={businessData.latitude !== 0 ? businessData.latitude : undefined}
                      initialLng={businessData.longitude !== 0 ? businessData.longitude : undefined}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={handleCreateBusiness}
                      disabled={businessLoading}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white gap-2"
                    >
                      {businessLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Building2 className="w-4 h-4" />
                          Create Business
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowBusinessModal(false)}
                      variant="outline"
                      className="flex-1 border-gray-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Profile Picture Modal */}
      {showProfilePictureModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowProfilePictureModal(false)}>
          <Card className="w-full max-w-md shadow-2xl border bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Profile Picture</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfilePictureModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Current Profile Picture Preview */}
              <div className="flex justify-center mb-6">
                <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-300 flex items-center justify-center text-white text-5xl font-bold shadow-xl overflow-hidden">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.full_name.split(' ').map(n => n[0]).join('')
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Upload Button */}
                <div>
                  <input
                    type="file"
                    id="profile-picture-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploadingPicture}
                  />
                  <label htmlFor="profile-picture-upload">
                    <Button
                      type="button"
                      disabled={uploadingPicture}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-2"
                      onClick={() => document.getElementById('profile-picture-upload')?.click()}
                      asChild
                    >
                      <span>
                        {uploadingPicture ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload New Picture
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>

                {/* Delete Button */}
                {profilePicture && (
                  <Button
                    onClick={handleDeleteProfilePicture}
                    disabled={deletingPicture}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 gap-2"
                  >
                    {deletingPicture ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Remove Picture
                      </>
                    )}
                  </Button>
                )}

                {/* Cancel Button */}
                <Button
                  onClick={() => setShowProfilePictureModal(false)}
                  variant="outline"
                  className="w-full border-gray-300"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Cover Image Modal */}
      {showCoverImageModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCoverImageModal(false)}>
          <Card className="w-full max-w-md shadow-2xl border bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Cover Image</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCoverImageModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Current Cover Image Preview */}
              <div className="flex justify-center mb-6">
                <div className="w-full h-40 rounded-lg bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 flex items-center justify-center text-white shadow-xl overflow-hidden relative">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">No cover image</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Upload Button */}
                <div>
                  <input
                    type="file"
                    id="cover-image-upload"
                    accept="image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handleCoverFileSelect}
                    className="hidden"
                    disabled={uploadingCover}
                  />
                  <label htmlFor="cover-image-upload">
                    <Button
                      type="button"
                      disabled={uploadingCover}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-2"
                      onClick={() => document.getElementById('cover-image-upload')?.click()}
                      asChild
                    >
                      <span>
                        {uploadingCover ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {coverImage ? 'Change Cover Image' : 'Upload Cover Image'}
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>

                {/* Delete Button */}
                {coverImage && (
                  <Button
                    onClick={handleDeleteCoverImage}
                    disabled={deletingCover}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 gap-2"
                  >
                    {deletingCover ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Remove Cover Image
                      </>
                    )}
                  </Button>
                )}

                {/* Cancel Button */}
                <Button
                  onClick={() => setShowCoverImageModal(false)}
                  variant="outline"
                  className="w-full border-gray-300"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


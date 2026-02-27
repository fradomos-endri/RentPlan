import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { getStoredToken, getStoredUser } from '@/lib/auth';
import type { User } from '@/lib/auth';
import { Car, Plus, Loader, ArrowLeft, Calendar as CalendarIcon, Fuel, Gauge, Grid3x3, CalendarDays, CheckCircle, XCircle, Clock, FileText, Mail, Phone, User as UserIcon, Camera, Upload, Trash2, X, Image as ImageIcon, MoveUp, MoveDown, Ban, Edit, Building2, MapPin, MoreVertical, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { getDaysInMonth } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LocationPicker } from '@/components/LocationPicker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Car {
  car_id: number;
  business_id: number;
  brand: string;
  model: string;
  production_year: number;
  engine: string;
  transmission: string;
  fuel_type: string;
  kilometers: number;
  color: string;
  seats?: number;
  car_type?: string;
  plate: string;
  description: string;
  price_per_day: string;
  created_at: string;
  updated_at: string;
  business_name: string;
  cover_image: string | null;
  coverImageUrl?: string | null;
}

interface Business {
  id: number;
  business_id?: number;
  business_name: string;
  vat_number: string;
  user_id?: number;
  owner_name?: string;
  owner_email?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  description?: string;
}

interface BusinessImage {
  image_id: number;
  image_path: string;
  image_order: number;
  created_at: string;
}

interface CarImage {
  image_id: number;
  image_path: string;
  is_cover: boolean;
  image_order: number;
  created_at: string;
}

interface Booking {
  booking_id: number;
  car_id: number;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
  user?: {
    user_id?: number;
    full_name: string;
    email: string;
    phone?: string;
  };
  car?: {
    car_id?: number;
    brand: string;
    model: string;
    plate: string;
    business_id?: number;
  };
}

interface CarBlock {
  id?: number;
  block_id?: number;
  car_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
  created_at: string;
}

type ViewMode = 'grid' | 'calendar';
type FilterType = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'today-checkin' | 'today-checkout';

export default function BusinessCars() {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const token = getStoredToken();
  const user = getStoredUser();
  const [cars, setCars] = useState<Car[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [showCarModal, setShowCarModal] = useState(false);
  const [carLoading, setCarLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [carData, setCarData] = useState({
    brand: '',
    model: '',
    production_year: new Date().getFullYear(),
    engine: '',
    transmission: 'automatic',
    fuel_type: 'petrol',
    kilometers: 0,
    color: '',
    seats: 5,
    car_type: 'sedan',
    plate: '',
    description: '',
    price_per_day: 0,
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedCarId, setSelectedCarId] = useState<number | 'all'>('all');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showCarDetailsModal, setShowCarDetailsModal] = useState(false);
  const [showEditCarModal, setShowEditCarModal] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [businessImages, setBusinessImages] = useState<BusinessImage[]>([]);
  const [showCoverImageModal, setShowCoverImageModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deletingCover, setDeletingCover] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImage, setDeletingImage] = useState<number | null>(null);
  const [updatingImageOrder, setUpdatingImageOrder] = useState<number | null>(null);
  const [showCarImagesModal, setShowCarImagesModal] = useState(false);
  const [selectedCarForImages, setSelectedCarForImages] = useState<Car | null>(null);
  const [carImages, setCarImages] = useState<CarImage[]>([]);
  const [uploadingCarImages, setUploadingCarImages] = useState(false);
  const [deletingCarImage, setDeletingCarImage] = useState<number | null>(null);
  const [updatingCarImageOrder, setUpdatingCarImageOrder] = useState<number | null>(null);
  const [settingCover, setSettingCover] = useState<number | null>(null);
  const [newCarCoverImage, setNewCarCoverImage] = useState<File | null>(null);
  const [newCarCoverPreview, setNewCarCoverPreview] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 25, width: 100, height: 21.33 }); // Fixed wide banner ratio (100:21.33 ≈ 4.7:1), centered vertically
  const [carBlocks, setCarBlocks] = useState<CarBlock[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockData, setBlockData] = useState({
    car_id: 0,
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [creatingBlock, setCreatingBlock] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<CarBlock | null>(null);
  const [showBlockDetailsModal, setShowBlockDetailsModal] = useState(false);
  const [deletingBlock, setDeletingBlock] = useState(false);
  
  // Business edit/delete states
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [showDeleteBusinessModal, setShowDeleteBusinessModal] = useState(false);
  const [updatingBusiness, setUpdatingBusiness] = useState(false);
  const [deletingBusiness, setDeletingBusiness] = useState(false);
  const [businessData, setBusinessData] = useState({
    business_name: '',
    address: '',
    city: 'Tirana',
    latitude: 41.3275,
    longitude: 19.8187,
    vat_number: '',
    phone: '',
    email: '',
    description: '',
  });
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  useEffect(() => {
    console.log('Business ID from params:', businessId);
    
    if (!token) {
      navigate('/signin');
      return;
    }
    
    if (!businessId) {
      console.error('Business ID is missing');
      toast.error('Business ID is missing');
      navigate('/profile');
      return;
    }
    
    fetchBusiness();
    fetchCars();
    fetchBookings();
    fetchCoverImage();
    fetchBusinessImages();
  }, [businessId, token, navigate]);

  // Fetch car blocks when cars are loaded
  useEffect(() => {
    if (cars.length > 0) {
      fetchCarBlocks();
    }
  }, [cars.length]);

  const fetchBusiness = async () => {
    if (!businessId) {
      console.error('Cannot fetch business: businessId is undefined');
      return;
    }

    if (!user?.user_id) {
      console.error('Cannot fetch business: user is not authenticated');
      toast.error('Authentication required');
      navigate('/signin');
      return;
    }
    
    try {
      // First, verify this business belongs to the current user
      // by fetching the user's businesses
      const userBusinessesUrl = getApiUrl(`${API_ENDPOINTS.BUSINESSES_BY_USER}/${user.user_id}`);
      console.log('Verifying business ownership from:', userBusinessesUrl);
      
      const verifyResponse = await fetch(userBusinessesUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!verifyResponse.ok) {
        console.error('Failed to verify business ownership:', verifyResponse.status);
        toast.error('Failed to verify business access');
        navigate('/profile');
        return;
      }

      const userBusinesses = await verifyResponse.json();
      console.log('User businesses:', userBusinesses);
      
      // Check if this business belongs to the user
      const ownsBusiness = userBusinesses.some(
        (b: any) => String(b.business_id) === String(businessId) || String(b.id) === String(businessId)
      );

      if (!ownsBusiness) {
        console.error('User does not own this business');
        toast.error('You do not have permission to access this business');
        navigate('/profile');
        return;
      }

      // Now fetch the full business details
      const url = getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessId}`);
      console.log('Fetching business from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched business:', data);
        setBusiness(data);
      } else {
        console.error('Failed to fetch business:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        toast.error('Failed to load business details');
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Error loading business');
      navigate('/profile');
    }
  };

  const fetchCars = async () => {
    if (!businessId) {
      console.error('Cannot fetch cars: businessId is undefined');
      return;
    }
    
    setLoading(true);
    try {
      // Use the sorted endpoint to get cars with availability info
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const params = new URLSearchParams({
        start_date: formatDate(today),
        end_date: formatDate(nextMonth),
      });

      const url = getApiUrl(`${API_ENDPOINTS.BUSINESS_CARS_SORTED}/${businessId}/sorted?${params.toString()}`);
      console.log('Fetching cars from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched cars:', data);
        console.log('Number of cars:', data.length);
        
        // API returns array directly, sorted with available cars first
        if (Array.isArray(data)) {
          // Fetch cover images for all cars
          const carsWithImages = await Promise.all(
            data.map(async (car) => {
              let coverImageUrl = null;
              try {
                const imageResponse = await fetch(
                  getApiUrl(`${API_ENDPOINTS.CARS}/${car.car_id}/cover-image`),
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  }
                );
                if (imageResponse.ok && imageResponse.status === 200) {
                  const blob = await imageResponse.blob();
                  if (blob.size > 0) {
                    coverImageUrl = URL.createObjectURL(blob);
                    console.log('Cover image loaded for car:', car.car_id, coverImageUrl);
                  }
                } else {
                  console.log('No cover image for car:', car.car_id);
                }
              } catch (error) {
                console.error('Error fetching car cover image for car', car.car_id, ':', error);
              }
              return {
                ...car,
                coverImageUrl,
              };
            })
          );
          console.log('Cars with images:', carsWithImages);
          setCars(carsWithImages);
        } else {
          console.error('Unexpected response format:', data);
          setCars([]);
        }
      } else {
        // Fallback to regular cars endpoint if sorted endpoint fails
        const fallbackUrl = getApiUrl(`${API_ENDPOINTS.CARS}?business_id=${businessId}`);
        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          if (Array.isArray(data)) {
            // Fetch cover images for fallback cars too
            const carsWithImages = await Promise.all(
              data.map(async (car) => {
                let coverImageUrl = null;
                try {
                  const imageResponse = await fetch(
                    getApiUrl(`${API_ENDPOINTS.CARS}/${car.car_id}/cover-image`),
                    {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                    }
                  );
                  if (imageResponse.ok && imageResponse.status === 200) {
                    const blob = await imageResponse.blob();
                    if (blob.size > 0) {
                      coverImageUrl = URL.createObjectURL(blob);
                    }
                  }
                } catch (error) {
                  console.error('Error fetching car cover image:', error);
                }
                return {
                  ...car,
                  coverImageUrl,
                };
              })
            );
            setCars(carsWithImages);
          } else {
            setCars([]);
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch cars:', response.status, errorText);
          toast.error('Failed to load cars');
          setCars([]);
        }
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!businessId) return;
    
    setBookingsLoading(true);
    try {
      const url = `http://localhost:3000/api/bookings/business/${businessId}`;
      console.log('Fetching bookings from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched bookings with user data:', data);
        
        // Parse the user and car JSON strings
        const parsedBookings = data.map((booking: any) => {
          try {
            return {
              ...booking,
              user: typeof booking.user === 'string' ? JSON.parse(booking.user) : booking.user,
              car: typeof booking.car === 'string' ? JSON.parse(booking.car) : booking.car,
            };
          } catch (error) {
            console.error('Error parsing booking data:', error, booking);
            return booking;
          }
        });
        
        console.log('Parsed bookings:', parsedBookings);
        setBookings(Array.isArray(parsedBookings) ? parsedBookings : []);
      } else {
        console.error('Failed to fetch bookings:', response.status);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchCoverImage = async () => {
    if (!businessId) return;

    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessId}/cover-image`),
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

  const fetchBusinessImages = async () => {
    if (!businessId) return;

    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessId}/images`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBusinessImages(Array.isArray(data) ? data.sort((a, b) => a.image_order - b.image_order) : []);
      }
    } catch (error) {
      console.error('Error fetching business images:', error);
    }
  };

  const fetchCarImages = async (carId: number) => {
    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.CARS}/${carId}/images`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCarImages(Array.isArray(data) ? data.sort((a, b) => a.image_order - b.image_order) : []);
      }
    } catch (error) {
      console.error('Error fetching car images:', error);
    }
  };

  const fetchCarBlocks = async () => {
    if (!businessId) return;
    
    try {
      // Get all blocks for this business's cars
      // We'll fetch blocks for each car once cars are loaded
      if (cars.length === 0) return;
      
      const blocksPromises = cars.map(async (car) => {
        try {
          const response = await fetch(
            getApiUrl(`${API_ENDPOINTS.CAR_BLOCKS}/car/${car.car_id}`),
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          
          if (response.ok) {
            const blocks = await response.json();
            console.log('Fetched blocks for car', car.car_id, ':', blocks);
            return blocks;
          }
          return [];
        } catch (error) {
          console.error(`Error fetching blocks for car ${car.car_id}:`, error);
          return [];
        }
      });
      
      const allBlocks = await Promise.all(blocksPromises);
      const flattenedBlocks = allBlocks.flat();
      console.log('All car blocks:', flattenedBlocks);
      setCarBlocks(flattenedBlocks);
    } catch (error) {
      console.error('Error fetching car blocks:', error);
    }
  };

  const handleCreateCarBlock = async () => {
    if (!blockData.car_id || !blockData.start_date || !blockData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Compare dates as strings (YYYY-MM-DD format)
    if (blockData.start_date > blockData.end_date) {
      toast.error('End date must be after start date');
      return;
    }

    console.log('Creating block with data:', blockData);

    setCreatingBlock(true);
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.CAR_BLOCKS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(blockData),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to create block');
        return;
      }

      const createdBlock = await response.json();
      console.log('Block created successfully:', createdBlock);
      
      toast.success('Car block created successfully!');
      setShowBlockModal(false);
      setBlockData({
        car_id: 0,
        start_date: '',
        end_date: '',
        reason: ''
      });
      await fetchCarBlocks();
    } catch (error) {
      console.error('Error creating car block:', error);
      toast.error('An error occurred while creating block');
    } finally {
      setCreatingBlock(false);
    }
  };

  const handleDeleteCarBlock = async (blockId: number) => {
    setDeletingBlock(true);
    try {
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.CAR_BLOCKS}/${blockId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete block');
        return;
      }

      toast.success('Block removed successfully!');
      setShowBlockDetailsModal(false);
      setSelectedBlock(null);
      await fetchCarBlocks();
    } catch (error) {
      console.error('Error deleting car block:', error);
      toast.error('An error occurred while deleting block');
    } finally {
      setDeletingBlock(false);
    }
  };

  // Helper function to extract date from API response (handles timezone issues)
  const extractDateFromApi = (dateString: string): string => {
    // If the date has a time component (T), we need to convert to local date
    if (dateString.includes('T')) {
      // Parse as Date and format in local timezone
      const date = new Date(dateString);
      return formatDateLocal(date);
    }
    // If it's already just YYYY-MM-DD, use it as-is
    return dateString.split('T')[0];
  };

  const getCarBlockForDate = (carId: number, date: Date): CarBlock | undefined => {
    const dateStr = formatDateLocal(date);
    
    const foundBlock = carBlocks.find(block => {
      const start = extractDateFromApi(block.start_date);
      const end = extractDateFromApi(block.end_date);
      const isMatch = block.car_id === carId && dateStr >= start && dateStr <= end;
      
      if (isMatch) {
        console.log('Block found for date:', dateStr, 'Block:', { 
          rawStart: block.start_date,
          rawEnd: block.end_date,
          parsedStart: start, 
          parsedEnd: end, 
          reason: block.reason 
        });
      }
      
      return isMatch;
    });
    
    return foundBlock;
  };

  // Helper function to format date in local timezone as YYYY-MM-DD
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpenBlockModal = (carId: number, date?: Date) => {
    const dateStr = date ? formatDateLocal(date) : '';
    console.log('Opening block modal for date:', date, 'formatted as:', dateStr);
    setBlockData({
      car_id: carId,
      start_date: dateStr,
      end_date: dateStr,
      reason: ''
    });
    setShowBlockModal(true);
  };

  const handleBlockClick = (block: CarBlock) => {
    console.log('Block clicked:', block);
    console.log('Block ID:', block.block_id || block.id);
    setSelectedBlock(block);
    setShowBlockDetailsModal(true);
  };

  const handleUploadCoverImage = async (file: File) => {
    if (!businessId) {
      toast.error('Business ID not found');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setUploadingCover(true);
    const formData = new FormData();
    formData.append('cover_image', file);

    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessId}/cover-image`),
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
      await fetchCoverImage();
    } catch (error) {
      console.error('Error uploading cover image:', error);
      toast.error('An error occurred while uploading cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDeleteCoverImage = async () => {
    if (!businessId) {
      toast.error('Business ID not found');
      return;
    }

    setDeletingCover(true);
    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessId}/cover-image`),
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

  const handleUploadBusinessImages = async (files: FileList) => {
    if (!businessId) {
      toast.error('Business ID not found');
      return;
    }

    if (files.length > 10) {
      toast.error('You can upload maximum 10 images at once');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const formData = new FormData();
    let validFilesCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        continue;
      }

      formData.append('images', file);
      validFilesCount++;
    }

    if (validFilesCount === 0) {
      toast.error('No valid images to upload');
      return;
    }

    setUploadingImages(true);

    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessId}/images`),
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
        toast.error(error.message || 'Failed to upload images');
        return;
      }

      toast.success(`${validFilesCount} image(s) uploaded successfully!`);
      await fetchBusinessImages();
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('An error occurred while uploading images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteBusinessImage = async (imageId: number) => {
    if (!businessId) return;

    setDeletingImage(imageId);
    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessId}/images/${imageId}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete image');
        return;
      }

      toast.success('Image deleted successfully!');
      await fetchBusinessImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('An error occurred while deleting image');
    } finally {
      setDeletingImage(null);
    }
  };

  const handleUpdateImageOrder = async (imageId: number, newOrder: number) => {
    if (!businessId) return;

    setUpdatingImageOrder(imageId);
    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessId}/images/${imageId}/order`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image_order: newOrder }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to update image order');
        return;
      }

      toast.success('Image order updated!');
      await fetchBusinessImages();
    } catch (error) {
      console.error('Error updating image order:', error);
      toast.error('An error occurred while updating order');
    } finally {
      setUpdatingImageOrder(null);
    }
  };

  const handleUploadCarImages = async (carId: number, files: FileList) => {
    if (files.length > 10) {
      toast.error('You can upload maximum 10 images at once');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const formData = new FormData();
    let validFilesCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        continue;
      }

      formData.append('images', file);
      validFilesCount++;
    }

    if (validFilesCount === 0) {
      toast.error('No valid images to upload');
      return;
    }

    setUploadingCarImages(true);

    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.CARS}/${carId}/images`),
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
        toast.error(error.message || 'Failed to upload images');
        return;
      }

      const data = await response.json();
      toast.success(data.message || `${validFilesCount} image(s) uploaded successfully!`);
      await fetchCarImages(carId);
      await fetchCars(); // Refresh cars to update cover images
    } catch (error) {
      console.error('Error uploading car images:', error);
      toast.error('An error occurred while uploading images');
    } finally {
      setUploadingCarImages(false);
    }
  };

  const handleDeleteCarImage = async (carId: number, imageId: number) => {
    setDeletingCarImage(imageId);
    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.CARS}/${carId}/images/${imageId}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete image');
        return;
      }

      toast.success('Image deleted successfully!');
      await fetchCarImages(carId);
      await fetchCars();
    } catch (error) {
      console.error('Error deleting car image:', error);
      toast.error('An error occurred while deleting image');
    } finally {
      setDeletingCarImage(null);
    }
  };

  const handleUpdateCarImageOrder = async (carId: number, imageId: number, newOrder: number) => {
    setUpdatingCarImageOrder(imageId);
    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.CARS}/${carId}/images/${imageId}/order`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image_order: newOrder }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to update image order');
        return;
      }

      toast.success('Image order updated!');
      await fetchCarImages(carId);
    } catch (error) {
      console.error('Error updating car image order:', error);
      toast.error('An error occurred while updating order');
    } finally {
      setUpdatingCarImageOrder(null);
    }
  };

  const handleSetCarCoverImage = async (carId: number, imageId: number) => {
    setSettingCover(imageId);
    try {
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.CARS}/${carId}/images/${imageId}/set-cover`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to set cover image');
        return;
      }

      toast.success('Cover image updated!');
      await fetchCarImages(carId);
      await fetchCars();
    } catch (error) {
      console.error('Error setting cover image:', error);
      toast.error('An error occurred while setting cover image');
    } finally {
      setSettingCover(null);
    }
  };

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Read the file and show crop modal
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async () => {
    if (!imageToCrop) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas size to match banner aspect ratio (1200x256 for wide banner)
        canvas.width = 1200;
        canvas.height = 256;

        // Calculate crop dimensions
        const scaleX = img.naturalWidth / 100;
        const scaleY = img.naturalHeight / 100;
        
        const sourceX = cropArea.x * scaleX;
        const sourceY = cropArea.y * scaleY;
        const sourceWidth = cropArea.width * scaleX;
        const sourceHeight = cropArea.height * scaleY;

        // Draw cropped image
        ctx?.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'cover-image.jpg', { type: 'image/jpeg' });
            setShowCropModal(false);
            setImageToCrop(null);
            await handleUploadCoverImage(file);
          }
        }, 'image/jpeg', 0.95);
      };

      img.src = imageToCrop;
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image');
    }
  };

  const handleImagesFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadBusinessImages(files);
    }
  };

  const handleCarImagesFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && selectedCarForImages) {
      handleUploadCarImages(selectedCarForImages.car_id, files);
    }
  };

  const getCarBookings = (carId: number) => {
    return bookings.filter(booking => booking.car_id === carId);
  };

  const isCarAvailable = (carId: number, date: Date) => {
    const carBookings = getCarBookings(carId);
    const dateStr = formatDateLocal(date);
    
    return !carBookings.some(booking => {
      const start = extractDateFromApi(booking.start_date);
      const end = extractDateFromApi(booking.end_date);
      return dateStr >= start && dateStr <= end && booking.status !== 'cancelled';
    });
  };

  const getBookingForCarOnDate = (carId: number, date: Date): Booking | undefined => {
    const carBookings = getCarBookings(carId);
    const dateStr = formatDateLocal(date);
    
    const foundBooking = carBookings.find(booking => {
      const start = extractDateFromApi(booking.start_date);
      const end = extractDateFromApi(booking.end_date);
      const isMatch = dateStr >= start && dateStr <= end && booking.status !== 'cancelled';
      
      // Debug logging
      if (isMatch) {
        console.log('Booking match found:', {
          calendarDate: dateStr,
          rawBookingStart: booking.start_date,
          rawBookingEnd: booking.end_date,
          parsedBookingStart: start,
          parsedBookingEnd: end,
          bookingId: booking.booking_id
        });
      }
      
      return isMatch;
    });
    
    return foundBooking;
  };

  const getFilteredBookings = () => {
    const today = formatDateLocal(new Date());
    
    switch (activeFilter) {
      case 'pending':
        return bookings.filter(b => b.status === 'pending');
      case 'confirmed':
        return bookings.filter(b => b.status === 'confirmed');
      case 'cancelled':
        return bookings.filter(b => b.status === 'cancelled');
      case 'today-checkin':
        // Cars being picked up today (booking starts today)
        return bookings.filter(b => {
          const startDate = extractDateFromApi(b.start_date);
          return startDate === today;
        });
      case 'today-checkout':
        // Cars being returned today (booking ends today)
        return bookings.filter(b => {
          const endDate = extractDateFromApi(b.end_date);
          return endDate === today;
        });
      default:
        return bookings;
    }
  };

  const filteredBookings = getFilteredBookings();
  const today = formatDateLocal(new Date());
  
  // Count cars being picked up today
  const todayCheckins = bookings.filter(b => {
    const startDate = extractDateFromApi(b.start_date);
    return startDate === today;
  }).length;
  
  // Count cars being returned today
  const todayCheckouts = bookings.filter(b => {
    const endDate = extractDateFromApi(b.end_date);
    return endDate === today;
  }).length;

  const getFilteredCars = () => {
    if (selectedCarId === 'all') {
      return cars;
    }
    return cars.filter(car => car.car_id === selectedCarId);
  };

  const changeMonth = (direction: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1));
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const handleCreateCar = async () => {
    if (!carData.brand || !carData.model || !carData.plate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCarLoading(true);

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.CARS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: Number(businessId),
          brand: carData.brand,
          model: carData.model,
          production_year: carData.production_year,
          engine: carData.engine,
          transmission: carData.transmission,
          fuel_type: carData.fuel_type,
          kilometers: carData.kilometers,
          color: carData.color,
          seats: carData.seats,
          car_type: carData.car_type,
          plate: carData.plate,
          description: carData.description,
          price_per_day: carData.price_per_day,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to create car');
        return;
      }

      const newCar = await response.json();
      
      // Upload cover image if selected
      if (newCarCoverImage && newCar.car_id) {
        try {
          const formData = new FormData();
          formData.append('images', newCarCoverImage);

          const imageResponse = await fetch(
            getApiUrl(`${API_ENDPOINTS.CARS}/${newCar.car_id}/images`),
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            // Set the first uploaded image as cover
            if (imageData.images && imageData.images.length > 0) {
              await fetch(
                getApiUrl(`${API_ENDPOINTS.CARS}/${newCar.car_id}/images/${imageData.images[0].image_id}/set-cover`),
                {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );
            }
          }
        } catch (error) {
          console.error('Error uploading cover image:', error);
          toast.error('Car created but failed to upload cover image');
        }
      }

      toast.success('Car added successfully!');
      setShowCarModal(false);
      setCarData({
        brand: '',
        model: '',
        production_year: new Date().getFullYear(),
        engine: '',
        transmission: 'automatic',
        fuel_type: 'petrol',
        kilometers: 0,
        color: '',
        seats: 5,
        car_type: 'sedan',
        plate: '',
        description: '',
        price_per_day: 0,
      });
      setNewCarCoverImage(null);
      setNewCarCoverPreview(null);
      fetchCars();
    } catch (error) {
      console.error('Error creating car:', error);
      toast.error('An error occurred while creating car');
    } finally {
      setCarLoading(false);
    }
  };

  const handleUpdateCar = async () => {
    if (!selectedCar || !carData.brand || !carData.model || !carData.plate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCarLoading(true);

    try {
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.CARS}/${selectedCar.car_id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          brand: carData.brand,
          model: carData.model,
          production_year: carData.production_year,
          engine: carData.engine,
          transmission: carData.transmission,
          fuel_type: carData.fuel_type,
          kilometers: carData.kilometers,
          color: carData.color,
          seats: carData.seats,
          car_type: carData.car_type,
          plate: carData.plate,
          description: carData.description,
          price_per_day: carData.price_per_day,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to update car');
        return;
      }

      toast.success('Car updated successfully!');
      setShowEditCarModal(false);
      setSelectedCar(null);
      setCarData({
        brand: '',
        model: '',
        production_year: new Date().getFullYear(),
        engine: '',
        transmission: 'automatic',
        fuel_type: 'petrol',
        kilometers: 0,
        color: '',
        seats: 5,
        car_type: 'sedan',
        plate: '',
        description: '',
        price_per_day: 0,
      });
      fetchCars();
    } catch (error) {
      console.error('Error updating car:', error);
      toast.error('An error occurred while updating car');
    } finally {
      setCarLoading(false);
    }
  };

  const handleDeleteCar = async (carId: number) => {
    if (!confirm('Are you sure you want to delete this car? This will also delete all associated images and bookings.')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.CARS}/${carId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete car');
        return;
      }

      toast.success('Car deleted successfully!');
      setShowCarDetailsModal(false);
      setSelectedCar(null);
      fetchCars();
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('An error occurred while deleting car');
    }
  };

  // Handle opening edit business modal
  const handleEditBusinessClick = () => {
    if (business) {
      setBusinessData({
        business_name: business.business_name || '',
        address: business.address || '',
        city: business.city || 'Tirana',
        latitude: business.latitude || 41.3275,
        longitude: business.longitude || 19.8187,
        vat_number: business.vat_number || '',
        phone: business.phone || '',
        email: business.email || '',
        description: business.description || '',
      });
      setLocationConfirmed(true); // Assuming existing location is confirmed
      setShowEditBusinessModal(true);
    }
  };

  // Handle updating business
  const handleUpdateBusiness = async () => {
    if (!businessData.business_name.trim()) {
      toast.error('Business name is required');
      return;
    }

    setUpdatingBusiness(true);
    try {
      const businessIdToUse = business?.business_id || business?.id;
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessIdToUse}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to update business');
        return;
      }

      const updatedBusiness = await response.json();
      toast.success('Business updated successfully!');
      setBusiness(updatedBusiness.business || updatedBusiness);
      setShowEditBusinessModal(false);
      fetchBusiness(); // Refresh business data
    } catch (error) {
      console.error('Error updating business:', error);
      toast.error('An error occurred while updating business');
    } finally {
      setUpdatingBusiness(false);
    }
  };

  // Handle delete business confirmation
  const handleDeleteBusinessClick = () => {
    setShowDeleteBusinessModal(true);
  };

  // Handle delete business
  const handleDeleteBusiness = async () => {
    setDeletingBusiness(true);
    try {
      const businessIdToUse = business?.business_id || business?.id;
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessIdToUse}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete business');
        return;
      }

      toast.success('Business deleted successfully!');
      setShowDeleteBusinessModal(false);
      // Redirect to profile page after deletion
      navigate('/profile');
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('An error occurred while deleting business');
    } finally {
      setDeletingBusiness(false);
    }
  };

  const handleNewCarCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setNewCarCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCarCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveNewCarCoverImage = () => {
    setNewCarCoverImage(null);
    setNewCarCoverPreview(null);
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    setUpdatingBooking(true);
    try {
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to update booking status');
        return;
      }

      toast.success(`Booking ${newStatus} successfully!`);
      setShowBookingModal(false);
      setSelectedBooking(null);
      
      // Refresh bookings
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('An error occurred while updating booking');
    } finally {
      setUpdatingBooking(false);
    }
  };

  const handleBookingClick = async (booking: Booking) => {
    // Fetch full booking details to ensure we have all user information
    try {
      const response = await fetch(`http://localhost:3000/api/bookings/${booking.booking_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const detailedBooking = await response.json();
        console.log('Detailed booking:', detailedBooking);
        setSelectedBooking(detailedBooking);
        setShowBookingModal(true);
      } else {
        // Fallback to the booking data we already have
        setSelectedBooking(booking);
        setShowBookingModal(true);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      // Fallback to the booking data we already have
      setSelectedBooking(booking);
      setShowBookingModal(true);
    }
  };

  const handleOpenCarImages = async (car: Car) => {
    setSelectedCarForImages(car);
    setShowCarImagesModal(true);
    await fetchCarImages(car.car_id);
  };

  const handleCarDetailsClick = async (car: Car) => {
    setSelectedCar(car);
    
    // Fetch car images when opening details
    if (car.car_id) {
      await fetchCarImages(car.car_id);
    }
    
    setShowCarDetailsModal(true);
  };

  const handleEditCarClick = (car: Car) => {
    setSelectedCar(car);
    setCarData({
      brand: car.brand,
      model: car.model,
      production_year: car.production_year,
      engine: car.engine || '',
      transmission: car.transmission,
      fuel_type: car.fuel_type,
      kilometers: car.kilometers,
      color: car.color || '',
      seats: car.seats || 5,
      car_type: car.car_type || 'sedan',
      plate: car.plate,
      description: car.description || '',
      price_per_day: Number(car.price_per_day),
    });
    setShowCarDetailsModal(false);
    setShowEditCarModal(true);
  };

  // Analytics Helper Functions
  const getMonthlyRevenueData = () => {
    const monthlyData: { [key: string]: number } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months with 0
    months.forEach(month => {
      monthlyData[month] = 0;
    });

    // Calculate revenue for each booking
    bookings.forEach(booking => {
      if (booking.status === 'confirmed') {
        const date = new Date(booking.start_date);
        const monthName = months[date.getMonth()];
        const price = typeof booking.total_price === 'string' ? parseFloat(booking.total_price) : booking.total_price || 0;
        monthlyData[monthName] += price;
      }
    });

    return months.map(month => ({
      month,
      revenue: monthlyData[month],
    }));
  };

  const getBookingStatusData = () => {
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;

    return [
      { name: 'Confirmed', value: confirmed },
      { name: 'Pending', value: pending },
      { name: 'Cancelled', value: cancelled },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />

      <div className="container py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header with Cover Image */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="mb-4 gap-2 hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Button>

            {/* Cover Image Section */}
            <div className="relative h-64 rounded-2xl overflow-hidden mb-6 border-2 shadow-lg">
              {coverImage ? (
                <img 
                  src={coverImage} 
                  alt="Business Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400">
                  <div className="absolute inset-0 bg-white/10"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
                </div>
              )}
              
              {/* Cover Image Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowCoverImageModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {coverImage ? 'Change Cover' : 'Add Cover'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowImagesModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Gallery ({businessImages.length})
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm gap-2"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setBusinessData({
                          business_name: business?.business_name || '',
                          address: business?.address || '',
                          city: business?.city || 'Tirana',
                          latitude: business?.latitude || 41.3275,
                          longitude: business?.longitude || 19.8187,
                          vat_number: business?.vat_number || '',
                          phone: business?.phone || '',
                          email: business?.email || '',
                          description: business?.description || '',
                        });
                        setShowEditBusinessModal(true);
                      }}
                      className="cursor-pointer"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Business
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDeleteBusinessClick}
                      className="cursor-pointer text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Business
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Business Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {business?.business_name || 'Business'}
                </h1>
                <p className="text-white/90">Manage your car fleet and bookings</p>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-2">
                {/* Action buttons moved here if needed */}
              </div>
              <Button
                onClick={() => setShowCarModal(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white gap-2 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Car
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 border-2 hover:border-blue-300 transition-colors bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Cars</p>
                  <p className="text-2xl font-bold text-gray-800">{cars.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-4 border-2 hover:border-green-300 transition-colors bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Active</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-4 border-2 hover:border-yellow-300 transition-colors bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-4 border-2 hover:border-purple-300 transition-colors bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Available</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {cars.filter(car => isCarAvailable(car.car_id, new Date())).length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Analytics & Reports Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <Card className="p-6 border-2 bg-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Monthly Revenue
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Total earnings from bookings</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ${(bookings
                      .filter(b => b.status === 'confirmed')
                      .reduce((sum, b) => {
                        const price = typeof b.total_price === 'string' ? parseFloat(b.total_price) : b.total_price || 0;
                        return sum + price;
                      }, 0))
                      .toLocaleString()}
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getMonthlyRevenueData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => `$${value}`}
                  />
                  <Bar dataKey="revenue" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Pickup & Dropoff Locations */}
            <Card className="p-6 border-2 bg-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Pickup & Dropoff Locations
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Available service locations</p>
                </div>
              </div>
              
              {business ? (
                <div className="space-y-4">
                  {/* Pickup Location */}
                  <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      Pickup Location - Today
                    </h4>
                    <div className="space-y-2 text-gray-700">
                      <div className="pt-1 border-t border-blue-200 space-y-1">
                        <p className="text-sm"><span className="font-medium text-blue-700">Total Cars:</span> <span className="text-blue-600 font-bold">{cars.length}</span></p>
                        <p className="text-sm"><span className="font-medium text-green-700">Available Today:</span> <span className="text-green-600 font-bold">{cars.filter(car => !bookings.some(b => b.car_id === car.car_id && b.status === 'confirmed' && new Date(b.start_date).toDateString() === new Date().toDateString())).length}</span></p>
                        <p className="text-sm"><span className="font-medium text-red-700">Booked Today:</span> <span className="text-red-600 font-bold">{cars.filter(car => bookings.some(b => b.car_id === car.car_id && b.status === 'confirmed' && new Date(b.start_date).toDateString() === new Date().toDateString())).length}</span></p>
                      </div>
                      {cars.filter(car => bookings.some(b => b.car_id === car.car_id && b.status === 'confirmed' && new Date(b.start_date).toDateString() === new Date().toDateString())).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <p className="text-xs font-medium text-gray-600 w-full">Booked cars:</p>
                          {cars.filter(car => bookings.some(b => b.car_id === car.car_id && b.status === 'confirmed' && new Date(b.start_date).toDateString() === new Date().toDateString())).slice(0, 3).map((car) => (
                            <span key={car.car_id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">
                              {car.brand} {car.model}
                            </span>
                          ))}
                          {cars.filter(car => bookings.some(b => b.car_id === car.car_id && b.status === 'confirmed' && new Date(b.start_date).toDateString() === new Date().toDateString())).length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">
                              +{cars.filter(car => bookings.some(b => b.car_id === car.car_id && b.status === 'confirmed' && new Date(b.start_date).toDateString() === new Date().toDateString())).length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dropoff Location */}
                  <div className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50 rounded-r-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      Dropoff Location - Today
                    </h4>
                    <div className="space-y-2 text-gray-700">
                      <div className="pt-1 border-t border-orange-200 space-y-1">
                        <p className="text-sm"><span className="font-medium text-orange-700">Total Cars:</span> <span className="text-orange-600 font-bold">{cars.length}</span></p>
                        <p className="text-sm"><span className="font-medium text-green-700">Available Today:</span> <span className="text-green-600 font-bold">{cars.filter(car => !bookings.some(b => b.car_id === car.car_id && b.status === 'confirmed' && new Date(b.start_date).toDateString() === new Date().toDateString())).length}</span></p>
                        <p className="text-sm"><span className="font-medium text-red-700">Booked Today:</span> <span className="text-red-600 font-bold">{cars.filter(car => bookings.some(b => b.car_id === car.car_id && b.status === 'confirmed' && new Date(b.start_date).toDateString() === new Date().toDateString())).length}</span></p>
                      </div>
                      {cars.filter(car => bookings.some(b => b.car_id === car.car_id && b.status === 'confirmed' && new Date(b.start_date).toDateString() === new Date().toDateString())).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <p className="text-xs font-medium text-gray-600 w-full">Booked cars:</p>
                          {cars.filter(car => bookings.some(b => b.car_id === car.car_id && b.status === 'confirmed' && new Date(b.start_date).toDateString() === new Date().toDateString())).slice(0, 3).map((car) => (
                            <span key={car.car_id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">
                              {car.brand} {car.model}
                            </span>
                          ))}
                          {cars.filter(car => bookings.some(b => b.car_id === car.car_id && b.status === 'confirmed' && new Date(b.start_date).toDateString() === new Date().toDateString())).length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">
                              +{cars.filter(car => bookings.some(b => b.car_id === car.car_id && b.status === 'confirmed' && new Date(b.start_date).toDateString() === new Date().toDateString())).length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Total Pickups</p>
                      <p className="text-2xl font-bold text-blue-600">{bookings.filter(b => b.status === 'confirmed').length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Total Dropoffs</p>
                      <p className="text-2xl font-bold text-orange-600">{bookings.filter(b => b.status === 'confirmed').length}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No location information available</p>
                </div>
              )}
            </Card>
          </div>

          {/* Booking Calendar - Car Availability Overview */}
          <Card className="p-6 border-2 bg-white mb-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-purple-600" />
                  Booking Calendar - Next 30 Days
                </h3>
                <p className="text-sm text-gray-500 mt-1">Each row represents a car and its booking status across dates</p>
              </div>
              <Button
                onClick={() => fetchBookings()}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Loader className="w-4 h-4" />
                Refresh
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="sticky top-0 bg-gray-50 z-10">
                    <th className="sticky left-0 bg-gray-50 z-20 px-3 py-2 text-left font-semibold text-gray-700 border-b-2 w-40">Car</th>
                    {Array.from({ length: 30 }).map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      return (
                        <th key={i} className="px-2 py-2 text-center font-semibold text-gray-600 border-b-2 border-gray-200 min-w-12">
                          <div className="text-xs">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.car_id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="sticky left-0 bg-white z-10 px-3 py-2 font-medium text-gray-800 border-r-2 w-40">
                        {car.brand} {car.model}
                      </td>
                      {Array.from({ length: 30 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        const dateStr = date.toISOString().split('T')[0];
                        
                        // Check if car has a booking on this date
                        const booking = bookings.find(b => {
                          const startDate = new Date(b.start_date).toISOString().split('T')[0];
                          const endDate = new Date(b.end_date).toISOString().split('T')[0];
                          return b.car_id === car.car_id && 
                                 b.status === 'confirmed' && 
                                 dateStr >= startDate && 
                                 dateStr <= endDate;
                        });
                        
                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                        
                        return (
                          <td 
                            key={i} 
                            className={`px-2 py-2 text-center text-xs border-r border-gray-200 min-w-12 transition-colors ${
                              isToday ? 'bg-yellow-100' : booking ? 'bg-red-200' : 'bg-green-100'
                            }`}
                          >
                            {booking ? (
                              <span className="font-semibold text-red-800" title={`Booked: ${booking.booking_id}`}>●</span>
                            ) : isToday ? (
                              <span className="text-yellow-800">✓</span>
                            ) : (
                              <span className="text-green-800">○</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300"></div>
                <span className="text-gray-700">Available (○)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 border border-red-400"></div>
                <span className="text-gray-700">Booked (●)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300"></div>
                <span className="text-gray-700">Today (✓)</span>
              </div>
            </div>
          </Card>

          {/* Car Performance & Analytics */}
          <Card className="p-6 border-2 bg-white mb-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Car Performance Report
              </h3>
              <p className="text-sm text-gray-500 mt-1">Revenue and booking statistics by car</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Car</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Bookings</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Confirmed</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Revenue</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Avg. Daily Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => {
                    const carBookings = bookings.filter(b => b.car_id === car.car_id);
                    const confirmedBookings = carBookings.filter(b => b.status === 'confirmed');
                    const totalRevenue = confirmedBookings.reduce((sum, b) => {
                      const price = typeof b.total_price === 'string' ? parseFloat(b.total_price) : b.total_price || 0;
                      return sum + price;
                    }, 0);
                    const avgRate = carBookings.length > 0 ? (totalRevenue / carBookings.length).toFixed(2) : '0.00';

                    return (
                      <tr key={car.car_id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{car.brand} {car.model}</td>
                        <td className="px-4 py-3 text-gray-600">{carBookings.length}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {confirmedBookings.length}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600">${totalRevenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-600">${avgRate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Main Content with Sidebar */}
          <div className="flex gap-6">
            {/* Left Sidebar */}
            <Card className="w-64 h-fit bg-white border-2 sticky top-24">
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Bookings Filter
                </h3>
              
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      activeFilter === 'all'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'hover:bg-blue-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">All Bookings</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        activeFilter === 'all' ? 'bg-white/20' : 'bg-gray-200'
                      }`}>
                        {bookings.length}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveFilter('pending')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      activeFilter === 'pending'
                        ? 'bg-yellow-500 text-white shadow-md'
                        : 'hover:bg-yellow-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Pending
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        activeFilter === 'pending' ? 'bg-white/20' : 'bg-yellow-200'
                      }`}>
                        {bookings.filter(b => b.status === 'pending').length}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveFilter('confirmed')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      activeFilter === 'confirmed'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'hover:bg-green-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Confirmed
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        activeFilter === 'confirmed' ? 'bg-white/20' : 'bg-green-200'
                      }`}>
                        {bookings.filter(b => b.status === 'confirmed').length}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveFilter('cancelled')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      activeFilter === 'cancelled'
                        ? 'bg-red-500 text-white shadow-md'
                        : 'hover:bg-red-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Cancelled
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        activeFilter === 'cancelled' ? 'bg-white/20' : 'bg-red-200'
                      }`}>
                        {bookings.filter(b => b.status === 'cancelled').length}
                      </span>
                    </div>
                  </button>

                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs text-gray-500 font-semibold mb-2 px-2">TODAY</p>
                    
                    <button
                      onClick={() => setActiveFilter('today-checkin')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        activeFilter === 'today-checkin'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'hover:bg-emerald-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          Check-ins
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activeFilter === 'today-checkin' ? 'bg-white/20' : 'bg-emerald-200'
                        }`}>
                          {todayCheckins}
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveFilter('today-checkout')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all mt-2 ${
                        activeFilter === 'today-checkout'
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'hover:bg-rose-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                          Check-outs
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activeFilter === 'today-checkout' ? 'bg-white/20' : 'bg-rose-200'
                        }`}>
                          {todayCheckouts}
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className="border-t pt-2 mt-2">
                    <button
                      onClick={() => {
                        setActiveFilter('all');
                        setViewMode('grid');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        viewMode === 'grid' && activeFilter === 'all'
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'hover:bg-indigo-50 text-gray-700'
                      }`}
                    >
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Grid3x3 className="w-4 h-4" />
                        Fleet View
                      </span>
                    </button>
                    
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all mt-2 ${
                        viewMode === 'calendar'
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'hover:bg-indigo-50 text-gray-700'
                      }`}
                    >
                      <span className="text-sm font-medium flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Calendar View
                      </span>
                    </button>
                  </div>

                  {/* Car Filter for Calendar */}
                  {viewMode === 'calendar' && cars.length > 0 && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-xs text-gray-500 font-semibold mb-2 px-2">FILTER BY CAR</p>
                      
                      <button
                        onClick={() => setSelectedCarId('all')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                          selectedCarId === 'all'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'hover:bg-blue-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">All Cars</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            selectedCarId === 'all' ? 'bg-white/20' : 'bg-blue-200'
                          }`}>
                            {cars.length}
                          </span>
                        </div>
                      </button>

                      <div className="max-h-48 overflow-y-auto mt-2 space-y-1">
                        {cars.map((car) => (
                          <button
                            key={car.car_id}
                            onClick={() => setSelectedCarId(car.car_id)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                              selectedCarId === car.car_id
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'hover:bg-blue-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {car.brand} {car.model}
                                </p>
                                <p className="text-xs opacity-75 truncate">
                                  {car.plate}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCarDetailsClick(car);
                                }}
                                className={`ml-2 p-1 rounded hover:bg-white/20 ${
                                  selectedCarId === car.car_id ? 'text-white' : 'text-blue-600'
                                }`}
                              >
                                <UserIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
  
              {/* Main Content Area */}
              <div className="flex-1">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : viewMode === 'calendar' ? (
                // Improved Calendar View
                <Card className="p-6 border-2 bg-white">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Fleet booking calendar</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changeMonth(-1)}
                          className="hover:bg-blue-50"
                        >
                          ← Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDate(new Date())}
                          className="hover:bg-blue-50"
                        >
                          Today
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changeMonth(1)}
                          className="hover:bg-blue-50"
                        >
                          Next →
                        </Button>
                      </div>
                    </div>

                    {bookingsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    ) : cars.length === 0 ? (
                      <div className="text-center py-12">
                        <CalendarIcon className="w-16 h-16 mx-auto text-blue-400 mb-4 opacity-50" />
                        <p className="text-gray-500">Add cars to view the calendar</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <div className="min-w-[900px]">
                          {/* Calendar Rows - One per car */}
                          {getFilteredCars().map(car => {
                            const daysCount = getDaysInMonth(selectedDate);
                            const days: Date[] = Array.from({ length: daysCount }, (_, i) => 
                              new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1)
                            );
                            const weeks: Date[][] = [];
                            for (let i = 0; i < days.length; i += 7) {
                              weeks.push(days.slice(i, i + 7));
                            }

                            return (
                              <div key={car.car_id} className="mb-8 border-2 border-gray-300 rounded-xl overflow-hidden shadow-sm">
                                {/* Car Header */}
                                <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                                      <Car className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-bold text-lg">{car.brand} {car.model}</h3>
                                      <p className="text-sm text-blue-100">
                                        {car.production_year} • {car.color} • {car.plate}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <p className="text-sm text-blue-100">Price/Day</p>
                                        <p className="text-xl font-bold">${car.price_per_day}</p>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => handleCarDetailsClick(car)}
                                        className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                                      >
                                        <UserIcon className="w-4 h-4 mr-1" />
                                        Info
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Calendar Grid Header */}
                                <div className="grid grid-cols-7 gap-0 bg-gray-100 border-b-2 border-gray-300">
                                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                    <div key={day} className="p-3 font-semibold text-sm text-center text-gray-700 border-r border-gray-300 last:border-r-0">
                                      {day}
                                    </div>
                                  ))}
                                </div>

                                {/* Calendar Days */}
                                {weeks.map((week, weekIndex) => (
                                  <div key={weekIndex} className="grid grid-cols-7 gap-0 border-b border-gray-200 last:border-b-0">
                                    {week.map((date, dayIndex) => {
                                      const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                                      const isToday = date.toDateString() === new Date().toDateString();
                                      const booking = getBookingForCarOnDate(car.car_id, date);
                                      const block = getCarBlockForDate(car.car_id, date);
                                      const dateStr = formatDateLocal(date);
                                      
                                      // Check if this is a check-in or check-out day
                                      let isCheckIn = false;
                                      let isCheckOut = false;
                                      if (booking) {
                                        const startDate = extractDateFromApi(booking.start_date);
                                        const endDate = extractDateFromApi(booking.end_date);
                                        isCheckIn = dateStr === startDate;
                                        isCheckOut = dateStr === endDate;
                                      }

                                      // Check if this is a block start or end day
                                      let isBlockStart = false;
                                      let isBlockEnd = false;
                                      if (block) {
                                        const startDate = extractDateFromApi(block.start_date);
                                        const endDate = extractDateFromApi(block.end_date);
                                        isBlockStart = dateStr === startDate;
                                        isBlockEnd = dateStr === endDate;
                                      }

                                      return (
                                        <div
                                          key={dayIndex}
                                          title={`Calendar Date: ${dateStr}${block ? `\nBlock: ${block.start_date} to ${block.end_date}` : ''}${booking ? `\nBooking: ${booking.start_date} to ${booking.end_date}` : ''}`}
                                          className={`p-3 min-h-[80px] transition-all border-r border-gray-200 last:border-r-0 relative group ${
                                            !isCurrentMonth 
                                              ? 'bg-gray-50 opacity-40' 
                                              : isToday
                                              ? 'bg-blue-100 border-2 border-blue-500'
                                              : block
                                              ? 'bg-red-50 cursor-pointer hover:shadow-lg border-2 border-red-300'
                                              : booking
                                              ? isCheckIn && isCheckOut
                                                ? 'bg-gradient-to-r from-emerald-200 to-rose-200 cursor-pointer hover:shadow-lg'
                                                : isCheckIn
                                                ? 'bg-gradient-to-r from-emerald-200 to-emerald-100 cursor-pointer hover:shadow-lg'
                                                : isCheckOut
                                                ? 'bg-gradient-to-r from-rose-100 to-rose-200 cursor-pointer hover:shadow-lg'
                                                : booking.status === 'confirmed'
                                                ? 'bg-green-100 cursor-pointer hover:shadow-lg'
                                                : booking.status === 'pending'
                                                ? 'bg-yellow-100 cursor-pointer hover:shadow-lg'
                                                : 'bg-gray-100'
                                              : 'bg-white hover:bg-blue-50/50'
                                          }`}
                                          onClick={() => {
                                            if (block) {
                                              handleBlockClick(block);
                                            } else if (booking) {
                                              handleBookingClick(booking);
                                            }
                                          }}
                                        >
                                          {/* Block/Book button for available dates */}
                                          {!booking && !block && isCurrentMonth && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenBlockModal(car.car_id, date);
                                              }}
                                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                                              title="Block this date"
                                            >
                                              <Ban className="w-3 h-3" />
                                            </button>
                                          )}
                                          
                                          <div className="flex items-start justify-between mb-2">
                                            <span className={`text-sm font-bold ${
                                              isToday ? 'text-blue-700' : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                                            }`}>
                                              {date.getDate()}
                                            </span>
                                            {booking && (
                                              <div className="flex items-center gap-1">
                                                {getStatusBadge(booking.status)}
                                              </div>
                                            )}
                                            {block && (
                                              <div className="flex items-center gap-1">
                                                <Ban className="w-4 h-4 text-red-600" />
                                              </div>
                                            )}
                                          </div>
                                          
                                          {block ? (
                                            <div className="text-xs space-y-1">
                                              {isBlockStart && (
                                                <div className="flex items-center gap-1 text-red-700 font-semibold mb-1">
                                                  <Ban className="w-3 h-3" />
                                                  <span>Block Start</span>
                                                </div>
                                              )}
                                              {isBlockEnd && isBlockStart && (
                                                <div className="flex items-center gap-1 text-red-700 font-semibold mb-1">
                                                  <span>Block End</span>
                                                </div>
                                              )}
                                              {isBlockEnd && !isBlockStart && (
                                                <div className="flex items-center gap-1 text-red-700 font-semibold mb-1">
                                                  <span>Block End</span>
                                                </div>
                                              )}
                                              <p className="text-red-800 font-semibold">
                                                BLOCKED
                                              </p>
                                              {block.reason && (
                                                <p className="text-gray-600 truncate" title={block.reason}>
                                                  {block.reason}
                                                </p>
                                              )}
                                            </div>
                                          ) : booking ? (
                                            <div className="text-xs space-y-1">
                                              {isCheckIn && (
                                                <div className="flex items-center gap-1 text-emerald-700 font-semibold mb-1">
                                                  <ArrowLeft className="w-3 h-3" />
                                                  <span>Check-in</span>
                                                </div>
                                              )}
                                              {isCheckOut && (
                                                <div className="flex items-center gap-1 text-rose-700 font-semibold mb-1">
                                                  <span>Check-out</span>
                                                  <ArrowLeft className="w-3 h-3 rotate-180" />
                                                </div>
                                              )}
                                              <p className="text-gray-800 font-semibold truncate">
                                                {booking.user?.full_name || 'Unknown'}
                                              </p>
                                              <p className="text-gray-600 font-mono">
                                                ${booking.total_price}
                                              </p>
                                            </div>
                                          ) : null}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Legend */}
                    <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-r from-emerald-200 to-emerald-100"></div>
                        <span className="text-sm font-medium text-gray-700">Check-in Day</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-r from-rose-100 to-rose-200"></div>
                        <span className="text-sm font-medium text-gray-700">Check-out Day</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-green-100"></div>
                        <span className="text-sm font-medium text-gray-700">Confirmed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-yellow-100"></div>
                        <span className="text-sm font-medium text-gray-700">Pending</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-red-50 border-2 border-red-300"></div>
                        <span className="text-sm font-medium text-gray-700">Blocked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gray-100"></div>
                        <span className="text-sm font-medium text-gray-700">Cancelled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-100 border-2 border-blue-500"></div>
                        <span className="text-sm font-medium text-gray-700">Today</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : viewMode === 'grid' ? (
                // Fleet Grid View - only when filter is 'all'
                activeFilter === 'all' ? (
                  <Card className="p-6 border-2 bg-white">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Fleet Overview</h3>
                        <p className="text-sm text-gray-500">{cars.length} vehicle(s) in your fleet</p>
                      </div>
                    </div>

                    {cars.length === 0 ? (
                      <div className="text-center py-16">
                        <Car className="w-16 h-16 mx-auto text-gray-400 mb-4 opacity-50" />
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">No cars yet</h4>
                        <p className="text-gray-500 mb-6">Add your first car to start renting</p>
                        <Button
                          onClick={() => setShowCarModal(true)}
                          className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Car
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {cars.map((car) => {
                          const carBookings = getCarBookings(car.car_id);
                          const isAvailable = isCarAvailable(car.car_id, new Date());
                          
                          return (
                            <Card 
                              key={car.car_id} 
                              className="overflow-hidden border-2 hover:border-blue-300 hover:shadow-xl transition-all bg-white cursor-pointer group"
                              onClick={() => handleCarDetailsClick(car)}
                            >
                              {/* Car Cover Image */}
                              {car.coverImageUrl ? (
                                <div className="relative h-48 overflow-hidden bg-gray-100">
                                  <img 
                                    src={car.coverImageUrl} 
                                    alt={`${car.brand} ${car.model}`}
                                    className="w-full h-full object-contain"
                                  />
                                  <div className="absolute top-2 right-2">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                                      isAvailable 
                                        ? 'bg-green-500/90 text-white' 
                                        : 'bg-red-500/90 text-white'
                                    }`}>
                                      {isAvailable ? 'Available' : 'Booked'}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                  <Car className="w-16 h-16 text-white/30" />
                                  <div className="absolute top-2 right-2">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                                      isAvailable 
                                        ? 'bg-green-500/90 text-white' 
                                        : 'bg-red-500/90 text-white'
                                    }`}>
                                      {isAvailable ? 'Available' : 'Booked'}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="p-6">
                                <div className="mb-4">
                                  <h3 className="font-bold text-foreground text-lg">{car.brand} {car.model}</h3>
                                  <p className="text-sm text-muted-foreground">{car.production_year} • {car.color}</p>
                                </div>

                                <div className="space-y-2 mb-4">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Fuel className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{car.fuel_type} • {car.transmission}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Gauge className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{car.kilometers.toLocaleString()} km</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground font-mono">Plate: {car.plate}</span>
                                  </div>
                                </div>

                                {carBookings.length > 0 && (
                                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-xs font-medium text-gray-600 mb-2">Upcoming Bookings</p>
                                    <div className="space-y-1">
                                      {carBookings.slice(0, 2).map((booking) => (
                                        <div 
                                          key={booking.booking_id} 
                                          className="flex items-center gap-2 text-xs hover:bg-white p-1 rounded"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleBookingClick(booking);
                                          }}
                                        >
                                          {getStatusBadge(booking.status)}
                                          <span className="text-gray-600">
                                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                          </span>
                                        </div>
                                      ))}
                                      {carBookings.length > 2 && (
                                        <p className="text-xs text-blue-600">+{carBookings.length - 2} more</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div className="pt-4 border-t">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">Price per day</span>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                      ${car.price_per_day}
                                    </span>
                                  </div>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenCarImages(car);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="w-full gap-2 mt-2"
                                  >
                                    <ImageIcon className="w-4 h-4" />
                                    Manage Images
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                ) : (
                  // Bookings List View for filtered bookings
                  <Card className="p-6 border-2 bg-white">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {activeFilter === 'pending' && 'Pending Bookings'}
                          {activeFilter === 'confirmed' && 'Confirmed Bookings'}
                          {activeFilter === 'cancelled' && 'Cancelled Bookings'}
                          {activeFilter === 'today-checkin' && "Today's Check-ins"}
                          {activeFilter === 'today-checkout' && "Today's Check-outs"}
                        </h3>
                        <p className="text-sm text-gray-500">{filteredBookings.length} booking(s)</p>
                      </div>
                    </div>

                    {filteredBookings.length === 0 ? (
                      <div className="text-center py-16">
                        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4 opacity-50" />
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">No bookings found</h4>
                        <p className="text-gray-500">No bookings match the selected filter</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredBookings
                          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                          .map((booking) => (
                            <div
                              key={booking.booking_id}
                              className="flex items-center justify-between p-4 border-2 rounded-lg hover:shadow-md transition-all cursor-pointer bg-white hover:border-blue-300"
                              onClick={() => handleBookingClick(booking)}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  booking.status === 'confirmed' ? 'bg-green-100' :
                                  booking.status === 'pending' ? 'bg-yellow-100' :
                                  'bg-gray-100'
                                }`}>
                                  {getStatusBadge(booking.status)}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-gray-800">
                                      {booking.car?.brand} {booking.car?.model}
                                    </p>
                                    <span className="text-xs text-gray-500">•</span>
                                    <p className="text-sm text-gray-600">{booking.user?.full_name}</p>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="w-3 h-3" />
                                      {new Date(booking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(booking.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Car className="w-3 h-3" />
                                      {booking.car?.plate}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-800">${booking.total_price}</p>
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                    booking.status === 'confirmed' 
                                      ? 'bg-green-100 text-green-700 border border-green-200'
                                      : booking.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </Card>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>


      {/* Add Car Modal */}
      {showCarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl shadow-2xl my-8 border-2">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Add New Car</h2>
              
              {/* Cover Image Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Cover Image (Optional)
                </label>
                
                {newCarCoverPreview ? (
                  <div className="relative">
                    <div className="w-full h-48 rounded-xl overflow-hidden border-2 border-blue-300 bg-gray-100">
                      <img 
                        src={newCarCoverPreview} 
                        alt="Cover preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <Button
                      onClick={handleRemoveNewCarCoverImage}
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="new-car-cover-upload"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleNewCarCoverImageSelect}
                      className="hidden"
                    />
                    <label htmlFor="new-car-cover-upload">
                      <div className="w-full h-48 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-blue-50">
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload cover image</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WebP (max 5MB)</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={carData.brand}
                    onChange={(e) => setCarData({ ...carData, brand: e.target.value })}
                    placeholder="Toyota"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={carData.model}
                    onChange={(e) => setCarData({ ...carData, model: e.target.value })}
                    placeholder="Camry"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Production Year
                  </label>
                  <input
                    type="number"
                    value={carData.production_year}
                    onChange={(e) => setCarData({ ...carData, production_year: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Engine
                  </label>
                  <input
                    type="text"
                    value={carData.engine}
                    onChange={(e) => setCarData({ ...carData, engine: e.target.value })}
                    placeholder="2.5L"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Transmission
                  </label>
                  <select
                    value={carData.transmission}
                    onChange={(e) => setCarData({ ...carData, transmission: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fuel Type
                  </label>
                  <select
                    value={carData.fuel_type}
                    onChange={(e) => setCarData({ ...carData, fuel_type: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Kilometers
                  </label>
                  <input
                    type="number"
                    value={carData.kilometers}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Remove leading zero when user starts typing
                      if (value === '' || value === '0') {
                        setCarData({ ...carData, kilometers: 0 });
                      } else {
                        setCarData({ ...carData, kilometers: Number(value) });
                      }
                    }}
                    onFocus={(e) => {
                      // Select all text when focused, so typing replaces the 0
                      if (carData.kilometers === 0) {
                        e.target.select();
                      }
                    }}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={carData.color}
                    onChange={(e) => setCarData({ ...carData, color: e.target.value })}
                    placeholder="White"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Seats
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="9"
                    value={carData.seats}
                    onChange={(e) => setCarData({ ...carData, seats: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Car Type
                  </label>
                  <select
                    value={carData.car_type}
                    onChange={(e) => setCarData({ ...carData, car_type: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="coupe">Coupe</option>
                    <option value="convertible">Convertible</option>
                    <option value="wagon">Wagon</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Plate *
                  </label>
                  <input
                    type="text"
                    value={carData.plate}
                    onChange={(e) => setCarData({ ...carData, plate: e.target.value })}
                    placeholder="ABC163"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price per Day
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={carData.price_per_day}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Remove leading zero when user starts typing
                      if (value === '' || value === '0') {
                        setCarData({ ...carData, price_per_day: 0 });
                      } else {
                        setCarData({ ...carData, price_per_day: Number(value) });
                      }
                    }}
                    onFocus={(e) => {
                      // Select all text when focused, so typing replaces the 0
                      if (carData.price_per_day === 0) {
                        e.target.select();
                      }
                    }}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={carData.description}
                    onChange={(e) => setCarData({ ...carData, description: e.target.value })}
                    placeholder="Comfortable and reliable sedan"
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateCar}
                  disabled={carLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white gap-2"
                >
                  {carLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Car
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowCarModal(false);
                    setNewCarCoverImage(null);
                    setNewCarCoverPreview(null);
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={carLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Car Modal */}
      {showEditCarModal && selectedCar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-4xl my-8 bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Edit className="w-6 h-6 text-green-500" />
                  Edit Car
                </h2>
                <Button
                  onClick={() => {
                    setShowEditCarModal(false);
                    setSelectedCar(null);
                    setCarData({
                      brand: '',
                      model: '',
                      production_year: new Date().getFullYear(),
                      engine: '',
                      transmission: 'automatic',
                      fuel_type: 'petrol',
                      kilometers: 0,
                      color: '',
                      seats: 5,
                      car_type: 'sedan',
                      plate: '',
                      description: '',
                      price_per_day: 0,
                    });
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={carData.brand}
                    onChange={(e) => setCarData({ ...carData, brand: e.target.value })}
                    placeholder="Toyota"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={carData.model}
                    onChange={(e) => setCarData({ ...carData, model: e.target.value })}
                    placeholder="Camry"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Production Year
                  </label>
                  <input
                    type="number"
                    value={carData.production_year}
                    onChange={(e) => setCarData({ ...carData, production_year: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Engine
                  </label>
                  <input
                    type="text"
                    value={carData.engine}
                    onChange={(e) => setCarData({ ...carData, engine: e.target.value })}
                    placeholder="2.5L"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Transmission
                  </label>
                  <select
                    value={carData.transmission}
                    onChange={(e) => setCarData({ ...carData, transmission: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fuel Type
                  </label>
                  <select
                    value={carData.fuel_type}
                    onChange={(e) => setCarData({ ...carData, fuel_type: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Kilometers
                  </label>
                  <input
                    type="number"
                    value={carData.kilometers}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === '0') {
                        setCarData({ ...carData, kilometers: 0 });
                      } else {
                        setCarData({ ...carData, kilometers: Number(value) });
                      }
                    }}
                    onFocus={(e) => {
                      if (carData.kilometers === 0) {
                        e.target.select();
                      }
                    }}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={carData.color}
                    onChange={(e) => setCarData({ ...carData, color: e.target.value })}
                    placeholder="White"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Seats
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="9"
                    value={carData.seats}
                    onChange={(e) => setCarData({ ...carData, seats: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Car Type
                  </label>
                  <select
                    value={carData.car_type}
                    onChange={(e) => setCarData({ ...carData, car_type: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="coupe">Coupe</option>
                    <option value="convertible">Convertible</option>
                    <option value="wagon">Wagon</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Plate *
                  </label>
                  <input
                    type="text"
                    value={carData.plate}
                    onChange={(e) => setCarData({ ...carData, plate: e.target.value })}
                    placeholder="ABC163"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price per Day
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={carData.price_per_day}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === '0') {
                        setCarData({ ...carData, price_per_day: 0 });
                      } else {
                        setCarData({ ...carData, price_per_day: Number(value) });
                      }
                    }}
                    onFocus={(e) => {
                      if (carData.price_per_day === 0) {
                        e.target.select();
                      }
                    }}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={carData.description}
                    onChange={(e) => setCarData({ ...carData, description: e.target.value })}
                    placeholder="Comfortable and reliable sedan"
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleUpdateCar}
                  disabled={carLoading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white gap-2"
                >
                  {carLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      Update Car
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowEditCarModal(false);
                    setSelectedCar(null);
                    setCarData({
                      brand: '',
                      model: '',
                      production_year: new Date().getFullYear(),
                      engine: '',
                      transmission: 'automatic',
                      fuel_type: 'petrol',
                      kilometers: 0,
                      color: '',
                      seats: 5,
                      car_type: 'sedan',
                      plate: '',
                      description: '',
                      price_per_day: 0,
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={carLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBookingModal(false)}>
          <Card className="w-full max-w-2xl shadow-2xl border-2 bg-white" onClick={(e) => e.stopPropagation()}>
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
              
              <div className="space-y-6">
                {/* Booking Status */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedBooking.status)}
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-semibold text-gray-800 capitalize">{selectedBooking.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Booking ID</p>
                    <p className="font-mono text-gray-800">#{selectedBooking.booking_id}</p>
                  </div>
                </div>

                {/* Car Details */}
                <div className="p-4 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {selectedBooking.car?.brand} {selectedBooking.car?.model}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Plate: {selectedBooking.car?.plate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                {selectedBooking.user && (
                  <div className="p-4 border-2 border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-3">Customer Information</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <p className="font-semibold text-gray-800">{selectedBooking.user.full_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{selectedBooking.user.email}</p>
                      </div>
                      {selectedBooking.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">{selectedBooking.user.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rental Period */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-4 h-4 text-blue-500" />
                      <p className="text-sm font-medium text-gray-500">Start Date</p>
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
                      <CalendarIcon className="w-4 h-4 text-blue-500" />
                      <p className="text-sm font-medium text-gray-500">End Date</p>
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
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Total Price</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ${selectedBooking.total_price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => updateBookingStatus(selectedBooking.booking_id, 'confirmed')}
                      disabled={updatingBooking}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white gap-2"
                    >
                      {updatingBooking ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => updateBookingStatus(selectedBooking.booking_id, 'cancelled')}
                      disabled={updatingBooking}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 gap-2"
                    >
                      {updatingBooking ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Reject Booking
                        </>
                      )}
                    </Button>
                  </>
                )}
                
                {selectedBooking.status === 'confirmed' && (
                  <Button
                    onClick={() => updateBookingStatus(selectedBooking.booking_id, 'cancelled')}
                    disabled={updatingBooking}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 gap-2"
                  >
                    {updatingBooking ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Cancel Booking
                      </>
                    )}
                  </Button>
                )}

                <Button
                  onClick={() => setShowBookingModal(false)}
                  variant="outline"
                  className="flex-1 border-gray-300"
                  disabled={updatingBooking}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Car Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBlockModal(false)}>
          <Card className="w-full max-w-lg shadow-2xl border bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Ban className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Block Car Dates</h2>
                    <p className="text-sm text-gray-500">Make car unavailable for booking</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBlockModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car
                  </label>
                  <select
                    value={blockData.car_id}
                    onChange={(e) => setBlockData({ ...blockData, car_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={creatingBlock}
                  >
                    <option value={0}>Select a car</option>
                    {cars.map((car) => (
                      <option key={car.car_id} value={car.car_id}>
                        {car.brand} {car.model} - {car.plate}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={blockData.start_date}
                    onChange={(e) => setBlockData({ ...blockData, start_date: e.target.value })}
                    disabled={creatingBlock}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={blockData.end_date}
                    onChange={(e) => setBlockData({ ...blockData, end_date: e.target.value })}
                    disabled={creatingBlock}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <Textarea
                    value={blockData.reason}
                    onChange={(e) => setBlockData({ ...blockData, reason: e.target.value })}
                    placeholder="e.g., Car in maintenance, Repair needed, etc."
                    disabled={creatingBlock}
                    className="w-full"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleCreateCarBlock}
                  disabled={creatingBlock || !blockData.car_id || !blockData.start_date || !blockData.end_date}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {creatingBlock ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Creating Block...
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Block Dates
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowBlockModal(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={creatingBlock}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Block Details Modal */}
      {showBlockDetailsModal && selectedBlock && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBlockDetailsModal(false)}>
          <Card className="w-full max-w-lg shadow-2xl border bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Ban className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Block Details</h2>
                    <p className="text-sm text-gray-500">Car availability block</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBlockDetailsModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <p className="text-sm text-gray-600 mb-1">Car</p>
                  <p className="font-semibold text-gray-800">
                    {cars.find(c => c.car_id === selectedBlock.car_id)?.brand} {cars.find(c => c.car_id === selectedBlock.car_id)?.model}
                  </p>
                  <p className="text-sm text-gray-600">
                    {cars.find(c => c.car_id === selectedBlock.car_id)?.plate}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(selectedBlock.start_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">End Date</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(selectedBlock.end_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {selectedBlock.reason && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Reason</p>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">
                      {selectedBlock.reason}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">Created</p>
                  <p className="text-gray-800">
                    {new Date(selectedBlock.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    const blockId = selectedBlock.block_id || selectedBlock.id;
                    if (blockId) {
                      handleDeleteCarBlock(blockId);
                    } else {
                      toast.error('Invalid block ID');
                      console.error('Block ID not found:', selectedBlock);
                    }
                  }}
                  disabled={deletingBlock}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {deletingBlock ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Block
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowBlockDetailsModal(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={deletingBlock}
                >
                  Close
                </Button>
              </div>
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
                <h2 className="text-2xl font-bold text-gray-800">Business Cover Image</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCoverImageModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex justify-center mb-6">
                <div className="w-full h-48 rounded-lg overflow-hidden relative bg-gray-100">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt="Cover"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 text-center flex flex-col items-center justify-center text-white">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">No cover image</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <input
                    type="file"
                    id="cover-image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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

                <Button
                  onClick={() => setShowCoverImageModal(false)}
                  variant="outline"
                  className="w-full border-gray-300"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Supported formats: JPEG, PNG, GIF, WebP (Max 10MB)
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Image Crop Modal */}
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Crop Cover Image</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCropModal(false);
                    setImageToCrop(null);
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Drag the selection area to choose which part of your image to use. The crop area is fixed to match the banner dimensions (wide format).
              </p>

              {/* Image with crop overlay */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-6" style={{ height: '500px' }}>
                <img 
                  src={imageToCrop} 
                  alt="Crop preview"
                  className="w-full h-full object-contain"
                  style={{ userSelect: 'none' }}
                />
                
                {/* Crop overlay */}
                <div 
                  className="absolute border-4 border-blue-500 cursor-move"
                  style={{
                    left: `${cropArea.x}%`,
                    top: `${cropArea.y}%`,
                    width: `${cropArea.width}%`,
                    height: `${cropArea.height}%`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                  }}
                  onMouseDown={(e) => {
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startCropX = cropArea.x;
                    const startCropY = cropArea.y;
                    const parent = e.currentTarget.parentElement;
                    if (!parent) return;

                    const onMouseMove = (moveEvent: MouseEvent) => {
                      const deltaX = ((moveEvent.clientX - startX) / parent.offsetWidth) * 100;
                      const deltaY = ((moveEvent.clientY - startY) / parent.offsetHeight) * 100;
                      
                      const newX = Math.max(0, Math.min(100 - cropArea.width, startCropX + deltaX));
                      const newY = Math.max(0, Math.min(100 - cropArea.height, startCropY + deltaY));
                      
                      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
                    };

                    const onMouseUp = () => {
                      document.removeEventListener('mousemove', onMouseMove);
                      document.removeEventListener('mouseup', onMouseUp);
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg pointer-events-none">
                    Banner Crop Area
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCropComplete}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Crop & Upload
                </Button>
                <Button
                  onClick={() => {
                    setCropArea({ x: 0, y: 25, width: 100, height: 21.33 });
                  }}
                  variant="outline"
                  className="px-6"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => {
                    setShowCropModal(false);
                    setImageToCrop(null);
                  }}
                  variant="outline"
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Business Images Gallery Modal */}
      {showImagesModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowImagesModal(false)}>
          <Card className="w-full max-w-4xl shadow-2xl border bg-white max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Business Image Gallery</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImagesModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="mb-6">
                <input
                  type="file"
                  id="business-images-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImagesFileSelect}
                  className="hidden"
                  multiple
                  disabled={uploadingImages}
                />
                <label htmlFor="business-images-upload">
                  <Button
                    type="button"
                    disabled={uploadingImages}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-2"
                    onClick={() => document.getElementById('business-images-upload')?.click()}
                    asChild
                  >
                    <span>
                      {uploadingImages ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload Images (Max 10)
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>

              {businessImages.length === 0 ? (
                <div className="text-center py-16">
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4 opacity-50" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">No images yet</h4>
                  <p className="text-gray-500 mb-6">Upload images to showcase your business</p>
                  <Button
                    onClick={() => setShowCarModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Image
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {businessImages.map((image, index) => (
                    <div key={image.image_id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all bg-gray-100">
                        <img
                          src={getApiUrl(image.image_path)}
                          alt={`Business ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        #{image.image_order}
                      </div>

                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateImageOrder(image.image_id, image.image_order - 1)}
                          disabled={image.image_order === 1 || updatingImageOrder === image.image_id}
                          className="bg-white/90 hover:bg-white text-blue-600 p-2 h-8 w-8"
                        >
                          {updatingImageOrder === image.image_id ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <MoveUp className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateImageOrder(image.image_id, image.image_order + 1)}
                          disabled={image.image_order === businessImages.length || updatingImageOrder === image.image_id}
                          className="bg-white/90 hover:bg-white text-blue-600 p-2 h-8 w-8"
                        >
                          {updatingImageOrder === image.image_id ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <MoveDown className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteBusinessImage(image.image_id)}
                          disabled={deletingImage === image.image_id}
                          className="bg-red-500/90 hover:bg-red-600 text-white p-2 h-8 w-8"
                        >
                          {deletingImage === image.image_id ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-6">
                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB per image, 10 images at once)
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Car Images Gallery Modal */}
      {showCarImagesModal && selectedCarForImages && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCarImagesModal(false)}>
          <Card className="w-full max-w-4xl shadow-2xl border bg-white max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedCarForImages.brand} {selectedCarForImages.model} - Images
                  </h2>
                  <p className="text-sm text-gray-500">{selectedCarForImages.plate}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCarImagesModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="mb-6">
                <input
                  type="file"
                  id="car-images-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleCarImagesFileSelect}
                  className="hidden"
                  multiple
                  disabled={uploadingCarImages}
                />
                <label htmlFor="car-images-upload">
                  <Button
                    type="button"
                    disabled={uploadingCarImages}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-2"
                    onClick={() => document.getElementById('car-images-upload')?.click()}
                    asChild
                  >
                    <span>
                      {uploadingCarImages ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload Images (Max 10)
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>

              {carImages.length === 0 ? (
                <div className="text-center py-16">
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4 opacity-50" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">No images yet</h4>
                  <p className="text-gray-500 mb-6">Upload images to showcase this car</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {carImages.map((image, index) => (
                    <div key={image.image_id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all bg-gray-100">
                        <img
                          src={getApiUrl(image.image_path)}
                          alt={`Car ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Cover Badge */}
                      {image.is_cover && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Cover
                        </div>
                      )}

                      {/* Order Badge */}
                      {!image.is_cover && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          #{image.image_order}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!image.is_cover && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateCarImageOrder(selectedCarForImages.car_id, image.image_id, image.image_order - 1)}
                              disabled={image.image_order === 1 || updatingCarImageOrder === image.image_id}
                              className="bg-white/90 hover:bg-white text-blue-600 p-2 h-8 w-8"
                            >
                              {updatingCarImageOrder === image.image_id ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : (
                                <MoveUp className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateCarImageOrder(selectedCarForImages.car_id, image.image_id, image.image_order + 1)}
                              disabled={image.image_order === carImages.filter(img => !img.is_cover).length || updatingCarImageOrder === image.image_id}
                              className="bg-white/90 hover:bg-white text-blue-600 p-2 h-8 w-8"
                            >
                              {updatingCarImageOrder === image.image_id ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : (
                                <MoveDown className="w-3 h-3" />
                              )}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleDeleteCarImage(selectedCarForImages.car_id, image.image_id)}
                          disabled={deletingCarImage === image.image_id}
                          className="bg-red-500/90 hover:bg-red-600 text-white p-2 h-8 w-8"
                        >
                          {deletingCarImage === image.image_id ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>

                      {/* Set as Cover Button */}
                      {!image.is_cover && (
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            onClick={() => handleSetCarCoverImage(selectedCarForImages.car_id, image.image_id)}
                            disabled={settingCover === image.image_id}
                            className="w-full bg-green-500/90 hover:bg-green-600 text-white text-xs h-7"
                          >
                            {settingCover === image.image_id ? (
                              <Loader className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Set as Cover
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-6">
                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB per image, 10 images at once)
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Car Details Modal */}
      {showCarDetailsModal && selectedCar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCarDetailsModal(false)}>
          <Card className="w-full max-w-4xl shadow-2xl border bg-white max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedCar.brand} {selectedCar.model}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedCar.production_year} • {selectedCar.plate}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCarDetailsModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Car Images Gallery */}
              {carImages.length > 0 && (
                <div className="mb-6">
                  {/* Cover Image */}
                  {carImages.find(img => img.is_cover) && (
                    <div className="mb-4 rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={getApiUrl(carImages.find(img => img.is_cover)!.image_path)} 
                        alt="Cover"
                        className="w-full h-96 object-contain"
                      />
                    </div>
                  )}
                  
                  {/* Image Gallery */}
                  {carImages.filter(img => !img.is_cover).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {carImages.filter(img => !img.is_cover).slice(0, 4).map((image) => (
                        <div key={image.image_id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={getApiUrl(image.image_path)} 
                            alt="Car"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Car Specifications */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Brand & Model</p>
                    <p className="text-gray-800 font-semibold text-lg">{selectedCar.brand} {selectedCar.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Production Year</p>
                    <p className="text-gray-800">{selectedCar.production_year}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Color</p>
                    <p className="text-gray-800 capitalize">{selectedCar.color}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">License Plate</p>
                    <p className="text-gray-800 font-mono">{selectedCar.plate}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Engine</p>
                    <p className="text-gray-800">{selectedCar.engine || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Transmission</p>
                    <p className="text-gray-800">{selectedCar.transmission}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Fuel Type</p>
                    <p className="text-gray-800">{selectedCar.fuel_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Kilometers</p>
                    <p className="text-gray-800">{selectedCar.kilometers.toLocaleString()} km</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedCar.description && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700">{selectedCar.description}</p>
                </div>
              )}

              {/* Price */}
              <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">Price per Day</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${selectedCar.price_per_day}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowCarDetailsModal(false);
                    handleOpenCarImages(selectedCar);
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Manage Images
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white gap-2"
                    >
                      <MoreVertical className="w-4 h-4" />
                      Settings
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleEditCarClick(selectedCar)}
                      className="cursor-pointer"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Car
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteCar(selectedCar.car_id)}
                      className="cursor-pointer text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Business Modal */}
      {showEditBusinessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditBusinessModal(false)}>
          <Card className="w-full max-w-2xl shadow-2xl border bg-white max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Business</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditBusinessModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <Input
                    value={businessData.business_name}
                    onChange={(e) => setBusinessData({ ...businessData, business_name: e.target.value })}
                    placeholder="Enter business name"
                    className="w-full border-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VAT Number
                  </label>
                  <Input
                    value={businessData.vat_number}
                    onChange={(e) => setBusinessData({ ...businessData, vat_number: e.target.value })}
                    placeholder="Enter VAT number"
                    className="w-full border-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    value={businessData.address}
                    onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                    placeholder="Enter address"
                    className="w-full border-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    value={businessData.city}
                    onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                    placeholder="Enter city"
                    className="w-full border-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <Input
                      value={businessData.phone}
                      onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="w-full border-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      value={businessData.email}
                      onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                      placeholder="Enter email"
                      className="w-full border-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={businessData.description}
                    onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                    placeholder="Enter business description"
                    className="w-full border-2"
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={businessData.latitude}
                      onChange={(e) => setBusinessData({ ...businessData, latitude: parseFloat(e.target.value) })}
                      placeholder="Enter latitude"
                      className="w-full border-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={businessData.longitude}
                      onChange={(e) => setBusinessData({ ...businessData, longitude: parseFloat(e.target.value) })}
                      placeholder="Enter longitude"
                      className="w-full border-2"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  onClick={handleUpdateBusiness}
                  disabled={updatingBusiness}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white gap-2"
                >
                  {updatingBusiness ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      Update Business
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowEditBusinessModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Business Modal */}
      {showDeleteBusinessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl border bg-white">
            <div className="p-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-100 mb-4 mx-auto">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              
              <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
                Delete Business?
              </h2>
              
              <p className="text-center text-gray-600 mb-6">
                This action cannot be undone. All cars, bookings, and images associated with this business will be permanently deleted.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 font-medium">
                  <strong>Business:</strong> {business?.business_name}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDeleteBusiness}
                  disabled={deletingBusiness}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                >
                  {deletingBusiness ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowDeleteBusinessModal(false)}
                  disabled={deletingBusiness}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
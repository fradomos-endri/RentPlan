import { useState, useEffect } from 'react';
import { Search, MapPin, Users, Zap, ChevronDown, Calendar as CalendarIcon, X, CheckCircle, Loader, ArrowRight, Car as CarIcon, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/obi-aZKJEvydrNM-unsplash.jpg';
import sideImage from '@/assets/archivio-automobile-gsNRBHH1Ij4-unsplash.jpg';
import rentplanLogo from '@/assets/rentplan.png';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { mockCars, mockBookings, mockAgencies } from '@/data/mockData';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';
import { getStoredUser, getStoredToken } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { BusinessMap } from '@/components/BusinessMap';

interface FilteredCar {
  id: string;
  name: string;
  type: string;
  image: string;
  coverImage?: string | null;
  pricePerDay: number;
  seats: number;
  transmission: string;
  fuelType: string;
  agencyName: string;
  agencyId: string;
  businessLocation?: string;
}

export function SearchHero() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState('all');
  const [carType, setCarType] = useState('all');
  const [passengers, setPassengers] = useState('all');
  const [carName, setCarName] = useState('');
  const [searchResults, setSearchResults] = useState<FilteredCar[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [cityBusinesses, setCityBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
  const [selectedCar, setSelectedCar] = useState<FilteredCar | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const user = getStoredUser();
  const token = getStoredToken();
  const navigate = useNavigate();

  // Albanian cities list
  const albanianCities = [
    'Tirana',
    'Durrës',
    'Vlorë',
    'Elbasan',
    'Shkodër',
    'Fier',
    'Korçë',
    'Berat',
    'Lushnjë',
    'Kavajë',
    'Pogradec',
    'Laç',
    'Kukës',
    'Lezhë',
    'Patos',
    'Krujë',
    'Kuçovë',
    'Burrel',
    'Cërrik',
    'Sarandë',
    'Gjirokastër',
    'Përmet',
    'Tepelenë',
    'Gramsh',
    'Librazhd',
    'Peshkopi',
    'Bulqizë'
  ].sort();

  // Fetch businesses on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch businesses for mapping cars to locations
        const businessResponse = await fetch(getApiUrl(API_ENDPOINTS.BUSINESSES));
        if (businessResponse.ok) {
          const businessesData = await businessResponse.json();
          setBusinesses(businessesData);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, []);

  // Get all booked dates from bookings
  const getBookedDates = (): Date[] => {
    const bookedDates: Date[] = [];
    mockBookings.forEach((booking) => {
      if (booking.status === 'cancelled') return;
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        bookedDates.push(new Date(d));
      }
    });
    return bookedDates;
  };

  const bookedDates = getBookedDates();

  // Check if a date is booked
  const isDateBooked = (date: Date): boolean => {
    return bookedDates.some(
      (bookedDate) =>
        bookedDate.toDateString() === date.toDateString()
    );
  };

  // Format date for display
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isCarAvailable = (carId: string, start: Date, end: Date): boolean => {
    return !mockBookings.some((booking) => {
      if (booking.carId !== carId) return false;
      if (booking.status === 'cancelled') return false;
      
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      return !(end < bookingStart || start > bookingEnd);
    });
  };

  const handleSearch = async () => {
    // Validate that at least location is selected or dates are provided
    if (!startDate && !endDate && location === 'all') {
      toast.error('Please select a location or dates to search');
      return;
    }

    // If dates are provided, both must be filled
    if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.error('Please select both pick-up and drop-off dates');
      return;
    }

    // If both dates are provided, validate they're correct
    if (startDate && endDate && startDate >= endDate) {
      toast.error('Drop-off date must be after pick-up date');
      return;
    }

    setIsSearching(true);
    setHasSearched(false);

    try {
      // Format dates as YYYY-MM-DD
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Build query parameters for advanced search
      const params = new URLSearchParams();

      // Determine dates to use
      let searchStartDate = startDate;
      let searchEndDate = endDate;

      // If no dates provided, use today and tomorrow as defaults
      if (!startDate || !endDate) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        searchStartDate = startDate || today;
        searchEndDate = endDate || tomorrow;
      }

      // Always add dates to the request
      const startDateStr = formatDate(searchStartDate);
      const endDateStr = formatDate(searchEndDate);
      params.append('start_date', startDateStr);
      params.append('end_date', endDateStr);

      // Add city filter if selected
      if (location !== 'all') {
        params.append('city', location);
      }

      // Add car type filter if selected
      if (carType !== 'all') {
        params.append('car_type', carType);
      }

      const url = `${getApiUrl(API_ENDPOINTS.CARS_ADVANCED_SEARCH)}?${params.toString()}`;
      console.log('Searching cars:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to search cars: ${response.status}`);
      }

      const data = await response.json();
      const cars = data.cars || []; // Extract cars array from response

      console.log('Search results:', data);

      // Transform API response to match FilteredCar interface
      const transformedCars: FilteredCar[] = cars.map((car: any) => {
        // Find the business/agency for this car to get location
        const business = businesses.find((b: any) => b.business_id === car.business_id);
        
        return {
          id: car.car_id.toString(),
          name: `${car.brand} ${car.model}`,
          type: car.car_type || 'sedan',
          image: car.cover_image || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
          coverImage: car.cover_image,
          pricePerDay: parseFloat(car.price_per_day),
          seats: car.seats || 5,
          transmission: car.transmission.toLowerCase() === 'automatic' ? 'automatic' : 'manual',
          fuelType: car.fuel_type,
          agencyName: car.business_name || 'Unknown Agency',
          agencyId: car.business_id.toString(),
          businessLocation: business?.location || car.city || '',
        };
      });

      setSearchResults(transformedCars);
      setHasSearched(true);
      setFilterActive(false);

      // Fetch cover images for each car
      const updatedCars = await Promise.all(
        transformedCars.map(async (car) => {
          try {
            const imagesResponse = await fetch(getApiUrl(`${API_ENDPOINTS.CARS}/${car.id}/images`), {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            
            if (imagesResponse.ok) {
              const images = await imagesResponse.json();
              const coverImage = Array.isArray(images) ? images.find((img: any) => img.is_cover) : null;
              if (coverImage) {
                return {
                  ...car,
                  coverImage: coverImage.image_path,
                };
              }
            }
          } catch (error) {
            console.error(`Error fetching images for car ${car.id}:`, error);
          }
          return car;
        })
      );
      
      setSearchResults(updatedCars);

      // Fetch businesses for the selected city to show on map
      if (location !== 'all') {
        const cityBusinessesList = businesses.filter(
          (b: any) => {
            // Support both 'city' and 'location' fields for backward compatibility
            const businessCity = b.city || b.location;
            return businessCity && businessCity.toLowerCase() === location.toLowerCase();
          }
        );
        setCityBusinesses(cityBusinessesList);
      } else {
        setCityBusinesses([]);
      }

      if (transformedCars.length === 0) {
        toast.info('No cars available for the selected dates and filters');
      } else {
        toast.success(`Found ${transformedCars.length} available car${transformedCars.length !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error searching cars:', error);
      toast.error('Failed to search cars. Please try again.');
      
      // Fallback to mock data
      const filtered = mockCars
        .filter((car) => {
          if (carName) {
            const searchLower = carName.toLowerCase();
            const matchesName = car.name.toLowerCase().includes(searchLower) || 
                              car.brand?.toLowerCase().includes(searchLower) ||
                              car.type?.toLowerCase().includes(searchLower);
            if (!matchesName) return false;
          }
          
          if (passengers !== 'all' && car.seats < parseInt(passengers)) return false;
          return car.available;
        })
        .map((car) => {
          const agency = mockAgencies.find((a) => a.id === car.agencyId);
          return {
            ...car,
            agencyName: agency?.name || 'Unknown Agency',
          };
        });

      setSearchResults(filtered);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setLocation('all');
    setCarType('all');
    setCarName('');
    setSearchResults([]);
    setHasSearched(false);
    setFilterActive(false);
    setCityBusinesses([]);
    toast.success('Search filters cleared');
  };

  const calculateDays = (start: Date | undefined, end: Date | undefined): number => {
    if (!start || !end) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const days = calculateDays(startDate, endDate);

  const handleBookCar = async () => {
    if (!user) {
      toast.error('Please sign in to book a car');
      navigate('/signin');
      return;
    }

    if (!selectedCar || !startDate || !endDate) {
      toast.error('Missing booking information');
      return;
    }

    setIsBooking(true);

    try {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const bookingData = {
        car_id: parseInt(selectedCar.id),
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        total_price: calculateDays(startDate, endDate) * selectedCar.pricePerDay,
      };

      console.log('Creating booking:', bookingData);

      const response = await fetch(getApiUrl(API_ENDPOINTS.BOOKINGS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      const booking = await response.json();
      console.log('Booking created:', booking);

      toast.success('Booking created successfully!');
      setShowBookingModal(false);
      setSelectedCar(null);

      // Redirect to profile page to view bookings
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleReserveClick = (car: FilteredCar) => {
    if (!user) {
      toast.error('Please sign in to book a car');
      navigate('/signin');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select pick-up and drop-off dates');
      return;
    }

    setSelectedCar(car);
    setShowBookingModal(true);
  };

  return (
    <div className="w-full">
      {/* Editorial Hero - Vertical Spine with Floating Search */}
      <section 
        className="relative overflow-hidden -mt-20 pt-20" 
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,0.15), transparent 50%, rgba(0,0,0,0.25)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }}
      >

        {/* Content Container - Spine Alignment */}
        <div className="container relative z-10 w-full">
          <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between py-12 lg:py-16">
            
            {/* Top Section - Headline with Emphasis */}
            <div className="max-w-2xl">
              <h1 className="text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight" style={{ wordSpacing: '0.1em' }}>
                Find <span className="text-cyan-400 inline-block">premium</span>
                <br />
                cars instantly.
              </h1>
              
              {/* Subheadline - Positioned with breathing room */}
              <p className="mt-8 text-lg text-white/75 font-light leading-relaxed max-w-lg">
                Rent from verified agencies with transparent pricing, instant confirmation, and 24/7 support.
              </p>
            </div>

            {/* Middle Section - Floating Search Module (Offset Left) */}
            <div className="relative max-w-lg -ml-0 lg:-ml-0">
              
              {/* White Container - Clean, prominent */}
              <div className="bg-white rounded-2xl p-8 space-y-4 shadow-2xl">
                
                {/* Search Label - Subtle, upper left */}
                <div className="flex items-center gap-2 mb-6">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Find your car</p>
                </div>

                {/* Row 1: City + Car Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* City Search */}
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="h-12 px-4 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-normal hover:bg-gray-50 focus:ring-2 focus:ring-cyan-500 transition-all">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <SelectValue placeholder="Select City" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {albanianCities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Car Type */}
                  <Select value={carType} onValueChange={setCarType}>
                    <SelectTrigger className="h-12 px-4 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-normal hover:bg-gray-50 focus:ring-2 focus:ring-cyan-500 transition-all">
                      <SelectValue placeholder="Car Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      <SelectItem value="coupe">Coupe</SelectItem>
                      <SelectItem value="convertible">Convertible</SelectItem>
                      <SelectItem value="wagon">Wagon</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 2: Pickup Date + Drop-off Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pickup Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 px-4 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-normal hover:bg-gray-50 focus:ring-2 focus:ring-cyan-500 transition-all whitespace-nowrap justify-start"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {startDate ? formatDate(startDate) : 'Pick-up Date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) =>
                          date < new Date() || isDateBooked(date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Drop-off Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 px-4 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-normal hover:bg-gray-50 focus:ring-2 focus:ring-cyan-500 transition-all whitespace-nowrap justify-start"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {endDate ? formatDate(endDate) : 'Drop-off Date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) =>
                          date < new Date() || 
                          (startDate && date <= startDate) ||
                          isDateBooked(date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Row 3: Search and Clear Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="flex-1 h-12 px-6 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-semibold rounded-lg text-sm transition-all disabled:opacity-50"
                  >
                    {isSearching ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search Cars
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleClearSearch}
                    disabled={isSearching}
                    variant="outline"
                    className="h-12 px-6 rounded-lg text-sm transition-all"
                    title="Clear all search filters"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Subtle shadow enhancement */}
              <div className="absolute -inset-1 bg-cyan-500/0 rounded-2xl blur-2xl -z-10 group-hover:bg-cyan-500/5 transition-all duration-300"></div>
            </div>

            {/* Bottom Section - Breathing room to image */}
            <div className="h-20"></div>

          </div>
        </div>
      </section>

      {/* Results Section */}
      {hasSearched && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
          <div className="container">
            {/* Header */}
            <div className="mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-400/20 px-4 py-2 border border-blue-400/20">
                <Search className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Search Results</span>
              </div>
              
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                {searchResults.length > 0 ? (
                  <>Found <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{searchResults.length}</span> Available Car{searchResults.length !== 1 ? 's' : ''}</>
                ) : (
                  'No Cars Found'
                )}
              </h2>
              
              {startDate && endDate && (
                <p className="text-lg text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                  <span>{days} day{days !== 1 ? 's' : ''} rental • {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</span>
                </p>
              )}
              
              {location !== 'all' && (
                <p className="text-md text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span>Showing results for: <strong>{location}</strong></span>
                </p>
              )}
            </div>

            {/* Map Section - Show when city is selected */}
            {location !== 'all' && cityBusinesses.length > 0 && (
              <div className="mb-8 relative">
                <BusinessMap 
                  city={location}
                  businesses={cityBusinesses}
                  onBusinessClick={(business) => {
                    // Show business details when a pin is clicked
                    console.log('Business clicked:', business);
                    setSelectedBusiness(business);
                  }}
                />

                {/* Floating details card shown when a marker is clicked */}
                {selectedBusiness && (
                  <div className="absolute right-4 bottom-4 z-50 w-full max-w-md">
                    <Card className="p-4 shadow-2xl">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-semibold">{selectedBusiness.business_name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedBusiness.address || selectedBusiness.city || selectedBusiness.location || 'Location not specified'}
                          </p>
                          {selectedBusiness.car_count !== undefined && (
                            <p className="text-sm text-blue-600 font-medium mt-2">🚗 {selectedBusiness.car_count} car{selectedBusiness.car_count !== 1 ? 's' : ''} available</p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Button
                            className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                            onClick={() => {
                              // Navigate to agency detail page
                              navigate(`/agency/${selectedBusiness.business_id}`);
                            }}
                          >
                            Open Agency
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedBusiness(null)}>
                            Close
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {searchResults.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
                {searchResults.map((car, index) => {
                  const totalPrice = days > 0 ? car.pricePerDay * days : 0;
                  const pricePerDayStr = `$${car.pricePerDay}`;
                  const totalPriceStr = totalPrice > 0 ? `$${totalPrice}` : '';

                  return (
                    <Card 
                      key={car.id} 
                      className="group overflow-hidden border border-muted/50 transition-all duration-300 hover:shadow-2xl hover:border-accent/30 hover:-translate-y-1 bg-white/50 backdrop-blur-sm"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Image Section */}
                      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                        {car.coverImage ? (
                          <img
                            src={getApiUrl(car.coverImage)}
                            alt={car.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-125"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <CarIcon className="w-20 h-20 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Badge */}
                        <div className="absolute right-4 top-4">
                          <div className="inline-flex items-center rounded-full border border-transparent bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                            Available
                          </div>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute left-4 top-4">
                          <div className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-semibold text-foreground">
                            {car.type}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5 p-5">
                        {/* Title & Agency */}
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                            {car.name}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {car.agencyName}
                            {car.businessLocation && (
                              <span className="ml-1 text-xs">• {car.businessLocation}</span>
                            )}
                          </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-muted/50 p-2 text-center">
                            <div className="text-sm font-semibold text-foreground">{car.seats}</div>
                            <div className="text-xs text-muted-foreground">Seats</div>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-2 text-center">
                            <div className="text-sm font-semibold text-foreground">{car.transmission === 'automatic' ? 'Auto' : 'Manual'}</div>
                            <div className="text-xs text-muted-foreground">Transmission</div>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-2 text-center col-span-2">
                            <div className="text-sm font-semibold text-foreground flex items-center justify-center gap-1">
                              {car.fuelType === 'Electric' ? (
                                <>
                                  <Zap className="h-3.5 w-3.5" />
                                  Electric
                                </>
                              ) : (
                                car.fuelType
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">Fuel Type</div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-muted/50"></div>

                        {/* Pricing */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm text-muted-foreground">Per Day:</span>
                            <span className="text-2xl font-bold text-accent">{pricePerDayStr}</span>
                          </div>
                          {days > 0 && totalPriceStr && (
                            <div className="flex justify-between items-baseline bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-lg px-3 py-2 border border-blue-400/20">
                              <span className="text-sm font-medium text-foreground">Total ({days} days):</span>
                              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{totalPriceStr}</span>
                            </div>
                          )}
                        </div>

                        {/* Book Button */}
                        <Button 
                          className="w-full h-11 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                          size="lg"
                          onClick={() => handleReserveClick(car)}
                        >
                          Reserve Now
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-2 border-dashed border-muted-foreground/30 bg-white/50 backdrop-blur p-16 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400/20 to-cyan-400/20">
                  <Search className="h-8 w-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">No Cars Available</h3>
                <p className="mt-3 text-lg text-muted-foreground max-w-sm mx-auto">
                  We couldn't find any cars matching your criteria. Try adjusting your dates, location, or filters.
                </p>
                <Button 
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setHasSearched(false);
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                >
                  New Search
                </Button>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Booking Confirmation Modal */}
      {showBookingModal && selectedCar && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowBookingModal(false)}
        >
          <Card 
            className="w-full max-w-2xl shadow-2xl border bg-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Confirm Your Booking</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBookingModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Car Details */}
              <div className="mb-6">
                <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                  <img
                    src={selectedCar.image}
                    alt={selectedCar.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">{selectedCar.name}</h3>
                    <p className="text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {selectedCar.agencyName}
                      {selectedCar.businessLocation && ` • ${selectedCar.businessLocation}`}
                    </p>
                  </div>
                </div>

                {/* Car Features */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <div className="font-semibold text-gray-800">{selectedCar.seats}</div>
                    <div className="text-xs text-gray-600">Seats</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <div className="font-semibold text-gray-800">{selectedCar.transmission === 'automatic' ? 'Auto' : 'Manual'}</div>
                    <div className="text-xs text-gray-600">Transmission</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <div className="font-semibold text-gray-800 flex items-center justify-center gap-1">
                      {selectedCar.fuelType === 'Electric' && <Zap className="w-3.5 h-3.5" />}
                      {selectedCar.fuelType}
                    </div>
                    <div className="text-xs text-gray-600">Fuel Type</div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4 mb-6">
                <div className="border-t border-b border-gray-200 py-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Rental Period</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Pick-up</span>
                      </div>
                      <div className="font-semibold text-gray-800">
                        {startDate && new Date(startDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Drop-off</span>
                      </div>
                      <div className="font-semibold text-gray-800">
                        {endDate && new Date(endDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-center text-sm text-gray-600">
                    <strong>{days}</strong> day{days !== 1 ? 's' : ''} rental
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Price Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Daily Rate:</span>
                      <span className="font-semibold text-gray-800">${selectedCar.pricePerDay}/day</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Number of Days:</span>
                      <span className="font-semibold text-gray-800">{days} day{days !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between">
                      <span className="font-bold text-gray-800">Total Amount:</span>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                        ${(days * selectedCar.pricePerDay).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                {user && (
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Booking For</h4>
                    <div className="text-sm text-gray-600">
                      <div>{user.full_name}</div>
                      <div>{user.email}</div>
                      {user.phone && <div>{user.phone}</div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleBookCar}
                  disabled={isBooking}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all text-base"
                >
                  {isBooking ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowBookingModal(false)}
                  variant="outline"
                  disabled={isBooking}
                  className="flex-1 h-12 border-gray-300 text-base"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                By confirming this booking, you agree to our terms and conditions
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
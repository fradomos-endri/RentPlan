import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Calendar as CalendarIcon } from 'lucide-react';
import { Header } from '@/components/Header';
import { CarCard } from '@/components/CarCard';
import { BookingDialog } from '@/components/BookingDialog';
import { CarDetailsModal } from '@/components/CarDetailsModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { mockCars, mockAgencies } from '@/data/mockData';
import { Car } from '@/types';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

const carTypes = ['SUV', 'Sedan', 'Sports', 'Compact', 'Luxury', 'Van'];

export default function Cars() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [useAvailabilityFilter, setUseAvailabilityFilter] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCarForDetails, setSelectedCarForDetails] = useState<Car | null>(null);

  // Fetch cars from API - with optional date filtering
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch businesses first for location data
        const businessResponse = await fetch(getApiUrl(API_ENDPOINTS.BUSINESSES));
        if (businessResponse.ok) {
          const businessesData = await businessResponse.json();
          setBusinesses(businessesData);
          const uniqueLocations = [...new Set(businessesData.map((b: any) => b.location).filter(Boolean))] as string[];
          setLocations(uniqueLocations);
        }
        
        let url = getApiUrl(API_ENDPOINTS.CARS);
        
        // If dates are selected and availability filter is on, use the available search endpoint
        if (useAvailabilityFilter && startDate && endDate) {
          const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          const params = new URLSearchParams({
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
          });

          if (selectedBrand !== 'all') {
            params.append('brand', selectedBrand);
          }

          url = `${getApiUrl(API_ENDPOINTS.CARS_AVAILABLE_SEARCH)}?${params.toString()}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error('Failed to fetch cars:', response.status);
          setCars(mockCars);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Raw cars data from API:', data);

        if (Array.isArray(data) && data.length > 0) {
          // Fetch cover images for all cars
          const carsWithImages = await Promise.all(
            data.map(async (car) => {
              let coverImageUrl = null;
              
              if (car.car_id) {
                try {
                  const imageUrl = getApiUrl(`${API_ENDPOINTS.CARS}/${car.car_id}/cover-image`);
                  console.log('Fetching cover image from:', imageUrl);
                  
                  const imageResponse = await fetch(imageUrl);
                  console.log('Image response status:', imageResponse.status, 'for car:', car.car_id);
                  
                  if (imageResponse.ok) {
                    const contentType = imageResponse.headers.get('content-type');
                    console.log('Content-Type:', contentType, 'for car:', car.car_id);
                    
                    if (contentType && contentType.startsWith('image/')) {
                      const blob = await imageResponse.blob();
                      console.log('Blob size:', blob.size, 'for car:', car.car_id);
                      
                      if (blob.size > 0) {
                        coverImageUrl = URL.createObjectURL(blob);
                        console.log('✓ Cover image loaded for car:', car.car_id);
                      } else {
                        console.log('✗ Empty blob for car:', car.car_id);
                      }
                    } else {
                      console.log('✗ Invalid content type for car:', car.car_id);
                    }
                  } else {
                    console.log('✗ Failed to fetch image for car:', car.car_id, imageResponse.status);
                  }
                } catch (error) {
                  console.error('✗ Error fetching cover image for car', car.car_id, ':', error);
                }
              }

              // Transform API data to match Car type
              return {
                id: car.car_id,
                name: `${car.brand} ${car.model}`,
                brand: car.brand || 'Unknown',
                type: car.model || 'Sedan',
                image: coverImageUrl || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
                pricePerDay: parseFloat(car.price_per_day) || 0,
                seats: 5,
                transmission: car.transmission || 'Automatic',
                fuelType: car.fuel_type || 'Petrol',
                available: car.is_available !== undefined ? car.is_available === 1 : true,
                agencyId: car.business_id,
                agencyName: car.business_name || 'Agency',
                description: car.description || '',
              };
            })
          );
          
          console.log('Final cars with images:', carsWithImages);
          setCars(carsWithImages);
        } else {
          console.log('No cars data, using mock data');
          setCars(mockCars);
        }
      } catch (err) {
        console.error('Error fetching cars:', err);
        toast.error('Failed to load cars');
        setCars(mockCars);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [useAvailabilityFilter, startDate, endDate, selectedBrand]);

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          car.name.toLowerCase().includes(query) ||
          car.type.toLowerCase().includes(query) ||
          car.brand?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && car.brand !== selectedBrand) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && car.type !== selectedType) {
        return false;
      }

      // Agency filter
      if (selectedAgency !== 'all' && car.agencyId !== selectedAgency) {
        return false;
      }

      // Location filter - match car's business location
      if (selectedLocation !== 'all') {
        const carBusiness = businesses.find((b: any) => b.business_id === car.agencyId);
        const carLocation = (carBusiness?.location || '').toLowerCase();
        const searchLocation = selectedLocation.toLowerCase();
        if (!carLocation.includes(searchLocation) && !searchLocation.includes(carLocation)) {
          return false;
        }
      }

      // Price range
      if (car.pricePerDay < priceRange[0] || car.pricePerDay > priceRange[1]) {
        return false;
      }

      // Availability
      if (showAvailableOnly && !car.available) {
        return false;
      }

      return true;
    });
  }, [cars, searchQuery, selectedBrand, selectedType, selectedAgency, selectedLocation, priceRange, showAvailableOnly, businesses]);

  const handleBook = (car: Car) => {
    setSelectedCar(car);
    setBookingOpen(true);
  };

  const handleCarClick = (car: Car) => {
    setSelectedCarForDetails(car);
    setShowDetailsModal(true);
  };

  const handleBookFromDetails = (car: Car) => {
    setSelectedCar(car);
    setBookingOpen(true);
  };

  const maxPrice = cars.length > 0 ? Math.max(...cars.map(c => c.pricePerDay)) : 500;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedBrand('all');
    setSelectedAgency('all');
    setSelectedLocation('all');
    setPriceRange([0, maxPrice]);
    setShowAvailableOnly(false);
    setStartDate(undefined);
    setEndDate(undefined);
    setUseAvailabilityFilter(false);
  };

  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedBrand !== 'all' || selectedAgency !== 'all' || 
    selectedLocation !== 'all' || priceRange[0] > 0 || priceRange[1] < maxPrice || showAvailableOnly || useAvailabilityFilter;

  // Get unique brands from cars
  const uniqueBrands = useMemo(() => {
    const brands = cars
      .map(car => car.brand)
      .filter(Boolean)
      .filter((brand, index, self) => self.indexOf(brand) === index)
      .sort();
    
    // Add sample brands if none found (for development/testing)
    if (brands.length === 0) {
      return ['Mercedes', 'BMW', 'Audi', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Tesla', 'Porsche', 'Jeep'];
    }
    
    return brands;
  }, [cars]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Location */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Location</Label>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Car Brand */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Brand</Label>
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Brands</SelectItem>
            {uniqueBrands.map((brand) => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Car Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Car Type</Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Types</SelectItem>
            {carTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Agency */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Agency</Label>
        <Select value={selectedAgency} onValueChange={setSelectedAgency}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Agencies" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Agencies</SelectItem>
            {mockAgencies.map((agency) => (
              <SelectItem key={agency.id} value={agency.id}>{agency.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Price Range: ${priceRange[0]} - ${priceRange[1]}/day
        </Label>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          max={maxPrice}
          min={0}
          step={10}
          className="py-4"
        />
      </div>

      {/* Availability */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="available" 
          checked={showAvailableOnly}
          onCheckedChange={(checked) => setShowAvailableOnly(checked as boolean)}
        />
        <Label htmlFor="available" className="text-sm font-medium cursor-pointer">
          Show available only
        </Label>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Browse All Cars
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Find the perfect car from our {mockCars.length} vehicles
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by brand, name, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-3">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Brands</SelectItem>
                {uniqueBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Car Type" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Types</SelectItem>
                {carTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAgency} onValueChange={setSelectedAgency}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Agency" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Agencies</SelectItem>
                {mockAgencies.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id}>{agency.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="available-desktop" 
                checked={showAvailableOnly}
                onCheckedChange={(checked) => setShowAvailableOnly(checked as boolean)}
              />
              <Label htmlFor="available-desktop" className="text-sm cursor-pointer whitespace-nowrap">
                Available only
              </Label>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                    !
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Filter Cars</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
          </div>

          {/* Date Range Filter for Availability */}
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="use-availability" 
                checked={useAvailabilityFilter}
                onCheckedChange={(checked) => setUseAvailabilityFilter(checked as boolean)}
              />
              <Label htmlFor="use-availability" className="text-sm font-medium cursor-pointer">
                Filter by availability dates
              </Label>
            </div>
            
            {useAvailabilityFilter && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Pick-up Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? startDate.toLocaleDateString() : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Drop-off Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? endDate.toLocaleDateString() : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => date < new Date() || (startDate && date <= startDate)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="mb-6 text-sm text-muted-foreground">
          Showing {filteredCars.length} of {mockCars.length} cars
        </p>

        {/* Cars Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCars.map((car, index) => (
            <div
              key={car.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CarCard car={car} onBook={handleCarClick} />
            </div>
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              No cars match your filters.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      <CarDetailsModal
        car={selectedCarForDetails}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        onBook={handleBookFromDetails}
      />

      <BookingDialog
        car={selectedCar}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />
    </div>
  );
}

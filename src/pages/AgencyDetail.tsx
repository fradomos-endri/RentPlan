import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Car as CarIcon, ArrowLeft, Phone, Mail, Calendar, Award, Shield, Clock, Users, Building2, CheckCircle, TrendingUp, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Car } from '@/types';
import { Header } from '@/components/Header';
import { CarCard } from '@/components/CarCard';
import { BookingDialog } from '@/components/BookingDialog';
import { CarDetailsModal } from '@/components/CarDetailsModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAgencies, mockCars } from '@/data/mockData';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

interface BusinessImage {
  image_id: number;
  image_path: string;
  image_order: number;
  created_at: string;
}

export default function AgencyDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [agency, setAgency] = useState<any>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [businessImages, setBusinessImages] = useState<BusinessImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    availableCars: 0,
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCarForDetails, setSelectedCarForDetails] = useState<Car | null>(null);

  useEffect(() => {
    const fetchAgencyAndCars = async () => {
      try {
        setLoading(true);

        // Fetch all businesses to find the one matching the ID
        const businessResponse = await fetch(getApiUrl(API_ENDPOINTS.BUSINESSES));
        
        if (businessResponse.ok) {
          const businesses = await businessResponse.json();
          const foundBusiness = businesses.find((b: any) => b.business_id === parseInt(id || '0'));
          
          if (foundBusiness) {
            setAgency({
              id: foundBusiness.business_id,
              name: foundBusiness.business_name,
              image: foundBusiness.cover_image || 'https://images.unsplash.com/photo-1549399542-7e3f8b83ad8e?w=600',
              rating: foundBusiness.rating || 4.5,
              reviewCount: foundBusiness.review_count || 0,
              location: foundBusiness.location || 'City Location',
              description: foundBusiness.description || 'Premium car rental service',
              totalCars: foundBusiness.car_count || 0,
              vatNumber: foundBusiness.vat_number,
              established: foundBusiness.created_at,
              email: foundBusiness.email || 'contact@agency.com',
              phone: foundBusiness.phone || '+1 (555) 123-4567',
            });

            // Fetch cover image
            try {
              const coverResponse = await fetch(
                getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${foundBusiness.business_id || foundBusiness.id}/cover-image`)
              );
              
              if (coverResponse.ok) {
                const contentType = coverResponse.headers.get('content-type');
                if (contentType && contentType.startsWith('image/')) {
                  const blob = await coverResponse.blob();
                  if (blob.size > 0) {
                    const imageUrl = URL.createObjectURL(blob);
                    setCoverImage(imageUrl);
                    console.log('✓ Business cover image loaded');
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching cover image:', error);
            }

            // Fetch business images
            try {
              const imagesResponse = await fetch(
                getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${foundBusiness.business_id || foundBusiness.id}/images`)
              );
              
              if (imagesResponse.ok) {
                const images = await imagesResponse.json();
                setBusinessImages(Array.isArray(images) ? images.sort((a, b) => a.image_order - b.image_order) : []);
                console.log('✓ Business gallery images loaded:', images.length);
              }
            } catch (error) {
              console.error('Error fetching business images:', error);
            }
          } else {
            const mockAgency = mockAgencies.find((a) => a.id === id);
            setAgency(mockAgency || null);
          }
        } else {
          const mockAgency = mockAgencies.find((a) => a.id === id);
          setAgency(mockAgency || null);
        }

        // Fetch cars for this business
        const carsResponse = await fetch(getApiUrl(API_ENDPOINTS.CARS));
        
        if (carsResponse.ok) {
          const allCars = await carsResponse.json();
          console.log('All cars fetched:', allCars.length);
          
          const businessCars = allCars.filter((car: any) => car.business_id === parseInt(id || '0'));
          console.log('Business cars filtered:', businessCars.length);

          // Fetch cover images for all cars
          const carsWithImages = await Promise.all(
            businessCars.map(async (car: any) => {
              let coverImageUrl = null;
              
              if (car.car_id) {
                try {
                  const imageUrl = getApiUrl(`${API_ENDPOINTS.CARS}/${car.car_id}/cover-image`);
                  const imageResponse = await fetch(imageUrl);
                  
                  if (imageResponse.ok) {
                    const contentType = imageResponse.headers.get('content-type');
                    
                    if (contentType && contentType.startsWith('image/')) {
                      const blob = await imageResponse.blob();
                      
                      if (blob.size > 0) {
                        coverImageUrl = URL.createObjectURL(blob);
                        console.log('✓ Cover image loaded for car:', car.car_id);
                      }
                    }
                  } else {
                    console.log('✗ No cover image for car:', car.car_id);
                  }
                } catch (error) {
                  console.error('✗ Error fetching cover image for car', car.car_id, ':', error);
                }
              }

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
                available: true,
                agencyId: car.business_id,
                agencyName: car.business_name || 'Agency',
                description: car.description || '',
                year: car.production_year,
                kilometers: car.kilometers,
                color: car.color,
                plate: car.plate,
              };
            })
          );
          
          console.log('Cars with cover images loaded:', carsWithImages.length);
          setCars(carsWithImages);
          
          // Calculate stats
          const availableCount = carsWithImages.filter((c: any) => c.available).length;
          setStats(prev => ({
            ...prev,
            availableCars: availableCount,
          }));
        } else {
          const mockCarsData = mockCars.filter((c) => c.agencyId === id);
          setCars(mockCarsData);
        }

        // Fetch bookings stats if available
        try {
          const bookingsResponse = await fetch(getApiUrl(`/bookings/business/${id}`));
          if (bookingsResponse.ok) {
            const bookings = await bookingsResponse.json();
            const activeBookings = bookings.filter((b: any) => b.status === 'confirmed').length;
            const totalRevenue = bookings.reduce((sum: number, b: any) => sum + parseFloat(b.total_price || 0), 0);
            
            setStats(prev => ({
              ...prev,
              totalBookings: bookings.length,
              activeBookings,
              totalRevenue,
            }));
          }
        } catch (err) {
          console.log('Bookings stats not available');
        }
      } catch (err) {
        console.error('Error fetching agency details:', err);
        const mockAgency = mockAgencies.find((a) => a.id === id);
        setAgency(mockAgency || null);
        const mockCarsData = mockCars.filter((c) => c.agencyId === id);
        setCars(mockCarsData);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencyAndCars();
  }, [id]);

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? businessImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === businessImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleCarClick = (car: Car) => {
    setSelectedCarForDetails(car);
    setShowDetailsModal(true);
  };

  const handleBookFromDetails = (car: Car) => {
    setSelectedCar(car);
    setBookingOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Header />
        <div className="container py-24 text-center">
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
          <p className="mt-4 text-lg text-muted-foreground">Loading agency details...</p>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Header />
        <div className="container py-24 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <Building2 className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Agency not found</h1>
            <p className="mt-2 text-gray-600">The agency you're looking for doesn't exist or has been removed.</p>
            <Link to="/agencies">
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Agencies
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleBook = (car: Car) => {
    setSelectedCar(car);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />

      {/* Enhanced Agency Hero with Cover Image */}
      <section className="relative overflow-hidden">
        {/* Background Cover Image with Overlay */}
        <div className="relative h-80 md:h-96">
          <img
            src={coverImage || agency.image}
            alt={agency.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Decorative Elements - Removed grid pattern */}
        </div>

        {/* Content */}
        <div className="container relative -mt-64 md:-mt-72">
          <Link to="/agencies" className="mb-4 inline-block">
            <Button variant="secondary" size="sm" className="shadow-lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agencies
            </Button>
          </Link>

          <Card className="overflow-hidden border-2 bg-white/95 backdrop-blur-sm shadow-2xl">
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                {/* Agency Info */}
                <div className="flex-1">
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
                        {agency.name}
                      </h1>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <Badge variant="secondary" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {agency.location}
                        </Badge>
                        <Badge className="gap-1 bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {agency.rating} ({agency.reviewCount} reviews)
                        </Badge>
                        {agency.vatNumber && (
                          <Badge variant="outline" className="gap-1">
                            <Shield className="h-3 w-3" />
                            VAT: {agency.vatNumber}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 text-gray-700">
                    {agency.description}
                  </p>

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {agency.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <a href={`mailto:${agency.email}`} className="hover:text-blue-600">
                          {agency.email}
                        </a>
                      </div>
                    )}
                    {agency.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <a href={`tel:${agency.phone}`} className="hover:text-blue-600">
                          {agency.phone}
                        </a>
                      </div>
                    )}
                    {agency.established && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>Est. {new Date(agency.established).getFullYear()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 md:w-80">
                  <Card className="border-2 border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-500 p-2">
                        <CarIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-900">{cars.length}</p>
                        <p className="text-xs text-blue-700">Total Fleet</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-2 border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-green-500 p-2">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-900">{stats.availableCars}</p>
                        <p className="text-xs text-green-700">Available Now</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-2 border-purple-200 bg-purple-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-500 p-2">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-900">{stats.totalBookings}</p>
                        <p className="text-xs text-purple-700">Total Bookings</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-2 border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-orange-500 p-2">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-900">{stats.activeBookings}</p>
                        <p className="text-xs text-orange-700">Active Rentals</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Features Bar */}
            <div className="border-t bg-gray-50 px-6 py-4 md:px-8">
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>Verified Agency</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span>Instant Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span>Best Prices</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Business Image Gallery */}
      {businessImages.length > 0 && (
        <section className="container py-8">
          <div className="mb-4">
            <h2 className="font-display text-xl font-bold text-gray-900 mb-1">
              Agency Gallery
            </h2>
            <p className="text-sm text-gray-600">
              {businessImages.length} {businessImages.length === 1 ? 'image' : 'images'}
            </p>
          </div>

          <div className="relative group">
            {/* Navigation Arrows */}
            {businessImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-800" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-6 w-6 text-gray-800" />
                </button>
              </>
            )}

            {/* Images Row */}
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="flex gap-4">
                {businessImages.map((image, index) => (
                  <div
                    key={image.image_id}
                    className="flex-shrink-0 w-80 h-60 relative group/item"
                  >
                    <Card className="overflow-hidden border-2 h-full hover:border-blue-400 transition-all hover:shadow-xl">
                      <img
                        src={getApiUrl(image.image_path)}
                        alt={`${agency.name} - Image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      
                      {/* Image Number Badge */}
                      <div className="absolute top-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white backdrop-blur-sm">
                        {index + 1}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cars Grid */}
      <main className="container py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">
              Available Vehicles
            </h2>
            <p className="mt-1 text-gray-600">
              Choose from our premium collection of {cars.length} vehicles
            </p>
          </div>
          
          {cars.length > 0 && (
            <Badge variant="outline" className="gap-2">
              <CarIcon className="h-4 w-4" />
              {stats.availableCars} available now
            </Badge>
          )}
        </div>

        {cars.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cars.map((car, index) => (
              <div
                key={car.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CarCard car={car} onBook={handleCarClick} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed">
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <CarIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No vehicles available
              </h3>
              <p className="text-gray-600">
                This agency currently has no vehicles in their fleet.
              </p>
              <Link to="/agencies" className="mt-6 inline-block">
                <Button variant="outline">
                  Browse Other Agencies
                </Button>
              </Link>
            </div>
          </Card>
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

import { useState, useEffect } from 'react';
import { X, Calendar, Users, Fuel, Gauge, MapPin, Building2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { Car } from '@/types';

interface CarImage {
  image_id: number;
  image_path: string;
  is_cover: boolean;
  image_order: number;
}

interface CarDetailsModalProps {
  car: Car | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBook: (car: Car) => void;
}

export function CarDetailsModal({ car, open, onOpenChange, onBook }: CarDetailsModalProps) {
  const [carImages, setCarImages] = useState<CarImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    if (open && car) {
      fetchCarImages();
      setCurrentImageIndex(0);
    }
  }, [open, car]);

  const fetchCarImages = async () => {
    if (!car) return;

    setLoadingImages(true);
    try {
      // Use car_id if available, fallback to id
      const carId = (car as any).car_id || car.id;
      const url = getApiUrl(`${API_ENDPOINTS.CARS}/${carId}/images`);
      console.log('Fetching car images from:', url, 'for car ID:', carId);
      
      const response = await fetch(url);
      console.log('Car images response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Car images data:', data);
        
        const sortedImages = Array.isArray(data) 
          ? data.sort((a, b) => {
              if (a.is_cover) return -1;
              if (b.is_cover) return 1;
              return a.image_order - b.image_order;
            })
          : [];
        
        console.log('Sorted car images:', sortedImages);
        setCarImages(sortedImages);
      } else {
        console.error('Failed to fetch car images:', response.status);
        setCarImages([]);
      }
    } catch (error) {
      console.error('Error fetching car images:', error);
      setCarImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % Math.max(carImages.length, 1));
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + Math.max(carImages.length, 1)) % Math.max(carImages.length, 1));
  };

  if (!open || !car) return null;

  const currentImage = carImages[currentImageIndex];

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <Card 
        className="w-full max-w-5xl shadow-2xl border-2 bg-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{car.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{car.brand} • {car.type}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="hover:bg-red-50 text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Image Gallery */}
          <div className="mb-6">
            {loadingImages ? (
              <div className="w-full h-96 rounded-xl bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : carImages.length > 0 ? (
              <div className="relative">
                {/* Main Image */}
                <div className="w-full h-96 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={getApiUrl(currentImage.image_path)}
                    alt={`${car.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {currentImage.is_cover && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Cover Photo
                    </div>
                  )}
                </div>

                {/* Navigation Arrows */}
                {carImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={previousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                  {currentImageIndex + 1} / {carImages.length}
                </div>

                {/* Thumbnail Strip */}
                {carImages.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {carImages.map((image, index) => (
                      <button
                        key={image.image_id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? 'border-blue-500 scale-105'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <img
                          src={getApiUrl(image.image_path)}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <ImageIcon className="w-24 h-24 text-white/30" />
              </div>
            )}
          </div>

          {/* Car Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Seats</p>
                  <p className="font-semibold text-gray-800">{car.seats} Passengers</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Gauge className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Transmission</p>
                  <p className="font-semibold text-gray-800">{car.transmission}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Fuel className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Fuel Type</p>
                  <p className="font-semibold text-gray-800">{car.fuelType}</p>
                </div>
              </div>
            </div>

            {/* Rental Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Rental Information</h3>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Availability</p>
                  <p className="font-semibold text-gray-800">
                    {car.available ? (
                      <span className="text-green-600">Available Now</span>
                    ) : (
                      <span className="text-red-600">Currently Booked</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Rental Agency</p>
                  <p className="font-semibold text-gray-800">{car.agencyName}</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg text-white">
                <p className="text-sm opacity-90 mb-1">Price per Day</p>
                <p className="text-3xl font-bold">${car.pricePerDay}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{car.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                onOpenChange(false);
                onBook(car);
              }}
              disabled={!car.available}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar className="w-4 h-4" />
              {car.available ? 'Book Now' : 'Not Available'}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 border-gray-300"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

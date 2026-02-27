import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Edit, Trash2, Eye, Calendar, AlertCircle, Car, Upload, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getStoredToken, getStoredUser } from '@/lib/auth';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

interface CarData {
  id: string;
  name: string;
  type: string;
  image: string;
  pricePerDay: number;
  seats: number;
  transmission: string;
  fuelType: string;
  status: 'available' | 'booked' | 'out_of_service';
  outOfServiceReason?: string;
}

interface CalendarEvent {
  id: string;
  carId: string;
  carName: string;
  customerName: string;
  startDate: string;
  endDate: string;
  status: 'booked' | 'available' | 'maintenance';
  totalPrice: number;
}

export default function AgencyAdminDashboard() {
  const navigate = useNavigate();
  const token = getStoredToken();
  const user = getStoredUser();
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<CalendarEvent[]>([]);

  const [activeTab, setActiveTab] = useState('cars');
  const [addCarDialogOpen, setAddCarDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarData | null>(null);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addBookingDialogOpen, setAddBookingDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    production_year: new Date().getFullYear(),
    engine: '',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    kilometers: 0,
    color: '',
    plate: '',
    description: '',
    price_per_day: 80,
    seats: 5,
    type: 'Sedan',
  });

  const [bookingFormData, setBookingFormData] = useState({
    carId: '',
    customerName: '',
    startDate: '',
    endDate: '',
  });

  // Load cars from API on mount
  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl(API_ENDPOINTS.CARS));
        
        if (!response.ok) {
          console.error('Failed to fetch cars:', response.status);
          setCars([]);
          return;
        }

        const carsData = await response.json();

        if (Array.isArray(carsData) && carsData.length > 0) {
          // Transform API data to match CarData type
          const transformedCars = carsData.map(car => ({
            id: car.car_id.toString(),
            name: `${car.brand} ${car.model}`,
            type: car.model || 'Sedan',
            image: car.cover_image || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
            pricePerDay: parseFloat(car.price_per_day),
            seats: 5,
            transmission: car.transmission || 'Automatic',
            fuelType: car.fuel_type || 'Petrol',
            status: 'available' as const,
          }));
          setCars(transformedCars);
        }
      } catch (error) {
        console.error('Error loading cars:', error);
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  const handleAddCar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brand || !formData.model) {
      toast.error('Brand and model are required');
      return;
    }

    // Save to API
    const saveCar = async () => {
      setLoading(true);
      try {
        if (!token) {
          toast.error('Authentication required');
          return;
        }

        // Get business from localStorage or fetch it
        // For now, we'll need to have business_id from user data
        // This assumes the user has business data available
        const response = await fetch(getApiUrl(API_ENDPOINTS.CARS), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            business_id: 1, // TODO: Get from user's business data
            brand: formData.brand,
            model: formData.model,
            production_year: formData.production_year,
            engine: formData.engine,
            transmission: formData.transmission,
            fuel_type: formData.fuel_type,
            kilometers: formData.kilometers,
            color: formData.color,
            plate: formData.plate,
            description: formData.description,
            price_per_day: formData.price_per_day,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.message || 'Failed to add car');
          return;
        }

        const carData = await response.json();

        const newCar: CarData = {
          id: carData.car_id,
          name: `${formData.brand} ${formData.model}`,
          type: formData.type,
          image: imagePreviews[0] || '',
          pricePerDay: formData.price_per_day,
          seats: formData.seats,
          transmission: formData.transmission,
          fuelType: formData.fuel_type,
          status: 'available',
        };

        setCars([...cars, newCar]);
        toast.success('Car added successfully!');
        resetCarForm();
        setAddCarDialogOpen(false);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to add car');
      } finally {
        setLoading(false);
      }
    };

    saveCar();
  };

  const handleEditCar = (car: CarData) => {
    // For API integration, we'll handle editing in a separate function
    // For now, we'll close edit functionality until API is updated
    toast.info('Car editing via API coming soon');
  };

  const handleSaveCar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brand || !formData.model) {
      toast.error('Brand and model are required');
      return;
    }

    if (editingCar) {
      // Edit functionality will be implemented when API supports it
      toast.info('Car editing via API coming soon');
      return;
    } else {
      handleAddCar(e);
      return;
    }
  };

  const resetCarForm = () => {
    setFormData({
      brand: '',
      model: '',
      production_year: new Date().getFullYear(),
      engine: '',
      transmission: 'Automatic',
      fuel_type: 'Petrol',
      kilometers: 0,
      color: '',
      plate: '',
      description: '',
      price_per_day: 80,
      seats: 5,
      type: 'Sedan',
    });
    setImagePreviews([]);
    setSelectedImageFiles([]);
  };

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews: string[] = [];
      let loadedCount = 0;

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          loadedCount++;
          if (loadedCount === newFiles.length) {
            setImagePreviews([...imagePreviews, ...newPreviews]);
            setSelectedImageFiles([...selectedImageFiles, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setSelectedImageFiles(selectedImageFiles.filter((_, i) => i !== index));
  };

  const handleDeleteCar = (id: string) => {
    if (confirm('Are you sure you want to delete this car?')) {
      // Delete via API
      const deleteCar = async () => {
        try {
          if (!token) {
            toast.error('Authentication required');
            return;
          }

          const response = await fetch(getApiUrl(`${API_ENDPOINTS.CARS}/${id}`), {
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

          setCars(cars.filter(c => c.id !== id));
          toast.success('Car deleted successfully!');
        } catch (error) {
          console.error('Error:', error);
          toast.error('Failed to delete car');
        }
      };

      deleteCar();
    }
  };

  const handleOutOfService = (id: string) => {
    const reason = prompt('Please enter the reason for taking the car out of service:');
    if (reason) {
      setCars(cars.map(c =>
        c.id === id
          ? { ...c, status: 'out_of_service', outOfServiceReason: reason }
          : c
      ));
      toast.success('Car marked as out of service');
    }
  };

  const handleRestoreCar = (id: string) => {
    setCars(cars.map(c =>
      c.id === id
        ? { ...c, status: 'available', outOfServiceReason: undefined }
        : c
    ));
    toast.success('Car restored to available');
  };

  // Booking handling
  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingFormData.carId || !bookingFormData.customerName || !bookingFormData.startDate || !bookingFormData.endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const selectedCar = cars.find(c => c.id === bookingFormData.carId);
    if (!selectedCar) {
      toast.error('Car not found');
      return;
    }

    const start = new Date(bookingFormData.startDate);
    const end = new Date(bookingFormData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalPrice = days * selectedCar.pricePerDay;

    const newBooking: CalendarEvent = {
      id: Date.now().toString(),
      carId: bookingFormData.carId,
      carName: selectedCar.name,
      customerName: bookingFormData.customerName,
      startDate: bookingFormData.startDate,
      endDate: bookingFormData.endDate,
      status: 'booked',
      totalPrice,
    };

    setBookings([...bookings, newBooking]);
    setCars(cars.map(c => c.id === bookingFormData.carId ? { ...c, status: 'booked' } : c));
    toast.success('Booking added successfully!');
    setBookingFormData({ carId: '', customerName: '', startDate: '', endDate: '' });
    setAddBookingDialogOpen(false);
  };

  const handleDeleteBooking = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (confirm('Are you sure you want to delete this booking?')) {
      setBookings(bookings.filter(b => b.id !== id));
      
      // Check if car has other bookings
      const hasOtherBookings = bookings.some(b => b.carId === booking?.carId && b.id !== id);
      if (!hasOtherBookings && booking) {
        setCars(cars.map(c => c.id === booking.carId ? { ...c, status: 'available' } : c));
      }
      
      toast.success('Booking deleted successfully!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const availableCars = cars.filter(c => c.status === 'available').length;
  const bookedCars = cars.filter(c => c.status === 'booked').length;
  const outOfServiceCars = cars.filter(c => c.status === 'out_of_service').length;

  // Calendar calculations
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const monthDays = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays = Array(firstDay).fill(null).concat(Array.from({ length: monthDays }, (_, i) => i + 1));

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const getBookingsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agency Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your cars and bookings</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-blue-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Cars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{cars.length}</div>
              <p className="text-xs text-muted-foreground mt-2">In your inventory</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-600">{availableCars}</div>
              <p className="text-xs text-muted-foreground mt-2">Ready to rent</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Booked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{bookedCars}</div>
              <p className="text-xs text-muted-foreground mt-2">Currently rented</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Out of Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{outOfServiceCars}</div>
              <p className="text-xs text-muted-foreground mt-2">Maintenance needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="cars" className="gap-2">
              <Car className="h-4 w-4" />
              Manage Cars
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Bookings
            </TabsTrigger>
          </TabsList>

          {/* Cars Management Tab */}
          <TabsContent value="cars">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Cars</CardTitle>
                    <CardDescription>Add, edit, or manage your rental vehicles</CardDescription>
                  </div>
                  <Dialog open={addCarDialogOpen} onOpenChange={setAddCarDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white">
                        <Plus className="h-4 w-4" />
                        Add Car
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingCar ? 'Edit Car' : 'Add New Car'}</DialogTitle>
                        <DialogDescription>
                          {editingCar ? 'Update car details and image' : 'Add a new vehicle to your inventory with image'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSaveCar} className="space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* Image Upload Section */}
                        <div className="space-y-2">
                          <Label>Car Images (Multiple)</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            {imagePreviews.length > 0 ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => handleRemoveImage(index)}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <label className="flex flex-col items-center justify-center cursor-pointer py-2 border border-dashed border-blue-300 rounded-lg bg-blue-50">
                                  <Upload className="h-6 w-6 text-blue-400 mb-1" />
                                  <span className="text-sm font-semibold text-blue-700">Add more images</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    multiple
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm font-semibold text-gray-700">Click to upload car images</span>
                                <span className="text-xs text-gray-500">PNG, JPG up to 10MB each - Select multiple files</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageSelect}
                                  className="hidden"
                                  multiple
                                  required={!editingCar}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                              id="brand"
                              value={formData.brand}
                              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                              placeholder="e.g., Toyota"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="model">Model</Label>
                            <Input
                              id="model"
                              value={formData.model}
                              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                              placeholder="e.g., Camry"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="production_year">Production Year</Label>
                            <Input
                              id="production_year"
                              type="number"
                              value={formData.production_year}
                              onChange={(e) => setFormData({ ...formData, production_year: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="engine">Engine</Label>
                            <Input
                              id="engine"
                              value={formData.engine}
                              onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                              placeholder="e.g., 2.5L V6"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="transmission">Transmission</Label>
                            <select
                              id="transmission"
                              value={formData.transmission}
                              onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                              className="w-full h-10 px-3 py-2 border border-input rounded-lg bg-background"
                            >
                              <option>Manual</option>
                              <option>Automatic</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="fuel_type">Fuel Type</Label>
                            <select
                              id="fuel_type"
                              value={formData.fuel_type}
                              onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                              className="w-full h-10 px-3 py-2 border border-input rounded-lg bg-background"
                            >
                              <option>Petrol</option>
                              <option>Diesel</option>
                              <option>Hybrid</option>
                              <option>Electric</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="color">Color</Label>
                            <Input
                              id="color"
                              value={formData.color}
                              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                              placeholder="e.g., Silver"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="kilometers">Kilometers</Label>
                            <Input
                              id="kilometers"
                              type="number"
                              value={formData.kilometers}
                              onChange={(e) => setFormData({ ...formData, kilometers: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="plate">License Plate</Label>
                            <Input
                              id="plate"
                              value={formData.plate}
                              onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                              placeholder="e.g., ABC-123"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Additional details about the car..."
                            className="w-full h-20 px-3 py-2 border border-input rounded-lg bg-background"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price_per_day">Price per Day ($)</Label>
                            <Input
                              id="price_per_day"
                              type="number"
                              step="0.01"
                              value={formData.price_per_day}
                              onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="seats">Seats</Label>
                            <Input
                              id="seats"
                              type="number"
                              value={formData.seats}
                              onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="type">Car Type</Label>
                          <select
                            id="type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full h-10 px-3 py-2 border border-input rounded-lg bg-background"
                          >
                            <option>Sedan</option>
                            <option>SUV</option>
                            <option>Truck</option>
                            <option>Van</option>
                            <option>Sports</option>
                            <option>Compact</option>
                            <option>Luxury</option>
                          </select>
                        </div>

                        <DialogFooter>
                          <Button type="submit" className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white">
                            {editingCar ? 'Update Car' : 'Add Car'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Car Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Price/Day</TableHead>
                        <TableHead>Seats</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cars.map(car => (
                        <TableRow key={car.id}>
                          <TableCell>
                            <img src={car.image} alt={car.name} className="h-10 w-10 rounded object-cover" />
                          </TableCell>
                          <TableCell className="font-semibold">{car.name}</TableCell>
                          <TableCell>{car.type}</TableCell>
                          <TableCell>${car.pricePerDay}</TableCell>
                          <TableCell>{car.seats}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                car.status === 'available'
                                  ? 'default'
                                  : car.status === 'booked'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {car.status === 'out_of_service' ? 'Out of Service' : car.status.charAt(0).toUpperCase() + car.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditCar(car)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {car.status === 'available' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleOutOfService(car.id)}
                                >
                                  <AlertCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {car.status === 'out_of_service' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRestoreCar(car.id)}
                                >
                                  Restore
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCar(car.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rental Calendar</CardTitle>
                    <CardDescription>View and manage car bookings and availability</CardDescription>
                  </div>
                  <Dialog open={addBookingDialogOpen} onOpenChange={setAddBookingDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white">
                        <Plus className="h-4 w-4" />
                        Add Booking
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Booking</DialogTitle>
                        <DialogDescription>Create a manual booking for a customer</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddBooking} className="space-y-4">
                        <div>
                          <Label htmlFor="car-select">Select Car</Label>
                          <select
                            id="car-select"
                            value={bookingFormData.carId}
                            onChange={(e) => setBookingFormData({ ...bookingFormData, carId: e.target.value })}
                            className="w-full h-10 px-3 py-2 border border-input rounded-lg bg-background"
                          >
                            <option value="">Choose a car...</option>
                            {cars.map(car => (
                              <option key={car.id} value={car.id}>
                                {car.name} - ${car.pricePerDay}/day
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="customer-name">Customer Name</Label>
                          <Input
                            id="customer-name"
                            value={bookingFormData.customerName}
                            onChange={(e) => setBookingFormData({ ...bookingFormData, customerName: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={bookingFormData.startDate}
                            onChange={(e) => setBookingFormData({ ...bookingFormData, startDate: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="end-date">End Date</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={bookingFormData.endDate}
                            onChange={(e) => setBookingFormData({ ...bookingFormData, endDate: e.target.value })}
                          />
                        </div>

                        <DialogFooter>
                          <Button type="submit" className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white">
                            Create Booking
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Calendar */}
                  <div className="lg:col-span-2">
                    <div className="space-y-4">
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-4">
                        <Button variant="outline" size="sm" onClick={prevMonth}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="text-lg font-semibold">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <Button variant="outline" size="sm" onClick={nextMonth}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Day Headers */}
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day, index) => {
                          const dayBookings = day ? getBookingsForDate(day) : [];
                          return (
                            <div
                              key={index}
                              className={`p-3 rounded-lg border-2 min-h-20 ${
                                day
                                  ? dayBookings.length > 0
                                    ? 'border-yellow-400 bg-yellow-50'
                                    : 'border-gray-200 bg-white hover:bg-gray-50 cursor-pointer'
                                  : 'border-transparent bg-gray-100'
                              }`}
                            >
                              {day && (
                                <>
                                  <div className="font-semibold text-sm mb-1">{day}</div>
                                  {dayBookings.length > 0 && (
                                    <div className="text-xs space-y-1">
                                      {dayBookings.slice(0, 2).map(booking => (
                                        <div key={booking.id} className="bg-yellow-200 px-1 py-0.5 rounded truncate text-yellow-900">
                                          {booking.carName.split(' ')[0]}
                                        </div>
                                      ))}
                                      {dayBookings.length > 2 && (
                                        <div className="text-gray-600 text-xs">+{dayBookings.length - 2} more</div>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Bookings */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Upcoming Bookings</h4>
                    {bookings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No bookings yet</p>
                    ) : (
                      <div className="space-y-2">
                        {bookings.slice(0, 5).map(booking => (
                          <div key={booking.id} className="border rounded-lg p-3 text-sm bg-gradient-to-r from-blue-50 to-cyan-50">
                            <p className="font-semibold text-blue-900">{booking.carName}</p>
                            <p className="text-xs text-gray-600">{booking.customerName}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs font-semibold text-cyan-600 mt-1">${booking.totalPrice}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>View and manage customer bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Bookings will appear here once connected to database</p>
                  <p className="text-sm text-muted-foreground mt-2">This section will show all customer bookings and reservations</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

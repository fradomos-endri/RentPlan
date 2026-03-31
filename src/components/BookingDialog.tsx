import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { User, Mail, ArrowRight, Check, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { Car } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { toast } from 'sonner';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { getStoredToken } from '@/lib/auth';

interface BookingDialogProps {
  car: Car | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PriceBreakdownDay {
  date: string;
  price: number;
  is_custom: boolean;
}

interface RangePriceData {
  price_per_day: number;
  days: number;
  total_price_for_range: number;
  price_breakdown: PriceBreakdownDay[];
}

type BookingStep = 'dates' | 'details' | 'confirmation';

export function BookingDialog({ car, open, onOpenChange }: BookingDialogProps) {
  const [step, setStep] = useState<BookingStep>('dates');
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [rangePrice, setRangePrice] = useState<RangePriceData | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [defaultPricePerDay, setDefaultPricePerDay] = useState<number>(0);
  const token = getStoredToken();

  const formatDateLocal = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Fetch car's default price when dialog opens
  useEffect(() => {
    if (!car || !open) return;
    const today = formatDateLocal(new Date());
    fetch(getApiUrl(`${API_ENDPOINTS.CARS}/${car.id}?date=${today}`))
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.effective_price != null) {
          setDefaultPricePerDay(parseFloat(data.effective_price));
        } else if (car.pricePerDay > 0) {
          setDefaultPricePerDay(car.pricePerDay);
        }
      })
      .catch(() => {
        if (car.pricePerDay > 0) setDefaultPricePerDay(car.pricePerDay);
      });
  }, [car, open]);

  // Fetch real price breakdown whenever a full range is selected
  useEffect(() => {
    if (!car || !selectedRange.start || !selectedRange.end) {
      setRangePrice(null);
      return;
    }
    const from = formatDateLocal(selectedRange.start);
    const to = formatDateLocal(selectedRange.end);
    setLoadingPrice(true);
    fetch(getApiUrl(`${API_ENDPOINTS.CARS}/${car.id}?from=${from}&to=${to}`))
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.total_price_for_range != null) {
          setRangePrice({
            price_per_day: parseFloat(data.price_per_day),
            days: data.days,
            total_price_for_range: parseFloat(data.total_price_for_range),
            price_breakdown: data.price_breakdown || [],
          });
        } else {
          setRangePrice(null);
        }
      })
      .catch(() => setRangePrice(null))
      .finally(() => setLoadingPrice(false));
  }, [car, selectedRange.start, selectedRange.end]);

  const resetForm = () => {
    setStep('dates');
    setSelectedRange({ start: null, end: null });
    setCustomerName('');
    setCustomerEmail('');
    setIsProcessing(false);
    setBookingId(null);
    setRangePrice(null);
    setShowBreakdown(false);
    setDefaultPricePerDay(0);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const totalDays = selectedRange.start && selectedRange.end
    ? differenceInDays(selectedRange.end, selectedRange.start) + 1
    : 0;

  const effectivePricePerDay = defaultPricePerDay > 0 ? defaultPricePerDay : (car?.pricePerDay ?? 0);

  const totalPrice = rangePrice
    ? rangePrice.total_price_for_range
    : effectivePricePerDay * totalDays;

  const handleContinueToDetails = () => {
    if (!selectedRange.start || !selectedRange.end) {
      toast.error('Please select your rental dates');
      return;
    }
    setStep('details');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerEmail) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!token) {
      toast.error('Please sign in to book a car');
      return;
    }

    if (!car || !selectedRange.start || !selectedRange.end) {
      toast.error('Invalid booking details');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.BOOKINGS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          car_id: car.id,
          start_date: format(selectedRange.start, 'yyyy-MM-dd'),
          end_date: format(selectedRange.end, 'yyyy-MM-dd'),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to create booking');
        return;
      }

      const data = await response.json();
      setBookingId(data.booking_id);
      toast.success('Booking created successfully!');
      setStep('confirmation');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('An error occurred while creating booking');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!car) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {step === 'confirmation' ? 'Booking Confirmed!' : `Book ${car.name}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'dates' && 'Select your rental dates from the calendar below.'}
            {step === 'details' && 'Enter your contact information to confirm booking.'}
            {step === 'confirmation' && 'Your booking has been confirmed.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        {step !== 'confirmation' && (
          <div className="flex items-center gap-2 mb-4">
            {['dates', 'details'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s ? 'bg-accent text-accent-foreground' : 
                  ['dates', 'details'].indexOf(step) > i ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                {i < 1 && <div className="w-8 h-0.5 bg-muted" />}
              </div>
            ))}
          </div>
        )}

        {/* Step: Select Dates */}
        {step === 'dates' && (
          <div className="space-y-6">
            <AvailabilityCalendar
              carId={car.id}
              defaultPrice={car.pricePerDay}
              selectedRange={selectedRange}
              onRangeSelect={setSelectedRange}
            />

            {totalDays > 0 && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                {loadingPrice ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader className="h-4 w-4 animate-spin" />
                    Calculating price...
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {totalDays} day{totalDays > 1 ? 's' : ''}
                      </span>
                      <span className="font-semibold">€{totalPrice.toFixed(2)}</span>
                    </div>
                    {rangePrice && rangePrice.price_breakdown.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowBreakdown(v => !v)}
                          className="flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          {showBreakdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          {showBreakdown ? 'Hide' : 'Show'} price breakdown
                        </button>
                        {showBreakdown && (
                          <div className="mt-1 max-h-40 overflow-y-auto rounded border bg-background p-2 space-y-1">
                            {rangePrice.price_breakdown.map(day => (
                              <div key={day.date} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <span className={day.is_custom ? 'text-blue-600 font-semibold' : ''}>
                                  €{parseFloat(day.price as any).toFixed(2)}
                                  {day.is_custom && ' ✎'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleClose(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                variant="accent" 
                onClick={handleContinueToDetails} 
                className="flex-1"
                disabled={!selectedRange.start || !selectedRange.end}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Customer Details */}
        {step === 'details' && (
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-medium text-foreground">Selected Dates</p>
              <p className="text-muted-foreground">
                {selectedRange.start && selectedRange.end && (
                  <>
                    {format(selectedRange.start, 'MMM d, yyyy')} — {format(selectedRange.end, 'MMM d, yyyy')}
                    <span className="ml-2">({totalDays} day{totalDays > 1 ? 's' : ''})</span>
                  </>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total ({totalDays} day{totalDays !== 1 ? 's' : ''})</span>
                <span className="text-xl font-bold text-accent">€{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep('dates')} className="flex-1" disabled={isProcessing}>
                Back
              </Button>
              <Button type="submit" variant="accent" className="flex-1" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step: Confirmation */}
        {step === 'confirmation' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-accent" />
            </div>
            
            <div className="space-y-2">
              <p className="text-foreground">
                Thank you, <strong>{customerName}</strong>!
              </p>
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to {customerEmail}
              </p>
              {bookingId && (
                <p className="text-sm text-muted-foreground">
                  Booking ID: <strong>#{bookingId}</strong>
                </p>
              )}
            </div>

            <div className="rounded-lg bg-muted p-4 text-left">
              <h4 className="font-semibold text-foreground mb-3">Booking Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle</span>
                  <span className="font-medium">{car.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dates</span>
                  <span className="font-medium">
                    {selectedRange.start && selectedRange.end && (
                      <>
                        {format(selectedRange.start, 'MMM d')} — {format(selectedRange.end, 'MMM d, yyyy')}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Price</span>
                  <span className="font-bold text-accent">€{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="inline-block px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-700 text-xs font-medium">
                    Pending
                  </span>
                </div>
              </div>
            </div>

            <Button variant="accent" onClick={() => handleClose(false)} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

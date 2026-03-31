import { useState, useEffect, useCallback } from 'react';
import { format, isSameDay, isWithinInterval, addDays, startOfDay, isBefore } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

interface AvailabilityCalendarProps {
  carId: string;
  defaultPrice: number;
  selectedRange: { start: Date | null; end: Date | null };
  onRangeSelect: (range: { start: Date | null; end: Date | null }) => void;
}

interface DayPriceInfo {
  effective_price: number;
  has_custom_price: boolean;
}

export function AvailabilityCalendar({ carId, defaultPrice, selectedRange, onRangeSelect }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [unavailableDateRanges, setUnavailableDateRanges] = useState<Array<{
    start_date: string;
    end_date: string;
    type: string;
    status?: string;
    reason?: string;
  }>>([]);
  // Map of "YYYY-MM-DD" -> price info fetched from GET /api/cars/:id?date=...
  const [dayPriceMap, setDayPriceMap] = useState<Record<string, DayPriceInfo>>({});
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(false);

  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const extractDateFromApi = (dateString: string): string => {
    const date = new Date(dateString);
    return formatDateLocal(date);
  };

  // Fetch unavailable dates
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        setLoadingDates(true);
        const response = await fetch(getApiUrl(`${API_ENDPOINTS.CARS}/${carId}/unavailable-dates`));
        if (response.ok) {
          const data = await response.json();
          setUnavailableDateRanges(Array.isArray(data?.unavailable_dates) ? data.unavailable_dates : []);
        } else {
          setUnavailableDateRanges([]);
        }
      } catch {
        setUnavailableDateRanges([]);
      } finally {
        setLoadingDates(false);
      }
    };
    if (carId) fetchUnavailableDates();
  }, [carId]);

  // Fetch prices for all days in the visible month using GET /api/cars/:id?date=YYYY-MM-DD
  const fetchMonthPrices = useCallback(async (month: Date) => {
    setLoadingPrices(true);
    try {
      const year = month.getFullYear();
      const m = month.getMonth();
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      const todayStr = formatDateLocal(startOfDay(new Date()));

      const promises = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(year, m, i + 1);
        const dateStr = formatDateLocal(date);
        if (dateStr < todayStr) return Promise.resolve(null); // skip past days
        return fetch(getApiUrl(`${API_ENDPOINTS.CARS}/${carId}?date=${dateStr}`))
          .then(r => r.ok ? r.json() : null)
          .then(data => data ? { dateStr, data } : null)
          .catch(() => null);
      });

      const results = await Promise.all(promises);
      const newMap: Record<string, DayPriceInfo> = {};
      results.forEach(res => {
        if (!res) return;
        newMap[res.dateStr] = {
          effective_price: parseFloat(res.data.effective_price ?? res.data.price_per_day ?? defaultPrice),
          has_custom_price: !!res.data.has_custom_price,
        };
      });
      setDayPriceMap(prev => ({ ...prev, ...newMap }));
    } catch {
      // silently fail — calendar still works, just shows default price
    } finally {
      setLoadingPrices(false);
    }
  }, [carId, defaultPrice]);

  useEffect(() => {
    if (carId) fetchMonthPrices(currentMonth);
  }, [carId, currentMonth, fetchMonthPrices]);

  const isDateBooked = (date: Date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return false;
    const dateStr = formatDateLocal(date);
    return unavailableDateRanges.some(range => {
      const start = extractDateFromApi(range.start_date);
      const end = extractDateFromApi(range.end_date);
      return dateStr >= start && dateStr <= end;
    });
  };

  const isDateInSelectedRange = (date: Date) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    return isWithinInterval(date, { start: selectedRange.start, end: selectedRange.end });
  };

  const isDateSelectable = (date: Date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return false;
    if (isDateBooked(date)) return false;
    if (selectingEnd && selectedRange.start) {
      let current = addDays(selectedRange.start, 1);
      while (isBefore(current, date)) {
        if (isDateBooked(current)) return false;
        current = addDays(current, 1);
      }
    }
    return true;
  };

  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;
    if (!selectingEnd || !selectedRange.start) {
      onRangeSelect({ start: date, end: null });
      setSelectingEnd(true);
    } else {
      if (isBefore(date, selectedRange.start)) {
        onRangeSelect({ start: date, end: null });
      } else {
        onRangeSelect({ start: selectedRange.start, end: date });
        setSelectingEnd(false);
      }
    }
  };

  const getPriceInfo = (date: Date): DayPriceInfo => {
    const dateStr = formatDateLocal(date);
    return dayPriceMap[dateStr] ?? { effective_price: defaultPrice, has_custom_price: false };
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const today = startOfDay(new Date());

  if (loadingDates) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-2" />
          <p className="text-sm text-muted-foreground">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          {format(currentMonth, 'MMMM yyyy')}
          {loadingPrices && (
            <span className="inline-block h-3 w-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          )}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-accent" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-destructive" />
          <span className="text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-secondary" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-blue-600 font-bold text-[10px]">€</span>
          <span className="text-muted-foreground">Custom price</span>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="aspect-square" />;

          const isPast = isBefore(date, today);
          const isBooked = isDateBooked(date);
          const isSelected = (selectedRange.start && isSameDay(date, selectedRange.start)) ||
                             (selectedRange.end && isSameDay(date, selectedRange.end));
          const isInRange = isDateInSelectedRange(date);
          const isSelectable = isDateSelectable(date);
          const isToday = isSameDay(date, today);
          const { effective_price, has_custom_price } = getPriceInfo(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={!isSelectable}
              className={cn(
                "aspect-square flex flex-col items-center justify-center text-xs rounded-md transition-colors",
                isPast && "text-muted-foreground/50 cursor-not-allowed hover:bg-transparent",
                !isPast && isBooked && "bg-destructive text-destructive-foreground cursor-not-allowed hover:bg-destructive",
                isSelected && "bg-accent text-accent-foreground font-semibold",
                isInRange && !isSelected && "bg-accent/30",
                isToday && !isSelected && !isBooked && "ring-1 ring-accent",
                !isPast && !isBooked && !isSelected && !isInRange && "bg-secondary/50 hover:bg-secondary"
              )}
            >
              <span className="font-medium leading-none">{format(date, 'd')}</span>
              {!isPast && !isBooked && (
                <span className={cn(
                  "text-[9px] leading-none mt-0.5",
                  isSelected || isInRange
                    ? "text-accent-foreground/80"
                    : has_custom_price
                    ? "text-blue-600 font-semibold"
                    : "text-muted-foreground"
                )}>
                  €{Number.isInteger(effective_price) ? effective_price : effective_price.toFixed(0)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection info */}
      <div className="mt-4 text-sm text-muted-foreground">
        {!selectedRange.start && <p>Click to select your start date</p>}
        {selectedRange.start && !selectedRange.end && (
          <p>Start: {format(selectedRange.start, 'MMM d, yyyy')} — Now select end date</p>
        )}
        {selectedRange.start && selectedRange.end && (
          <p className="text-foreground font-medium">
            {format(selectedRange.start, 'MMM d')} — {format(selectedRange.end, 'MMM d, yyyy')}
          </p>
        )}
      </div>
    </div>
  );
}

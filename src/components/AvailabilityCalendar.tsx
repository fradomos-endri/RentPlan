import { useState, useMemo, useEffect } from 'react';
import { format, isSameDay, isWithinInterval, addDays, startOfDay, isBefore, isAfter, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

interface AvailabilityCalendarProps {
  carId: string;
  selectedRange: { start: Date | null; end: Date | null };
  onRangeSelect: (range: { start: Date | null; end: Date | null }) => void;
}

export function AvailabilityCalendar({ carId, selectedRange, onRangeSelect }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [unavailableDateRanges, setUnavailableDateRanges] = useState<Array<{
    start_date: string;
    end_date: string;
    type: string;
    status?: string;
    reason?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch unavailable dates from API
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl(`${API_ENDPOINTS.CARS}/${carId}/unavailable-dates`));
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched unavailable dates for car', carId, ':', data);
          
          // Handle the API response format
          if (data && Array.isArray(data.unavailable_dates)) {
            setUnavailableDateRanges(data.unavailable_dates);
          } else {
            console.warn('API returned unexpected format:', data);
            setUnavailableDateRanges([]);
          }
        } else {
          console.error('Failed to fetch unavailable dates:', response.status);
          setUnavailableDateRanges([]);
        }
      } catch (error) {
        console.error('Error fetching unavailable dates:', error);
        setUnavailableDateRanges([]);
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchUnavailableDates();
    }
  }, [carId]);

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to extract date from API response (handles timezone issues)
  const extractDateFromApi = (dateString: string): string => {
    // Parse as Date and format in local timezone
    const date = new Date(dateString);
    return formatDateLocal(date);
  };

  const isDateBooked = (date: Date) => {
    // Don't mark past dates as booked
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return false;
    
    const dateStr = formatDateLocal(date);
    
    // Check if the date falls within any unavailable date range
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
    
    // If selecting end date, check if any booked dates are between start and this date
    if (selectingEnd && selectedRange.start) {
      const start = selectedRange.start;
      // Check each date between start and the clicked date
      let current = addDays(start, 1);
      while (isBefore(current, date)) {
        if (isDateBooked(current)) {
          return false;
        }
        current = addDays(current, 1);
      }
    }
    
    return true;
  };

  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;

    if (!selectingEnd || !selectedRange.start) {
      // Selecting start date
      onRangeSelect({ start: date, end: null });
      setSelectingEnd(true);
    } else {
      // Selecting end date
      if (isBefore(date, selectedRange.start)) {
        // If clicked date is before start, make it the new start
        onRangeSelect({ start: date, end: null });
      } else {
        onRangeSelect({ start: selectedRange.start, end: date });
        setSelectingEnd(false);
      }
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const today = startOfDay(new Date());

  // Show loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading availability...</p>
          </div>
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
        <h3 className="font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
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
      <div className="flex gap-4 mb-4 text-xs">
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
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isPast = isBefore(date, today);
          const isBooked = isDateBooked(date);
          const isSelected = selectedRange.start && isSameDay(date, selectedRange.start) ||
                            selectedRange.end && isSameDay(date, selectedRange.end);
          const isInRange = isDateInSelectedRange(date);
          const isSelectable = isDateSelectable(date);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={!isSelectable}
              className={cn(
                "aspect-square flex items-center justify-center text-sm rounded-md transition-colors",
                // Base styles
                "hover:bg-secondary/80",
                // Past dates - just dim them, don't mark as red
                isPast && "text-muted-foreground/50 cursor-not-allowed hover:bg-transparent",
                // Booked dates (only future dates) - red background
                !isPast && isBooked && "bg-destructive text-destructive-foreground cursor-not-allowed hover:bg-destructive",
                // Selected dates - accent color
                isSelected && "bg-accent text-accent-foreground font-semibold",
                // In range dates
                isInRange && !isSelected && "bg-accent/30",
                // Today indicator
                isToday && !isSelected && !isBooked && "ring-1 ring-accent",
                // Available and selectable
                !isPast && !isBooked && !isSelected && !isInRange && "bg-secondary/50 hover:bg-secondary"
              )}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      {/* Selection info */}
      <div className="mt-4 text-sm text-muted-foreground">
        {!selectedRange.start && (
          <p>Click to select your start date</p>
        )}
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

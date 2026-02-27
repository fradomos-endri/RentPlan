# Booking Calendar API Integration

## Overview
Updated the `AvailabilityCalendar` component to fetch real unavailable dates from the backend API instead of using mock data.

## Changes Made

### File: `/src/components/AvailabilityCalendar.tsx`

#### 1. **Added API Integration**
- Replaced mock data with real API calls
- Fetches unavailable dates from: `GET /api/cars/:carId/unavailable-dates`

#### 2. **New Imports**
```typescript
import { useState, useMemo, useEffect } from 'react'; // Added useEffect
import { parseISO } from 'date-fns'; // Added parseISO
import { getApiUrl, API_ENDPOINTS } from '@/config/api'; // Added API config
```

#### 3. **New State Variables**
```typescript
const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
const [loading, setLoading] = useState(true);
```

#### 4. **API Fetch Function**
```typescript
useEffect(() => {
  const fetchUnavailableDates = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.CARS}/${carId}/unavailable-dates`));
      
      if (response.ok) {
        const dates = await response.json();
        console.log('Fetched unavailable dates for car', carId, ':', dates);
        setUnavailableDates(dates);
      } else {
        console.error('Failed to fetch unavailable dates:', response.status);
        setUnavailableDates([]);
      }
    } catch (error) {
      console.error('Error fetching unavailable dates:', error);
      setUnavailableDates([]);
    } finally {
      setLoading(false);
    }
  };

  if (carId) {
    fetchUnavailableDates();
  }
}, [carId]);
```

#### 5. **Date Formatting Helper**
Added a helper function to format dates consistently:
```typescript
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
```

#### 6. **Updated Date Checking**
Changed from checking against mock bookings to checking against API-fetched dates:
```typescript
const isDateBooked = (date: Date) => {
  const dateStr = formatDateLocal(date);
  return unavailableDates.includes(dateStr);
};
```

#### 7. **Updated Date Selection Logic**
Improved the `isDateSelectable` function to check unavailable dates between start and end:
```typescript
const isDateSelectable = (date: Date) => {
  const today = startOfDay(new Date());
  if (isBefore(date, today)) return false;
  if (isDateBooked(date)) return false;
  
  // If selecting end date, check if any booked dates are between start and this date
  if (selectingEnd && selectedRange.start) {
    const start = selectedRange.start;
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
```

#### 8. **Added Loading State**
Shows a spinner while fetching unavailable dates:
```typescript
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
```

## API Endpoint Expected

### GET `/api/cars/:carId/unavailable-dates`

**Description:** Returns an array of dates (in YYYY-MM-DD format) when the car is unavailable.

**Response Format:**
```json
[
  "2026-02-22",
  "2026-02-23",
  "2026-02-24",
  "2026-03-10",
  "2026-03-11"
]
```

**What Should Be Included:**
- All dates with confirmed/pending bookings
- All dates with car blocks (maintenance, repairs, etc.)

**Example Backend Implementation:**
```javascript
// GET /api/cars/:carId/unavailable-dates
app.get('/api/cars/:carId/unavailable-dates', async (req, res) => {
  const { carId } = req.params;
  
  try {
    // Fetch bookings for this car (confirmed and pending)
    const bookings = await db.query(
      `SELECT start_date, end_date 
       FROM bookings 
       WHERE car_id = ? AND status IN ('confirmed', 'pending')`,
      [carId]
    );
    
    // Fetch blocks for this car
    const blocks = await db.query(
      `SELECT start_date, end_date 
       FROM car_blocks 
       WHERE car_id = ?`,
      [carId]
    );
    
    // Generate array of all unavailable dates
    const unavailableDates = new Set();
    
    // Add booking dates
    bookings.forEach(booking => {
      let current = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      
      while (current <= end) {
        unavailableDates.add(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });
    
    // Add block dates
    blocks.forEach(block => {
      let current = new Date(block.start_date);
      const end = new Date(block.end_date);
      
      while (current <= end) {
        unavailableDates.add(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });
    
    res.json(Array.from(unavailableDates).sort());
  } catch (error) {
    console.error('Error fetching unavailable dates:', error);
    res.status(500).json({ error: 'Failed to fetch unavailable dates' });
  }
});
```

## Benefits

1. **Real-Time Data**: Calendar shows actual unavailable dates from the database
2. **Includes Blocks**: Unavailable dates now include car blocks (maintenance, etc.)
3. **Better UX**: Loading state provides feedback while fetching data
4. **Prevents Conflicts**: Users cannot select date ranges that include unavailable dates
5. **Timezone Safe**: Uses local date formatting to avoid timezone issues

## User Experience

### Before:
- Calendar showed mock booking data
- Didn't reflect real bookings or blocks
- Could potentially allow conflicting bookings

### After:
- Calendar fetches real unavailable dates on component mount
- Shows loading spinner while fetching
- Displays all dates that are:
  - Already booked (confirmed or pending)
  - Blocked by the car owner
- Prevents users from selecting unavailable dates
- Prevents selecting date ranges that span unavailable dates

## Testing

1. **Test Calendar Loading:**
   - Open booking dialog for any car
   - Verify loading spinner appears briefly
   - Verify calendar loads successfully

2. **Test Unavailable Dates Display:**
   - Book a car for specific dates
   - Open booking dialog again
   - Verify those dates appear as unavailable (red)

3. **Test Date Selection:**
   - Try to click on an unavailable date → Should not be selectable
   - Select a start date, then try to select an end date that spans an unavailable date → Should not be allowed

4. **Test Car Blocks:**
   - Block a car for specific dates (maintenance)
   - Open booking dialog for that car
   - Verify blocked dates appear as unavailable

## Console Logs

For debugging, the component logs:
```
Fetched unavailable dates for car 5: ["2026-02-22", "2026-02-23", ...]
```

## Dependencies

- Requires the backend API endpoint: `GET /api/cars/:carId/unavailable-dates`
- Uses existing `getApiUrl` and `API_ENDPOINTS` configuration

## Future Enhancements

1. **Refresh on Change**: Automatically refresh unavailable dates if a booking is made
2. **Error Handling UI**: Show user-friendly error message if API fails
3. **Caching**: Cache unavailable dates to reduce API calls
4. **Month Range**: Fetch only unavailable dates for visible month range

---

**Date Updated:** February 26, 2026

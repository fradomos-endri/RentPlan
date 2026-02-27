# Car Blocking Feature Documentation

## Overview
The Car Blocking feature allows business owners to make their cars unavailable for booking during specific date ranges. This is useful for maintenance, repairs, personal use, or any other reason where the car should not be rented out.

## Features

### 1. **Create Car Blocks**
Business owners can block a car for specific dates directly from the calendar view.

**How to Block a Car:**
1. Navigate to the Business Cars page (Calendar View)
2. Hover over any available date (white background) on a car's calendar row
3. Click the red Ban icon that appears in the top-right corner of the date cell
4. Fill in the block details:
   - **Car**: Select the car to block (pre-selected if clicked from a specific car's row)
   - **Start Date**: First day of the block period
   - **End Date**: Last day of the block period
   - **Reason** (Optional): Description of why the car is blocked (e.g., "Maintenance", "Repair needed")
5. Click "Block Dates" to create the block

### 2. **View Block Details**
Click on any blocked date (red/pink background) in the calendar to view full details:
- Car information (Brand, Model, Plate)
- Start and End dates
- Reason for blocking
- Creation timestamp

### 3. **Delete Car Blocks**
From the Block Details modal:
1. Click on a blocked date to open the details
2. Click "Remove Block" to delete the block
3. Confirm the action

The car will become available for booking again for those dates.

## Visual Indicators

### Calendar Color Coding
- **Red/Pink Background with Red Border**: Blocked dates
- **Red Ban Icon**: Indicates a blocked date
- **"BLOCKED" Label**: Shows on blocked dates with reason (if provided)

### Legend
The calendar includes a legend showing:
- ✅ Check-in Day (Green gradient)
- ✅ Check-out Day (Rose gradient)  
- ✅ Confirmed Bookings (Green)
- ⏳ Pending Bookings (Yellow)
- 🚫 **Blocked Dates (Red/Pink)**
- ❌ Cancelled Bookings (Gray)
- 📅 Today (Blue border)

## API Integration

### Endpoints Used

#### 1. Create Car Block
```
POST /api/car-blocks
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "car_id": 5,
  "start_date": "2024-03-01",
  "end_date": "2024-03-05",
  "reason": "Car in maintenance"
}
```

#### 2. Get Blocks for a Car
```
GET /api/car-blocks/car/:carId
Authorization: Bearer <token>
```

#### 3. Get Single Block
```
GET /api/car-blocks/:id
Authorization: Bearer <token>
```

#### 4. Update Block
```
PUT /api/car-blocks/:id
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "start_date": "2024-03-02",
  "end_date": "2024-03-06",
  "reason": "Extended maintenance"
}
```

#### 5. Delete Block
```
DELETE /api/car-blocks/:id
Authorization: Bearer <token>
```

## Technical Implementation

### Data Structure

```typescript
interface CarBlock {
  id: number;
  car_id: number;
  start_date: string;      // ISO8601 format: "YYYY-MM-DD"
  end_date: string;        // ISO8601 format: "YYYY-MM-DD"
  reason?: string;
  created_at: string;
}
```

### State Management

```typescript
const [carBlocks, setCarBlocks] = useState<CarBlock[]>([]);
const [showBlockModal, setShowBlockModal] = useState(false);
const [blockData, setBlockData] = useState({
  car_id: 0,
  start_date: '',
  end_date: '',
  reason: ''
});
const [selectedBlock, setSelectedBlock] = useState<CarBlock | null>(null);
const [showBlockDetailsModal, setShowBlockDetailsModal] = useState(false);
```

### Key Functions

1. **fetchCarBlocks()**: Loads all blocks for business's cars
2. **handleCreateCarBlock()**: Creates a new car block
3. **handleDeleteCarBlock(blockId)**: Removes a car block
4. **getCarBlockForDate(carId, date)**: Checks if a car is blocked on a specific date
5. **handleOpenBlockModal(carId, date?)**: Opens the create block modal
6. **handleBlockClick(block)**: Opens the block details modal

### Calendar Integration

The calendar view has been updated to:
- Display blocked dates with distinct styling
- Show a hover button to quickly block dates
- Handle clicks on blocked dates to view details
- Prioritize blocks over bookings (blocks prevent bookings)
- Include blocks in the calendar legend

## User Experience

### Quick Block Flow
1. Hover over an available date → Ban icon appears
2. Click Ban icon → Modal opens with date pre-filled
3. Fill reason (optional) → Click "Block Dates"
4. Calendar updates immediately showing the blocked period

### Block Management Flow
1. Click on any blocked date → Details modal opens
2. View block information
3. Remove block if needed
4. Calendar updates immediately

## Business Rules

1. **Authorization**: Only car owners or super admins can create/delete blocks
2. **Date Validation**: End date must be after or equal to start date
3. **Priority**: Blocks take precedence over bookings (blocked dates cannot be booked)
4. **Visibility**: Blocks are visible in the calendar view for business owners
5. **Customer View**: Blocked dates appear as unavailable to customers (same as booked dates)

## Files Modified

1. **src/config/api.ts**
   - Added `CAR_BLOCKS: '/api/car-blocks'` endpoint

2. **src/pages/BusinessCars.tsx**
   - Added CarBlock interface
   - Added state variables for car blocks management
   - Added fetch, create, and delete functions for car blocks
   - Updated calendar rendering to show blocked dates
   - Added two modals: Create Block and Block Details
   - Updated calendar legend to include blocked dates
   - Added hover button for quick blocking

## Future Enhancements

Possible improvements for future versions:
1. **Bulk Blocking**: Block multiple cars at once
2. **Recurring Blocks**: Set up recurring block patterns
3. **Block Templates**: Save common block reasons as templates
4. **Calendar Export**: Export blocks to external calendars
5. **Block Notifications**: Notify when blocks are about to expire
6. **Edit Blocks**: Update existing blocks without deleting and recreating
7. **Block History**: Track block changes over time
8. **Conflict Detection**: Warn if trying to block dates with existing bookings

## Testing Checklist

- [ ] Create a car block from the calendar
- [ ] View block details by clicking on a blocked date
- [ ] Delete a car block
- [ ] Verify blocks appear correctly in calendar
- [ ] Verify blocks prevent bookings on those dates
- [ ] Test with multiple cars and overlapping blocks
- [ ] Verify authorization (only car owner can block)
- [ ] Test date validation (end after start)
- [ ] Test with optional reason field
- [ ] Verify blocks persist after page reload

## Support

For issues or questions about the Car Blocking feature, please refer to:
- API Documentation: `API_CONFIG_GUIDE.md`
- Main Architecture: `ARCHITECTURE_DIAGRAM.md`
- Backend API: Check the backend server documentation for car-blocks endpoints

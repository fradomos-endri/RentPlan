# Search & Availability Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ SearchHero   │  │  Cars Page   │  │  BusinessCars Page   │  │
│  │ (Home Page)  │  │              │  │  (Admin Dashboard)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         │                 │                      │              │
│         └────────┬────────┴──────────┬───────────┘              │
│                  │                   │                          │
│         ┌────────▼───────┐  ┌────────▼──────────┐              │
│         │ getApiUrl()    │  │  API_ENDPOINTS    │              │
│         │ Helper         │  │  Configuration    │              │
│         └────────┬───────┘  └───────────────────┘              │
│                  │                                              │
└──────────────────┼──────────────────────────────────────────────┘
                   │
                   │ HTTP Requests
                   │
┌──────────────────▼──────────────────────────────────────────────┐
│                      BACKEND API                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Endpoint 1: GET /api/cars/available/search             │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  Query Params:                                          │   │
│  │    • start_date (required)                              │   │
│  │    • end_date (required)                                │   │
│  │    • brand (optional)                                   │   │
│  │    • fuel_type (optional)                               │   │
│  │    • transmission (optional)                            │   │
│  │                                                          │   │
│  │  Returns: Cars available for date range                 │   │
│  │    with is_available field (1 or 0)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Endpoint 2: GET /api/cars/business/:id/sorted          │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  Query Params:                                          │   │
│  │    • start_date (required)                              │   │
│  │    • end_date (required)                                │   │
│  │                                                          │   │
│  │  Returns: Business cars sorted by:                      │   │
│  │    1. is_available DESC (available first)               │   │
│  │    2. created_at (newest first)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Database Queries
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                         DATABASE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tables:                                                         │
│  • cars                                                          │
│  • bookings                                                      │
│  • businesses                                                    │
│                                                                  │
│  Logic checks:                                                   │
│  - No overlapping bookings for date range                       │
│  - Car belongs to business                                      │
│  - Booking status not cancelled                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Data Flow

### 1. SearchHero Component (Home Page)

```
┌────────────────────────────────────────────────────────────┐
│                    COMPONENT STATE                          │
├────────────────────────────────────────────────────────────┤
│  startDate: Date | undefined                               │
│  endDate: Date | undefined                                 │
│  carName: string                                           │
│  carBrand: string                                          │
│  location: string                                          │
│  isSearching: boolean                                      │
│  searchResults: FilteredCar[]                              │
│  hasSearched: boolean                                      │
│  locations: string[]  ← Fetched from /api/businesses       │
│  brands: string[]     ← Fetched from /api/cars             │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                  USER INTERACTIONS                          │
├────────────────────────────────────────────────────────────┤
│  1. User selects startDate                                 │
│  2. User selects endDate                                   │
│  3. User optionally filters by brand/location              │
│  4. User clicks "Search" button                            │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                   VALIDATION                                │
├────────────────────────────────────────────────────────────┤
│  ✓ Dates selected?                                         │
│  ✓ End date > Start date?                                  │
│  ✓ Dates in future?                                        │
│                                                             │
│  ✗ Show error toast → Return                               │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                  API REQUEST                                │
├────────────────────────────────────────────────────────────┤
│  URL: /api/cars/available/search                           │
│  Params: {                                                 │
│    start_date: "2026-02-21",                               │
│    end_date: "2026-02-25",                                 │
│    brand: "Toyota"  // if selected                         │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│               RESPONSE HANDLING                             │
├────────────────────────────────────────────────────────────┤
│  Success:                                                   │
│    • Transform API data → UI format                        │
│    • Apply client-side filters (name, location)            │
│    • Set searchResults                                     │
│    • Show success toast                                    │
│                                                             │
│  Error:                                                     │
│    • Show error toast                                      │
│    • Fallback to mock data                                 │
│    • Set searchResults                                     │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                 RENDER RESULTS                              │
├────────────────────────────────────────────────────────────┤
│  • Display count: "Found X cars"                           │
│  • Show date range and days                                │
│  • Render car cards with:                                  │
│    - Image                                                 │
│    - Name & agency                                         │
│    - Features (seats, transmission, fuel)                  │
│    - Price per day                                         │
│    - Total price (days × price_per_day)                    │
│    - "Reserve Now" button                                  │
└────────────────────────────────────────────────────────────┘
```

### 2. Cars Page with Availability Filter

```
┌────────────────────────────────────────────────────────────┐
│                    COMPONENT STATE                          │
├────────────────────────────────────────────────────────────┤
│  cars: Car[]                                               │
│  startDate: Date | undefined                               │
│  endDate: Date | undefined                                 │
│  useAvailabilityFilter: boolean                            │
│  ... (other existing filters)                              │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                    useEffect                                │
│  Dependencies: [useAvailabilityFilter, startDate, endDate] │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  if (useAvailabilityFilter && startDate && endDate) {      │
│    → Use: /api/cars/available/search                       │
│  } else {                                                   │
│    → Use: /api/cars                                        │
│  }                                                          │
│                                                             │
│  Transform response → Set cars state                       │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                  CLIENT-SIDE FILTERING                      │
│                  (useMemo hook)                             │
├────────────────────────────────────────────────────────────┤
│  Filter cars by:                                           │
│  • Search query (name, brand, type)                        │
│  • Selected brand                                          │
│  • Selected type                                           │
│  • Selected agency                                         │
│  • Price range                                             │
│  • Show available only checkbox                            │
│                                                             │
│  Returns: filteredCars                                     │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                    RENDER                                   │
├────────────────────────────────────────────────────────────┤
│  Display:                                                   │
│  • Search bar                                              │
│  • Filter dropdowns                                        │
│  • Availability filter toggle with date pickers            │
│  • Result count                                            │
│  • Car grid (filteredCars)                                 │
└────────────────────────────────────────────────────────────┘
```

### 3. BusinessCars Page

```
┌────────────────────────────────────────────────────────────┐
│                   fetchCars()                               │
├────────────────────────────────────────────────────────────┤
│  1. Calculate date range (today → +30 days)                │
│  2. Format dates to YYYY-MM-DD                             │
│  3. Build URL:                                             │
│     /api/cars/business/:id/sorted?                         │
│       start_date=...&end_date=...                          │
│  4. Fetch with Authorization header                        │
│  5. If success:                                            │
│     → Set cars (already sorted by API)                     │
│  6. If error:                                              │
│     → Try fallback endpoint: /api/cars?business_id=:id     │
│     → Set cars (unsorted)                                  │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                    DISPLAY                                  │
├────────────────────────────────────────────────────────────┤
│  Cars displayed in order:                                  │
│  1. Available cars (is_available = 1)                      │
│  2. Unavailable cars (is_available = 0)                    │
│                                                             │
│  Each car shows availability status badge                  │
└────────────────────────────────────────────────────────────┘
```

## API Response Format

### Available Cars Search Response
```json
[
  {
    "car_id": 5,
    "business_id": 1,
    "brand": "Toyota",
    "model": "Camry",
    "production_year": 2022,
    "engine": "2.5L",
    "transmission": "Automatic",
    "fuel_type": "Petrol",
    "kilometers": 15000,
    "color": "White",
    "plate": "ABC123",
    "description": "Comfortable sedan",
    "price_per_day": "80.00",
    "business_name": "ABC Rentals",
    "cover_image": "https://example.com/image.jpg",
    "is_available": 1,  ← Key field!
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

## State Management Flow

```
USER ACTION
    ↓
UPDATE STATE (useState)
    ↓
TRIGGER EFFECT (useEffect)
    ↓
FETCH DATA (API call)
    ↓
UPDATE STATE (setCars, setSearchResults)
    ↓
MEMO RECALCULATES (useMemo)
    ↓
RE-RENDER (React)
    ↓
DISPLAY TO USER
```

## Error Handling Strategy

```
┌──────────────────────┐
│   Try API Call      │
└──────┬───────────────┘
       │
       ├─── Success ──→ Transform Data ──→ Update State
       │
       └─── Error ──→ Log Error
                      ↓
                   Show Toast
                      ↓
                   Fallback to Mock Data
                      ↓
                   Update State
```

## Performance Considerations

1. **Debouncing**: Search queries could be debounced
2. **Caching**: Frequently searched date ranges could be cached
3. **Lazy Loading**: Car images loaded on-demand
4. **Pagination**: Could paginate results for large datasets
5. **Memoization**: useMemo prevents unnecessary recalculations

## Security

- ✅ API calls use HTTPS in production
- ✅ Business endpoints require authentication token
- ✅ Input validation on dates
- ✅ XSS protection via React escaping
- ✅ No sensitive data in localStorage (only tokens)

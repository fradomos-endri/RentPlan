# 🎨 Business Management System - Visual Flow

## 🗺️ Map Feature Flow (IMPLEMENTED ✅)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION FLOW                     │
└─────────────────────────────────────────────────────────────┘

   1. User selects city
      from dropdown
           │
           ▼
   ┌─────────────────┐
   │  City Selected  │
   │  (e.g. Shkodër) │
   └────────┬────────┘
           │
           ▼
   2. Map loads with pins
      for businesses in city
           │
           ▼
   ┌─────────────────┐
   │  🗺️ Interactive │
   │      Map        │
   │   📍 📍 📍      │
   └────────┬────────┘
           │
           ▼
   3. User clicks a pin
           │
           ▼
   ┌─────────────────────────────────┐
   │   📋 Business Details Card      │
   │                                 │
   │  🏢 Premium Car Rentals         │
   │  📍 Rruga Nene Tereza 15        │
   │  🚗 12 cars available           │
   │                                 │
   │  [Open Agency] [Close]          │
   └────────┬────────────────────────┘
           │
           ├──→ User clicks "Close" → Card disappears
           │
           └──→ User clicks "Open Agency"
                      │
                      ▼
              Navigate to /agency/:id
                      │
                      ▼
           ┌────────────────────┐
           │  Agency Detail Page │
           │                     │
           │  • Business info    │
           │  • All cars         │
           │  • Gallery images   │
           │  • Contact info     │
           └─────────────────────┘
```

---

## 🔄 Update Business API Flow (READY TO IMPLEMENT 📝)

```
┌─────────────────────────────────────────────────────────────┐
│                  UPDATE BUSINESS FLOW                        │
└─────────────────────────────────────────────────────────────┘

   Business Owner / Super Admin
           │
           ▼
   Opens business edit form
           │
           ▼
   ┌─────────────────────────────┐
   │   Edit Business Form        │
   │                             │
   │  Name: [____________]       │
   │  City: [Shkodër    ▼]       │
   │  Address: [________]        │
   │  📍 Map (drag pin)          │
   │                             │
   │  [Update] [Cancel]          │
   └──────────┬──────────────────┘
              │
              ▼ Clicks "Update"
              │
   ┌──────────────────────────────────────┐
   │  PUT /api/businesses/:id             │
   │  Authorization: Bearer <token>       │
   │  {                                   │
   │    "business_name": "Updated Name",  │
   │    "city": "Shkodër",                │
   │    "latitude": 42.0685,              │
   │    "longitude": 19.5130              │
   │  }                                   │
   └──────────┬───────────────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │  BACKEND VALIDATION         │
   │                             │
   │  ✓ Verify JWT token         │
   │  ✓ Check user is owner      │
   │  ✓ Validate city name       │
   │  ✓ Validate coordinates     │
   │  ✓ Check VAT uniqueness     │
   └──────────┬──────────────────┘
              │
              ├──→ ❌ Invalid? → 400/403 Error
              │
              └──→ ✅ Valid
                     │
                     ▼
              UPDATE businesses 
              SET fields... 
              WHERE business_id = ?
                     │
                     ▼
              ┌──────────────────┐
              │  200 OK Response │
              │  {               │
              │    "message": "Business updated", │
              │    "business": {...}              │
              │  }                                │
              └──────────┬─────────────────────────┘
                         │
                         ▼
                   Frontend updates UI
                   Shows success message
```

---

## 🗑️ Delete Business API Flow (READY TO IMPLEMENT 📝)

```
┌─────────────────────────────────────────────────────────────┐
│                  DELETE BUSINESS FLOW                        │
└─────────────────────────────────────────────────────────────┘

   Business Owner / Super Admin
           │
           ▼
   Clicks "Delete Business" button
           │
           ▼
   ┌─────────────────────────────┐
   │   ⚠️  Confirmation Dialog   │
   │                             │
   │  Delete "Premium Rentals"?  │
   │                             │
   │  This will also delete:     │
   │  • 12 cars                  │
   │  • All images               │
   │  • Bookings history         │
   │                             │
   │  This cannot be undone!     │
   │                             │
   │  [Delete] [Cancel]          │
   └──────────┬──────────────────┘
              │
              ▼ Clicks "Delete"
              │
   ┌──────────────────────────────┐
   │  DELETE /api/businesses/:id  │
   │  Authorization: Bearer <token>│
   └──────────┬───────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │  BACKEND CHECKS             │
   │                             │
   │  ✓ Verify JWT token         │
   │  ✓ Check user is owner      │
   │  ✓ Check business exists    │
   └──────────┬──────────────────┘
              │
              ├──→ ❌ Unauthorized? → 401/403 Error
              │
              └──→ ✅ Authorized
                     │
                     ▼
              ┌───────────────────────┐
              │  Check Active Bookings│
              │  WHERE status='confirmed'│
              │  AND end_date >= NOW()   │
              └──────────┬───────────────┘
                         │
                         ├──→ ❌ Has active bookings?
                         │         │
                         │         ▼
                         │    409 Conflict Error
                         │    "Cannot delete - active bookings"
                         │
                         └──→ ✅ No active bookings
                                  │
                                  ▼
                         ┌────────────────────┐
                         │  BEGIN TRANSACTION │
                         └────────┬───────────┘
                                  │
                                  ▼
                         ┌────────────────────────────┐
                         │  1. Get all car IDs        │
                         │     for this business      │
                         └────────┬───────────────────┘
                                  │
                                  ▼
                         ┌────────────────────────────┐
                         │  2. Delete car images      │
                         │     • Remove files         │
                         │     • Delete DB records    │
                         └────────┬───────────────────┘
                                  │
                                  ▼
                         ┌────────────────────────────┐
                         │  3. Delete business images │
                         │     • Remove files         │
                         │     • Delete DB records    │
                         └────────┬───────────────────┘
                                  │
                                  ▼
                         ┌────────────────────────────┐
                         │  4. Delete cover image     │
                         │     • Remove file          │
                         └────────┬───────────────────┘
                                  │
                                  ▼
                         ┌────────────────────────────┐
                         │  5. DELETE FROM bookings   │
                         │     WHERE business_id = ?  │
                         └────────┬───────────────────┘
                                  │
                                  ▼
                         ┌────────────────────────────┐
                         │  6. DELETE FROM cars       │
                         │     WHERE business_id = ?  │
                         └────────┬───────────────────┘
                                  │
                                  ▼
                         ┌────────────────────────────┐
                         │  7. DELETE FROM businesses │
                         │     WHERE business_id = ?  │
                         └────────┬───────────────────┘
                                  │
                                  ▼
                         ┌────────────────────┐
                         │  COMMIT TRANSACTION│
                         └────────┬───────────┘
                                  │
                                  ▼
                         ┌──────────────────────┐
                         │  200 OK Response     │
                         │  {                   │
                         │    "message": "Business deleted", │
                         │    "deleted_business_id": 5,      │
                         │    "deleted_resources": {         │
                         │      "cars": 12,                  │
                         │      "images": 8                  │
                         │    }                              │
                         │  }                                │
                         └──────────┬─────────────────────────┘
                                    │
                                    ▼
                         Frontend redirects to businesses list
                         Shows success message
```

---

## 🔐 Authentication Flow (APPLIES TO BOTH APIS)

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

   API Request
        │
        ▼
   ┌──────────────────────────┐
   │  Extract Bearer Token    │
   │  from Authorization      │
   │  header                  │
   └──────────┬───────────────┘
              │
              ├──→ ❌ No token? → 401 Unauthorized
              │
              └──→ ✅ Token exists
                     │
                     ▼
              ┌──────────────────┐
              │  Verify JWT      │
              │  with secret key │
              └──────┬───────────┘
                     │
                     ├──→ ❌ Invalid/Expired? → 403 Forbidden
                     │
                     └──→ ✅ Valid token
                            │
                            ▼
                     ┌────────────────────┐
                     │  Extract user info │
                     │  • user_id         │
                     │  • role            │
                     └────────┬───────────┘
                              │
                              ▼
                     ┌────────────────────────────┐
                     │  Query business ownership  │
                     │  SELECT user_id            │
                     │  FROM businesses           │
                     │  WHERE business_id = ?     │
                     └────────┬───────────────────┘
                              │
                              ▼
                     ┌────────────────────────────┐
                     │  Check Authorization       │
                     │                            │
                     │  Is user owner?            │
                     │  OR                        │
                     │  Is super_admin?           │
                     └────────┬───────────────────┘
                              │
                              ├──→ ❌ No → 403 Forbidden
                              │          "Not authorized"
                              │
                              └──→ ✅ Yes → Continue to handler
```

---

## 📊 Database Cascade Delete Structure

```
┌─────────────────────────────────────────────────────────────┐
│              DATABASE RELATIONSHIPS                          │
└─────────────────────────────────────────────────────────────┘

         ┌──────────────────┐
         │   businesses     │
         │  (business_id)   │
         └────────┬─────────┘
                  │
         ┌────────┴────────────────────────┐
         │                                 │
         ▼                                 ▼
   ┌──────────┐                   ┌─────────────────┐
   │   cars   │                   │ business_images │
   │ (car_id) │                   └─────────────────┘
   └────┬─────┘                           │
        │                                 ▼
   ┌────┴───────────────┐          [Delete files
   │                    │           from filesystem]
   ▼                    ▼
┌─────────────┐   ┌───────────┐
│ car_images  │   │ bookings  │
└─────────────┘   └───────────┘
       │
       ▼
[Delete files
 from filesystem]

DELETE ORDER (from bottom up):
1. car_images (DB records + files)
2. business_images (DB records + files)  
3. bookings
4. cars
5. businesses
```

---

## 🎨 Frontend Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND COMPONENT HIERARCHY                    │
└─────────────────────────────────────────────────────────────┘

   SearchHero Component
         │
         ├── City Select Dropdown
         │
         ├── Date Pickers
         │
         ├── Search Button
         │
         └── Results Section
                 │
                 ├── BusinessMap Component
                 │        │
                 │        ├── Leaflet Map
                 │        │     │
                 │        │     └── Markers (pins)
                 │        │          │
                 │        │          └── onClick → setSelectedBusiness()
                 │        │
                 │        └── Popup (on marker hover)
                 │
                 └── {selectedBusiness && (
                       <Card> ← ✅ NEW!
                         │
                         ├── Business Name
                         ├── Address
                         ├── Car Count
                         │
                         ├── <Button> Open Agency </Button>
                         │      │
                         │      └── onClick: navigate(`/agency/${id}`)
                         │
                         └── <Button> Close </Button>
                                │
                                └── onClick: setSelectedBusiness(null)
                       </Card>
                     )}
```

---

## 📱 Responsive Design Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 RESPONSIVE BEHAVIOR                          │
└─────────────────────────────────────────────────────────────┘

Mobile (< 768px)                Desktop (≥ 768px)
─────────────────               ─────────────────

┌─────────────────┐             ┌─────────────────────────────┐
│   Search Form   │             │      Search Form            │
└─────────────────┘             └─────────────────────────────┘

┌─────────────────┐             ┌─────────────────────────────┐
│                 │             │                             │
│   🗺️  Map      │             │        🗺️  Map             │
│                 │             │                             │
│   📍 📍 📍     │             │     📍    📍    📍         │
│                 │             │                             │
│ ┌─────────────┐ │             │         ┌─────────────────┐│
│ │Business Card││             │         │ Business Card   ││
│ │(full width) ││             │         │ (bottom-right)  ││
│ └─────────────┘ │             │         └─────────────────┘│
└─────────────────┘             └─────────────────────────────┘

┌─────────────────┐             ┌─────────────────────────────┐
│  Search Results │             │      Search Results         │
│  (stacked)      │             │      (grid layout)          │
└─────────────────┘             └─────────────────────────────┘
```

---

## ⚡ Performance & Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                OPTIMIZATION STRATEGIES                       │
└─────────────────────────────────────────────────────────────┘

1. Map Loading
   │
   ├── Lazy load Leaflet library (CDN)
   ├── Only load when city is selected
   ├── Cache tile images (browser)
   └── Reuse map instance (don't recreate)

2. Business Data
   │
   ├── Fetch all businesses once on mount
   ├── Filter client-side by city
   ├── Cache in state (don't refetch)
   └── Use indexed queries on backend

3. Image Loading
   │
   ├── Lazy load car images
   ├── Use appropriate image sizes
   ├── Compress images (backend)
   └── CDN for static assets (production)

4. Delete Operations
   │
   ├── Use database transactions
   ├── Batch file deletions
   ├── Background cleanup (optional)
   └── Soft delete option (future)

5. API Calls
   │
   ├── Debounce search inputs
   ├── Cancel previous requests
   ├── Show loading states
   └── Handle errors gracefully
```

---

## 🔄 State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                           │
└─────────────────────────────────────────────────────────────┘

SearchHero Component State:
┌────────────────────────────────┐
│ const [state, setState] = ...  │
│                                │
│ • startDate                    │
│ • endDate                      │
│ • location (city)              │
│ • carType                      │
│ • passengers                   │
│ • searchResults                │
│ • hasSearched                  │
│ • isSearching                  │
│ • businesses (all)             │
│ • cityBusinesses (filtered)    │
│ • selectedBusiness ← ✅ NEW!   │
│ • selectedCar                  │
│ • showBookingModal             │
└────────────────────────────────┘

State Updates Flow:
─────────────────

location changes
     │
     ▼
Filter businesses → setCityBusinesses()
     │
     ▼
Map re-renders with new pins
     │
     ▼
User clicks pin → setSelectedBusiness(business)
     │
     ▼
Details card appears
     │
     ├──→ User clicks "Open Agency"
     │         │
     │         └──→ navigate() → State cleared (new page)
     │
     └──→ User clicks "Close"
               │
               └──→ setSelectedBusiness(null) → Card disappears
```

---

**Visual diagrams created**: February 26, 2026  
**Version**: 1.0  
**Status**: Map feature ✅ Implemented | APIs 📝 Documented

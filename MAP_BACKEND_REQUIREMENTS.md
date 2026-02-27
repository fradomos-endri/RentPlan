# Map Feature - Backend Requirements

## Overview
The map feature displays rental agency locations on an interactive map when users search for cars in a specific city. Each business is shown with a pin marker that can be clicked to view details.

## Required Backend Data

### 1. Business/Agency Endpoint Updates

Your existing `/api/businesses` endpoint needs to include the following fields for each business:

```json
{
  "business_id": 1,
  "business_name": "Premium Car Rentals",
  "address": "Rruga Nene Tereza 15",  // Street address
  "city": "Shkodër",                   // City name (must match Albanian cities list)
  "latitude": 42.0682,                 // ⚠️ REQUIRED NEW FIELD
  "longitude": 19.5126,                // ⚠️ REQUIRED NEW FIELD
  "vat_number": "J61234567A",          // VAT number
  "cover_image": "uploads/business-covers/abc123.jpg",  // Optional: Business cover image
  "phone": "+355 69 123 4567",         // Optional
  "email": "info@premiumrentals.al"    // Optional
}
```

### 2. New Fields Required

#### **latitude** (DECIMAL, required)
- Type: `DECIMAL(10, 8)` or `FLOAT`
- Description: Latitude coordinate of the business location
- Example: `42.0682` (for Shkodër)
- Range: 39.0 to 43.0 (for Albania)

#### **longitude** (DECIMAL, required)
- Type: `DECIMAL(11, 8)` or `FLOAT`
- Description: Longitude coordinate of the business location
- Example: `19.5126` (for Shkodër)
- Range: 19.0 to 21.0 (for Albania)

### 3. Optional Enhancement: Car Count per Business

Add a field showing how many cars are available at each business location:

```json
{
  "business_id": 1,
  "business_name": "Premium Car Rentals",
  "location": "Shkodër",
  "latitude": 42.0682,
  "longitude": 19.5126,
  "car_count": 12  // ⚠️ OPTIONAL: Number of cars available
}
```

This can be calculated with a JOIN query or subquery in your businesses endpoint.

## Database Schema Changes

### Migration SQL Example

```sql
-- Add new columns to businesses table
ALTER TABLE businesses 
ADD COLUMN address VARCHAR(255),
ADD COLUMN city VARCHAR(100),
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- If you have an old 'location' column, you can migrate the data
UPDATE businesses SET city = location WHERE city IS NULL;

-- Create indexes for location-based queries (optional, for performance)
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_coordinates ON businesses(latitude, longitude);
```

## Albanian City Coordinates Reference

Here are the coordinates for all Albanian cities in the system:

| City | Latitude | Longitude |
|------|----------|-----------|
| Tirana | 41.3275 | 19.8187 |
| Durrës | 41.3231 | 19.4569 |
| Vlorë | 40.4686 | 19.4914 |
| Elbasan | 41.1125 | 20.0822 |
| Shkodër | 42.0682 | 19.5126 |
| Fier | 40.7239 | 19.5558 |
| Korçë | 40.6186 | 20.7814 |
| Berat | 40.7058 | 19.9522 |
| Lushnjë | 40.9419 | 19.7028 |
| Kavajë | 41.1850 | 19.5569 |
| Pogradec | 40.9022 | 20.6522 |
| Laç | 41.6353 | 19.7131 |
| Kukës | 42.0772 | 20.4211 |
| Lezhë | 41.7836 | 19.6436 |
| Patos | 40.6833 | 19.6167 |
| Krujë | 41.5092 | 19.7928 |
| Kuçovë | 40.8006 | 19.9167 |
| Burrel | 41.6103 | 20.0089 |
| Cërrik | 41.0219 | 19.9808 |
| Sarandë | 39.8753 | 20.0056 |
| Gjirokastër | 40.0758 | 20.1389 |
| Përmet | 40.2364 | 20.3517 |
| Tepelenë | 40.2975 | 20.0194 |
| Gramsh | 40.8697 | 20.1842 |
| Librazhd | 41.1828 | 20.3169 |
| Peshkopi | 41.6850 | 20.4289 |
| Bulqizë | 41.4917 | 20.2208 |

## API Response Example

### GET `/api/businesses`

```json
[
  {
    "business_id": 1,
    "user_id": 5,
    "business_name": "Premium Car Rentals Shkodër",
    "location": "Shkodër",
    "latitude": 42.0682,
    "longitude": 19.5126,
    "address": "Rruga Kole Idromeno 45, Shkodër 4001",
    "phone": "+355 69 123 4567",
    "email": "info@premiumrentals.al",
    "description": "Premium car rental service in Shkodër",
    "car_count": 12
  },
  {
    "business_id": 2,
    "user_id": 8,
    "business_name": "Elite Auto Rent Shkodër",
    "location": "Shkodër",
    "latitude": 42.0695,
    "longitude": 19.5140,
    "address": "Rruga Marin Barleti 23, Shkodër 4001",
    "phone": "+355 69 987 6543",
    "email": "contact@eliteauto.al",
    "description": "Luxury and economy car rentals",
    "car_count": 8
  }
]
```

## How the Frontend Uses This Data

1. **User searches with city filter** (e.g., "Shkodër")
2. **Frontend fetches businesses** from `/api/businesses` 
3. **Frontend filters businesses** by matching `location` field to selected city
4. **Map displays pins** at each business's `latitude` and `longitude`
5. **User clicks pin** → Shows popup with:
   - Business name
   - Location/address
   - Car count (if available)

## Testing Checklist

- [ ] Add `latitude` and `longitude` columns to businesses table
- [ ] Update existing business records with correct coordinates
- [ ] Verify `/api/businesses` returns lat/lng in response
- [ ] Test that businesses filter correctly by city name
- [ ] Optional: Add `car_count` calculation to businesses endpoint
- [ ] Optional: Add full `address` field for more detailed popups

## Notes

- The map uses **OpenStreetMap** (free, no API key required)
- The map loads via CDN (Leaflet.js) - no npm package needed
- Coordinates are cached in frontend for Albanian cities
- If a business has no coordinates, it won't appear on the map
- The `location` field must exactly match one of the 27 Albanian cities in the system

## Future Enhancements (Optional)

1. **Geocoding API**: Auto-generate coordinates from business address
2. **Clustering**: Group nearby businesses when zoomed out
3. **Directions**: Add "Get Directions" button in popup
4. **Business hours**: Show opening hours in map popup
5. **Photos**: Display business photos in popup
6. **Filter by rating**: Show only highly-rated businesses

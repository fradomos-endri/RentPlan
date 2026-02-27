# 📖 API Documentation Index

Welcome to the RentPlan API documentation! This index helps you find the right documentation for your needs.

---

## 🗂️ Table of Contents

### Quick References
- [API Quick Reference](./API_QUICK_REF.md) - How to update API URL
- [Business API Quick Reference](./BUSINESS_API_QUICK_REF.md) - Update & Delete endpoints cheat sheet

### Core Features
- [API Configuration Guide](./API_CONFIG_GUIDE.md) - Centralized API configuration
- [Business Update & Delete API](./BUSINESS_UPDATE_DELETE_API.md) - Full documentation for business management
- [Map Backend Requirements](./MAP_BACKEND_REQUIREMENTS.md) - Location & coordinate system
- [Location Picker Feature](./LOCATION_PICKER_FEATURE.md) - Interactive map for business creation

### Special Features
- [Booking Calendar Integration](./BOOKING_CALENDAR_API_INTEGRATION.md) - Booking system
- [Car Blocking Feature](./CAR_BLOCKING_FEATURE.md) - Block cars from availability
- [City Filtering Guide](./CITY_FILTERING_GUIDE.md) - Location-based search

### Security & Architecture
- [Security Fix Summary](./SECURITY_FIX_SUMMARY.md) - Authentication & authorization
- [Profile Security Fix](./PROFILE_SECURITY_FIX.md) - User profile security
- [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md) - System architecture

---

## 🚀 Getting Started

### 1. Configure API URL
Start here: [API_QUICK_REF.md](./API_QUICK_REF.md)

Change the API base URL in `src/config/api.ts`:
```typescript
export const API_BASE_URL = 'http://YOUR_IP:3000';
```

### 2. Authentication
See: [SECURITY_FIX_SUMMARY.md](./SECURITY_FIX_SUMMARY.md)

All protected endpoints require a JWT token:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 📋 API Endpoints Overview

### Business Management

| Endpoint | Method | Auth | Description | Documentation |
|----------|--------|------|-------------|---------------|
| `/api/businesses` | GET | No | List all businesses | [MAP_BACKEND_REQUIREMENTS.md](./MAP_BACKEND_REQUIREMENTS.md) |
| `/api/businesses` | POST | Yes | Create business | [LOCATION_PICKER_FEATURE.md](./LOCATION_PICKER_FEATURE.md) |
| `/api/businesses/:id` | GET | No | Get business details | - |
| `/api/businesses/:id` | PUT | Yes | Update business | [BUSINESS_UPDATE_DELETE_API.md](./BUSINESS_UPDATE_DELETE_API.md) |
| `/api/businesses/:id` | DELETE | Yes | Delete business | [BUSINESS_UPDATE_DELETE_API.md](./BUSINESS_UPDATE_DELETE_API.md) |
| `/api/businesses/user` | GET | Yes | Get user's businesses | [SECURITY_FIX_SUMMARY.md](./SECURITY_FIX_SUMMARY.md) |
| `/api/businesses/:id/cover-image` | GET | No | Get cover image | - |
| `/api/businesses/:id/images` | GET | No | Get gallery images | - |

### Car Management

| Endpoint | Method | Auth | Description | Documentation |
|----------|--------|------|-------------|---------------|
| `/api/cars` | GET | No | List all cars | - |
| `/api/cars` | POST | Yes | Create car | - |
| `/api/cars/:id` | GET | No | Get car details | - |
| `/api/cars/:id` | PUT | Yes | Update car | - |
| `/api/cars/:id` | DELETE | Yes | Delete car | - |
| `/api/cars/search/advanced` | GET | No | Advanced search | [CITY_FILTERING_GUIDE.md](./CITY_FILTERING_GUIDE.md) |
| `/api/cars/:id/cover-image` | GET | No | Get car cover image | - |
| `/api/car-blocks` | POST | Yes | Block car dates | [CAR_BLOCKING_FEATURE.md](./CAR_BLOCKING_FEATURE.md) |
| `/api/car-blocks/:carId` | GET | No | Get blocked dates | [CAR_BLOCKING_FEATURE.md](./CAR_BLOCKING_FEATURE.md) |

### User Management

| Endpoint | Method | Auth | Description | Documentation |
|----------|--------|------|-------------|---------------|
| `/api/users/register` | POST | No | Register new user | [SECURITY_FIX_SUMMARY.md](./SECURITY_FIX_SUMMARY.md) |
| `/api/users/login` | POST | No | Login user | [SECURITY_FIX_SUMMARY.md](./SECURITY_FIX_SUMMARY.md) |
| `/api/users/:id` | GET | Yes | Get user profile | [PROFILE_SECURITY_FIX.md](./PROFILE_SECURITY_FIX.md) |
| `/api/users/:id` | PUT | Yes | Update profile | [PROFILE_SECURITY_FIX.md](./PROFILE_SECURITY_FIX.md) |
| `/api/users/:id/upgrade-to-business` | POST | Yes | Upgrade to business account | - |

### Booking Management

| Endpoint | Method | Auth | Description | Documentation |
|----------|--------|------|-------------|---------------|
| `/api/bookings` | GET | Yes | List bookings | [BOOKING_CALENDAR_API_INTEGRATION.md](./BOOKING_CALENDAR_API_INTEGRATION.md) |
| `/api/bookings` | POST | Yes | Create booking | [BOOKING_CALENDAR_API_INTEGRATION.md](./BOOKING_CALENDAR_API_INTEGRATION.md) |
| `/api/bookings/:id` | GET | Yes | Get booking details | - |
| `/api/bookings/:id` | PUT | Yes | Update booking | - |
| `/api/bookings/:id` | DELETE | Yes | Cancel booking | - |
| `/api/bookings/business/:id` | GET | Yes | Get business bookings | - |

---

## 🔐 Authentication Flow

```
1. User registers → POST /api/users/register
2. User logs in → POST /api/users/login → Receives JWT token
3. Store token in localStorage
4. Include token in all protected requests:
   Authorization: Bearer <token>
```

---

## 🗺️ Location & Coordinates

### Albanian Cities Supported (27)
```
Tirana, Durrës, Vlorë, Elbasan, Shkodër, Fier, Korçë, Berat,
Lushnjë, Kavajë, Pogradec, Laç, Kukës, Lezhë, Patos, Krujë,
Kuçovë, Burrel, Cërrik, Sarandë, Gjirokastër, Përmet, Tepelenë,
Gramsh, Librazhd, Peshkopi, Bulqizë
```

### Coordinate Bounds
- **Latitude**: 39.0 to 43.0 (Albania)
- **Longitude**: 19.0 to 21.0 (Albania)

See: [MAP_BACKEND_REQUIREMENTS.md](./MAP_BACKEND_REQUIREMENTS.md)

---

## 🎯 Common Use Cases

### Create a Business with Location
1. Read: [LOCATION_PICKER_FEATURE.md](./LOCATION_PICKER_FEATURE.md)
2. Frontend shows interactive map
3. User clicks to place pin → Gets coordinates
4. POST `/api/businesses` with coordinates

### Update Business Details
1. Read: [BUSINESS_UPDATE_DELETE_API.md](./BUSINESS_UPDATE_DELETE_API.md)
2. PUT `/api/businesses/:id` with updated fields
3. Only sends fields that changed

### Delete a Business
1. Read: [BUSINESS_UPDATE_DELETE_API.md](./BUSINESS_UPDATE_DELETE_API.md)
2. Check for active bookings first
3. DELETE `/api/businesses/:id`
4. Cascades to cars, images, bookings

### Search Cars by City
1. Read: [CITY_FILTERING_GUIDE.md](./CITY_FILTERING_GUIDE.md)
2. GET `/api/cars/search/advanced?city=Shkodër&start_date=...&end_date=...`
3. Returns available cars in that city

### Block Car Dates
1. Read: [CAR_BLOCKING_FEATURE.md](./CAR_BLOCKING_FEATURE.md)
2. POST `/api/car-blocks` with car_id, start_date, end_date
3. Car becomes unavailable for those dates

---

## 📝 Request Examples

### Update Business (JavaScript)
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/businesses/5', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    business_name: 'Updated Name',
    city: 'Tirana',
    latitude: 41.3275,
    longitude: 19.8187
  })
});

const result = await response.json();
```

### Delete Business (JavaScript)
```javascript
const token = localStorage.getItem('token');

if (confirm('Delete this business? This cannot be undone.')) {
  const response = await fetch('http://localhost:3000/api/businesses/5', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  console.log(result.message); // "Business deleted successfully"
}
```

---

## 🛠️ Development Tools

### View API Settings in Browser
Navigate to: `http://localhost:5173/api-settings`

See current configuration and all available endpoints.

### Test with cURL
```bash
# Get all businesses
curl http://localhost:3000/api/businesses

# Update business
curl -X PUT http://localhost:3000/api/businesses/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"business_name": "New Name"}'

# Delete business
curl -X DELETE http://localhost:3000/api/businesses/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚨 Important Notes

### Security
- ✅ Always validate user permissions before update/delete
- ✅ Use parameterized queries to prevent SQL injection
- ✅ Validate and sanitize all inputs
- ✅ Rate limit API endpoints in production

### Data Integrity
- ✅ Use database transactions for complex operations
- ✅ Cascade deletes properly (cars → images → bookings)
- ✅ Check for active bookings before deletion
- ✅ Backup data before destructive operations

### Performance
- ✅ Add indexes on frequently queried columns
- ✅ Paginate large result sets
- ✅ Cache coordinate lookups
- ✅ Optimize image serving

---

## 📞 Support & Contributions

For questions or issues:
1. Check the relevant documentation file
2. Review the implementation examples
3. Test with the provided cURL commands
4. Check browser console for errors

---

## 📚 Documentation Files

All documentation files in this project:

```
API_QUICK_REF.md                      - API URL configuration quick reference
API_CONFIG_GUIDE.md                   - Detailed API configuration guide
BUSINESS_API_QUICK_REF.md            - Business API endpoints cheat sheet
BUSINESS_UPDATE_DELETE_API.md        - Full Update & Delete documentation
MAP_BACKEND_REQUIREMENTS.md          - Location/coordinate requirements
LOCATION_PICKER_FEATURE.md           - Interactive location picker
BOOKING_CALENDAR_API_INTEGRATION.md  - Booking system integration
CAR_BLOCKING_FEATURE.md              - Car blocking functionality
CITY_FILTERING_GUIDE.md              - City-based filtering
SECURITY_FIX_SUMMARY.md              - Authentication & authorization
PROFILE_SECURITY_FIX.md              - User profile security
ARCHITECTURE_DIAGRAM.md              - System architecture overview
```

---

**Last Updated**: February 26, 2026  
**Project**: RentPlan - Car Rental Platform  
**Version**: 1.0

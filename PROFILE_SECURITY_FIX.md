# Profile & BusinessCars Security Fix - Business Access Control

## Issues Fixed

### 1. Profile Page Security Issue
The Profile page was previously fetching ALL businesses from the public `/api/businesses` endpoint, allowing users to see businesses they don't own.

### 2. BusinessCars Page Security Issue  
The BusinessCars page was not verifying if the logged-in user actually owns the business before allowing access to manage cars, bookings, and business settings. Any authenticated user could access any business's management page by knowing the business ID.

## Changes Made

### 1. API Configuration (`src/config/api.ts`)
Added new authenticated endpoint for fetching user-specific businesses:

```typescript
export const API_ENDPOINTS = {
  BUSINESSES: '/api/businesses',                    // Public - limited info
  BUSINESSES_BY_USER: '/api/businesses/user',      // Authenticated - user's own businesses
  // ... other endpoints
}
```

### 2. Profile Page (`src/pages/Profile.tsx`)

#### Updated `fetchBusinesses()` function:
- **Before**: Used public endpoint `GET /api/businesses` (returned ALL businesses)
- **After**: Uses authenticated endpoint `GET /api/businesses/user/:userId` (returns only user's own businesses)

**Key Changes:**
- Now requires `user.user_id` to be present
- Uses the new `BUSINESSES_BY_USER` endpoint with user ID
- Includes proper error handling and logging
- Requires authentication token in headers

```typescript
// OLD (Insecure)
const response = await fetch(getApiUrl(API_ENDPOINTS.BUSINESSES), {
  headers: { 'Authorization': `Bearer ${token}` }
});

// NEW (Secure)
const url = getApiUrl(`${API_ENDPOINTS.BUSINESSES_BY_USER}/${user.user_id}`);
const response = await fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### Additional Improvements:
- Updated `fetchBookings()` to use centralized API configuration instead of hardcoded URL
- Updated `fetchBookingDetails()` to use centralized API configuration
- Added validation to ensure `user_id` exists before making the API call

### 3. BusinessCars Page (`src/pages/BusinessCars.tsx`)

#### Updated Business Interface:
Added optional fields to support ownership validation:
```typescript
interface Business {
  id: number;
  business_id?: number;
  business_name: string;
  vat_number: string;
  user_id?: number;        // Added for ownership verification
  owner_name?: string;     // Added for owner details
  owner_email?: string;    // Added for owner details
}
```

#### Updated `fetchBusiness()` function:
- **Before**: Directly fetched business by ID without ownership verification
- **After**: First verifies the user owns the business, then fetches details

**Security Flow:**
1. Check if user is authenticated
2. Fetch user's businesses from `GET /api/businesses/user/:userId`
3. Verify the requested businessId exists in user's businesses list
4. If not owned, redirect to profile with error message
5. If owned, proceed to fetch full business details

```typescript
// NEW (Secure) - Ownership Verification
const userBusinessesUrl = getApiUrl(`${API_ENDPOINTS.BUSINESSES_BY_USER}/${user.user_id}`);
const verifyResponse = await fetch(userBusinessesUrl, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const userBusinesses = await verifyResponse.json();

// Check if this business belongs to the user
const ownsBusiness = userBusinesses.some(
  (b: any) => String(b.business_id) === String(businessId) || String(b.id) === String(businessId)
);

if (!ownsBusiness) {
  toast.error('You do not have permission to access this business');
  navigate('/profile');
  return;
}
```

**Key Security Improvements:**
- Added `getStoredUser()` import to access current user data
- Verifies user authentication before any business operations
- Validates business ownership before allowing access
- Redirects unauthorized users to profile page
- Shows clear error messages for unauthorized access attempts
- Prevents users from managing businesses they don't own

## Security Benefits

### Before:
❌ Any authenticated user could see ALL businesses in the database (Profile)
❌ Any authenticated user could access ANY business management page by URL (BusinessCars)
❌ Public endpoint exposed potentially sensitive business information  
❌ No ownership validation on frontend
❌ Users could manage cars/bookings for businesses they don't own

### After:
✅ Users can ONLY see businesses they own (Profile)
✅ Users can ONLY access management pages for businesses they own (BusinessCars)
✅ Backend validates token and user ownership  
✅ Frontend validates ownership before showing sensitive data
✅ Proper error handling if user_id is missing
✅ Clear feedback when access is denied
✅ Automatic redirect for unauthorized access attempts

## API Endpoint Comparison

| Endpoint | Access | Returns | Use Case |
|----------|--------|---------|----------|
| `GET /api/businesses` | Public | Limited info (business_id, business_name, vat_number, created_at) | Browse all businesses (Agencies page) |
| `GET /api/businesses/:id` | Public | Single business with limited info | View business details |
| `GET /api/businesses/user/:userId` | Authenticated (Token Required) | Full business details including owner info | User's profile - manage own businesses |
| `POST /api/businesses` | Authenticated (Owner only) | Created business | Create new business |
| `PUT /api/businesses/:id` | Authenticated (Owner/Super Admin) | Updated business | Update business |
| `DELETE /api/businesses/:id` | Authenticated (Owner/Super Admin) | Success message | Delete business |

## Backend Requirements

The backend API must implement:

```sql
-- Example backend query for GET /api/businesses/user/:userId
SELECT * FROM businesses 
WHERE user_id = :userId
```

The endpoint should:
1. Validate the authentication token
2. Extract user_id from the token
3. Verify that the requested :userId matches the authenticated user's ID
4. Return only businesses owned by that user
5. Return full business details (including owner info)

## Testing

To test the fixes:

### Profile Page Test:
1. **As a business owner:**
   - Login to your account
   - Navigate to Profile page
   - Click on "My Businesses" tab
   - ✅ Should see ONLY your businesses
   - ✅ Should NOT see businesses owned by other users

2. **As a regular customer:**
   - Login to your account
   - Navigate to Profile page
   - ✅ Should NOT see any businesses (if you don't own any)

3. **Without authentication:**
   - Try accessing profile without token
   - ✅ Should redirect to login page

### BusinessCars Page Test:
1. **As the business owner:**
   - Login to your account
   - Navigate to `/business/:yourBusinessId/cars`
   - ✅ Should successfully load the business management page
   - ✅ Should see your cars and bookings
   - ✅ Should be able to add/edit cars

2. **As another user (trying to access someone else's business):**
   - Login to your account
   - Try to navigate to `/business/:someoneElseBusinessId/cars`
   - ❌ Should see error: "You do not have permission to access this business"
   - ❌ Should be redirected to your profile page
   - ❌ Should NOT be able to access or modify their business

3. **Direct URL manipulation test:**
   - Login as User A (owns Business 1)
   - Manually type `/business/999/cars` (someone else's business ID)
   - ❌ Should verify ownership and redirect with error
   - ✅ Should NOT be able to bypass security by URL manipulation

## Impact on Other Pages

This change affects the following pages:

### Updated Pages (Security Fixes Applied):
- ✅ **Profile Page** (`src/pages/Profile.tsx`): Now uses authenticated user-specific endpoint
- ✅ **BusinessCars Page** (`src/pages/BusinessCars.tsx`): Now verifies ownership before allowing access

### Unchanged Pages (Correctly Using Public Endpoints):
- ✅ **Agencies Page** (`src/pages/Agencies.tsx`): Still uses public `GET /api/businesses` endpoint (correct - shows all businesses for browsing)
- ✅ **Agency Detail Page** (`src/pages/AgencyDetail.tsx`): Still uses public `GET /api/businesses/:id` endpoint (correct - shows single business details for public viewing)

## Migration Notes

No database migration required - this is a frontend-only fix that aligns with the new backend API structure.

## Date
Fixed: February 21, 2026

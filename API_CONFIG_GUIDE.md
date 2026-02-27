# API Configuration Guide

## Overview
This project now has centralized API configuration management. All API URLs are managed in a single location, making it easy to update when your IP address changes.

## Quick Start

### How to Change the API URL

1. **Open the config file:**
   ```
   src/config/api.ts
   ```

2. **Update the API_BASE_URL:**
   ```typescript
   export const API_BASE_URL = 'http://YOUR_NEW_IP:3000';
   ```

3. **Save the file** - The changes will be reflected immediately across the entire application!

## File Structure

```
src/
├── config/
│   └── api.ts          # ⭐ API configuration file (UPDATE THIS!)
├── pages/
│   ├── ApiSettings.tsx # View current API configuration
│   └── ...
```

## Configuration File (`src/config/api.ts`)

The configuration file exports:

- **`API_BASE_URL`**: The base URL for your API server
- **`getApiUrl(endpoint)`**: Helper function to build full URLs
- **`API_ENDPOINTS`**: Common endpoint paths

Example:
```typescript
export const API_BASE_URL = 'http://192.168.1.107:3000';

export const API_ENDPOINTS = {
  BUSINESSES: '/api/businesses',
  CARS: '/api/cars',
  USERS_LOGIN: '/api/users/login',
  USERS_REGISTER: '/api/users/register',
};
```

## View API Settings Page

You can view the current API configuration in your browser:

1. Navigate to: `http://localhost:5173/api-settings` (or your dev server URL)
2. You'll see:
   - Current API Base URL
   - Instructions on how to update it
   - List of all available endpoints

## Files Updated

The following files have been updated to use the centralized configuration:

- ✅ `src/pages/Index.tsx`
- ✅ `src/pages/Agencies.tsx`
- ✅ `src/pages/AgencyDetail.tsx`
- ✅ `src/pages/Login.tsx`
- ✅ `src/pages/Signup.tsx`
- ✅ `src/pages/Profile.tsx`
- ✅ `src/pages/Cars.tsx`
- ✅ `src/pages/AgencyAdminDashboard.tsx`

## Usage Examples

### In your components:

```typescript
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

// Fetch businesses
const response = await fetch(getApiUrl(API_ENDPOINTS.BUSINESSES));

// Fetch cars
const response = await fetch(getApiUrl(API_ENDPOINTS.CARS));

// Custom endpoint
const response = await fetch(getApiUrl('/api/custom/endpoint'));
```

## Benefits

1. ✅ **Single Source of Truth**: Update API URL in one place
2. ✅ **No More Searching**: No need to hunt through files to find hardcoded URLs
3. ✅ **Type Safety**: Predefined endpoint constants prevent typos
4. ✅ **Easy Maintenance**: Simple to manage when IP changes frequently
5. ✅ **Developer Friendly**: Clear structure and documentation

## Common Scenarios

### Scenario 1: IP Address Changed
1. Open `src/config/api.ts`
2. Update `API_BASE_URL` with new IP
3. Save - Done! 🎉

### Scenario 2: Switching Between Development and Production
You can modify the config to automatically switch:

```typescript
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://192.168.1.107:3000'  // Local development
  : 'https://api.production.com'; // Production
```

### Scenario 3: Using Environment Variables
For even more flexibility:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.107:3000';
```

Then create a `.env` file:
```
VITE_API_URL=http://192.168.1.107:3000
```

## Need Help?

- Visit `/api-settings` in your browser to see current configuration
- Check the console for any API-related errors
- All API calls now use the centralized configuration

---

**Last Updated**: February 2026

# 🎯 Quick Reference: Business Update & Delete APIs

## Update Business

```http
PUT /api/businesses/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Example
```json
{
  "business_name": "Premium Car Rentals Updated",
  "address": "Rruga Nene Tereza 20",
  "city": "Shkodër",
  "latitude": 42.0685,
  "longitude": 19.5130,
  "vat_number": "J61234567B"
}
```

### Success (200 OK)
```json
{
  "message": "Business updated successfully",
  "business": { /* updated business object */ }
}
```

### Errors
- **401**: Missing/invalid token
- **403**: Not business owner or super admin
- **404**: Business not found
- **409**: VAT number already exists

---

## Delete Business

```http
DELETE /api/businesses/:id
Authorization: Bearer <token>
```

### Request Example
```bash
DELETE /api/businesses/5
```

### Success (200 OK)
```json
{
  "message": "Business deleted successfully",
  "deleted_business_id": 5,
  "deleted_resources": {
    "cars": 12,
    "images": 8
  }
}
```

### Errors
- **401**: Missing/invalid token
- **403**: Not business owner or super admin
- **404**: Business not found
- **409**: Active bookings exist

---

## Authorization

Both endpoints require:
- ✅ Valid JWT token
- ✅ User must be business owner OR super admin

---

## Key Features

### Update API
- ✅ Update any business field (name, address, coordinates, etc.)
- ✅ Validates city against Albanian cities list
- ✅ Checks coordinate bounds (lat: 39-43, lng: 19-21)
- ✅ Ensures VAT number uniqueness
- ✅ Only updates fields provided in request

### Delete API
- ✅ Cascades to delete cars, images, bookings
- ✅ Prevents deletion if active bookings exist
- ✅ Removes image files from filesystem
- ✅ Uses database transactions for safety
- ✅ Returns count of deleted resources

---

## Testing with cURL

### Update
```bash
curl -X PUT http://localhost:3000/api/businesses/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"business_name": "New Name", "city": "Tirana"}'
```

### Delete
```bash
curl -X DELETE http://localhost:3000/api/businesses/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Integration

### Update Business
```typescript
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

const updateBusiness = async (businessId: number, updates: any) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessId}`),
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    }
  );

  if (!response.ok) throw new Error('Update failed');
  return await response.json();
};
```

### Delete Business
```typescript
const deleteBusiness = async (businessId: number) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${businessId}`),
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) throw new Error('Delete failed');
  return await response.json();
};
```

---

## 🚨 Important

**Before Deleting:**
- Backup important data
- Check for active bookings
- Inform affected users

**When Updating:**
- Validate coordinates match city
- Ensure VAT format is correct
- Only send fields being changed

---

For detailed documentation, see [BUSINESS_UPDATE_DELETE_API.md](./BUSINESS_UPDATE_DELETE_API.md)

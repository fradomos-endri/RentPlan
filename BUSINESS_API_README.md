# 🎯 Business Management API - README

## Quick Start

### 🗺️ Map Enhancement (Frontend) - LIVE NOW!

**What**: Click map pins to see business details and navigate to agency pages

**Try it**:
1. Start dev server: `npm run dev`
2. Go to homepage
3. Select a city (e.g., "Shkodër")
4. Click any pin on the map
5. See business details card appear
6. Click "Open Agency" button

**Status**: ✅ **IMPLEMENTED AND WORKING**

---

### 📋 Update & Delete APIs (Backend) - READY TO IMPLEMENT

**What**: Full CRUD operations for business management

**Documentation**:
- 📘 Full Guide: [BUSINESS_UPDATE_DELETE_API.md](./BUSINESS_UPDATE_DELETE_API.md)
- 🎯 Quick Ref: [BUSINESS_API_QUICK_REF.md](./BUSINESS_API_QUICK_REF.md)
- 📖 All APIs: [API_DOCUMENTATION_INDEX.md](./API_DOCUMENTATION_INDEX.md)

**Status**: 📝 **DOCUMENTED - READY FOR BACKEND IMPLEMENTATION**

---

## 📚 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| [BUSINESS_UPDATE_DELETE_API.md](./BUSINESS_UPDATE_DELETE_API.md) | Complete API implementation guide | Backend developers |
| [BUSINESS_API_QUICK_REF.md](./BUSINESS_API_QUICK_REF.md) | Quick reference cheat sheet | All developers |
| [API_DOCUMENTATION_INDEX.md](./API_DOCUMENTATION_INDEX.md) | Master index of all APIs | All developers |
| [IMPLEMENTATION_SUMMARY_BUSINESS_API.md](./IMPLEMENTATION_SUMMARY_BUSINESS_API.md) | What was implemented | Project managers |

---

## 🚀 API Endpoints

### Update Business
```http
PUT /api/businesses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "business_name": "Premium Car Rentals Updated",
  "address": "Rruga Nene Tereza 20",
  "city": "Shkodër",
  "latitude": 42.0685,
  "longitude": 19.5130,
  "vat_number": "J61234567B"
}
```

**Response**: `200 OK` with updated business object

**Auth**: Business owner or super admin

**Docs**: [BUSINESS_UPDATE_DELETE_API.md](./BUSINESS_UPDATE_DELETE_API.md#-update-business-api)

---

### Delete Business
```http
DELETE /api/businesses/:id
Authorization: Bearer <token>
```

**Response**: `200 OK` with deletion summary

**Auth**: Business owner or super admin

**Features**:
- ✅ Cascade deletes cars, images, bookings
- ✅ Prevents deletion if active bookings exist
- ✅ Removes files from filesystem
- ✅ Uses database transactions

**Docs**: [BUSINESS_UPDATE_DELETE_API.md](./BUSINESS_UPDATE_DELETE_API.md#️-delete-business-api)

---

## 🧪 Testing

### Quick Test Commands

```bash
# Update business
curl -X PUT http://localhost:3000/api/businesses/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"business_name": "New Name", "city": "Tirana"}'

# Delete business
curl -X DELETE http://localhost:3000/api/businesses/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

More examples: [BUSINESS_API_QUICK_REF.md](./BUSINESS_API_QUICK_REF.md#testing-with-curl)

---

## 🎯 For Backend Developers

### Implementation Steps

1. **Read the full documentation**:
   - [BUSINESS_UPDATE_DELETE_API.md](./BUSINESS_UPDATE_DELETE_API.md)

2. **Add the routes**:
   ```javascript
   router.put('/businesses/:id', authenticateToken, updateBusinessHandler);
   router.delete('/businesses/:id', authenticateToken, deleteBusinessHandler);
   ```

3. **Copy the implementation code**:
   - Full code examples provided in documentation
   - Includes validation, authorization, error handling
   - Database transactions for delete

4. **Run database migrations**:
   ```sql
   ALTER TABLE businesses 
   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
   
   CREATE INDEX idx_businesses_user_id ON businesses(user_id);
   ```

5. **Test with cURL**:
   - Use provided test commands
   - Verify all error cases
   - Test authorization

---

## 🎨 For Frontend Developers

### Map Feature (Already Done! ✅)

The map now shows business details when you click pins. Code in:
- `src/components/SearchHero.tsx`

### Adding Update/Delete UI

When backend is ready, integrate like this:

```typescript
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

// Update business
const handleUpdate = async (businessId: number, updates: any) => {
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
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
};

// Delete business
const handleDelete = async (businessId: number) => {
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
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
};
```

More examples: [BUSINESS_UPDATE_DELETE_API.md](./BUSINESS_UPDATE_DELETE_API.md#javascript-fetch-examples)

---

## 🔐 Security Notes

### Authentication Required
Both endpoints require:
- ✅ Valid JWT token in Authorization header
- ✅ User must be business owner OR super admin

### Validation
- ✅ City must be one of 27 Albanian cities
- ✅ Coordinates must be within Albania bounds
- ✅ VAT number must be unique
- ✅ All inputs sanitized

### Data Protection
- ✅ Database transactions prevent partial deletes
- ✅ Cascade deletes properly configured
- ✅ Files removed from filesystem
- ✅ Active bookings prevent deletion

---

## 🗺️ Albanian Cities Supported

```
Tirana, Durrës, Vlorë, Elbasan, Shkodër, Fier, Korçë, Berat,
Lushnjë, Kavajë, Pogradec, Laç, Kukës, Lezhë, Patos, Krujë,
Kuçovë, Burrel, Cërrik, Sarandë, Gjirokastër, Përmet, Tepelenë,
Gramsh, Librazhd, Peshkopi, Bulqizë
```

**Coordinate Bounds**:
- Latitude: 39.0 to 43.0
- Longitude: 19.0 to 21.0

---

## 📋 Checklist

### Frontend ✅
- [x] Map pin click shows business details
- [x] "Open Agency" button navigation
- [x] Responsive details card UI
- [ ] Add update/delete UI buttons (when backend ready)
- [ ] Add confirmation dialogs

### Backend ⏳
- [ ] Implement PUT `/api/businesses/:id`
- [ ] Implement DELETE `/api/businesses/:id`
- [ ] Add validation middleware
- [ ] Run database migrations
- [ ] Test with provided examples
- [ ] Deploy to staging

### Testing ⏳
- [ ] Test update with valid data
- [ ] Test update with invalid data
- [ ] Test unauthorized update attempts
- [ ] Test delete with no active bookings
- [ ] Test delete prevention with active bookings
- [ ] Test cascade delete
- [ ] Test file cleanup

---

## 🎉 What's Working Now

1. ✅ **Interactive Map**: Shows businesses in selected city
2. ✅ **Clickable Pins**: Click to see business details
3. ✅ **Business Details Card**: Shows name, location, car count
4. ✅ **Navigation**: "Open Agency" button works
5. ✅ **Complete Documentation**: Ready for backend implementation

---

## 📞 Need Help?

1. **API Questions**: See [BUSINESS_UPDATE_DELETE_API.md](./BUSINESS_UPDATE_DELETE_API.md)
2. **Quick Reference**: See [BUSINESS_API_QUICK_REF.md](./BUSINESS_API_QUICK_REF.md)
3. **All Endpoints**: See [API_DOCUMENTATION_INDEX.md](./API_DOCUMENTATION_INDEX.md)
4. **What Changed**: See [IMPLEMENTATION_SUMMARY_BUSINESS_API.md](./IMPLEMENTATION_SUMMARY_BUSINESS_API.md)

---

## 🚀 Next Steps

1. **Backend Team**: Implement the two endpoints using provided code
2. **Frontend Team**: Prepare UI for update/delete operations
3. **QA Team**: Test map feature and prepare test cases for APIs
4. **All**: Review documentation and provide feedback

---

**Last Updated**: February 26, 2026  
**Status**: Map feature ✅ Complete | APIs 📝 Documented & Ready  
**Version**: 1.0

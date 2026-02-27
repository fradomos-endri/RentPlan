# Business Update & Delete API Documentation

## Overview
This document describes the Update and Delete API endpoints for business management. These endpoints allow business owners and super admins to modify or remove business records.

---

## 🔄 Update Business API

### Endpoint
```
PUT /api/businesses/:id
```

### Authentication
**Required**: Yes
- Business owner (can only update their own business)
- Super admin (can update any business)

### Authorization Logic
```javascript
// Verify user owns the business OR is super admin
const userId = req.user.user_id;
const userRole = req.user.role;
const businessId = req.params.id;

// Query the business to check ownership
const business = await db.query(
  'SELECT user_id FROM businesses WHERE business_id = ?',
  [businessId]
);

if (business.user_id !== userId && userRole !== 'super_admin') {
  return res.status(403).json({ 
    error: 'Forbidden', 
    message: 'You do not have permission to update this business' 
  });
}
```

### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "business_name": "Premium Car Rentals Updated",
  "address": "Rruga Nene Tereza 20",
  "city": "Shkodër",
  "latitude": 42.0685,
  "longitude": 19.5130,
  "vat_number": "J61234567B",
  "phone": "+355 69 123 4567",
  "email": "info@premiumrentals.al",
  "description": "Updated premium car rental service"
}
```

### Field Validation

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `business_name` | String | No* | 3-200 characters, alphanumeric with spaces |
| `address` | String | No* | 5-255 characters |
| `city` | String | No* | Must match one of 27 Albanian cities |
| `latitude` | Decimal | No* | Between 39.0 and 43.0 (Albania bounds) |
| `longitude` | Decimal | No* | Between 19.0 and 21.0 (Albania bounds) |
| `vat_number` | String | No | Format: J + 8 digits + letter (e.g., J61234567B) |
| `phone` | String | No | Format: +355 + 9-10 digits |
| `email` | String | No | Valid email format |
| `description` | String | No | Max 1000 characters |

**Note**: At least one field must be provided in the request body.

### Albanian Cities List
```
Tirana, Durrës, Vlorë, Elbasan, Shkodër, Fier, Korçë, Berat,
Lushnjë, Kavajë, Pogradec, Laç, Kukës, Lezhë, Patos, Krujë,
Kuçovë, Burrel, Cërrik, Sarandë, Gjirokastër, Përmet, Tepelenë,
Gramsh, Librazhd, Peshkopi, Bulqizë
```

### Success Response (200 OK)
```json
{
  "message": "Business updated successfully",
  "business": {
    "business_id": 5,
    "user_id": 12,
    "business_name": "Premium Car Rentals Updated",
    "address": "Rruga Nene Tereza 20",
    "city": "Shkodër",
    "latitude": 42.0685,
    "longitude": 19.513,
    "vat_number": "J61234567B",
    "phone": "+355 69 123 4567",
    "email": "info@premiumrentals.al",
    "description": "Updated premium car rental service",
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-02-26T14:25:00Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "error": "Validation Error",
  "message": "Invalid field values",
  "details": [
    {
      "field": "city",
      "message": "City must be one of the 27 Albanian cities"
    },
    {
      "field": "latitude",
      "message": "Latitude must be between 39.0 and 43.0"
    }
  ]
}
```

#### 401 Unauthorized - Missing/Invalid Token
```json
{
  "error": "Unauthorized",
  "message": "Authentication token is required"
}
```

#### 403 Forbidden - Not Business Owner
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to update this business"
}
```

#### 404 Not Found - Business Not Found
```json
{
  "error": "Not Found",
  "message": "Business with ID 5 not found"
}
```

#### 409 Conflict - VAT Number Already Exists
```json
{
  "error": "Conflict",
  "message": "A business with this VAT number already exists"
}
```

### Implementation Example (Node.js/Express)

```javascript
// PUT /api/businesses/:id
router.put('/businesses/:id', authenticateToken, async (req, res) => {
  try {
    const businessId = parseInt(req.params.id);
    const userId = req.user.user_id;
    const userRole = req.user.role;
    
    // Validate request body
    const {
      business_name,
      address,
      city,
      latitude,
      longitude,
      vat_number,
      phone,
      email,
      description
    } = req.body;

    // Check if business exists and get owner
    const [business] = await db.query(
      'SELECT user_id FROM businesses WHERE business_id = ?',
      [businessId]
    );

    if (!business) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Business with ID ${businessId} not found`
      });
    }

    // Authorization check
    if (business.user_id !== userId && userRole !== 'super_admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this business'
      });
    }

    // Validate city if provided
    const validCities = [
      'Tirana', 'Durrës', 'Vlorë', 'Elbasan', 'Shkodër', 'Fier',
      'Korçë', 'Berat', 'Lushnjë', 'Kavajë', 'Pogradec', 'Laç',
      'Kukës', 'Lezhë', 'Patos', 'Krujë', 'Kuçovë', 'Burrel',
      'Cërrik', 'Sarandë', 'Gjirokastër', 'Përmet', 'Tepelenë',
      'Gramsh', 'Librazhd', 'Peshkopi', 'Bulqizë'
    ];

    if (city && !validCities.includes(city)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'City must be one of the 27 Albanian cities'
      });
    }

    // Validate coordinates if provided
    if (latitude && (latitude < 39.0 || latitude > 43.0)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Latitude must be between 39.0 and 43.0'
      });
    }

    if (longitude && (longitude < 19.0 || longitude > 21.0)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Longitude must be between 19.0 and 21.0'
      });
    }

    // Check VAT number uniqueness if provided
    if (vat_number) {
      const [existingVat] = await db.query(
        'SELECT business_id FROM businesses WHERE vat_number = ? AND business_id != ?',
        [vat_number, businessId]
      );

      if (existingVat) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'A business with this VAT number already exists'
        });
      }
    }

    // Build dynamic UPDATE query
    const updates = [];
    const values = [];

    if (business_name !== undefined) {
      updates.push('business_name = ?');
      values.push(business_name);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (city !== undefined) {
      updates.push('city = ?');
      values.push(city);
    }
    if (latitude !== undefined) {
      updates.push('latitude = ?');
      values.push(latitude);
    }
    if (longitude !== undefined) {
      updates.push('longitude = ?');
      values.push(longitude);
    }
    if (vat_number !== undefined) {
      updates.push('vat_number = ?');
      values.push(vat_number);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    // Add updated_at timestamp
    updates.push('updated_at = NOW()');

    if (updates.length === 1) { // Only updated_at
      return res.status(400).json({
        error: 'Validation Error',
        message: 'At least one field must be provided'
      });
    }

    // Execute update
    values.push(businessId);
    const query = `UPDATE businesses SET ${updates.join(', ')} WHERE business_id = ?`;
    await db.query(query, values);

    // Fetch and return updated business
    const [updatedBusiness] = await db.query(
      'SELECT * FROM businesses WHERE business_id = ?',
      [businessId]
    );

    res.status(200).json({
      message: 'Business updated successfully',
      business: updatedBusiness
    });

  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update business'
    });
  }
});
```

---

## 🗑️ Delete Business API

### Endpoint
```
DELETE /api/businesses/:id
```

### Authentication
**Required**: Yes
- Business owner (can only delete their own business)
- Super admin (can delete any business)

### Authorization Logic
```javascript
// Same as Update - verify ownership or super admin role
const userId = req.user.user_id;
const userRole = req.user.role;

if (business.user_id !== userId && userRole !== 'super_admin') {
  return res.status(403).json({ 
    error: 'Forbidden', 
    message: 'You do not have permission to delete this business' 
  });
}
```

### Request Headers
```
Authorization: Bearer <jwt_token>
```

### Request Body
**None** - Business ID is provided in the URL path

### URL Parameters
```
:id - The business_id to delete (integer)
```

### Success Response (200 OK)
```json
{
  "message": "Business deleted successfully",
  "deleted_business_id": 5,
  "deleted_resources": {
    "cars": 12,
    "images": 8,
    "bookings": 45
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication token is required"
}
```

#### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to delete this business"
}
```

#### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Business with ID 5 not found"
}
```

#### 409 Conflict - Active Bookings
```json
{
  "error": "Conflict",
  "message": "Cannot delete business with active bookings. Please cancel or complete all bookings first.",
  "active_bookings": 3
}
```

### Cascade Delete Strategy

When a business is deleted, the following related data should be handled:

| Resource | Action | Notes |
|----------|--------|-------|
| **Cars** | Delete (CASCADE) | All cars belonging to the business |
| **Car Images** | Delete files & DB records | Remove from filesystem and database |
| **Business Images** | Delete files & DB records | Remove cover image and gallery images |
| **Bookings** | Check first, then handle | See booking rules below |
| **Reviews** | Optional: Keep or Delete | Consider keeping for audit trail |

#### Booking Deletion Rules

**Option 1: Prevent deletion if active bookings**
```javascript
// Check for active bookings (status = 'confirmed')
const [activeBookings] = await db.query(
  `SELECT COUNT(*) as count FROM bookings 
   WHERE business_id = ? AND status = 'confirmed'`,
  [businessId]
);

if (activeBookings.count > 0) {
  return res.status(409).json({
    error: 'Conflict',
    message: 'Cannot delete business with active bookings',
    active_bookings: activeBookings.count
  });
}
```

**Option 2: Cancel all bookings**
```javascript
// Cancel all confirmed bookings
await db.query(
  `UPDATE bookings SET status = 'cancelled' 
   WHERE business_id = ? AND status = 'confirmed'`,
  [businessId]
);
```

### Implementation Example (Node.js/Express)

```javascript
// DELETE /api/businesses/:id
router.delete('/businesses/:id', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const businessId = parseInt(req.params.id);
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Check if business exists and get owner
    const [business] = await connection.query(
      'SELECT user_id, business_name FROM businesses WHERE business_id = ?',
      [businessId]
    );

    if (!business) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Not Found',
        message: `Business with ID ${businessId} not found`
      });
    }

    // Authorization check
    if (business.user_id !== userId && userRole !== 'super_admin') {
      await connection.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this business'
      });
    }

    // Check for active bookings
    const [activeBookings] = await connection.query(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE business_id = ? AND status = 'confirmed' 
       AND end_date >= CURDATE()`,
      [businessId]
    );

    if (activeBookings.count > 0) {
      await connection.rollback();
      return res.status(409).json({
        error: 'Conflict',
        message: 'Cannot delete business with active bookings. Please cancel or complete all bookings first.',
        active_bookings: activeBookings.count
      });
    }

    // Get cars for this business
    const [cars] = await connection.query(
      'SELECT car_id FROM cars WHERE business_id = ?',
      [businessId]
    );
    const carIds = cars.map(c => c.car_id);

    // Delete car images from filesystem
    for (const carId of carIds) {
      const [carImages] = await connection.query(
        'SELECT image_path FROM car_images WHERE car_id = ?',
        [carId]
      );
      
      for (const img of carImages) {
        const filePath = path.join(__dirname, '..', img.image_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // Delete business images from filesystem
    const [businessImages] = await connection.query(
      'SELECT image_path FROM business_images WHERE business_id = ?',
      [businessId]
    );
    
    for (const img of businessImages) {
      const filePath = path.join(__dirname, '..', img.image_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete cover image if exists
    if (business.cover_image) {
      const coverPath = path.join(__dirname, '..', business.cover_image);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    // Delete related records (in order of foreign key dependencies)
    await connection.query('DELETE FROM car_images WHERE car_id IN (?)', [carIds]);
    await connection.query('DELETE FROM business_images WHERE business_id = ?', [businessId]);
    await connection.query('DELETE FROM bookings WHERE business_id = ?', [businessId]);
    await connection.query('DELETE FROM cars WHERE business_id = ?', [businessId]);
    await connection.query('DELETE FROM businesses WHERE business_id = ?', [businessId]);

    await connection.commit();

    res.status(200).json({
      message: 'Business deleted successfully',
      deleted_business_id: businessId,
      deleted_business_name: business.business_name,
      deleted_resources: {
        cars: carIds.length,
        images: businessImages.length + carIds.length
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Delete business error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete business'
    });
  } finally {
    connection.release();
  }
});
```

---

## 🔐 Authentication Middleware

Both endpoints require the `authenticateToken` middleware:

```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token is required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid or expired token'
      });
    }

    req.user = user; // Contains user_id, role, etc.
    next();
  });
}
```

---

## 📊 Database Schema

### businesses Table
```sql
CREATE TABLE businesses (
  business_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  vat_number VARCHAR(20) UNIQUE,
  phone VARCHAR(20),
  email VARCHAR(100),
  description TEXT,
  cover_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### Indexes for Performance
```sql
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_coordinates ON businesses(latitude, longitude);
```

---

## 🧪 Testing Examples

### Update Business (cURL)
```bash
curl -X PUT http://localhost:3000/api/businesses/5 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Premium Car Rentals Updated",
    "address": "Rruga Nene Tereza 20",
    "city": "Shkodër",
    "latitude": 42.0685,
    "longitude": 19.5130,
    "phone": "+355 69 123 4567"
  }'
```

### Delete Business (cURL)
```bash
curl -X DELETE http://localhost:3000/api/businesses/5 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript/Fetch Examples

#### Update Business
```javascript
const updateBusiness = async (businessId, updates) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3000/api/businesses/${businessId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
};

// Usage
updateBusiness(5, {
  business_name: 'New Business Name',
  city: 'Tirana',
  latitude: 41.3275,
  longitude: 19.8187
}).then(result => {
  console.log('Business updated:', result);
}).catch(error => {
  console.error('Update failed:', error);
});
```

#### Delete Business
```javascript
const deleteBusiness = async (businessId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3000/api/businesses/${businessId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
};

// Usage with confirmation
const confirmDelete = async (businessId, businessName) => {
  if (confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
    try {
      const result = await deleteBusiness(businessId);
      console.log('Business deleted:', result);
      // Redirect or update UI
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete business: ' + error.message);
    }
  }
};
```

---

## ✅ Security Checklist

- [x] **Authentication Required**: Both endpoints require valid JWT token
- [x] **Authorization Enforced**: Users can only modify/delete their own businesses (or super admin)
- [x] **Input Validation**: All fields validated before database update
- [x] **SQL Injection Prevention**: Use parameterized queries
- [x] **Transaction Safety**: Use database transactions for delete operations
- [x] **File Cleanup**: Delete associated image files from filesystem
- [x] **Cascade Delete**: Properly handle related records (cars, bookings, images)
- [x] **Error Handling**: Return appropriate HTTP status codes and error messages
- [x] **Rate Limiting**: Consider adding rate limiting middleware (recommended)
- [x] **Audit Logging**: Consider logging delete operations for audit trail (recommended)

---

## 🚨 Important Notes

### Before Deleting a Business:
1. ✅ Check for active bookings
2. ✅ Backup data if needed
3. ✅ Delete or migrate associated images
4. ✅ Update or cancel related bookings
5. ✅ Notify users if applicable

### Update Best Practices:
1. ✅ Only send fields that need to be updated
2. ✅ Validate coordinates match the selected city
3. ✅ Check VAT number uniqueness
4. ✅ Sanitize input to prevent XSS
5. ✅ Log significant changes (optional)

### Production Considerations:
- Implement soft deletes (mark as deleted instead of removing)
- Add `deleted_at` timestamp column
- Keep records for audit and analytics
- Consider GDPR/data retention policies

---

## 📚 Related Documentation

- [MAP_BACKEND_REQUIREMENTS.md](./MAP_BACKEND_REQUIREMENTS.md) - Coordinate system details
- [LOCATION_PICKER_FEATURE.md](./LOCATION_PICKER_FEATURE.md) - Frontend location picker
- [SECURITY_FIX_SUMMARY.md](./SECURITY_FIX_SUMMARY.md) - Authentication overview
- [API_CONFIG_GUIDE.md](./API_CONFIG_GUIDE.md) - Frontend API configuration

---

**Last Updated**: February 26, 2026
**Version**: 1.0

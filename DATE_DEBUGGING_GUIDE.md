# Date Blocking Debugging Guide

## How to Test and Debug Date Blocking

### Step-by-Step Testing

1. **Open Browser Developer Console**
   - Press F12 or Right-click → Inspect
   - Go to the "Console" tab

2. **Click on Date 12 to Block**
   - Hover over date 12 in the calendar
   - Click the Ban (🚫) icon that appears

3. **Check Console Logs - Should See:**
   ```
   Opening block modal for date: [Date Object] formatted as: 2024-XX-12
   ```
   ✅ **VERIFY:** The formatted date shows "12" not "11"

4. **Check the Modal Date Fields**
   - Start Date field should show: `2024-XX-12`
   - End Date field should show: `2024-XX-12`
   - ✅ **VERIFY:** Both show date 12

5. **Click "Block Dates" Button**

6. **Check Console Logs - Should See:**
   ```
   Creating block with data: {
     car_id: X,
     start_date: "2024-XX-12",
     end_date: "2024-XX-12",
     reason: ""
   }
   ```
   ✅ **VERIFY:** start_date and end_date are both "2024-XX-12"

7. **After Block is Created - Should See:**
   ```
   Block created successfully: {
     block_id: XXX,
     car_id: X,
     start_date: "2024-XX-12",
     end_date: "2024-XX-12",
     ...
   }
   ```
   ✅ **VERIFY:** The response has "2024-XX-12"

8. **Check Console for Block Fetch:**
   ```
   Fetched blocks for car X: [
     {
       block_id: XXX,
       start_date: "2024-XX-12",
       end_date: "2024-XX-12",
       ...
     }
   ]
   ```
   ✅ **VERIFY:** The fetched block has "2024-XX-12"

9. **Look at the Calendar**
   - Date 12 should be highlighted in red/pink with a red border
   - ✅ **VERIFY:** Date 12 is blocked, NOT date 11

10. **Hover Over Blocked Date**
    ```
    Block found for date: 2024-XX-12 Block: {
      start: "2024-XX-12",
      end: "2024-XX-12",
      reason: ""
    }
    ```
    ✅ **VERIFY:** The block is for date 12

---

## If Date 11 is Still Being Blocked

### Check These Things:

#### 1. **Server-Side Issue**
The problem might be in the backend API, not the frontend.

**Check the Network Tab:**
- Open Developer Tools → Network tab
- Click to block date 12
- Find the POST request to `/api/car-blocks`
- Click on it → "Payload" tab
- **Verify the payload shows:**
  ```json
  {
    "car_id": X,
    "start_date": "2024-XX-12",
    "end_date": "2024-XX-12",
    "reason": ""
  }
  ```

If the payload is correct but the server returns date 11, then **the backend has a timezone issue**.

#### 2. **Database Timezone**
Check if the database is storing dates correctly:
- The `start_date` and `end_date` columns should be `DATE` type, not `DATETIME` or `TIMESTAMP`
- If they're `DATETIME`, the database might be converting the date

#### 3. **Backend Date Handling**
Check your backend code for:
```javascript
// ❌ WRONG - This converts to UTC
new Date(dateString).toISOString()

// ✅ CORRECT - Keep as date string
dateString // "2024-XX-12"
```

---

## Expected Console Output (Complete Flow)

```
1. Opening block modal for date: Thu Mar 12 2024 00:00:00 GMT+0100 formatted as: 2024-03-12

2. Creating block with data: {
     car_id: 5,
     start_date: "2024-03-12",
     end_date: "2024-03-12",
     reason: ""
   }

3. Block created successfully: {
     block_id: 123,
     car_id: 5,
     start_date: "2024-03-12",
     end_date: "2024-03-12",
     created_at: "2024-03-12T10:30:00.000Z"
   }

4. Fetched blocks for car 5: [
     {
       block_id: 123,
       car_id: 5,
       start_date: "2024-03-12",
       end_date: "2024-03-12",
       reason: "",
       created_at: "2024-03-12T10:30:00.000Z"
     }
   ]

5. All car blocks: [
     { block_id: 123, car_id: 5, start_date: "2024-03-12", ... }
   ]

6. Block found for date: 2024-03-12 Block: {
     start: "2024-03-12",
     end: "2024-03-12",
     reason: ""
   }
```

**All dates should consistently show "12" throughout this flow!**

---

## Quick Fix Checklist

- [ ] Frontend sends: `"2024-03-12"`
- [ ] Network request shows: `"2024-03-12"`
- [ ] Backend receives: `"2024-03-12"`
- [ ] Database stores: `2024-03-12`
- [ ] Backend returns: `"2024-03-12"`
- [ ] Frontend receives: `"2024-03-12"`
- [ ] Calendar displays block on: date 12

**If ANY step shows date 11 instead of 12, that's where the bug is!**

---

## Common Causes

### Frontend Issues (Should be Fixed Now):
✅ Using `.toISOString()` → Fixed with `formatDateLocal()`
✅ Creating Date objects incorrectly → Fixed
✅ Timezone conversions → Fixed

### Backend Issues (Check These):

1. **Date Parsing:**
```javascript
// ❌ WRONG
const date = new Date(req.body.start_date);
// This interprets "2024-03-12" as UTC, might shift by 1 day

// ✅ CORRECT
const start_date = req.body.start_date;
// Use the string directly: "2024-03-12"
```

2. **Database Query:**
```sql
-- ✅ CORRECT - Use DATE columns
CREATE TABLE car_blocks (
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

-- ❌ WRONG - TIMESTAMP can cause issues
CREATE TABLE car_blocks (
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL
);
```

3. **ORM/Query Builder:**
```javascript
// Make sure your ORM doesn't convert DATE to DATETIME
// Check Sequelize/TypeORM/Prisma settings
```

---

## If Problem Persists

1. **Clear browser cache** and reload
2. **Check server logs** for the exact values being saved
3. **Query the database directly:**
   ```sql
   SELECT * FROM car_blocks ORDER BY created_at DESC LIMIT 1;
   ```
   Check if `start_date` shows "2024-03-12" or "2024-03-11"

4. **Share the console logs** from steps 1-10 above to identify where the conversion happens

---

## Contact Points

If you're still seeing date 11 when clicking date 12:

1. Copy ALL console logs from the test above
2. Check the Network tab payload and response
3. Check what's actually in the database
4. This will tell us if it's a frontend, backend, or database issue

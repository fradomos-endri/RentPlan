# Car Blocking Feature - Quick Visual Guide

## 🎯 Quick Overview

The Car Blocking feature allows you to mark specific dates when your cars are unavailable for rental (maintenance, repairs, personal use, etc.).

---

## 📍 Location

**Business Cars Page → Calendar View**

Navigate to: Your Business → Cars → Calendar View

---

## 🎨 Visual Elements

### Calendar Date States

```
┌─────────────────────────────────────────────────────────────┐
│  CALENDAR COLOR GUIDE                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🟩 Green (Gradient)    → Check-in Day                      │
│  🟥 Rose (Gradient)     → Check-out Day                     │
│  🟢 Green (Solid)       → Confirmed Booking                 │
│  🟡 Yellow              → Pending Booking                   │
│  🔴 Red/Pink + Border   → BLOCKED (Unavailable)             │
│  ⚪ Gray                → Cancelled Booking                  │
│  🔵 Blue Border         → Today                             │
│  ⬜ White               → Available                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Blocked Date Appearance

```
┌──────────────────────────┐
│  5                    🚫 │  ← Ban icon indicator
│  ═══════════════════════ │
│  BLOCKED                 │  ← "BLOCKED" label
│  Car in maintenance      │  ← Reason (if provided)
│                          │
└──────────────────────────┘
   Red/Pink background with red border
```

---

## 🖱️ How to Block a Car

### Method 1: Quick Block from Calendar

```
1. Hover over ANY available date (white background)
   
   ┌──────────────────────────┐
   │  15            [🚫]      │  ← Ban button appears on hover
   │                          │
   └──────────────────────────┘

2. Click the Ban icon (🚫)

3. Modal opens with date pre-filled
   
   ┌─────────────────────────────────────┐
   │  🚫 Block Car Dates                 │
   │  ─────────────────────────────────  │
   │                                     │
   │  Car: [BMW 5 Series - ABC123  ▼]  │
   │  Start Date: [2024-03-15]          │
   │  End Date: [2024-03-15]            │
   │  Reason: [Optional text...]        │
   │                                     │
   │  [🚫 Block Dates]  [Cancel]        │
   └─────────────────────────────────────┘

4. Fill in details and click "Block Dates"
```

---

## 👁️ View Block Details

```
Click on any blocked date:

┌──────────────────────────┐
│  15                   🚫 │  ← Click here
│  ═══════════════════════ │
│  BLOCKED                 │
│  Car in maintenance      │
└──────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│  🚫 Block Details                   │
│  ─────────────────────────────────  │
│                                     │
│  Car: BMW 5 Series (ABC123)        │
│                                     │
│  Start: March 15, 2024             │
│  End: March 20, 2024               │
│                                     │
│  Reason: Car in maintenance        │
│                                     │
│  Created: March 1, 2024, 10:30 AM  │
│                                     │
│  [🗑️ Remove Block]  [Close]        │
└─────────────────────────────────────┘
```

---

## 🗑️ Remove a Block

```
From Block Details Modal:

1. Click on blocked date → Modal opens
2. Click "Remove Block" button
3. Block is deleted
4. Calendar updates immediately
5. Dates become available again
```

---

## 📅 Calendar Layout Example

```
════════════════════════════════════════════════════════════════
              MARCH 2024 - BMW 5 Series                        
════════════════════════════════════════════════════════════════
 SUN    MON    TUE    WED    THU    FRI    SAT
────────────────────────────────────────────────────────────────
        1      2      3      4      5      6
      Avail  Avail  Avail  Avail  Avail  Avail

 7      8      9      10     11     12     13
 Avail  Avail  🚫     🚫     🚫     Avail  Avail
              BLOCK  BLOCK  BLOCK
              Maint. Maint. Maint.

 14     15     16     17     18     19     20
 Avail  🟩     🟢     🟢     🟢     🟥     Avail
        Check  Book   Book   Book   Check
        -In    John   John   John   -Out

 21     22     23     24     25     26     27
 Avail  Avail  Avail  🟡     🟡     Avail  Avail
                      Pend   Pend
                      Sarah  Sarah
────────────────────────────────────────────────────────────────

Legend:
🟩 = Check-in   🟥 = Check-out   🟢 = Confirmed   
🟡 = Pending    🚫 = Blocked     ⬜ = Available
```

---

## ⚡ Quick Actions Summary

| Action | Method | Result |
|--------|--------|--------|
| **Block Date** | Hover → Click 🚫 icon | Opens block modal |
| **View Block** | Click blocked date | Shows block details |
| **Remove Block** | Block details → Remove | Unblocks dates |
| **Navigate Month** | ← Prev / Next → | Change month |
| **Filter by Car** | Left sidebar | Show specific car |

---

## 💡 Pro Tips

1. **Hover to Block**: Quickly block dates by hovering and clicking the ban icon
2. **Add Reasons**: Always add a reason to track why cars are blocked
3. **Plan Ahead**: Block maintenance dates in advance
4. **Check Conflicts**: View the calendar before blocking to avoid customer bookings
5. **Use Details**: Click blocked dates to see full information and manage blocks

---

## 🎯 Common Use Cases

### Maintenance Schedule
```
Block: March 15-17
Reason: "Regular maintenance service"
```

### Repair Work
```
Block: March 20-25
Reason: "Engine repair at dealership"
```

### Personal Use
```
Block: March 28-30
Reason: "Personal use - family trip"
```

### Seasonal Storage
```
Block: November 1 - March 31
Reason: "Winter storage"
```

---

## ⚠️ Important Notes

- ✅ Only car owners can block their cars
- ✅ Blocked dates appear as unavailable to customers
- ✅ Blocks prevent new bookings
- ✅ Existing bookings must be managed separately
- ✅ Blocks are instantly visible in the calendar
- ✅ End date must be after or equal to start date

---

## 🆘 Troubleshooting

**Problem**: Can't create a block
- **Solution**: Ensure you're logged in as the car owner
- **Solution**: Check that end date is after start date
- **Solution**: Verify the car is selected

**Problem**: Block button doesn't appear
- **Solution**: Hover longer over the date cell
- **Solution**: Make sure you're in Calendar View
- **Solution**: Ensure the date is not already booked/blocked

**Problem**: Block doesn't show in calendar
- **Solution**: Refresh the page
- **Solution**: Check the correct month is displayed
- **Solution**: Verify the car filter (not filtering to wrong car)

---

## 📱 Mobile Support

The blocking feature works on mobile devices:
- Tap instead of hover to reveal the block button
- Swipe to navigate months
- Tap blocked dates to view details
- Full modal support for creating/viewing blocks

---

## ✨ Best Practices

1. **Regular Review**: Check your blocks monthly
2. **Clear Reasons**: Use descriptive reasons for team clarity  
3. **Remove Unused**: Delete blocks when no longer needed
4. **Plan Ahead**: Block dates as soon as you know about them
5. **Customer Service**: Keep blocked periods reasonable

---

For detailed technical documentation, see: `CAR_BLOCKING_FEATURE.md`

# 🎯 Quick Reference: API Configuration

## 📍 Where to Update API URL

**File Location:**
```
src/config/api.ts
```

**Current URL:**
```typescript
export const API_BASE_URL = 'http://192.168.1.107:3000';
```

## ⚡ Quick Steps When IP Changes

1. Open `src/config/api.ts`
2. Change the IP address in `API_BASE_URL`
3. Save the file
4. ✅ Done! All API calls automatically use the new URL

## 🌐 View Settings in Browser

Visit: **`/api-settings`** (e.g., `http://localhost:5173/api-settings`)

This page shows:
- Current API configuration
- All available endpoints
- How to update the URL

## 📝 Example Update

**Before:**
```typescript
export const API_BASE_URL = 'http://192.168.1.107:3000';
```

**After (when your IP changes to 192.168.1.200):**
```typescript
export const API_BASE_URL = 'http://192.168.1.200:3000';
```

That's it! No need to search through other files. 🎉

---

For more details, see [API_CONFIG_GUIDE.md](./API_CONFIG_GUIDE.md)

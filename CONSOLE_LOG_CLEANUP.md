# Console.log Cleanup for Production

This document lists all console.log statements that need to be commented out for production deployment.

## Files with console.log statements:

### ✅ Already Fixed:
1. `app/home/trip/[id]/page.jsx` - Line 39 ✅
2. `components/website/tripsPage/CheckoutPages.jsx` - Lines 45, 86, 88, 190 ✅
3. `lib/apis/couponApi.js` - Lines 137, 166, 179 ✅

### 🔧 Needs Fixing:

#### lib/apis/couponApi.js
- Line 191: `console.log(formattedData);`
- Line 207: `console.log("Created coupon:", data);`
- Line 245: `console.log("Updated coupon:", data);`
- Line 309: `console.log("Patched coupon:", data);`
- Line 338: `console.log(\`Coupons with active status \${status}:\`, data);`
- Line 371: `console.log(\`Coupons with type \${type}:\`, data);`
- Line 464: `console.log("Applied coupon:", data);`
- Line 469: `console.log("Applied coupon data:", data?.data);`

#### lib/apis/api.js
- Line 61: `console.log("data:", data.data);`
- Line 74: `console.log(url, token);`
- Line 92: `console.log("data:", data.data);`
- Line 126: `console.log("data:", data);`
- Line 153: `console.log(data);`
- Line 179: `console.log(data);`
- Line 208: `console.log(updated);`
- Line 220: `console.log(props.tripData);`
- Line 238: `console.log(data);`
- Line 263: `console.log(data);`
- Line 286: `console.log(data);`
- Line 310: `console.log(data);`
- Line 334: `console.log(data);`
- Line 358: `console.log(data);`
- Line 386: `console.log(data);`
- Line 408: `console.log(data);`
- Line 432: `console.log(data);`
- Line 455: `console.log(data);`
- Line 478: `console.log(data);`

#### lib/apis/authApi.js
- Line 28: `console.log("revoke failed (ignored):", e);`

#### lib/apis/tripsApi.jsx
- Line 10: `console.log(response)`

#### app/dashboard/bookings/page.jsx
- Line 90: `console.log(error);`

#### app/dashboard/gate/page.jsx
- Line 76: `console.log(response.data);`
- Line 82: `console.log(error);`
- Line 91: `console.log(response.data);`
- Line 97: `console.log(error);`
- Line 108: `console.log(\`\${decoded.bid}\`);`

## How to Fix:

Run this PowerShell command from the project root to comment out all console.log statements:

```powershell
$files = @(
  'lib\apis\couponApi.js',
  'lib\apis\api.js', 
  'lib\apis\authApi.js',
  'lib\apis\tripsApi.jsx',
  'app\dashboard\bookings\page.jsx',
  'app\dashboard\gate\page.jsx'
)

foreach ($file in $files) {
  if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace '(\s+)console\.log\(', '$1// console.log('
    $content | Set-Content $file -NoNewline
    Write-Host "✅ Updated $file"
  }
}
```

Or manually add `//` before each console.log statement listed above.

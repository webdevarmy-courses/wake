# RevenueCat Setup & Troubleshooting Guide

## Issues Fixed

### 1. **Package Identifier Mismatch**
**Problem:** The code was looking for `currentOffering.weekly` and `currentOffering.annual`, but RevenueCat uses package identifiers like `$rc_weekly` and `$rc_annual`.

**Solution:** Updated the code to:
- Check for both the convenience properties (`weekly`, `annual`) 
- Fall back to searching `availablePackages` array
- Match by package identifier or packageType

### 2. **Entitlement Identifier Case Sensitivity**
**Problem:** Code was checking for `PREMIUM` (uppercase) but RevenueCat dashboard shows `premium` (lowercase).

**Solution:** Updated to check both cases:
```typescript
const hasEntitlements = customerInfo.entitlements?.active?.premium !== undefined || 
                       customerInfo.entitlements?.active?.PREMIUM !== undefined;
```

### 3. **Missing Error Handling**
**Problem:** No user feedback when purchases fail or packages aren't available.

**Solution:** Added:
- Alert dialogs for errors
- Console logging for debugging
- User-cancelled error handling

## Current RevenueCat Configuration

Based on your screenshots:

### Products
- **premium-weekly** (`premiumWeekly`)
  - Product ID: `prod00724e45b7`
  - Store: App Store
  - Status: Approved
  - Type: Subscription
  - Group: premium-subscription
  - Entitlement: `premium`

- **premium-yearly** (`premiumYearly`)
  - Product ID: `prod1718277c4e`
  - Store: App Store
  - Status: Approved
  - Type: Subscription
  - Group: premium-subscription
  - Entitlement: `premium`

### Offering
- **Identifier:** `PREMIUM`
- **Display Name:** "The PREMIUM Membership Subscription"
- **Packages:**
  - Yearly Access (`$rc_annual`): premium-yearly
  - Weekly Access (`$rc_weekly`): premium-weekly

### Entitlement
- **Identifier:** `premium`
- **Description:** "premium access"

## Testing Limitations in Expo Go

⚠️ **IMPORTANT:** RevenueCat **DOES NOT WORK** in Expo Go!

Your logs show:
```
[RevenueCat] [configure], You successfully installed the RevenueCat SDK. 
However, it's currently running in Preview API mode because it requires 
some native modules that are not available in Expo Go.
```

### What This Means:
- All RevenueCat methods return empty/mock data
- Purchases cannot be tested
- Offerings will be empty
- Customer info will always show no subscriptions

### How to Test Properly:

#### Option 1: Development Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --profile development --platform ios

# Install on device and run
eas device:create  # Register your device
# Wait for build to complete, then install
```

#### Option 2: TestFlight (Production Testing)
```bash
# Build for TestFlight
eas build --profile preview --platform ios

# Submit to TestFlight
eas submit --platform ios
```

#### Option 3: Simulator Build (Limited Testing)
```bash
# Build for iOS Simulator
eas build --profile development --platform ios --local
```

## Verifying the Setup

Once you have a proper build (not Expo Go), you should see:

### Expected Console Output:
```
[RevenueCat] Offerings received: {
  current: "PREMIUM",
  availablePackages: [
    { identifier: "$rc_weekly", packageType: "WEEKLY", price: "$2.99" },
    { identifier: "$rc_annual", packageType: "ANNUAL", price: "$29.99" }
  ],
  weekly: "$rc_weekly",
  annual: "$rc_annual"
}
```

### When Purchase Works:
```
Attempting weekly purchase with package: $rc_weekly
Weekly purchase successful
```

## Testing In-App Purchases

### Sandbox Testing (iOS)
1. Create a Sandbox Tester account in App Store Connect
2. Sign out of your Apple ID in Settings
3. When making a purchase, sign in with sandbox account
4. Purchases are free in sandbox mode

### Important Notes:
- Sandbox purchases don't charge real money
- You can test subscriptions multiple times
- Subscription periods are accelerated (1 week = 3 minutes)

## Common Issues & Solutions

### Issue: "Selected plan not available"
**Causes:**
- Testing in Expo Go (RevenueCat doesn't work)
- Offerings not loaded yet
- Package identifiers don't match

**Solution:**
- Use development build, not Expo Go
- Check console logs for offering structure
- Verify product IDs match in RevenueCat dashboard

### Issue: Prices not showing
**Causes:**
- Products not approved in App Store Connect
- Bundle ID mismatch
- Testing in Expo Go

**Solution:**
- Ensure products are "Ready to Submit" in App Store Connect
- Verify bundle ID: `com.coursebydevarmy.doomsapp`
- Use development build

### Issue: "No active subscriptions found" after purchase
**Causes:**
- Entitlement identifier mismatch
- Purchase didn't complete
- Receipt validation failed

**Solution:**
- Check entitlement is named `premium` (lowercase)
- Verify purchase completed in sandbox
- Check RevenueCat dashboard for customer

## Next Steps

1. **Build a development build:**
   ```bash
   npx expo install expo-dev-client
   eas build --profile development --platform ios
   ```

2. **Test on a real device** with the development build

3. **Monitor RevenueCat Dashboard:**
   - Go to https://app.revenuecat.com/
   - Check "Customers" tab after test purchases
   - Verify transactions are recorded

4. **Test both plans:**
   - Weekly subscription
   - Yearly subscription with free trial

5. **Test edge cases:**
   - Restore purchases
   - Cancel subscription
   - Resubscribe

## Support Resources

- RevenueCat Docs: https://docs.revenuecat.com/
- Expo Development Builds: https://docs.expo.dev/develop/development-builds/
- App Store Connect: https://appstoreconnect.apple.com/

## Code Changes Summary

### Files Modified:
1. `hooks/useRevenueCat.ts` - Added better logging and entitlement checking
2. `components/PaywallModal.js` - Fixed package lookup and error handling

### Key Changes:
- ✅ Package lookup now checks multiple sources
- ✅ Entitlement checking handles both cases
- ✅ Added error alerts for better UX
- ✅ Added comprehensive logging for debugging
- ✅ Fallback prices if packages not loaded


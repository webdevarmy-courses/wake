# Testing In-App Purchases in Xcode - Complete Guide

## Current Issue: No Payment Dialog Appearing

When testing in Xcode, you're not seeing the payment dialog because of one or more of these reasons:

### 1. **Sandbox Account Not Configured**
### 2. **StoreKit Configuration Missing**
### 3. **Bundle ID Mismatch**
### 4. **Products Not Synced**

---

## Solution Steps

### Step 1: Create Sandbox Test Account

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **Users and Access** (in the top menu)
3. Click **Sandbox** tab (on the left)
4. Click the **+** button to add a new tester
5. Fill in:
   - **First Name:** Test
   - **Last Name:** User
   - **Email:** Create a NEW email (e.g., `test.wakescroll@gmail.com`)
   - **Password:** Create a strong password (save it!)
   - **Country/Region:** United States (or your region)
6. Click **Invite**
7. **Important:** You don't need to verify this email - it's sandbox only

### Step 2: Sign Out of Your Apple ID on Device

**On your iPhone/iPad:**
1. Go to **Settings**
2. Scroll down to **App Store**
3. Tap your Apple ID at the top
4. Tap **Sign Out**
5. **DO NOT** sign in with the sandbox account yet

**Important:** Never sign into Settings with a sandbox account, only use it when prompted during purchase!

### Step 3: Configure StoreKit in Xcode (Recommended Method)

#### Option A: Use StoreKit Configuration File (Easier for Testing)

1. **In Xcode**, go to **File → New → File**
2. Search for "StoreKit Configuration File"
3. Name it `Products.storekit`
4. Click **Create**

5. **Add Your Products:**
   - Click the **+** button in the bottom left
   - Select **Add Subscription**
   
   **For Weekly Subscription:**
   - Product ID: `premiumWeekly`
   - Reference Name: `Premium Weekly`
   - Price: `$2.99`
   - Subscription Duration: `1 Week`
   - Subscription Group: `premium-subscription`
   
   **For Yearly Subscription:**
   - Click **+** again
   - Product ID: `premiumYearly`
   - Reference Name: `Premium Yearly`
   - Price: `$29.99`
   - Subscription Duration: `1 Year`
   - Subscription Group: `premium-subscription`
   - Add **Introductory Offer:**
     - Type: `Free Trial`
     - Duration: `7 Days`

6. **Enable StoreKit Configuration:**
   - In Xcode, go to **Product → Scheme → Edit Scheme**
   - Select **Run** (on the left)
   - Go to **Options** tab
   - Under **StoreKit Configuration**, select `Products.storekit`
   - Click **Close**

7. **Run the app again** from Xcode

Now when you try to purchase, you'll see a **fake payment dialog** that doesn't require a sandbox account!

#### Option B: Use Real Sandbox Testing

If you want to test with real App Store sandbox:

1. Make sure your products are **"Ready to Submit"** in App Store Connect
2. Wait 2-3 hours for products to sync to sandbox
3. Sign out of App Store (Settings → App Store → Sign Out)
4. Run app from Xcode
5. Try to make a purchase
6. When prompted, sign in with your **sandbox test account**

### Step 4: Verify Bundle ID Matches

Your bundle ID must match exactly:
- **In app.json:** `com.coursebydevarmy.doomsapp`
- **In App Store Connect:** Should be the same
- **In Xcode:** Check the project settings

To verify in Xcode:
1. Open your project in Xcode
2. Select your project in the navigator (top left)
3. Select your target
4. Go to **Signing & Capabilities** tab
5. Verify **Bundle Identifier** is: `com.coursebydevarmy.doomsapp`

### Step 5: Add Debug Logging

Add this to your `PaywallModal.js` to see what's happening:

```javascript
const handleStartTrial = async () => {
  console.log('🔵 START TRIAL TAPPED');
  console.log('Selected plan:', selectedPlan);
  console.log('Current offering:', currentOffering);
  console.log('Available packages:', currentOffering?.availablePackages);
  
  if (selectedPlan === "weekly") {
    await handleWeeklyPurchase();
  } else if (selectedPlan === "yearly") {
    await handleYearlyPurchase();
  }
};
```

### Step 6: Check Xcode Console for Errors

When you tap the purchase button, check Xcode console for:

**Good signs:**
```
🔵 START TRIAL TAPPED
Selected plan: yearly
Attempting yearly purchase with package: $rc_annual
```

**Bad signs:**
```
Annual package not found
Error: No offerings available
```

---

## Common Issues & Solutions

### Issue 1: "Cannot connect to iTunes Store"

**Solution:**
- You're signed into a real Apple ID in Settings
- Sign out from Settings → App Store
- Try purchase again
- Sign in with sandbox account when prompted

### Issue 2: "This In-App Purchase has already been bought"

**Solution:**
- Sandbox purchases persist
- Go to Settings → App Store → Sandbox Account
- Tap "Clear Purchase History"
- Or use a different sandbox account

### Issue 3: No dialog appears at all

**Causes:**
1. RevenueCat offering not loaded
2. Package not found
3. StoreKit not configured

**Solutions:**
1. Check console logs for offering structure
2. Use StoreKit Configuration file (Option A above)
3. Add debug logging to see where it fails

### Issue 4: "Product not available"

**Causes:**
- Products not approved in App Store Connect
- Bundle ID mismatch
- Products not synced (wait 2-3 hours)

**Solutions:**
- Use StoreKit Configuration file for immediate testing
- Verify bundle ID matches everywhere
- Wait for products to sync if using real sandbox

### Issue 5: RevenueCat returns empty offerings

**Causes:**
- API key incorrect
- Products not configured in RevenueCat dashboard
- Offering not set as "current"

**Solutions:**
1. Verify API key in `useRevenueCat.ts`:
   ```typescript
   apple: "appl_ClZgmSWEYsyFeMoteVUdeddVWHU"
   ```
2. Check RevenueCat dashboard:
   - Products are linked
   - Offering is marked as "Current"
   - Entitlements are set up

---

## Testing Checklist

Before testing purchases:

- [ ] Signed out of Apple ID in Settings → App Store
- [ ] StoreKit Configuration file created and enabled (Option A)
  OR
- [ ] Sandbox account created and ready (Option B)
- [ ] Bundle ID matches: `com.coursebydevarmy.doomsapp`
- [ ] App running from Xcode (not Expo Go)
- [ ] Console logs visible in Xcode
- [ ] RevenueCat API key is correct
- [ ] Products configured in RevenueCat dashboard

---

## Quick Test (Recommended)

**Use StoreKit Configuration for fastest testing:**

1. Create `Products.storekit` file in Xcode
2. Add both products (weekly & yearly)
3. Enable in Edit Scheme → Options
4. Run app
5. Try purchase - you'll see fake dialog immediately!

This bypasses all sandbox complexity and lets you test the purchase flow instantly.

---

## Expected Flow

When everything works:

1. Tap "Start 7-Day Free Trial"
2. Console shows: `Attempting yearly purchase with package: $rc_annual`
3. Payment dialog appears (fake if using StoreKit Config, real if using sandbox)
4. Complete purchase
5. Console shows: `Yearly purchase successful`
6. Alert shows: "Welcome to Premium! 🎉"
7. Modal closes
8. Premium features unlock

---

## Debugging Commands

In Xcode console, you can check:

```javascript
// Check if offerings loaded
console.log('Offerings:', currentOffering);

// Check packages
console.log('Packages:', currentOffering?.availablePackages);

// Check if purchase method is called
console.log('Purchase method called');
```

---

## Next Steps

1. **Try StoreKit Configuration first** (fastest way to test)
2. If that works, then test with real sandbox
3. Once sandbox works, test on TestFlight
4. Finally, test in production

---

## Support

If still not working:
1. Share Xcode console logs
2. Share RevenueCat dashboard screenshots
3. Confirm which testing method you're using (StoreKit vs Sandbox)


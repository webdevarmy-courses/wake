import { useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';

// To get your Google Play API key:
// 1. Go to https://app.revenuecat.com/
// 2. Navigate to your project settings
// 3. Go to "API Keys" section
// 4. Copy the Google Play Store API key (should start with "goog_")
const APIKeys = {
    apple: "appl_ClZgmSWEYsyFeMoteVUdeddVWHU",
    google : "goog_YOUR_GOOGLE_API_KEY" // Replace with your actual Google Play API key
}

const typesOfMembership = {
    weekly : "premiumWeekly",
    yearly : "premiumYearly"
}

function useRevenueCat(){
    const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const debounceTimeoutRef = useRef<number | null>(null);

    // Use useMemo to stabilize the premium status check
    const isPremiumMember = useMemo(() => {
        if (!customerInfo || !isInitialized) return false;
        
        const hasActiveSubscription = customerInfo.activeSubscriptions.includes(typesOfMembership.weekly) || 
                                    customerInfo.activeSubscriptions.includes(typesOfMembership.yearly);
        
        // Also check entitlements as a backup
        const hasEntitlements = customerInfo.entitlements?.active?.PREMIUM !== undefined;
        
        const result = hasActiveSubscription || hasEntitlements;
        console.log('[RevenueCat] Premium status check:', {
            hasActiveSubscription,
            hasEntitlements,
            result,
            activeSubscriptions: customerInfo.activeSubscriptions,
            entitlements: customerInfo.entitlements?.active
        });
        
        return result;
    }, [customerInfo, isInitialized]);

    useEffect(()=>{
        const fetchData = async ()=>{
            try {
                console.log('[RevenueCat] Initializing...');
                
                // Validate API keys before configuration
                const apiKey = Platform.OS === 'android' ? APIKeys.google : APIKeys.apple;
                if (!apiKey || apiKey.includes('YOUR_') || apiKey === 'google_API_KEY') {
                    console.warn('[RevenueCat] Invalid API key detected, skipping initialization');
                    setIsInitialized(true);
                    return;
                }
                
                if(Platform.OS==='android'){
                    await Purchases.configure({apiKey: APIKeys.google})
                }else{
                    await Purchases.configure({apiKey : APIKeys.apple})
                }

                const offerings = await Purchases.getOfferings();
                const customerInfo = await Purchases.getCustomerInfo();

                console.log('[RevenueCat] Customer info:', {
                    activeSubscriptions: customerInfo.activeSubscriptions,
                    entitlements: customerInfo.entitlements?.active
                });

                setCurrentOffering(offerings.current)
                setCustomerInfo(customerInfo);
                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing RevenueCat:', error);
                setIsInitialized(true); // Set to true even on error to prevent infinite loading
            }
        }

        fetchData();
    },[])

    useEffect(()=>{
        if (!isInitialized) return;

        const customerInfoUpdated = async (purchaserInfo : CustomerInfo)=>{
            try {
                console.log('[RevenueCat] Customer info updated:', {
                    activeSubscriptions: purchaserInfo.activeSubscriptions,
                    entitlements: purchaserInfo.entitlements?.active
                });
                
                // Debounce rapid updates to prevent UI flickering
                if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current);
                }
                
                debounceTimeoutRef.current = setTimeout(() => {
                    setCustomerInfo(purchaserInfo);
                }, 100) as any; // Type assertion for React Native timeout
            } catch (error) {
                console.error('[RevenueCat] Error in customer info update:', error);
            }
        }

        try {
            Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);
        } catch (error) {
            console.error('[RevenueCat] Error adding listener:', error);
        }
        
        return () => {
            try {
                if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current);
                }
                Purchases.removeCustomerInfoUpdateListener(customerInfoUpdated);
            } catch (error) {
                console.error('[RevenueCat] Error removing listener:', error);
            }
        };
    },[isInitialized]);

    return {currentOffering, customerInfo, isPremiumMember, isInitialized}
}

export default useRevenueCat;
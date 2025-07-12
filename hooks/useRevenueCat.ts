import { useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';

const APIKeys = {
    apple: "appl_ClZgmSWEYsyFeMoteVUdeddVWHU",
    google : "google_API_KEY"
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
        }

        Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            Purchases.removeCustomerInfoUpdateListener(customerInfoUpdated);
        };
    },[isInitialized]);

    return {currentOffering, customerInfo, isPremiumMember, isInitialized}
}

export default useRevenueCat;
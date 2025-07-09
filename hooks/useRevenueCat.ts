import { useEffect, useState } from "react";
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

    const isPremiumMember = customerInfo?.activeSubscriptions.includes(typesOfMembership.weekly) || customerInfo?.activeSubscriptions.includes(typesOfMembership.yearly);

    useEffect(()=>{
        const fetchData = async ()=>{
            try {
                // Check if we're in a native environment (not web or Node.js)
                // if (Platform.OS === 'web' || !Constants.executionEnvironment || Constants.executionEnvironment === 'storeClient') {
                //     console.warn('RevenueCat is not supported in this environment');
                //     return;
                // }

                // Purchases.setDebugLogsEnabled(true);

                if(Platform.OS==='android'){
                    await Purchases.configure({apiKey: APIKeys.google})
                }else{
                    await Purchases.configure({apiKey : APIKeys.apple})
                }

                const offerings = await Purchases.getOfferings();
                const customerInfo = await Purchases.getCustomerInfo();

                setCurrentOffering(offerings.current)
                setCustomerInfo(customerInfo);
                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing RevenueCat:', error);
            }
        }

        fetchData();
    },[])


    useEffect(()=>{
        if (!isInitialized) return;

        const customerInfoUpdated = async (purchaserInfo : CustomerInfo)=>{
            setCustomerInfo(purchaserInfo);
        }

        const removeListener = Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);
        return () => {
            Purchases.removeCustomerInfoUpdateListener(customerInfoUpdated);
        };
    },[isInitialized]);

    return {currentOffering, customerInfo, isPremiumMember, isInitialized}

}

export default useRevenueCat;
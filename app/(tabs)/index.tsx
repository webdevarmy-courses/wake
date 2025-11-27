import useRevenueCat from '@/hooks/useRevenueCat';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Purchases from 'react-native-purchases';
import MindfulPage from '../../pages/MindfulPage';

export default function TabOneScreen() {
  const { isPremiumMember, isInitialized } = useRevenueCat();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldShowMindful, setShouldShowMindful] = useState(false);
  const hasCheckedRef = useRef(false);

  // Check subscription status when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const checkSubscription = async () => {
        try {
          console.log('[TabOneScreen] Checking subscription status...');
          
          // Wait for RevenueCat to initialize
          if (!isInitialized) {
            console.log('[TabOneScreen] Waiting for RevenueCat initialization...');
            return;
          }

          // Small delay to ensure customer info is updated after purchase
          await new Promise(resolve => setTimeout(resolve, 500));

          // Force refresh customer info from RevenueCat
          const customerInfo = await Purchases.getCustomerInfo();
          console.log('[TabOneScreen] Customer info:', {
            activeSubscriptions: customerInfo.activeSubscriptions,
            entitlements: customerInfo.entitlements?.active
          });

          // Check if user has premium
          const hasPremium = customerInfo.entitlements?.active?.Premium !== undefined ||
                            customerInfo.entitlements?.active?.premium !== undefined;

          console.log('[TabOneScreen] Premium status:', hasPremium);

          if (hasPremium) {
            console.log('[TabOneScreen] User is premium, showing Mindful page');
            setShouldShowMindful(true);
            setIsChecking(false);
          } else if (!hasCheckedRef.current) {
            // Only redirect to onboarding once
            console.log('[TabOneScreen] User is not premium, redirecting to onboarding...');
            hasCheckedRef.current = true;
            setIsChecking(false);
            router.replace('/onboarding/Onboarding1');
          }
        } catch (error) {
          console.error('[TabOneScreen] Error checking subscription:', error);
          setIsChecking(false);
        }
      };

      checkSubscription();
    }, [isInitialized])
  );

  // Show loading indicator while checking
  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#9575CD" />
      </View>
    );
  }

  // Show MindfulPage if user has premium
  if (shouldShowMindful) {
    return <MindfulPage />;
  }

  // Return null while redirecting
  return null;
} 
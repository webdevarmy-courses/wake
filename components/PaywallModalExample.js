import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PaywallModal from "./PaywallModal";

// Example usage component showing how to integrate PaywallModal
const PaywallModalExample = () => {
  const [showPaywall, setShowPaywall] = useState(false);

  const handleUpgrade = () => {
    setShowPaywall(true);
  };

  const handleClosePaywall = () => {
    setShowPaywall(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paywall Modal Integration Example</Text>

      <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
        <Text style={styles.upgradeButtonText}>🚀 Show Premium Features</Text>
      </TouchableOpacity>

      <Text style={styles.instructions}>
        Tap the button above to see the full-screen paywall modal with:
        {"\n\n"}• Scrollable hero section with headline & image
        {"\n"}• Feature list with emoji icons & descriptions
        {"\n"}• User testimonial section
        {"\n"}• Fixed bottom plan selector with pricing
        {"\n"}• Animated shimmer effects on XP streak
        {"\n"}• Gentle yellow/lavender gradient background
        {"\n"}• Soft shadows and rounded cards
        {"\n"}• Terms & Privacy links
        {"\n"}• Restore purchases & close buttons
      </Text>

      {/* PaywallModal Component */}
      <PaywallModal visible={showPaywall} onClose={handleClosePaywall} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#1f2937",
  },
  upgradeButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  instructions: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
    textAlign: "left",
  },
});

export default PaywallModalExample;

/* 
INTEGRATION GUIDE:

1. Import the PaywallModal component:
   import PaywallModal from './components/PaywallModal';

2. Add state to control visibility:
   const [paywallVisible, setPaywallVisible] = useState(false);

3. Add the modal to your JSX:
   <PaywallModal 
     visible={paywallVisible}
     onClose={() => setPaywallVisible(false)}
   />

4. Trigger the modal:
   <TouchableOpacity onPress={() => setPaywallVisible(true)}>
     <Text>Upgrade to Premium</Text>
   </TouchableOpacity>

CUSTOMIZATION OPTIONS:

To customize the PaywallModal, you can modify:
- colors in the LinearGradient components
- feature list in the features array
- pricing plans in the planSelector section
- testimonial text and author
- button text and styling
- animation durations and effects

PLACEHOLDER FUNCTIONS:

The component includes these placeholder functions that you should implement:
- handleRestorePurchases(): Connect to your restore purchases logic
- handleStartTrial(): Connect to your subscription/trial logic  
- handleTerms(): Navigate to Terms & Conditions
- handlePrivacy(): Navigate to Privacy Policy

STYLING FEATURES:

✅ Full-screen modal overlay with blur background
✅ Gentle yellow/lavender gradient
✅ Scrollable content with fixed bottom plan selector
✅ Rounded cards with soft shadows
✅ Emoji icons throughout
✅ Shimmer animation on XP streak feature
✅ Smooth fade-in/slide-up animations
✅ Mobile-responsive design
✅ Top navigation with close/restore buttons
✅ Legal links at bottom of scrollable content
✅ Two-plan pricing section with "Best Value" badge
✅ CTA button with gradient and glow effect
*/

import useRevenueCat from "@/hooks/useRevenueCat";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Linking,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Purchases from "react-native-purchases";

const { width, height } = Dimensions.get("window");

const PaywallModal = ({ visible, onClose }) => {
  
  const [selectedPlan, setSelectedPlan] = useState("yearly"); // "weekly" or "yearly"

  const {currentOffering, isPremiumMember} = useRevenueCat()

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Entry animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Start continuous animations
      startShimmerAnimation();
      startFloatingAnimation();
      startBreathingAnimation();
      startPulseAnimation();
      startSparkleAnimation();
      startBounceAnimation();
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
    }
  }, [visible]);

  const startShimmerAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startFloatingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startBreathingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.02,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startSparkleAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startBounceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 30,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleRestorePurchases = async () => {
    const purchaseInfo = await Purchases.restorePurchases();

    if(purchaseInfo?.activeSubscriptions?.length > 0) {
      Alert.alert("Success", "Your purchases have been restored.");
      handleClose();
    }else{
      Alert.alert("No Purchases", "No active subscriptions found.");
    }
  };

  const handleStartTrial = async () => {
    console.log(`Start trial tapped for ${selectedPlan} plan`);
    
    if (selectedPlan === "weekly") {
      await handleWeeklyPurchase();
    } else if (selectedPlan === "yearly") {
      await handleYearlyPurchase();
    }
  };

  const handleYearlyPurchase = async () => {
    // Try to find the annual package
    const annualPackage = currentOffering?.annual || 
                         currentOffering?.availablePackages?.find(pkg => 
                           pkg.identifier === '$rc_annual' || 
                           pkg.packageType === 'ANNUAL'
                         );
    
    if(!annualPackage){
      console.error("Annual package not found");
      Alert.alert("Error", "Annual plan not available. Please try again later.");
      return;
    }
  
    try {
      console.log("Attempting yearly purchase with package:", annualPackage.identifier);
      const purchaseInfo = await Purchases.purchasePackage(annualPackage);
  
      if(purchaseInfo?.customerInfo?.entitlements?.active?.premium) {
        console.log("Yearly purchase successful");
        Alert.alert("Success", "Welcome to Premium! 🎉");
        handleClose();
      }
    } catch (error) {
      console.error("Purchase error:", error);
      if (!error.userCancelled) {
        Alert.alert("Purchase Failed", error.message || "Something went wrong. Please try again.");
      }
    }
  };
  
  // And update your handleWeeklyPurchase to not be called on plan selection:
  const handleWeeklyPurchase = async () => {
    // Try to find the weekly package
    const weeklyPackage = currentOffering?.weekly || 
                         currentOffering?.availablePackages?.find(pkg => 
                           pkg.identifier === '$rc_weekly' || 
                           pkg.packageType === 'WEEKLY'
                         );
    
    if(!weeklyPackage){
      console.error("Weekly package not found");
      Alert.alert("Error", "Weekly plan not available. Please try again later.");
      return;
    }
  
    try {
      console.log("Attempting weekly purchase with package:", weeklyPackage.identifier);
      const purchaseInfo = await Purchases.purchasePackage(weeklyPackage);
  
      if(purchaseInfo?.customerInfo?.entitlements?.active?.premium) {
        console.log("Weekly purchase successful");
        Alert.alert("Success", "Welcome to Premium! 🎉");
        handleClose();
      }
    } catch (error) {
      console.error("Purchase error:", error);
      if (!error.userCancelled) {
        Alert.alert("Purchase Failed", error.message || "Something went wrong. Please try again.");
      }
    }
  };

  const handleTerms = () => {
    Linking.openURL(
      "https://island-banana-8a6.notion.site/Wake-Scroll-Terms-of-Use-22b44938f4f580d691acde7c194226c0?source=copy_link"
    );
  };

  const handlePrivacy = () => {
    Linking.openURL(
      "https://island-banana-8a6.notion.site/Privacy-Policy-for-Wake-Scroll-22b44938f4f5803cb500d692a1e00495?source=copy_link"
    );
  };

  if(!currentOffering && !isPremiumMember){
    return(
      <View className="bg-[#FFFDE9] flex-1 items-center justify-center">
        {/* <ActivityIndicator size="large" color="#121111" />
        <Text className="text-[#121111] mt-4">Loading plans...</Text>
        <Text className="text-[#121111] mt-2">Please wait a moment</Text> */}
      </View>
    )
  }

  // If user is already premium, don't show paywall
  if(isPremiumMember){
    return null;
  }

  // If no offering available for non-premium users, show loading
  if(!currentOffering){
    return(
      <View className="bg-[#FFFDE9] flex-1 items-center justify-center">
        {/* <ActivityIndicator size="large" color="#121111" />
        <Text className="text-[#121111] mt-4">Loading plans...</Text>
        <Text className="text-[#121111] mt-2">Please wait a moment</Text> */}
      </View>
    )
  }

  const getTodaysDate = () => {
    const today = new Date();
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return today.toLocaleDateString("en-US", options);
  };

  const features = [
    {
      emoji: "🧠",
      title: "Interruptive Mindful Nudges",
      description:
        "Replace late-night doomscrolling with timely, self-reflective prompts",
      bgColor: "#F4D8FE",
    },
    {
      emoji: "💥",
      title: "Scroll-Free Streak Builder",
      description: "XP-powered streaks to reward intentional use",
      bgColor: "#FFE37D",
      hasShimmer: true,
    },
    {
      emoji: "📊",
      title: "Detailed Journey Tracking",
      description: "See how often you interrupted scrolling or reflected",
      bgColor: "#93D5E1",
    },
    {
      emoji: "🌱",
      title: "Power Habits",
      description:
        "Unlock 10 science-backed habits (Cold Showers, Digital Detox)",
      bgColor: "#F3FBCB",
    },
    {
      emoji: "😊",
      title: "Mood Emojis & Check-ins",
      description: "Log how you feel and track what improves your day",
      bgColor: "#F4D8FE",
    },
    {
      emoji: "📆",
      title: "Calendar + Heatmaps",
      description: "Visual patterns of behavior and mood over time",
      bgColor: "#93D5E1",
    },
    {
      emoji: "🧘",
      title: "Breathing Exercises",
      description: "Quick, guided calming sessions",
      bgColor: "#F3FBCB",
    },
    {
      emoji: "⏰",
      title: "Screen-Free Timer",
      description: "Set focused work sessions without digital distractions",
      bgColor: "#F4D8FE",
    },
    {
      emoji: "📝",
      title: "Quick Journal",
      description: "Capture thoughts and insights in moments of clarity",
      bgColor: "#FFE37D",
    },
    {
      emoji: "🔄",
      title: "Reflect Card",
      description: "Guided reflection prompts for deeper self-awareness",
      bgColor: "#93D5E1",
    },
    {
      emoji: "🛑",
      title: "Catch Me Scrolling",
      description: "Instant mindful interruption when you need it most",
      bgColor: "#F3FBCB",
    },
  ];

  const FloatingElement = ({ children, delay = 0, range = 10 }) => {
    return (
      <Animated.View
        style={{
          transform: [
            {
              translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -range],
              }),
            },
          ],
        }}
      >
        {children}
      </Animated.View>
    );
  };

  const SparkleElement = ({ style, delay = 0 }) => {
    return (
      <Animated.View
        style={[
          style,
          {
            opacity: sparkleAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 1, 0.3],
            }),
            transform: [
              {
                scale: sparkleAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.8, 1.2, 0.8],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.sparkleText}>✨</Text>
      </Animated.View>
    );
  };

  const FeatureCard = ({ feature, index }) => {
    const cardColors = ["#F3FBCB", "#F4D8FE", "#93D5E1", "#FFE37D"];
    const backgroundColor = cardColors[index % cardColors.length];

    return (
      <Animated.View
        style={[
          styles.featureCard,
          { backgroundColor },
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 30],
                  outputRange: [0, index * 5],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.featureContent}>
          <Text style={styles.featureEmoji}>{feature.emoji}</Text>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureDescription}>{feature.description}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={30} style={styles.blurBackground}>
          {/* Background Gradient */}
          <View style={styles.gradientBackground}>
            {/* Floating background elements */}
            <FloatingElement delay={0} range={8}>
              <View style={[styles.floatingCircle, styles.circle1]} />
            </FloatingElement>
            <FloatingElement delay={1000} range={12}>
              <View style={[styles.floatingCircle, styles.circle2]} />
            </FloatingElement>
            <FloatingElement delay={2000} range={6}>
              <View style={[styles.floatingCircle, styles.circle3]} />
            </FloatingElement>

            {/* Sparkle elements */}
            <SparkleElement style={styles.sparkle1} />
            <SparkleElement style={styles.sparkle2} delay={500} />
            <SparkleElement style={styles.sparkle3} delay={1000} />

            <SafeAreaView style={styles.safeArea}>
              <View style={styles.contentContainer}>
                {/* Scrollable Content including header */}
                <ScrollView
                  style={styles.scrollContent}
                  contentContainerStyle={styles.scrollContentContainer}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Header Navigation */}
                  <Animated.View
                    style={[
                      styles.header,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={handleRestorePurchases}
                      style={styles.restoreButton}
                    >
                      <Text style={styles.restoreText}>Restore Purchases</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleClose}
                    >
                      <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Hero Section */}
                  <Animated.View
                    style={[
                      styles.heroSection,
                      {
                        opacity: fadeAnim,
                        transform: [
                          { translateY: slideAnim },
                          { scale: breatheAnim },
                        ],
                      },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.headlineContainer,
                        {
                          transform: [{ scale: pulseAnim }],
                        },
                      ]}
                    >
                      <Text style={styles.headline}>
                        You weren't born to scroll.{"\n"}
                        <Text style={styles.headlineAccent}>
                          You were made to live.
                        </Text>
                      </Text>
                    </Animated.View>

                    <Text style={styles.subheadline}>
                      Unlock the full experience to take back your time, your
                      mind, and your life — one intentional moment at a time.
                    </Text>

                    {/* Hero Image */}
                    <View style={styles.heroImageContainer}>
                      <Image
                        source={require("../assets/images/paywallImage.png")}
                        style={styles.heroImage}
                        resizeMode="cover"
                      />
                      <Animated.View
                        style={[
                          styles.heroImageOverlay,
                          {
                            transform: [{ scale: pulseAnim }],
                          },
                        ]}
                      >
                        <Text style={styles.heroImageText}>✨</Text>
                      </Animated.View>
                    </View>

                    {/* Floating sparkles around hero */}
                    <SparkleElement style={styles.heroSparkle1} />
                    <SparkleElement style={styles.heroSparkle2} delay={700} />
                  </Animated.View>

                  {/* Features Section */}
                  <Animated.View
                    style={[
                      styles.featuresSection,
                      {
                        opacity: fadeAnim,
                      },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.sectionTitleContainer,
                        {
                          transform: [{ scale: breatheAnim }],
                        },
                      ]}
                    >
                      <Text style={styles.sectionTitle}>
                        UNLOCK PREMIUM FEATURES
                      </Text>
                    </Animated.View>

                    {/* Horizontal scrollable feature cards */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.featuresScrollContainer}
                      snapToInterval={200}
                      decelerationRate="fast"
                      snapToAlignment="center"
                    >
                      {features.map((feature, index) => (
                        <FeatureCard
                          key={index}
                          feature={feature}
                          index={index}
                        />
                      ))}
                    </ScrollView>
                  </Animated.View>

                  {/* Future Self Letter Section */}
                  <Animated.View
                    style={[
                      styles.letterSection,
                      {
                        opacity: fadeAnim,
                        transform: [
                          { translateY: slideAnim },
                          { scale: breatheAnim },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.letterCard}>
                      <Text style={styles.letterHeader}>
                        📮 A Letter from Future You
                      </Text>
                      <View style={styles.letterContent}>
                        <Text style={styles.letterDate}>{getTodaysDate()}</Text>
                        <Text style={styles.letterBody}>
                          Hey, it's me — your future self.
                          {"\n\n"}
                          {getTodaysDate()} is the day everything changed for
                          us. We finally broke free from endless scrolling and
                          got our life back.
                          {"\n\n"}
                          Trust me, this decision transforms everything.
                          {"\n\n"}
                          <Text style={styles.letterSignature}>
                            Future You ✨
                          </Text>
                        </Text>
                      </View>
                    </View>
                  </Animated.View>

                  {/* Legal Links */}
                  <Animated.View
                    style={[
                      styles.legalSection,
                      {
                        opacity: fadeAnim,
                      },
                    ]}
                  >
                    <View style={styles.legalLinks}>
                      <Pressable onPress={handleTerms}>
                        <Text style={styles.legalLink}>Terms & Conditions</Text>
                      </Pressable>
                      <Text style={styles.legalSeparator}> • </Text>
                      <Pressable onPress={handlePrivacy}>
                        <Text style={styles.legalLink}>Privacy Policy</Text>
                      </Pressable>
                    </View>
                  </Animated.View>

                  {/* Bottom padding for fixed plan selector */}
                  <View style={styles.bottomPadding} />
                </ScrollView>

                {/* Fixed Bottom Plan Selector */}
                <Animated.View
                  style={[
                    styles.planSelectorContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <View style={styles.planSelector}>
                    {/* Best Value Badge */}
                    <Animated.View
                      style={[
                        styles.bestValueBadge,
                        {
                          transform: [{ scale: pulseAnim }],
                        },
                      ]}
                    >
                      <Text style={styles.bestValueText}>🎯 BEST VALUE 🎯</Text>
                    </Animated.View>

                    {/* Plans Container */}
                    <View style={styles.plansContainer}>
                      <TouchableOpacity
                        onPress={() => setSelectedPlan("weekly")}
                        style={[
                          styles.planCard,
                          selectedPlan === "weekly" && styles.selectedPlan,
                        ]}
                      >
                        <Animated.View
                          style={[
                            styles.planContent,
                            {
                              transform: [
                                {
                                  scale: bounceAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.01],
                                  }),
                                },
                              ],
                            },
                          ]}
                        >
                          <Text style={styles.planPrice}>
                            {currentOffering?.weekly?.product?.priceString || 
                             currentOffering?.availablePackages?.find(pkg => 
                               pkg.identifier === '$rc_weekly' || pkg.packageType === 'WEEKLY'
                             )?.product?.priceString || 
                             "$2.99"}
                          </Text>
                          <Text style={styles.planPeriod}>per week</Text>
                          <Text style={styles.planDescription}>
                            Start simple, stay grounded
                          </Text>
                          {selectedPlan === "weekly" && (
                            <View style={styles.selectedIndicator}>
                              <Text style={styles.selectedText}>✓</Text>
                            </View>
                          )}
                        </Animated.View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setSelectedPlan("yearly")}
                        style={[
                          styles.planCard,
                          styles.yearlyPlan,
                          selectedPlan === "yearly" && styles.selectedPlan,
                        ]}
                      >
                        <Animated.View
                          style={[
                            styles.planContent,
                            {
                              transform: [{ scale: pulseAnim }],
                            },
                          ]}
                        >
                          <Text style={styles.planPrice}>
                            {currentOffering?.annual?.product?.priceString || 
                             currentOffering?.availablePackages?.find(pkg => 
                               pkg.identifier === '$rc_annual' || pkg.packageType === 'ANNUAL'
                             )?.product?.priceString || 
                             "$29.99"}
                          </Text>
                          <Text style={styles.planPeriod}>per year</Text>
                          <Text style={styles.planDescription}>
                            Save 85% • 7-day free trial
                          </Text>
                          {selectedPlan === "yearly" && (
                            <View style={styles.selectedIndicator}>
                              <Text style={styles.selectedText}>✓</Text>
                            </View>
                          )}
                        </Animated.View>
                      </TouchableOpacity>
                    </View>

                    {/* CTA Button */}
                    <TouchableOpacity
                      style={styles.ctaButton}
                      onPress={handleStartTrial}
                    >
                      <Animated.View
                        style={[
                          styles.ctaGradient,
                          {
                            transform: [{ scale: breatheAnim }],
                          },
                        ]}
                      >
                        <Text style={styles.ctaButtonText}>
                          {selectedPlan === "weekly"
                            ? "Start Weekly Plan 🚀"
                            : "Start 7-Day Free Trial ✨"}
                        </Text>
                      </Animated.View>
                    </TouchableOpacity>

                    {/* Cancel Note */}
                    <Text style={styles.cancelNote}>
                      🛡️{" "}
                      {selectedPlan === "weekly"
                        ? "Cancel anytime. Billed weekly."
                        : "Cancel anytime. No charges until trial ends."}
                    </Text>
                  </View>
                </Animated.View>
              </View>
            </SafeAreaView>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(18, 17, 17, 0.4)",
  },
  blurBackground: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    backgroundColor: "#FFFDE9",
    position: "relative",
  },
  floatingCircle: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  circle1: {
    width: 120,
    height: 120,
    top: 100,
    left: -40,
  },
  circle2: {
    width: 80,
    height: 80,
    top: 200,
    right: -20,
  },
  circle3: {
    width: 60,
    height: 60,
    top: 400,
    left: 50,
  },
  sparkle1: {
    position: "absolute",
    top: 150,
    right: 30,
  },
  sparkle2: {
    position: "absolute",
    top: 300,
    left: 40,
  },
  sparkle3: {
    position: "absolute",
    top: 450,
    right: 60,
  },
  sparkleText: {
    fontSize: 16,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  restoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  restoreText: {
    fontSize: 16,
    color: "#121111",
    fontWeight: "500",
    opacity: 0.8,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  closeText: {
    fontSize: 18,
    color: "#121111",
    fontWeight: "600",
    opacity: 0.7,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: "center",
    position: "relative",
  },
  headlineContainer: {
    alignItems: "center",
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#121111",
    marginBottom: 12,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  headlineAccent: {
    color: "#121111",
    fontStyle: "italic",
  },
  subheadline: {
    fontSize: 15,
    textAlign: "center",
    color: "#121111",
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 8,
    opacity: 0.8,
    fontWeight: "400",
  },
  heroImageContainer: {
    width: width * 0.85,
    height: 200,
    borderRadius: 32,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroImageOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
  },
  heroImageText: {
    fontSize: 20,
  },
  heroSparkle1: {
    position: "absolute",
    top: 180,
    left: 20,
  },
  heroSparkle2: {
    position: "absolute",
    top: 220,
    right: 30,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  featuresScrollContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  featureCard: {
    width: 180,
    height: 160,
    borderRadius: 24,
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingHorizontal: 16,
  },
  featureContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: "#121111",
    textAlign: "center",
    lineHeight: 16,
    opacity: 0.8,
    fontWeight: "400",
  },
  letterSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  letterCard: {
    backgroundColor: "#F3FBCB",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  letterHeader: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    color: "#121111",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  letterContent: {
    alignItems: "flex-start",
  },
  letterDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 16,
    opacity: 0.8,
  },
  letterBody: {
    fontSize: 16,
    color: "#121111",
    lineHeight: 24,
    fontWeight: "400",
    textAlign: "left",
  },
  letterSignature: {
    fontWeight: "600",
    fontStyle: "italic",
  },
  legalSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  legalLink: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.6,
    textDecorationLine: "underline",
  },
  legalSeparator: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.4,
  },
  bottomPadding: {
    height: 180,
  },
  planSelectorContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  planSelector: {
    backgroundColor: "#F4D8FE",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
  },
  bestValueBadge: {
    position: "absolute",
    top: -8,
    left: "50%",
    transform: [{ translateX: -60 }],
    backgroundColor: "#FFE37D",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  bestValueText: {
    fontSize: 10,
    color: "#121111",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  plansContainer: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
    marginTop: 6,
  },
  planCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    minHeight: 80,
  },
  yearlyPlan: {
    backgroundColor: "#93D5E1",
    borderColor: "rgba(18, 17, 17, 0.2)",
  },
  planPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 2,
  },
  planPeriod: {
    fontSize: 11,
    color: "#121111",
    opacity: 0.7,
    marginBottom: 6,
    fontWeight: "500",
  },
  planDescription: {
    fontSize: 9,
    color: "#121111",
    textAlign: "center",
    lineHeight: 12,
    opacity: 0.8,
    fontWeight: "500",
  },
  ctaButton: {
    marginBottom: 10,
  },
  ctaGradient: {
    backgroundColor: "#121111",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#121111",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFDE9",
    letterSpacing: 0.2,
  },
  cancelNote: {
    fontSize: 11,
    textAlign: "center",
    color: "#121111",
    opacity: 0.7,
    lineHeight: 16,
    fontWeight: "400",
  },
  selectedPlan: {
    borderColor: "#121111",
    borderWidth: 2,
  },
  selectedIndicator: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#121111",
    borderRadius: 10,
    padding: 4,
  },
  selectedText: {
    fontSize: 12,
    color: "#FFFDE9",
    fontWeight: "700",
  },
  planContent: {
    position: "relative",
  },
});

export default PaywallModal;

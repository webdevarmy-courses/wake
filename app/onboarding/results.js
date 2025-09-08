import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Dimensions, Image, Linking, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { resultsPreview } from "../../data/questions";

const { width } = Dimensions.get("window");

function BenefitBox({ title, percentage, index }) {
  const colors = [
    ["#FF6B6B", "#FF8E53"],
    ["#4ECDC4", "#44A08D"], 
    ["#45B7D1", "#96C93D"],
    ["#F093FB", "#F5576C"]
  ];
  
  return (
    <View style={styles.benefitBox}>
      <LinearGradient
        colors={colors[index % colors.length]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.benefitGradient}
      >
        <Text style={styles.benefitPercentage}>{percentage}</Text>
        <Text style={styles.benefitTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );
}

function ResearchLink({ title, url }) {
  const handlePress = () => {
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity style={styles.researchLink} onPress={handlePress}>
      <Text style={styles.researchLinkIcon}>🔗</Text>
      <Text style={styles.researchLinkText}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function ResultsPage() {
  const handleContinue = () => {
    // Navigate to Get Program page
    router.push("/onboarding/GetProgram");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Main Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>{resultsPreview.title}</Text>
            <Text style={styles.subheadline}>{resultsPreview.subtitle}</Text>
          </View>

          {/* Benefits Grid */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitsGrid}>
              {resultsPreview.benefits.map((benefit, index) => (
                <BenefitBox
                  key={index}
                  title={benefit.title}
                  percentage={benefit.percentage}
                  index={index}
                />
              ))}
            </View>
          </View>

          {/* Scientific Research Section */}
          <View style={styles.researchContainer}>
            <Text style={styles.researchTitle}>📚 Scientific Research</Text>
            <View style={styles.researchBox}>
              {resultsPreview.researchLinks.map((link, index) => (
                <ResearchLink
                  key={index}
                  title={link.title}
                  url={link.url}
                />
              ))}
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.bottomArea}>
            <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleContinue}>
              <LinearGradient
                colors={["#9575CD", "#7B68EE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Start Your Journey</Text>
                <Text style={styles.buttonIcon}>✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "300",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 40,
    height: 40,
    opacity: 0.9,
  },
  headlineContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  headline: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    color: "#9575CD",
    marginBottom: 6,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: undefined }),
  },
  subheadline: {
    fontSize: 14,
    textAlign: "center",
    color: "#ffffff",
    opacity: 0.8,
    lineHeight: 18,
    maxWidth: 260,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  benefitBox: {
    width: (width - 56) / 2, // Account for padding and gap
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  benefitGradient: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  benefitPercentage: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 3,
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    opacity: 0.9,
  },
  researchContainer: {
    marginBottom: 20,
  },
  researchTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  researchBox: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  researchLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  researchLinkIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  researchLinkText: {
    fontSize: 11,
    color: "#9575CD",
    fontWeight: "500",
    flex: 1,
  },
  bottomArea: {
    alignItems: "center",
  },
  button: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 28,
    shadowColor: "#9575CD",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
    marginRight: 8,
  },
  buttonIcon: {
    color: "#ffffff",
    fontSize: 18,
  },
});

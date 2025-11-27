import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet
} from "react-native";
import CatchScrollButton from "../components/CatchScrollButton";
import MindfulBackground from "../components/MindfulBackground";
import MindfulHeader from "../components/MindfulHeader";
import MindfulPrompt from "../components/MindfulPrompt";
import PaywallModal from "../components/PaywallModal";
import ReplaceScrollCards from "../components/ReplaceScrollCards";
import XPJar from "../components/XPJar";
import XPRulesModal from "../components/XPRulesModal";
import { getTodaysXP } from "../utils/xpManager";

const MindfulPage = () => {
  const [currentXP, setCurrentXP] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const loadTodaysXP = async () => {
    try {
      console.log("[MindfulPage] Loading todays XP...");
      const todaysXP = await getTodaysXP();
      console.log("[MindfulPage] Loaded todays XP:", todaysXP);
      setCurrentXP(todaysXP);
    } catch (error) {
      console.error("Error loading today's XP:", error);
    }
  };

  useEffect(() => {
    loadTodaysXP();
  }, []);

  // Refresh XP whenever the page gains focus (e.g., returning from activities)
  useFocusEffect(
    useCallback(() => {
      loadTodaysXP();
    }, [])
  );

  // Also refresh when the tab comes into focus
  useEffect(() => {
    if (isFocused) {
      console.log("[MindfulPage] Tab focused, refreshing XP...");
      loadTodaysXP();
    }
  }, [isFocused]);

  const handleXPGained = async (newTotalXP) => {
    // Refresh today's XP after gaining XP from catch button
    await loadTodaysXP();
  };

  const handleJarPress = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <MindfulBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mindful Header */}
          <MindfulHeader todaysXP={currentXP} />

          {/* Mindful Prompt */}
          <MindfulPrompt />

          {/* Catch Me Scrolling Button */}
          <CatchScrollButton onXPGained={handleXPGained} />

          {/* Replace Scrolling Cards */}
          <ReplaceScrollCards />

          {/* XP Jar */}
          <XPJar currentXP={currentXP} onPress={handleJarPress} />

          {/* Paywall Test Button - For Testing Only */}
          {/* <View style={styles.testSection}>
            <TouchableOpacity
              style={styles.paywallTestButton}
              onPress={() => setPaywallVisible(true)}
            >
              <Text style={styles.paywallTestEmoji}>✨</Text>
              <Text style={styles.paywallTestText}>
                Preview Premium Features
              </Text>
              <Text style={styles.paywallTestSubtext}>Test Paywall Modal</Text>
            </TouchableOpacity>
          </View> */}
        </ScrollView>

        {/* XP Rules Modal */}
        <XPRulesModal
          visible={modalVisible}
          onClose={handleModalClose}
          navigation={navigation}
        />

        {/* Paywall Modal */}
        <PaywallModal
          visible={paywallVisible}
          onClose={() => setPaywallVisible(false)}
        />
      </SafeAreaView>
    </MindfulBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  testSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  paywallTestButton: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderStyle: "dashed",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    maxWidth: 280,
  },
  paywallTestEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  paywallTestText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366f1",
    marginBottom: 2,
    textAlign: "center",
  },
  paywallTestSubtext: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    opacity: 0.8,
  },
});

export default MindfulPage;

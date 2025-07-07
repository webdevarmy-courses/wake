import { useFocusEffect } from "@react-navigation/native";
import React, { useRef } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import CatchScrollStats from "../components/CatchScrollStats";
import MindfulBackground from "../components/MindfulBackground";
import XPJourneyJournal from "../components/XPJourneyJournal";

const ProgressPage = () => {
  const journeyRef = useRef();
  const statsRef = useRef();

  useFocusEffect(
    React.useCallback(() => {
      // Refresh data when the page gains focus
      if (journeyRef.current) {
        journeyRef.current.refreshData();
      }
      if (statsRef.current) {
        statsRef.current.refreshData();
      }
    }, [])
  );

  return (
    <MindfulBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <CatchScrollStats ref={statsRef} />
          <XPJourneyJournal ref={journeyRef} />
          {/* Future progress components will go here */}
        </ScrollView>
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
  contentContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
});

export default ProgressPage;

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Line, Polygon, Text as SvgText } from "react-native-svg";

const { width, height } = Dimensions.get("window");

function RadarChart({ data, centerX, centerY, radius, animated = false }) {
  const categories = ["Overall", "Wisdom", "Discipline", "Confidence", "Strength", "Focus"];
  const animatedValues = categories.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    if (animated) {
      const animations = categories.map((_, index) => 
        Animated.timing(animatedValues[index], {
          toValue: data[index],
          duration: 1000,
          delay: index * 100,
          useNativeDriver: false,
        })
      );
      Animated.parallel(animations).start();
    } else {
      categories.forEach((_, index) => {
        animatedValues[index].setValue(data[index]);
      });
    }
  }, [data, animated]);

  const points = categories.map((_, index) => {
    const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
    const value = animated ? animatedValues[index] : { _value: data[index] };
    const currentValue = animated ? value._value : data[index];
    const x = centerX + Math.cos(angle) * (radius * currentValue / 100);
    const y = centerY + Math.sin(angle) * (radius * currentValue / 100);
    return { x, y, angle, label: categories[index] };
  });

  return (
    <Svg width={width - 40} height={300} style={styles.radarSvg}>
      {/* Background grid circles */}
      {[20, 40, 60, 80, 100].map((percent) => (
        <Circle
          key={percent}
          cx={centerX}
          cy={centerY}
          r={(radius * percent) / 100}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          fill="none"
        />
      ))}

      {/* Axis lines */}
      {categories.map((_, index) => {
        const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        return (
          <Line
            key={index}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <Polygon
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
        fill="rgba(149, 117, 205, 0.3)"
        stroke="#9575CD"
        strokeWidth="2"
      />

      {/* Data points */}
      {points.map((point, index) => (
        <Circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#9575CD"
        />
      ))}

      {/* Labels */}
      {categories.map((label, index) => {
        const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
        const labelRadius = radius + 25;
        const x = centerX + Math.cos(angle) * labelRadius;
        const y = centerY + Math.sin(angle) * labelRadius;
        return (
          <SvgText
            key={index}
            x={x}
            y={y}
            fontSize="12"
            fill="#ffffff"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export default function GrowthWebPage() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const weekData = {
    1: [25, 20, 22, 28, 24, 26], // Week 1 baseline
    5: [45, 42, 48, 50, 46, 44], // Week 5 progress  
    10: [70, 68, 75, 72, 70, 73] // Week 10 strong growth
  };

  const weekLabels = {
    1: "Week 1 - Starting Your Journey",
    5: "Week 5 - Building Momentum", 
    10: "Week 10 - Transformation"
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (currentWeek === 1) {
      // Animate to Week 5
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentWeek(5);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else if (currentWeek === 5) {
      // Animate to Week 10
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentWeek(10);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Go to next page
      router.push("/onboarding/time-awareness");
    }
  };

  const centerX = (width - 40) / 2;
  const centerY = 150;
  const radius = 80;

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
          <View style={styles.titleContainer}>
            <Text style={styles.headline}>Your Growth Journey</Text>
            <Animated.Text style={[styles.weekLabel, { opacity: fadeAnim }]}>
              {weekLabels[currentWeek]}
            </Animated.Text>
          </View>

          <Animated.View style={[styles.chartContainer, { opacity: fadeAnim }]}>
            <RadarChart 
              data={weekData[currentWeek]} 
              centerX={centerX}
              centerY={centerY}
              radius={radius}
              animated={true}
            />
          </Animated.View>

          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Growth Areas</Text>
            <View style={styles.legendGrid}>
              {["Overall", "Wisdom", "Discipline", "Confidence", "Strength", "Focus"].map((category, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={styles.legendDot} />
                  <Text style={styles.legendText}>{category}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleContinue}>
            <LinearGradient
              colors={["#9575CD", "#7B68EE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {currentWeek === 10 ? "Continue" : "Next Week"}
              </Text>
              <Text style={styles.buttonIcon}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const serifFamily = Platform.select({ ios: "Georgia", android: "serif", default: undefined });

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
    paddingTop: Platform.OS === "android" ? 30 : 0,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "300",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 10,
    fontFamily: serifFamily,
  },
  weekLabel: {
    fontSize: 16,
    color: "#9575CD",
    fontWeight: "600",
    textAlign: "center",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  radarSvg: {
    alignSelf: "center",
  },
  legendContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9575CD",
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    fontWeight: "300",
  },
});

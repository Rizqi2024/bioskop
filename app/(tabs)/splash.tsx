import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function SplashScreen() {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoBox}>
          <Image
            source={require("../../assets/images/logo-lp3i.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>LP3I Cinema</Text>
        <Text style={styles.subtitle}>Aplikasi Pemesanan Tiket Bioskop</Text>

        <View style={styles.loadingArea}>
          <ActivityIndicator size="small" color="#38bdf8" />

          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>

          <Text style={styles.loadingText}>Memuat aplikasi...</Text>
        </View>
      </Animated.View>

      <Text style={styles.footer}>Powered by LP3I</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  logoBox: {
    width: 135,
    height: 135,
    borderRadius: 28,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    padding: 18,
    shadowColor: "#38bdf8",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#38bdf8",
    letterSpacing: 1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#cbd5e1",
    marginTop: 10,
    textAlign: "center",
  },
  loadingArea: {
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },
  progressBackground: {
    width: "85%",
    height: 10,
    backgroundColor: "#1e293b",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 18,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#38bdf8",
    borderRadius: 20,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 12,
  },
  footer: {
    position: "absolute",
    bottom: 35,
    color: "#64748b",
    fontSize: 13,
  },
});

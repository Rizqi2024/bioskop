import { auth } from "@/config/firebase";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
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

  const resolvedUser = useRef<boolean | null>(null);

  useEffect(() => {
    // 1. Play intro animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start();

    // 2. Check Firebase Auth session state and store in ref (not state)
    // Using a ref avoids the stale closure bug inside setTimeout
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      resolvedUser.current = !!user;
    });

    // 3. Redirect after animations complete, reading from ref (not state)
    const timer = setTimeout(() => {
      if (resolvedUser.current === true) {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/login");
      }
    }, 2600);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      {/* Ambient background glow decorations */}
      <View style={styles.glowSpotLeft} />
      <View style={styles.glowSpotRight} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoBox}>
          <Image
            source={require("../assets/images/logo-lp3i.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>LP3I Cinema</Text>
        <Text style={styles.subtitle}>Aplikasi Pemesanan Tiket Bioskop</Text>

        <View style={styles.loadingArea}>
          <ActivityIndicator size="small" color="#38bdf8" style={styles.loader} />

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

          <Text style={styles.loadingText}>Memuat sistem aman...</Text>
        </View>
      </Animated.View>

      <Text style={styles.footer}>Powered by LP3I Informatics</Text>
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
    position: "relative",
    overflow: "hidden",
  },
  glowSpotLeft: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(56, 189, 248, 0.06)",
  },
  glowSpotRight: {
    position: "absolute",
    bottom: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(2, 132, 199, 0.05)",
  },
  content: {
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  logoBox: {
    width: 140,
    height: 140,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    padding: 16,
    shadowColor: "#38bdf8",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: 2,
    textAlign: "center",
    textShadowColor: "rgba(56, 189, 248, 0.4)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  loadingArea: {
    width: "100%",
    alignItems: "center",
    marginTop: 50,
  },
  loader: {
    marginBottom: 10,
  },
  progressBackground: {
    width: "70%",
    height: 6,
    backgroundColor: "#1e293b",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#38bdf8",
    borderRadius: 999,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  loadingText: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    zIndex: 1,
  },
});

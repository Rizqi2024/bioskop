import { auth } from "@/config/firebase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  
  // Interactive inputs focus states
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Peringatan", "Email dan password wajib diisi!");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)/dashboard");
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Terjadi kesalahan saat masuk.";
      if (error.code === "auth/invalid-email") {
        errorMessage = "Format alamat email tidak valid.";
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage = "Email atau password yang Anda masukkan salah.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Koneksi jaringan terputus. Harap periksa koneksi internet Anda.";
      }
      Alert.alert("Gagal Masuk", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (email === "") {
      Alert.alert(
        "Lupa Kata Sandi",
        "Silakan isi kolom Email Anda terlebih dahulu, kemudian tekan tombol ini kembali untuk mengirimkan link pemulihan."
      );
      return;
    }

    Alert.alert(
      "Reset Kata Sandi",
      `Apakah Anda ingin mengirimkan email pemulihan sandi ke ${email.trim()}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Kirim",
          onPress: async () => {
            try {
              await sendPasswordResetEmail(auth, email.trim());
              Alert.alert("Berhasil", "Link reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam.");
            } catch (error: any) {
              let msg = "Gagal mengirim email reset sandi.";
              if (error.code === "auth/invalid-email") {
                msg = "Format email tidak valid.";
              } else if (error.code === "auth/user-not-found") {
                msg = "Email tidak terdaftar di sistem kami.";
              }
              Alert.alert("Kesalahan", msg);
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Image
              source={require("../assets/images/logo-lp3i.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>LP3I Cinema</Text>
          <Text style={styles.subtitle}>Gerbang Masuk Eksplorasi Film Terbaik</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputContainer, isEmailFocused && styles.inputContainerFocused]}>
            <Ionicons name="mail-outline" size={20} color={isEmailFocused ? "#38bdf8" : "#64748b"} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan email Anda"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
            />
          </View>

          <Text style={styles.label}>Kata Sandi</Text>
          <View style={[styles.inputContainer, isPasswordFocused && styles.inputContainerFocused]}>
            <Ionicons name="lock-closed-outline" size={20} color={isPasswordFocused ? "#38bdf8" : "#64748b"} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan kata sandi Anda"
              placeholderTextColor="#64748b"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
              <Ionicons name={secureText ? "eye-off-outline" : "eye-outline"} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Lupa Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>MASUK</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push("/register" as any)}>
              <Text style={styles.linkText}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#38bdf8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: 1.5,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },
  form: {
    backgroundColor: "#0f172a",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderWidth: 1.5,
    borderColor: "#334155",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputContainerFocused: {
    borderColor: "#38bdf8",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: "#f8fafc",
    fontSize: 15,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#0284c7",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },
  footerText: {
    color: "#64748b",
    fontSize: 14,
  },
  linkText: {
    color: "#38bdf8",
    fontWeight: "bold",
    fontSize: 14,
  },
});

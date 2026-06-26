import { auth, db } from "@/config/firebase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);

  // Focus states for text inputs
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const handleRegister = async () => {
    if (name.trim() === "" || email.trim() === "" || password === "" || confirmPassword === "") {
      Alert.alert("Peringatan", "Semua kolom input wajib diisi!");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Peringatan", "Sandi minimal harus terdiri dari 6 karakter!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Peringatan", "Konfirmasi sandi tidak cocok!");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Set profile name in Firebase auth
      await updateProfile(user, {
        displayName: name.trim(),
      });

      // 3. Save profile metadata in Firestore under 'users' collection
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: email.trim(),
        createdAt: new Date(),
      });

      Alert.alert("Sukses", "Akun berhasil dibuat!", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/(tabs)/dashboard");
          },
        },
      ]);
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Gagal membuat akun.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email tersebut sudah terdaftar di sistem kami.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Format alamat email tidak valid.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Koneksi jaringan terputus. Harap periksa koneksi internet Anda.";
      }
      Alert.alert("Registrasi Gagal", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Image
              source={require("../assets/images/logo-lp3i.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Daftar Akun</Text>
          <Text style={styles.subtitle}>Bergabunglah dengan komunitas bioskop modern</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <View style={[styles.inputContainer, isNameFocused && styles.inputContainerFocused]}>
            <Ionicons name="person-outline" size={20} color={isNameFocused ? "#38bdf8" : "#64748b"} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama lengkap Anda"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
              autoCorrect={false}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
            />
          </View>

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

          <Text style={styles.label}>Kata Sandi (Min 6 karakter)</Text>
          <View style={[styles.inputContainer, isPasswordFocused && styles.inputContainerFocused]}>
            <Ionicons name="lock-closed-outline" size={20} color={isPasswordFocused ? "#38bdf8" : "#64748b"} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Buat kata sandi baru"
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

          <Text style={styles.label}>Konfirmasi Kata Sandi</Text>
          <View style={[styles.inputContainer, isConfirmPasswordFocused && styles.inputContainerFocused]}>
            <Ionicons name="lock-closed-outline" size={20} color={isConfirmPasswordFocused ? "#38bdf8" : "#64748b"} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ulangi kata sandi"
              placeholderTextColor="#64748b"
              secureTextEntry={secureConfirmText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setIsConfirmPasswordFocused(true)}
              onBlur={() => setIsConfirmPasswordFocused(false)}
            />
            <TouchableOpacity onPress={() => setSecureConfirmText(!secureConfirmText)} style={styles.eyeIcon}>
              <Ionicons name={secureConfirmText ? "eye-off-outline" : "eye-outline"} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading} activeOpacity={0.85}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>DAFTAR</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={styles.linkText}>Masuk Di Sini</Text>
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
    marginBottom: 24,
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    top: 10,
    left: 0,
    padding: 8,
    zIndex: 10,
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
    marginTop: 10,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: 1,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 20,
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
    marginBottom: 6,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderWidth: 1.5,
    borderColor: "#334155",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
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
    paddingVertical: 12,
    color: "#f8fafc",
    fontSize: 15,
  },
  eyeIcon: {
    padding: 8,
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
    marginTop: 18,
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
    marginTop: 18,
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

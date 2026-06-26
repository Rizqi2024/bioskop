import { auth, db } from "@/config/firebase";
import { FallbackImage } from "@/components/fallback-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const STUDIOS = ["Studio 1", "Premiere", "IMAX 3D"];
const SHOWTIMES = ["13:00", "15:30", "18:00", "20:30"];
const ROWS = ["A", "B", "C", "D", "E"];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function PesanScreen() {
  const { id, judul, genre, harga, poster } = useLocalSearchParams();

  const [selectedStudio, setSelectedStudio] = useState(STUDIOS[0]);
  const [selectedShowtime, setSelectedShowtime] = useState(SHOWTIMES[0]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [uangBayar, setUangBayar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Focus state for cashier input
  const [isPaymentInputFocused, setIsPaymentInputFocused] = useState(false);

  const hargaTiket = Number(harga) || 45000;
  const totalBayar = hargaTiket * selectedSeats.length;
  const bayar = Number(uangBayar) || 0;
  const kembalian = bayar - totalBayar;

  // 1. Fetch booked seats from Firestore for the selected Movie, Studio, and Showtime
  useEffect(() => {
    const fetchReservedSeats = async () => {
      setIsLoadingBookings(true);
      try {
        const q = query(
          collection(db, "bookings"),
          where("movieId", "==", String(id)),
          where("studio", "==", selectedStudio),
          where("showtime", "==", selectedShowtime)
        );
        const querySnapshot = await getDocs(q);
        const seats: string[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.seats && Array.isArray(data.seats)) {
            seats.push(...data.seats);
          }
        });
        setBookedSeats(seats);
        // Clear any selected seats that are now booked
        setSelectedSeats([]);
      } catch (error) {
        console.error("Failed to load reserved seats:", error);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    if (id) {
      fetchReservedSeats();
    }
  }, [id, selectedStudio, selectedShowtime]);

  const handleSeatPress = (seatCode: string) => {
    // Trigger Haptic Feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (bookedSeats.includes(seatCode)) return; // disabled

    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatCode));
    } else {
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  const setExactPayment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUangBayar(totalBayar.toString());
  };

  const setPresetPayment = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUangBayar(amount.toString());
  };

  const handlePayment = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Anda harus login untuk melakukan pemesanan!");
      router.replace("/login");
      return;
    }

    if (selectedSeats.length === 0) {
      Alert.alert("Peringatan", "Pilihlah minimal satu kursi sebelum membayar!");
      return;
    }

    if (uangBayar === "" || bayar < totalBayar) {
      Alert.alert("Pembayaran Kurang", "Nominal uang bayar kurang dari total harga tiket.");
      return;
    }

    // Smart Change Calculator checks
    // Excessive digits checking (e.g. user typed extra zeros, e.g. 1.000.000 instead of 100.000)
    if (bayar > totalBayar * 15 || bayar > 3000000) {
      Alert.alert(
        "Nominal Sangat Besar",
        `Uang bayar Anda (${formatRupiah(bayar)}) sangat besar dibanding total bayar (${formatRupiah(totalBayar)}).\n\nApakah nominal uang bayar Anda sudah benar?`,
        [
          { text: "Perbaiki", style: "cancel" },
          { text: "Sudah Benar", onPress: () => processBooking(user.uid, user.email || "") }
        ]
      );
    } else {
      processBooking(user.uid, user.email || "");
    }
  };

  const processBooking = async (uid: string, email: string) => {
    setIsSubmitting(true);
    try {
      const bookingCode = "LP3I-" + Math.floor(100000 + Math.random() * 900000);
      
      // Save transaction to Firestore
      const docRef = await addDoc(collection(db, "bookings"), {
        userId: uid,
        userEmail: email,
        movieId: String(id),
        movieTitle: String(judul),
        moviePoster: poster || "",
        studio: selectedStudio,
        showtime: selectedShowtime,
        seats: selectedSeats,
        ticketCount: selectedSeats.length,
        totalPrice: totalBayar,
        paymentAmount: bayar,
        changeAmount: kembalian,
        bookingCode: bookingCode,
        timestamp: new Date(),
        status: "Aktif",
      });

      // Trigger success Haptic Feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Redirect to Print Receipt (cetak.tsx) with Firestore doc ID
      router.replace({
        pathname: "/cetak",
        params: {
          bookingId: docRef.id,
          showSuccessAnim: "true", // trigger checkmark animation
        },
      });
    } catch (error: any) {
      console.error("Booking failed:", error);
      Alert.alert("Gagal Memesan", "Gagal menyimpan transaksi ke database. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getPosterSource = (posterPath?: string, movieId?: string) => {
    if (!posterPath) return require("../assets/images/lp3i.png");
    
    const idStr = String(movieId || "");
    if (posterPath.includes("infinity") || idStr === "299536") return require("../assets/images/infinity-war.jpg");
    if (posterPath.includes("endgame") || idStr === "299534") return require("../assets/images/endgame.jpg");
    if (posterPath.includes("kkn") || idStr === "1000003") return require("../assets/images/kkn.jpg");
    if (posterPath.includes("upin") || idStr === "1000004") return require("../assets/images/upin.jpg");
    if (posterPath.includes("pabrik") || idStr === "1000005") return require("../assets/images/pabrik-gula.jpg");
    
    if (posterPath.startsWith("http")) return { uri: posterPath };
    return require("../assets/images/lp3i.png");
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pesan Tiket</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Movie Details Summary */}
      <View style={styles.movieSummaryCard}>
        <FallbackImage
          source={getPosterSource(String(poster), String(id))}
          fallbackSource={require("../assets/images/lp3i.png")}
          style={styles.moviePoster}
        />
        <View style={styles.movieMeta}>
          <Text numberOfLines={1} style={styles.movieTitle}>{judul}</Text>
          <Text numberOfLines={1} style={styles.movieGenre}>{genre}</Text>
          <Text style={styles.moviePrice}>{formatRupiah(hargaTiket)} / tiket</Text>
        </View>
      </View>

      {/* Select Studio & Showtime */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionLabel}>Pilih Studio</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {STUDIOS.map((studio) => (
            <TouchableOpacity
              key={studio}
              style={[styles.chip, selectedStudio === studio && styles.chipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedStudio(studio);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selectedStudio === studio && styles.chipTextActive]}>
                {studio}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionLabel, { marginTop: 18 }]}>Pilih Jam Tayang</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {SHOWTIMES.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.chip, selectedShowtime === time && styles.chipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedShowtime(time);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selectedShowtime === time && styles.chipTextActive]}>
                {time} WIB
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Seat Grid Layout */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionLabel}>Denah Kursi</Text>
        <View style={styles.screenIndicator}>
          <View style={styles.screenLine} />
          <Text style={styles.screenText}>Layar Bioskop</Text>
        </View>

        {isLoadingBookings ? (
          <View style={styles.gridLoader}>
            <ActivityIndicator size="small" color="#38bdf8" />
            <Text style={styles.loaderSubText}>Memperbarui denah kursi...</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {ROWS.map((row) => (
              <View key={row} style={styles.gridRow}>
                <Text style={styles.rowLabel}>{row}</Text>
                {COLS.map((col) => {
                  const seatCode = `${row}${col}`;
                  const isBooked = bookedSeats.includes(seatCode);
                  const isSelected = selectedSeats.includes(seatCode);

                  return (
                    <TouchableOpacity
                      key={seatCode}
                      activeOpacity={0.7}
                      style={[
                        styles.seat,
                        isSelected && styles.seatSelected,
                        isBooked && styles.seatBooked,
                      ]}
                      onPress={() => handleSeatPress(seatCode)}
                      disabled={isBooked}
                    >
                      <Text
                        style={[
                          styles.seatText,
                          isSelected && styles.seatTextSelected,
                          isBooked && styles.seatTextBooked,
                        ]}
                      >
                        {col}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={styles.legendColor} />
            <Text style={styles.legendText}>Kosong</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.seatSelected]} />
            <Text style={styles.legendText}>Pilihan</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.seatBooked]} />
            <Text style={styles.legendText}>Terisi</Text>
          </View>
        </View>
      </View>

      {/* Checkout Form */}
      {selectedSeats.length > 0 && (
        <View style={styles.formBox}>
          <View style={styles.priceSummaryRow}>
            <View>
              <Text style={styles.checkoutLabel}>Kursi Terpilih</Text>
              <Text style={styles.checkoutValue}>{selectedSeats.join(", ")}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.checkoutLabel}>Total Harga</Text>
              <Text style={styles.checkoutPrice}>{formatRupiah(totalBayar)}</Text>
            </View>
          </View>

          <Text style={styles.formLabel}>Uang Pembayaran (Cash)</Text>
          <TextInput
            style={[styles.paymentInput, isPaymentInputFocused && styles.paymentInputFocused]}
            placeholder="Masukkan nominal cash"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            value={uangBayar}
            onChangeText={setUangBayar}
            onFocus={() => setIsPaymentInputFocused(true)}
            onBlur={() => setIsPaymentInputFocused(false)}
          />

          {/* Quick Pay Chips */}
          <View style={styles.quickPayContainer}>
            <TouchableOpacity style={styles.quickPayChip} onPress={setExactPayment} activeOpacity={0.7}>
              <Text style={styles.quickPayText}>Uang Pas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickPayChip} onPress={() => setPresetPayment(50000)} activeOpacity={0.7}>
              <Text style={styles.quickPayText}>Rp 50.000</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickPayChip} onPress={() => setPresetPayment(100000)} activeOpacity={0.7}>
              <Text style={styles.quickPayText}>Rp 100.000</Text>
            </TouchableOpacity>
          </View>

          {/* Refund Box */}
          {uangBayar !== "" && bayar >= totalBayar && (
            <View style={styles.changeContainer}>
              <Text style={styles.changeLabel}>Kembalian Anda</Text>
              <Text style={styles.changeValue}>{formatRupiah(kembalian)}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.payButton, isSubmitting && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <Text style={styles.payButtonText}>BAYAR & CETAK STRUK</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#020617",
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  headerTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "bold",
  },
  movieSummaryCard: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    marginHorizontal: 22,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    marginBottom: 20,
  },
  moviePoster: {
    width: 65,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#1e293b",
  },
  movieMeta: {
    marginLeft: 14,
    flex: 1,
  },
  movieTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "bold",
  },
  movieGenre: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  moviePrice: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
  },
  sectionBox: {
    backgroundColor: "#0f172a",
    marginHorizontal: 22,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  chipsScroll: {
    paddingRight: 10,
  },
  chip: {
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  chipActive: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },
  chipText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#020617",
    fontWeight: "bold",
  },
  screenIndicator: {
    alignItems: "center",
    marginVertical: 18,
  },
  screenLine: {
    width: "85%",
    height: 8,
    backgroundColor: "#38bdf8",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 5,
  },
  screenText: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 8,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  gridLoader: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loaderSubText: {
    color: "#475569",
    fontSize: 12,
    marginTop: 8,
  },
  gridContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rowLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "bold",
    width: 20,
    textAlign: "center",
    marginRight: 8,
  },
  seat: {
    width: 33,
    height: 33,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#334155",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  seatSelected: {
    backgroundColor: "#38bdf8",
    borderColor: "#0ea5e9",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  seatBooked: {
    backgroundColor: "#1e293b",
    borderColor: "#1e293b",
    opacity: 0.45,
  },
  seatText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "bold",
  },
  seatTextSelected: {
    color: "#020617",
  },
  seatTextBooked: {
    color: "#475569",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 18,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 14,
    height: 14,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 4,
  },
  legendText: {
    color: "#64748b",
    fontSize: 12,
  },
  formBox: {
    backgroundColor: "#0f172a",
    marginHorizontal: 22,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.25)",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
  },
  priceSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  checkoutLabel: {
    color: "#64748b",
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  checkoutValue: {
    color: "#cbd5e1",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 4,
  },
  checkoutPrice: {
    color: "#38bdf8",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  formLabel: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
  },
  paymentInput: {
    backgroundColor: "#020617",
    borderWidth: 1.5,
    borderColor: "#334155",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    fontSize: 15,
  },
  paymentInputFocused: {
    borderColor: "#38bdf8",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickPayContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  quickPayChip: {
    backgroundColor: "#1e293b",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  quickPayText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
  },
  changeContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  changeLabel: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "600",
  },
  changeValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  payButton: {
    backgroundColor: "#38bdf8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  payButtonDisabled: {
    backgroundColor: "#1e293b",
  },
  payButtonText: {
    color: "#020617",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

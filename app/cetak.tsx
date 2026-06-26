import { db } from "@/config/firebase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface BookingData {
  movieTitle: string;
  moviePoster: string;
  studio: string;
  showtime: string;
  seats: string[];
  ticketCount: number;
  totalPrice: number;
  paymentAmount: number;
  changeAmount: number;
  bookingCode: string;
  status: "Aktif" | "Sudah Digunakan";
  timestamp: any;
}

export default function CetakScreen() {
  const { bookingId, showSuccessAnim } = useLocalSearchParams();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [animPlaying, setAnimPlaying] = useState(false);

  // 1. Handle Lottie success animation play state
  useEffect(() => {
    if (showSuccessAnim === "true") {
      setAnimPlaying(true);
      const timer = setTimeout(() => {
        setAnimPlaying(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAnim]);

  // 2. Fetch booking document from Firestore
  const fetchBookingData = async () => {
    if (!bookingId) return;
    setIsLoading(true);
    try {
      const docRef = doc(db, "bookings", String(bookingId));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBooking(docSnap.data() as BookingData);
      } else {
        console.error("No such document!");
      }
    } catch (err) {
      console.error("Failed to load booking details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId && !animPlaying) {
      fetchBookingData();
    }
  }, [bookingId, animPlaying]);

  // 3. Mark ticket as used/cancelled
  const handleUseTicket = async () => {
    if (!bookingId || !booking) return;

    Alert.alert(
      "Gunakan Tiket",
      "Apakah Anda yakin ingin menggunakan tiket ini untuk masuk studio? Tiket tidak akan bisa digunakan lagi.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Gunakan",
          onPress: async () => {
            setIsUpdating(true);
            try {
              const docRef = doc(db, "bookings", String(bookingId));
              await updateDoc(docRef, {
                status: "Sudah Digunakan",
              });
              // Refresh data
              await fetchBookingData();
              Alert.alert("Sukses", "Tiket berhasil digunakan. Selamat menonton!");
            } catch (err) {
              console.error(err);
              Alert.alert("Gagal", "Gagal memperbarui status tiket.");
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  const formatRupiah = (angka: number) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getFormattedDate = (timestamp: any) => {
    if (!timestamp) return new Date().toLocaleDateString("id-ID");
    
    // Check if it is Firestore Timestamp object
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("id-ID", {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }
    
    return new Date(timestamp).toLocaleDateString("id-ID", {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Draw simulated QR Code matrix with Flexbox grid
  const renderQRCode = () => {
    const matrix = [
      [1, 1, 1, 1, 0, 1],
      [1, 0, 0, 1, 0, 0],
      [1, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 1],
      [0, 1, 0, 1, 0, 0],
      [1, 0, 1, 1, 1, 1],
    ];
    return (
      <View style={styles.qrContainer}>
        {matrix.map((row, rIdx) => (
          <View key={rIdx} style={styles.qrRow}>
            {row.map((val, cIdx) => (
               <View
                 key={cIdx}
                 style={[
                   styles.qrPixel,
                   { backgroundColor: val === 1 ? "#38bdf8" : "transparent" },
                 ]}
               />
            ))}
          </View>
        ))}
      </View>
    );
  };

  // Play Lottie intro screen
  if (animPlaying) {
    return (
      <View style={styles.animContainer}>
        <LottieView
          source={require("../assets/images/success.json")}
          autoPlay
          loop={false}
          style={styles.lottieAnim}
        />
        <Text style={styles.animText}>Pembayaran Berhasil!</Text>
        <Text style={styles.animSubText}>Mencetak tiket digital Anda...</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Memuat tiket...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tiket tidak ditemukan</Text>
        <TouchableOpacity style={styles.backBtnText} onPress={() => router.replace("/(tabs)/dashboard")}>
          <Text style={styles.backLink}>Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAktif = booking.status === "Aktif";

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Tiket Digital Anda</Text>
      <Text style={styles.pageSubtitle}>Tunjukkan kode QR di bawah ini pada saat memasuki bioskop</Text>

      {/* TICKET RECEIPT CARD */}
      <View style={styles.ticket}>
        <View style={styles.ticketHeader}>
          <Text style={styles.cinemaName}>LP3I CINEMA</Text>
          <Text style={styles.ticketCode}>{booking.bookingCode}</Text>
          
          <View style={[styles.statusBadge, isAktif ? styles.badgeAktif : styles.badgeGunakan]}>
            <Text style={[styles.statusText, isAktif ? styles.textAktif : styles.textGunakan]}>
              {booking.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.movieSection}>
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle}>{booking.movieTitle}</Text>
            <Text style={styles.movieText}>Tanggal: {getFormattedDate(booking.timestamp)}</Text>
            <Text style={styles.movieText}>Jam: {booking.showtime} WIB</Text>
            <Text style={styles.movieText}>Jumlah Kursi: {booking.ticketCount} Kursi</Text>
            <Text style={styles.movieText}>Nomor Kursi: {booking.seats.join(", ")}</Text>
            <Text style={styles.studioText}>{booking.studio}</Text>
          </View>
        </View>

        <View style={styles.perforation}>
          <View style={styles.circleLeft} />
          <Text style={styles.dashedLine} numberOfLines={1}>
            - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          </Text>
          <View style={styles.circleRight} />
        </View>

        <View style={styles.detailBox}>
          <View style={styles.row}>
            <Text style={styles.label}>Harga Tiket</Text>
            <Text style={styles.value}>{formatRupiah(booking.totalPrice / booking.ticketCount)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Jumlah Tiket</Text>
            <Text style={styles.value}>{booking.ticketCount} Tiket</Text>
          </View>

          <View style={[styles.row, { marginTop: 6, borderTopWidth: 1, borderColor: "rgba(56, 189, 248, 0.1)", paddingTop: 6 }]}>
            <Text style={styles.labelBold}>Total Bayar</Text>
            <Text style={styles.valueBold}>{formatRupiah(booking.totalPrice)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Uang Bayar</Text>
            <Text style={styles.value}>{formatRupiah(booking.paymentAmount)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Kembalian</Text>
            <Text style={styles.value}>{formatRupiah(booking.changeAmount)}</Text>
          </View>
        </View>

        <View style={styles.barcodeBox}>
          {renderQRCode()}
          <Text style={styles.barcodeNumber}>{booking.bookingCode}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Terima kasih telah berkunjung</Text>
          <Text style={styles.footerSubText}>Harap masuk studio 10 menit sebelum tayang</Text>
        </View>
      </View>

      {/* Action Buttons */}
      {isAktif && (
        <TouchableOpacity
          style={[styles.useButton, isUpdating && styles.useButtonDisabled]}
          onPress={handleUseTicket}
          disabled={isUpdating}
          activeOpacity={0.85}
        >
          {isUpdating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.useButtonText}>SIMULASIKAN TIKET MASUK</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.newTransactionButton}
        onPress={() => router.replace("/(tabs)/dashboard")}
        activeOpacity={0.85}
      >
        <Text style={styles.newTransactionText}>KEMBALI KE DASHBOARD</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#020617",
    padding: 24,
    paddingTop: 50,
    alignItems: "center",
  },
  animContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
    padding: 24,
  },
  lottieAnim: {
    width: 150,
    height: 150,
  },
  animText: {
    color: "#38bdf8",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  animSubText: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 6,
  },
  pageTitle: {
    color: "#38bdf8",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  pageSubtitle: {
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 18,
  },
  ticket: {
    width: "100%",
    backgroundColor: "#0f172a",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.35)",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  ticketHeader: {
    alignItems: "center",
  },
  cinemaName: {
    color: "#38bdf8",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
    textShadowColor: "rgba(56, 189, 248, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ticketCode: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  badgeAktif: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.25)",
  },
  badgeGunakan: {
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.25)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  textAktif: {
    color: "#4ade80",
  },
  textGunakan: {
    color: "#94a3b8",
  },
  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 14,
  },
  movieSection: {
    flexDirection: "row",
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  movieText: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "500",
  },
  studioText: {
    alignSelf: "flex-start",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontWeight: "bold",
    marginTop: 8,
    fontSize: 11,
  },
  perforation: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  dashedLine: {
    color: "rgba(56, 189, 248, 0.25)",
    fontSize: 14,
    letterSpacing: 2,
    width: "110%",
  },
  circleLeft: {
    position: "absolute",
    left: -35,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#020617",
  },
  circleRight: {
    position: "absolute",
    right: -35,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#020617",
  },
  detailBox: {
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.15)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: "#64748b",
    fontSize: 13,
  },
  labelBold: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "bold",
  },
  value: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "600",
  },
  valueBold: {
    color: "#38bdf8",
    fontSize: 15,
    fontWeight: "bold",
  },
  barcodeBox: {
    alignItems: "center",
    marginTop: 18,
    gap: 8,
  },
  qrContainer: {
    padding: 10,
    backgroundColor: "#020617",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
  },
  qrRow: {
    flexDirection: "row",
  },
  qrPixel: {
    width: 9,
    height: 9,
    margin: 0.5,
    borderRadius: 1,
  },
  barcodeNumber: {
    color: "#64748b",
    fontSize: 11,
  },
  footer: {
    marginTop: 14,
    alignItems: "center",
  },
  footerText: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "bold",
  },
  footerSubText: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
  useButton: {
    width: "100%",
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
  },
  useButtonDisabled: {
    backgroundColor: "#b91c1c",
  },
  useButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  newTransactionButton: {
    width: "100%",
    backgroundColor: "#0284c7",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  newTransactionText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "bold",
  },
  backBtnText: {
    marginTop: 12,
  },
  backLink: {
    color: "#38bdf8",
    fontWeight: "bold",
  },
});

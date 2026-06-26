import { auth, db } from "@/config/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Booking {
  id: string;
  movieTitle: string;
  moviePoster: string;
  studio: string;
  showtime: string;
  bookingCode: string;
  ticketCount: number;
  totalPrice: number;
  status: "Aktif" | "Sudah Digunakan";
  timestamp: any;
  seats: string[];
}

export default function HistoryScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const fetchedBookings: Booking[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedBookings.push({
          id: doc.id,
          movieTitle: data.movieTitle || "",
          moviePoster: data.moviePoster || "",
          studio: data.studio || "Studio 1",
          showtime: data.showtime || "",
          bookingCode: data.bookingCode || "",
          ticketCount: data.ticketCount || 0,
          totalPrice: data.totalPrice || 0,
          status: data.status || "Aktif",
          timestamp: data.timestamp,
          seats: data.seats || [],
        });
      });

      // Sort by timestamp descending in memory to avoid Firebase Composite Index requirement
      fetchedBookings.sort((a, b) => {
        const timeA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
        const timeB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
        return timeB - timeA;
      });

      setBookings(fetchedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  const formatRupiah = (angka: number) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const isAktif = item.status === "Aktif";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: "/cetak", params: { bookingId: item.id } })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleCol}>
            <Text numberOfLines={1} style={styles.movieTitle}>
              {item.movieTitle}
            </Text>
            <Text style={styles.bookingCode}>{item.bookingCode}</Text>
          </View>

          <View style={[styles.statusBadge, isAktif ? styles.badgeAktif : styles.badgeGunakan]}>
            <Text style={[styles.statusText, isAktif ? styles.textAktif : styles.textGunakan]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Studio</Text>
              <Text style={styles.infoValue}>{item.studio}</Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Jam Tayang</Text>
              <Text style={styles.infoValue}>{item.showtime}</Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Tiket</Text>
              <Text style={styles.infoValue}>{item.ticketCount} Kursi</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoColFull}>
              <Text style={styles.infoLabel}>Nomor Kursi</Text>
              <Text style={styles.infoValue}>{item.seats.join(", ")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.priceLabel}>Total Bayar</Text>
          <Text style={styles.totalPrice}>{formatRupiah(item.totalPrice)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat Tiket</Text>
        <Text style={styles.subtitle}>Daftar transaksi pemesanan bioskop Anda</Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Memuat riwayat pemesanan...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="ticket-outline" size={48} color="#64748b" />
          </View>
          <Text style={styles.emptyTitle}>Belum Ada Pemesanan</Text>
          <Text style={styles.emptySubtitle}>
            Tiket bioskop yang Anda pesan nanti akan muncul di halaman riwayat ini.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/(tabs)/dashboard")}
          >
            <Text style={styles.emptyButtonText}>Eksplor Film Sekarang</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  title: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 22,
    paddingBottom: 90, // Spacing for absolute bottom navbar
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.18)",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleCol: {
    flex: 1,
    marginRight: 10,
  },
  movieTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "bold",
  },
  bookingCode: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeAktif: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  badgeGunakan: {
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  statusText: {
    fontSize: 11,
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
    marginVertical: 12,
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCol: {
    flex: 1,
  },
  infoColFull: {
    width: "100%",
  },
  infoLabel: {
    color: "#64748b",
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  infoValue: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#020617",
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  priceLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "500",
  },
  totalPrice: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "bold",
  },
  emptySubtitle: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});

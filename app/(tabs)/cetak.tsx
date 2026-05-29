import { router, useLocalSearchParams } from "expo-router";
import {
    Image,
    ImageSourcePropType,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CetakScreen() {
  const { id, judul, genre, jam, harga, jumlah, total, bayar, kembalian } =
    useLocalSearchParams();

  const formatRupiah = (angka: number) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getGambarFilm = (filmId: string): ImageSourcePropType => {
    switch (filmId) {
      case "1":
        return require("../../assets/images/infinity-war.jpg");
      case "2":
        return require("../../assets/images/endgame.jpg");
      case "3":
        return require("../../assets/images/kkn.jpg");
      case "4":
        return require("../../assets/images/upin.jpg");
      case "5":
        return require("../../assets/images/pabrik-gula.jpg");
      default:
        return require("../../assets/images/lp3i.png");
    }
  };

  const tanggal = new Date().toLocaleDateString("id-ID");
  const kodeTiket = "LP3I-" + Math.floor(100000 + Math.random() * 900000);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Tiket Berhasil Dicetak</Text>
      <Text style={styles.pageSubtitle}>Simpan struk ini sebagai bukti pembayaran</Text>

      <View style={styles.ticket}>
        <View style={styles.ticketHeader}>
          <Text style={styles.cinemaName}>LP3I CINEMA</Text>
          <Text style={styles.ticketCode}>{kodeTiket}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.movieSection}>
          <Image source={getGambarFilm(String(id))} style={styles.poster} />

          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle}>{judul}</Text>
            <Text style={styles.movieText}>Genre: {genre}</Text>
            <Text style={styles.movieText}>Tanggal: {tanggal}</Text>
            <Text style={styles.movieText}>Jam: {jam}</Text>
            <Text style={styles.studioText}>Studio 1</Text>
          </View>
        </View>

        <View style={styles.perforation}>
          <View style={styles.circleLeft} />
          <Text style={styles.dashedLine}>
            - - - - - - - - - - - - - - - - - - -
          </Text>
          <View style={styles.circleRight} />
        </View>

        <View style={styles.detailBox}>
          <View style={styles.row}>
            <Text style={styles.label}>Harga Tiket</Text>
            <Text style={styles.value}>{formatRupiah(Number(harga))}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Jumlah Tiket</Text>
            <Text style={styles.value}>{jumlah} Tiket</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Bayar</Text>
            <Text style={styles.valueBold}>{formatRupiah(Number(total))}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Uang Bayar</Text>
            <Text style={styles.value}>{formatRupiah(Number(bayar))}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Kembalian</Text>
            <Text style={styles.valueBold}>
              {formatRupiah(Number(kembalian))}
            </Text>
          </View>
        </View>

        <View style={styles.barcodeBox}>
          <Text style={styles.barcode}>|||| ||| |||| || ||||| |||</Text>
          <Text style={styles.barcodeNumber}>{kodeTiket}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Terima kasih telah memesan tiket</Text>
          <Text style={styles.footerText}>Selamat menonton!</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/dashboard")}
      >
        <Text style={styles.buttonText}>TRANSAKSI BARU</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/dashboard")}
      >
        <Text style={styles.backText}>Kembali ke Dashboard</Text>
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
  pageTitle: {
    color: "#38bdf8",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  pageSubtitle: {
    color: "#cbd5e1",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  ticket: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 22,
    padding: 20,
    marginBottom: 22,
  },
  ticketHeader: {
    alignItems: "center",
  },
  cinemaName: {
    color: "#020617",
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  ticketCode: {
    color: "#0284c7",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#cbd5e1",
    marginVertical: 18,
  },
  movieSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  poster: {
    width: 100,
    height: 140,
    borderRadius: 14,
    backgroundColor: "#cbd5e1",
  },
  movieInfo: {
    flex: 1,
    marginLeft: 15,
  },
  movieTitle: {
    color: "#020617",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  movieText: {
    color: "#334155",
    fontSize: 14,
    marginBottom: 5,
  },
  studioText: {
    alignSelf: "flex-start",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontWeight: "bold",
    marginTop: 8,
    fontSize: 13,
  },
  perforation: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  dashedLine: {
    color: "#94a3b8",
    fontSize: 16,
    letterSpacing: 1,
  },
  circleLeft: {
    position: "absolute",
    left: -34,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#020617",
  },
  circleRight: {
    position: "absolute",
    right: -34,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#020617",
  },
  detailBox: {
    backgroundColor: "#e2e8f0",
    padding: 16,
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 11,
  },
  label: {
    color: "#475569",
    fontSize: 14,
  },
  value: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "600",
  },
  valueBold: {
    color: "#0284c7",
    fontSize: 15,
    fontWeight: "bold",
  },
  barcodeBox: {
    alignItems: "center",
    marginTop: 20,
  },
  barcode: {
    color: "#020617",
    fontSize: 28,
    letterSpacing: 2,
    fontWeight: "bold",
  },
  barcodeNumber: {
    color: "#475569",
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    marginTop: 18,
    alignItems: "center",
  },
  footerText: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    width: "100%",
    backgroundColor: "#0284c7",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  backButton: {
    padding: 14,
    alignItems: "center",
  },
  backText: {
    color: "#38bdf8",
    fontWeight: "bold",
  },
});


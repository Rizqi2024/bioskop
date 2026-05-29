import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    ImageSourcePropType,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function PesanScreen() {
  const { id, judul, genre, jam, harga } = useLocalSearchParams();

  const [jumlah, setJumlah] = useState("");
  const [uangBayar, setUangBayar] = useState("");

  const hargaTiket = Number(harga);
  const jumlahTiket = Number(jumlah) || 0;
  const totalBayar = hargaTiket * jumlahTiket;
  const bayar = Number(uangBayar) || 0;
  const kembalian = bayar - totalBayar;

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

  const prosesCetak = () => {
    if (jumlah === "" || jumlahTiket <= 0) {
      Alert.alert("Peringatan", "Jumlah tiket wajib diisi!");
      return;
    }

    if (uangBayar === "" || bayar < totalBayar) {
      Alert.alert("Peringatan", "Uang bayar kurang!");
      return;
    }

    router.push({
      pathname: "/cetak",
      params: {
        id: String(id),
        judul: String(judul),
        genre: String(genre),
        jam: String(jam),
        harga: String(harga),
        jumlah: jumlah,
        total: totalBayar.toString(),
        bayar: uangBayar,
        kembalian: kembalian.toString(),
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pemesanan Tiket</Text>
      <Text style={styles.subtitle}>Lengkapi jumlah tiket dan pembayaran</Text>

      <View style={styles.card}>
        <Image source={getGambarFilm(String(id))} style={styles.poster} />

        <View style={styles.info}>
          <Text style={styles.filmTitle}>{judul}</Text>
          <Text style={styles.text}>Genre: {genre}</Text>
          <Text style={styles.text}>Jam Tayang: {jam}</Text>
          <Text style={styles.price}>Harga: {formatRupiah(hargaTiket)}</Text>
        </View>
      </View>

      <View style={styles.formBox}>
        <Text style={styles.label}>Jumlah Tiket</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan jumlah tiket"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={jumlah}
          onChangeText={setJumlah}
        />

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Bayar</Text>
          <Text style={styles.totalText}>{formatRupiah(totalBayar)}</Text>
        </View>

        <Text style={styles.label}>Uang Bayar</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan uang bayar"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={uangBayar}
          onChangeText={setUangBayar}
        />

        {uangBayar !== "" && bayar >= totalBayar && jumlahTiket > 0 ? (
          <View style={styles.changeBox}>
            <Text style={styles.changeLabel}>Kembalian</Text>
            <Text style={styles.changeText}>{formatRupiah(kembalian)}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={prosesCetak}>
          <Text style={styles.buttonText}>BAYAR & CETAK STRUK</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 50,
    backgroundColor: "#020617",
  },
  title: {
    color: "#38bdf8",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#cbd5e1",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 20,
    alignItems: "center",
  },
  poster: {
    width: 105,
    height: 145,
    borderRadius: 14,
    backgroundColor: "#1e293b",
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  filmTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    color: "#cbd5e1",
    fontSize: 15,
    marginBottom: 5,
  },
  price: {
    color: "#38bdf8",
    fontWeight: "bold",
    fontSize: 17,
    marginTop: 8,
  },
  formBox: {
    backgroundColor: "#0f172a",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  label: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    color: "#fff",
    fontSize: 16,
  },
  totalBox: {
    backgroundColor: "#082f49",
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
  },
  totalLabel: {
    color: "#bae6fd",
    fontSize: 15,
  },
  totalText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 5,
  },
  changeBox: {
    backgroundColor: "#064e3b",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  changeLabel: {
    color: "#bbf7d0",
    fontSize: 15,
  },
  changeText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#0284c7",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  backButton: {
    padding: 14,
    alignItems: "center",
    marginTop: 5,
  },
  backText: {
    color: "#38bdf8",
    fontWeight: "bold",
  },
});


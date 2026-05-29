import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    FlatList,
    Image,
    ImageBackground,
    ImageSourcePropType,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Film = {
  id: string;
  judul: string;
  genre: string;
  jam: string;
  harga: number;
  gambar: ImageSourcePropType;
};

const films: Film[] = [
  {
    id: "1",
    judul: "Avengers: Infinity War",
    genre: "Action",
    jam: "13.00 WIB",
    harga: 45000,
    gambar: require("../../assets/images/infinity-war.jpg"),
  },
  {
    id: "2",
    judul: "Avengers: Endgame",
    genre: "Action",
    jam: "15.30 WIB",
    harga: 45000,
    gambar: require("../../assets/images/endgame.jpg"),
  },
  {
    id: "3",
    judul: "KKN di Desa Penari",
    genre: "Horror",
    jam: "18.00 WIB",
    harga: 40000,
    gambar: require("../../assets/images/kkn.jpg"),
  },
  {
    id: "4",
    judul: "Upin Ipin The Movie",
    genre: "Animation",
    jam: "10.00 WIB",
    harga: 30000,
    gambar: require("../../assets/images/upin.jpg"),
  },
  {
    id: "5",
    judul: "Pabrik Gula",
    genre: "Action",
    jam: "20.00 WIB",
    harga: 50000,
    gambar: require("../../assets/images/pabrik-gula.jpg"),
  },
];

const COMING_SOON_CARD_WIDTH = 260;
const CARD_WIDTH = 158;
const CARD_GAP = 14;
const AUTO_SCROLL_INTERVAL = 2500;

export default function DashboardScreen() {
  const comingSoonRef = useRef<FlatList<Film>>(null);
  const comingSoonOffset = useRef(0);
  const [comingSoonFilms, setComingSoonFilms] = useState<Film[]>([
    ...films,
    ...films,
    ...films,
  ]);
  const [nowPlayingFilms, setNowPlayingFilms] = useState<Film[]>([
    ...films,
    ...films,
    ...films,
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      comingSoonOffset.current += COMING_SOON_CARD_WIDTH + CARD_GAP;
      comingSoonRef.current?.scrollToOffset({
        offset: comingSoonOffset.current,
        animated: true,
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const pilihFilm = (film: Film) => {
    router.push({
      pathname: "/pesan",
      params: {
        id: film.id,
        judul: film.judul,
        genre: film.genre,
        jam: film.jam,
        harga: film.harga.toString(),
      },
    });
  };

  const tambahComingSoon = () => {
    setComingSoonFilms((currentFilms) => [...currentFilms, ...films]);
  };

  const tambahNowPlaying = () => {
    setNowPlayingFilms((currentFilms) => [...currentFilms, ...films]);
  };

  const formatRupiah = (angka: number) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const renderComingSoon = ({ item }: { item: Film }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.comingSoonCard}
        onPress={() => pilihFilm(item)}
      >
        <ImageBackground
          source={item.gambar}
          imageStyle={styles.comingSoonImage}
          style={styles.comingSoonImageWrap}
        >
          <View style={styles.comingSoonOverlay}>
            <View style={styles.comingSoonTopRow}>
              <View style={styles.releaseBadge}>
                <Ionicons name="sparkles" size={13} color="#f8fafc" />
                <Text style={styles.releaseBadgeText}>Coming Soon</Text>
              </View>
              <View style={styles.playPreview}>
                <Ionicons name="play" size={14} color="#020617" />
              </View>
            </View>

            <View>
              <Text numberOfLines={2} style={styles.comingSoonTitle}>
                {item.judul}
              </Text>
              <Text style={styles.comingSoonMeta}>
                {item.genre}  |  Segera tayang
              </Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderNowPlaying = ({ item }: { item: Film }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.nowPlayingCard}
        onPress={() => pilihFilm(item)}
      >
        <View style={styles.nowPosterFrame}>
          <Image source={item.gambar} style={styles.nowPoster} />
          <View style={styles.nowStatusBadge}>
            <Text style={styles.nowStatusText}>Live</Text>
          </View>
        </View>

        <View style={styles.nowInfo}>
          <Text numberOfLines={2} style={styles.nowTitle}>
            {item.judul}
          </Text>

          <View style={styles.nowMetaRow}>
            <View style={styles.nowMetaItem}>
              <Ionicons name="film-outline" size={13} color="#38bdf8" />
              <Text numberOfLines={1} style={styles.nowMetaText}>
                {item.genre}
              </Text>
            </View>
            <View style={styles.nowMetaItem}>
              <Ionicons name="time-outline" size={13} color="#38bdf8" />
              <Text style={styles.nowMetaText}>{item.jam}</Text>
            </View>
          </View>

          <View style={styles.nowActionRow}>
            <Text style={styles.nowPrice}>{formatRupiah(item.harga)}</Text>
            <View style={styles.bookButton}>
              <Ionicons name="ticket-outline" size={14} color="#020617" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <View>
          <Text style={styles.eyebrow}>Now showing</Text>
          <Text style={styles.brandTitle}>LP3I Cinema</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.logoutIconButton}
          onPress={() => router.replace("/login")}
        >
          <Ionicons name="log-out-outline" size={22} color="#f8fafc" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.comingSoonSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Coming Soon</Text>
              <Text style={styles.sectionSubtitle}>Preview film berikutnya</Text>
            </View>
          </View>
          <FlatList
            ref={comingSoonRef}
            data={comingSoonFilms}
            horizontal
            keyExtractor={(item, index) => `coming-soon-${item.id}-${index}`}
            renderItem={renderComingSoon}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            onEndReached={tambahComingSoon}
            onEndReachedThreshold={0.6}
            onScroll={(event) => {
              comingSoonOffset.current = event.nativeEvent.contentOffset.x;
            }}
            scrollEventThrottle={16}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Now Playing</Text>
              <Text style={styles.sectionSubtitle}>Pilih jadwal favoritmu</Text>
            </View>
            <View style={styles.nowPill}>
              <Ionicons name="ticket-outline" size={13} color="#020617" />
              <Text style={styles.nowPillText}>Tiket</Text>
            </View>
          </View>
          <FlatList
            data={nowPlayingFilms}
            horizontal
            keyExtractor={(item, index) => `now-playing-${item.id}-${index}`}
            renderItem={renderNowPlaying}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            onEndReached={tambahNowPlaying}
            onEndReachedThreshold={0.6}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 50,
    backgroundColor: "#020617",
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  eyebrow: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  brandTitle: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "bold",
  },
  logoutIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  comingSoonSection: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 3,
  },
  sectionPill: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionPillText: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "700",
  },
  horizontalList: {
    paddingRight: 8,
  },
  comingSoonCard: {
    width: COMING_SOON_CARD_WIDTH,
    height: 168,
    marginRight: CARD_GAP,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  comingSoonImageWrap: {
    flex: 1,
  },
  comingSoonImage: {
    borderRadius: 18,
  },
  comingSoonOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "rgba(2, 6, 23, 0.42)",
  },
  comingSoonTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  releaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(14, 165, 233, 0.88)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  releaseBadgeText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "800",
  },
  playPreview: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  comingSoonTitle: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "900",
  },
  comingSoonMeta: {
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },
  nowPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#38bdf8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  nowPillText: {
    color: "#020617",
    fontSize: 12,
    fontWeight: "800",
  },
  nowPlayingCard: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    padding: 8,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  nowPosterFrame: {
    height: 210,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#1e293b",
    position: "relative",
  },
  nowPoster: {
    width: "100%",
    height: "100%",
  },
  nowStatusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(34, 197, 94, 0.95)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  nowStatusText: {
    color: "#052e16",
    fontSize: 11,
    fontWeight: "900",
  },
  nowInfo: {
    paddingTop: 10,
  },
  nowTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
    minHeight: 38,
  },
  nowMetaRow: {
    gap: 6,
    marginTop: 8,
  },
  nowMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  nowMetaText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
  },
  nowActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  nowPrice: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "900",
  },
  bookButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
  },
});

import { FallbackImage, FallbackImageBackground } from "@/components/fallback-image";
import { movieService, Movie, CastMember } from "@/services/movieService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const [details, credits] = await Promise.all([
          movieService.getMovieDetails(String(id)),
          movieService.getMovieCredits(String(id)),
        ]);
        setMovie(details);
        setCast(credits);
      } catch (err) {
        console.error("Failed to load details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  const formatRuntime = (minutes?: number) => {
    if (!minutes) return "-";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}j ${mins}m` : `${mins}m`;
  };

  const getReleaseYear = (releaseDate: string) => {
    const match = releaseDate.match(/\d{4}/);
    return match ? match[0] : releaseDate;
  };

  const getPosterSource = (posterPath: string, movieId?: string) => {
    if (!posterPath) return require("../../assets/images/lp3i.png");
    
    const idStr = String(movieId || "");
    if (posterPath.includes("infinity") || idStr === "299536") return require("../../assets/images/infinity-war.jpg");
    if (posterPath.includes("endgame") || idStr === "299534") return require("../../assets/images/endgame.jpg");
    if (posterPath.includes("kkn") || idStr === "1000003") return require("../../assets/images/kkn.jpg");
    if (posterPath.includes("upin") || idStr === "1000004") return require("../../assets/images/upin.jpg");
    if (posterPath.includes("pabrik") || idStr === "1000005") return require("../../assets/images/pabrik-gula.jpg");
    
    if (posterPath.startsWith("http")) return { uri: posterPath };
    return require("../../assets/images/lp3i.png");
  };

  const getBackdropSource = (backdropPath: string, movieId?: string) => {
    if (!backdropPath) return require("../../assets/images/lp3i.png");
    
    const idStr = String(movieId || "");
    if (backdropPath.includes("infinity") || idStr === "299536") return require("../../assets/images/infinity-war.jpg");
    if (backdropPath.includes("endgame") || idStr === "299534") return require("../../assets/images/endgame.jpg");
    if (backdropPath.includes("kkn") || idStr === "1000003") return require("../../assets/images/kkn.jpg");
    if (backdropPath.includes("upin") || idStr === "1000004") return require("../../assets/images/upin.jpg");
    if (backdropPath.includes("pabrik") || idStr === "1000005") return require("../../assets/images/pabrik-gula.jpg");
    
    if (backdropPath.startsWith("http")) return { uri: backdropPath };
    return require("../../assets/images/lp3i.png");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const getGenreLabel = (movieObj: Movie) => {
    if (movieObj.genres && movieObj.genres.length > 0) {
      return movieObj.genres.map((g) => g.name).join(", ");
    }
    if (movieObj.genreIds.includes(28)) return "Action, Adventure";
    if (movieObj.genreIds.includes(27)) return "Horror, Mystery";
    if (movieObj.genreIds.includes(35)) return "Comedy";
    if (movieObj.genreIds.includes(16)) return "Animation, Family";
    return "Drama";
  };

  const getTicketPrice = (movieId: string) => {
    if (movieId === "1000003") return 40000;
    if (movieId === "1000004") return 30000;
    if (movieId === "1000005") return 50000;
    return 45000;
  };

  const handleBookNow = () => {
    if (!movie) return;
    router.push({
      pathname: "/pesan",
      params: {
        id: movie.id,
        judul: movie.title,
        genre: getGenreLabel(movie),
        harga: getTicketPrice(movie.id).toString(),
        poster: movie.posterPath,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Memuat detail film...</Text>
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Film tidak ditemukan</Text>
        <TouchableOpacity style={styles.backBtnText} onPress={() => router.back()}>
          <Text style={styles.backLink}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Backdrop Banner */}
        <FallbackImageBackground
          source={getBackdropSource(movie.backdropPath, movie.id)}
          fallbackSource={require("../../assets/images/lp3i.png")}
          style={styles.backdrop}
        >
          <View style={styles.backdropOverlay}>
            {/* Header Buttons */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.circleHeaderBtn} onPress={() => router.back()} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={24} color="#f8fafc" />
              </TouchableOpacity>
            </View>

            {/* Seamless fading simulation to dark background */}
            <View style={styles.fadeContainer}>
              <View style={styles.fadeRow1} />
              <View style={styles.fadeRow2} />
              <View style={styles.fadeRow3} />
            </View>
          </View>
        </FallbackImageBackground>

        {/* Movie Meta Box */}
        <View style={styles.contentBox}>
          <View style={styles.mainRow}>
            {/* Poster Overlay */}
            <FallbackImage
              source={getPosterSource(movie.posterPath, movie.id)}
              fallbackSource={require("../../assets/images/lp3i.png")}
              style={styles.poster}
            />

            <View style={styles.metaCol}>
              <Text style={styles.title}>{movie.title}</Text>
              
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Ionicons name="calendar-outline" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
                  <Text style={styles.badgeText}>{getReleaseYear(movie.releaseDate)}</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="time-outline" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
                  <Text style={styles.badgeText}>{formatRuntime(movie.runtime)}</Text>
                </View>
              </View>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={18} color="#fbbf24" />
                <Text style={styles.ratingText}>{movie.voteAverage.toFixed(1)}</Text>
                <Text style={styles.maxRating}>/10</Text>
              </View>

              <Text style={styles.genreLabel}>{getGenreLabel(movie)}</Text>
            </View>
          </View>

          {/* Synopsis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sinopsis</Text>
            <Text style={styles.synopsisText}>{movie.overview || "Tidak ada deskripsi sinopsis untuk film ini."}</Text>
          </View>

          {/* Cast Members */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aktor & Pemeran</Text>
            {cast.length === 0 ? (
              <Text style={styles.emptyCastText}>Daftar pemeran belum tersedia.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castScroll}>
                {cast.map((item) => (
                  <View key={`${item.id}-${item.name}`} style={styles.castCard}>
                    <View style={styles.castAvatar}>
                      <Text style={styles.castInitials}>{getInitials(item.name)}</Text>
                    </View>
                    <Text style={styles.castName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.castCharacter} numberOfLines={1}>{item.character}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Booking CTA Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow} activeOpacity={0.88}>
          <Ionicons name="ticket" size={20} color="#020617" style={{ marginRight: 8 }} />
          <Text style={styles.bookButtonText}>PESAN TIKET SEKARANG</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContainer: {
    paddingBottom: 110,
  },
  backdrop: {
    width: "100%",
    height: 250,
  },
  backdropOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.3)",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    paddingTop: 50,
    paddingHorizontal: 22,
  },
  circleHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(2, 6, 23, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  fadeContainer: {
    width: "100%",
    justifyContent: "flex-end",
  },
  fadeRow1: {
    height: 20,
    backgroundColor: "#020617",
    opacity: 0.3,
  },
  fadeRow2: {
    height: 20,
    backgroundColor: "#020617",
    opacity: 0.65,
  },
  fadeRow3: {
    height: 20,
    backgroundColor: "#020617",
  },
  contentBox: {
    paddingHorizontal: 22,
    marginTop: -50, // Overlap backdrop fade
    zIndex: 2,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  poster: {
    width: 114,
    height: 164,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#38bdf8",
    backgroundColor: "#0f172a",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  metaCol: {
    flex: 1,
    marginLeft: 16,
    paddingBottom: 4,
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 28,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "bold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  ratingText: {
    color: "#fbbf24",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 4,
  },
  maxRating: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },
  genreLabel: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  synopsisText: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
  },
  castScroll: {
    paddingRight: 10,
  },
  castCard: {
    width: 80,
    marginRight: 14,
    alignItems: "center",
  },
  castAvatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
  },
  castInitials: {
    color: "#38bdf8",
    fontSize: 18,
    fontWeight: "900",
  },
  castName: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 6,
    textAlign: "center",
    width: "100%",
  },
  castCharacter: {
    color: "#64748b",
    fontSize: 9,
    textAlign: "center",
    width: "100%",
    marginTop: 1,
  },
  emptyCastText: {
    color: "#64748b",
    fontSize: 13,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(2, 6, 23, 0.92)",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    padding: 16,
  },
  bookButton: {
    backgroundColor: "#38bdf8",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  bookButtonText: {
    color: "#020617",
    fontWeight: "bold",
    fontSize: 15,
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
    fontSize: 16,
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

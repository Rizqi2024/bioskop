import { auth } from "@/config/firebase";
import { FallbackImage, FallbackImageBackground } from "@/components/fallback-image";
import { movieService, Movie } from "@/services/movieService";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useRef, useState, useCallback } from "react";
import {
    Alert,
    Animated,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const COMING_SOON_CARD_WIDTH = 280;
const CARD_WIDTH = 160;
const CARD_GAP = 14;
const AUTO_SCROLL_INTERVAL = 4000;

const CITIES = ["Jakarta", "Depok", "Bogor", "Bandung", "Surabaya", "Medan"];
const PROMOS = [
  { id: "p1", title: "Diskon 50% Tiket Pertama!", subtitle: "Khusus pengguna baru aplikasi", color: "rgba(56, 189, 248, 0.08)", border: "#38bdf8", tag: "DISCOUNT" },
  { id: "p2", title: "Beli 1 Gratis 1 IMAX", subtitle: "Hari Jumat pakai QRIS Bank Mandiri", color: "rgba(168, 85, 247, 0.08)", border: "#a855f7", tag: "PROMO" },
  { id: "p3", title: "Cashback Rp 25.000", subtitle: "Pembayaran e-wallet Dana / Gopay", color: "rgba(236, 72, 153, 0.08)", border: "#ec4899", tag: "CASHBACK" },
];

export default function DashboardScreen() {
  const comingSoonRef = useRef<FlatList<Movie>>(null);
  const comingSoonOffset = useRef(0);

  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  
  // TIX ID specific states
  const [selectedCity, setSelectedCity] = useState("Jakarta");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Pengguna");

  // Skeleton Animation Value
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  // Pulse animation for LIVE indicator
  const livePulseAnim = useRef(new Animated.Value(0.4)).current;

  // Set user profile display name
  useEffect(() => {
    if (auth.currentUser) {
      setUserName(auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "Pengguna");
    }
  }, []);

  // Fetch movie data from OMDb service
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nowPlaying, upcoming, genreList] = await Promise.all([
        movieService.getNowPlaying(),
        movieService.getUpcoming(),
        movieService.getGenres(),
      ]);

      setNowPlayingMovies(nowPlaying);
      setFilteredMovies(nowPlaying);
      setUpcomingMovies(upcoming);
      
      // Filter out only genres that we want to showcase (Action, Comedy, Horror, Family/Animation)
      const targetIds = [28, 35, 27, 16]; // Action, Comedy, Horror, Animation
      const filteredGenreList = genreList.filter(g => targetIds.includes(g.id));
      setGenres(filteredGenreList);
      
      // Reset filter states
      setSelectedGenreId(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to load OMDb movies:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Setup loop animation for Skeleton Loader
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0.3);
    }
  }, [isLoading]);

  // Setup loop animation for LIVE indicator
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(livePulseAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(livePulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Setup Coming Soon Auto Scroll Carousel
  useEffect(() => {
    if (upcomingMovies.length === 0) return;

    const timer = setInterval(() => {
      comingSoonOffset.current += COMING_SOON_CARD_WIDTH + CARD_GAP;
      const maxScrollWidth = (upcomingMovies.length) * (COMING_SOON_CARD_WIDTH + CARD_GAP);
      if (comingSoonOffset.current >= maxScrollWidth - COMING_SOON_CARD_WIDTH) {
        comingSoonOffset.current = 0;
      }

      comingSoonRef.current?.scrollToOffset({
        offset: comingSoonOffset.current,
        animated: true,
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(timer);
  }, [upcomingMovies]);

  // Handle Genre Filter clicks
  const selectGenre = (genreId: number | null) => {
    setSelectedGenreId(genreId);
    let filtered = nowPlayingMovies;
    
    if (genreId !== null) {
      filtered = filtered.filter((movie) => movie.genreIds.includes(genreId));
    }
    
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredMovies(filtered);
  };

  // Search filter handler
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    let filtered = nowPlayingMovies;
    
    if (selectedGenreId !== null) {
      filtered = filtered.filter((movie) => movie.genreIds.includes(selectedGenreId));
    }
    
    if (text.trim() !== "") {
      filtered = filtered.filter((movie) =>
        movie.title.toLowerCase().includes(text.toLowerCase())
      );
    }
    
    setFilteredMovies(filtered);
  };

  const handleLogout = () => {
    Alert.alert(
      "Keluar",
      "Apakah Anda yakin ingin keluar dari akun ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace("/login");
            } catch (err) {
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const formatRupiah = (angka: number) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getGenreLabel = (genreIds: number[]) => {
    if (genreIds.includes(28)) return "Action";
    if (genreIds.includes(27)) return "Horror";
    if (genreIds.includes(35)) return "Comedy";
    if (genreIds.includes(16)) return "Animation";
    return "Drama";
  };

  // Helper for static image mapping - fallback based on movie ID for offline mock support
  const getPosterSource = (posterPath: string, movieId?: string) => {
    if (!posterPath) return require("../../assets/images/lp3i.png");
    
    const id = String(movieId || "");
    if (posterPath.includes("infinity") || id === "299536") return require("../../assets/images/infinity-war.jpg");
    if (posterPath.includes("endgame") || id === "299534") return require("../../assets/images/endgame.jpg");
    if (posterPath.includes("kkn") || id === "1000003") return require("../../assets/images/kkn.jpg");
    if (posterPath.includes("upin") || id === "1000004") return require("../../assets/images/upin.jpg");
    if (posterPath.includes("pabrik") || id === "1000005") return require("../../assets/images/pabrik-gula.jpg");
    
    if (posterPath.startsWith("http")) return { uri: posterPath };
    return require("../../assets/images/lp3i.png");
  };

  const getBackdropSource = (backdropPath: string, movieId?: string) => {
    if (!backdropPath) return require("../../assets/images/lp3i.png");
    
    const id = String(movieId || "");
    if (backdropPath.includes("infinity") || id === "299536") return require("../../assets/images/infinity-war.jpg");
    if (backdropPath.includes("endgame") || id === "299534") return require("../../assets/images/endgame.jpg");
    if (backdropPath.includes("kkn") || id === "1000003") return require("../../assets/images/kkn.jpg");
    if (backdropPath.includes("upin") || id === "1000004") return require("../../assets/images/upin.jpg");
    if (backdropPath.includes("pabrik") || id === "1000005") return require("../../assets/images/pabrik-gula.jpg");
    
    if (backdropPath.startsWith("http")) return { uri: backdropPath };
    return require("../../assets/images/lp3i.png");
  };

  // Cinema Format labels: e.g. XXI, CGV, IMAX
  const getMovieFormat = (movieId: string) => {
    const num = Number(movieId) || 0;
    if (num === 299536 || num === 299534 || num === 533535) return "IMAX 3D";
    if (num % 2 === 0) return "XXI 2D";
    return "CGV 2D";
  };

  const getTicketPrice = (movieId: string) => {
    if (movieId === "1000003") return 40000;
    if (movieId === "1000004") return 30000;
    if (movieId === "1000005") return 50000;
    return 45000;
  };

  // Render Skeletons for dashboard list
  const renderSkeletonList = () => {
    const arr = [1, 2, 3];
    return (
      <View style={{ flexDirection: "row", gap: 14 }}>
        {arr.map((item) => (
          <View key={item} style={styles.skeletonCard}>
            <Animated.View style={[styles.skeletonPoster, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.skeletonTitle, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.skeletonMeta, { opacity: pulseAnim }]} />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* App Bar Header */}
      <View style={styles.appBar}>
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.eyebrow}>Selamat Datang,</Text>
            <Text style={styles.brandTitle} numberOfLines={1}>{userName}</Text>
          </View>
        </View>

        <View style={styles.rightHeaderContainer}>
          <TouchableOpacity 
            style={styles.cityBtn} 
            onPress={() => setShowCityDropdown(!showCityDropdown)}
            activeOpacity={0.8}
          >
            <Ionicons name="location-sharp" size={15} color="#fbbf24" style={{ marginRight: 3 }} />
            <Text style={styles.cityText}>{selectedCity}</Text>
            <Ionicons name={showCityDropdown ? "chevron-up" : "chevron-down"} size={12} color="#94a3b8" style={{ marginLeft: 3 }} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Absolute City Dropdown Modal overlay */}
      {showCityDropdown && (
        <View style={styles.cityDropdownMenu}>
          {CITIES.map((city) => (
            <TouchableOpacity
              key={city}
              style={[styles.cityDropdownItem, selectedCity === city && styles.cityDropdownItemActive]}
              onPress={() => {
                setSelectedCity(city);
                setShowCityDropdown(false);
              }}
            >
              <Text style={[styles.cityItemText, selectedCity === city && styles.cityItemTextActive]}>
                {city}
              </Text>
              {selectedCity === city && <Ionicons name="checkmark" size={16} color="#38bdf8" />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* SEARCH BAR SECTION */}
      <View style={styles.searchSection}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={18} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari film di bioskop..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* PROMOTIONAL ADS SLIDER */}
        <View style={styles.promoSection}>
          <FlatList
            data={PROMOS}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <View style={[styles.promoCard, { backgroundColor: item.color, borderColor: item.border }]}>
                <View style={[styles.promoBadge, { backgroundColor: item.border }]}>
                  <Text style={styles.promoBadgeText}>{item.tag}</Text>
                </View>
                <Text style={styles.promoTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.promoSubtitle} numberOfLines={1}>{item.subtitle}</Text>
              </View>
            )}
          />
        </View>

        {/* COMING SOON CAROUSEL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          <Text style={styles.sectionSubtitle}>Film-film seru yang segera tayang di bioskop</Text>

          {isLoading ? (
            renderSkeletonList()
          ) : (
            <FlatList
              ref={comingSoonRef}
              data={upcomingMovies}
              horizontal
              keyExtractor={(item) => `upcoming-${item.id}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.comingSoonCard}
                  onPress={() => router.push({ pathname: "/detail/[id]", params: { id: item.id } } as any)}
                >
                  <FallbackImageBackground
                    source={getBackdropSource(item.backdropPath, item.id)}
                    fallbackSource={require("../../assets/images/lp3i.png")}
                    style={styles.comingSoonImageWrap}
                    imageStyle={{ borderRadius: 18 }}
                  >
                    <View style={styles.comingSoonOverlay}>
                      <View style={styles.headerBadgeRow}>
                        <View style={styles.comingSoonBadge}>
                          <Ionicons name="sparkles" size={12} color="#fff" />
                          <Text style={styles.comingSoonBadgeText}>Upcoming</Text>
                        </View>
                        <View style={styles.formatBadge}>
                          <Text style={styles.formatBadgeText}>{getMovieFormat(item.id)}</Text>
                        </View>
                      </View>

                      <View style={styles.comingSoonTextContainer}>
                        <Text style={styles.comingSoonTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.comingSoonMeta}>{item.releaseDate}</Text>
                      </View>
                    </View>
                  </FallbackImageBackground>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* GENRE FILTER CHIPS */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, selectedGenreId === null && styles.filterChipActive]}
              onPress={() => selectGenre(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, selectedGenreId === null && styles.filterTextActive]}>
                Semua Genre
              </Text>
            </TouchableOpacity>

            {genres.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[styles.filterChip, selectedGenreId === g.id && styles.filterChipActive]}
                onPress={() => selectGenre(g.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, selectedGenreId === g.id && styles.filterTextActive]}>
                  {g.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* NOW PLAYING LIST */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Sedang Tayang</Text>
              <Text style={styles.sectionSubtitle}>{filteredMovies.length} film tersedia untuk dipesan</Text>
            </View>
            <View style={styles.liveBadge}>
              <Animated.View 
                style={[
                  styles.liveIndicator, 
                  { 
                    opacity: livePulseAnim, 
                    transform: [{ 
                      scale: livePulseAnim.interpolate({ 
                        inputRange: [0.4, 1.0], 
                        outputRange: [0.8, 1.2] 
                      }) 
                    }] 
                  }
                ]} 
              />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>

          {isLoading ? (
            renderSkeletonList()
          ) : filteredMovies.length === 0 ? (
            <View style={styles.emptySearch}>
              <Ionicons name="film-outline" size={40} color="#475569" />
              <Text style={styles.emptySearchText}>Tidak ada film kategori ini</Text>
            </View>
          ) : (
            <FlatList
              data={filteredMovies}
              horizontal
              keyExtractor={(item) => `now-playing-${item.id}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.nowPlayingCard}
                  onPress={() => router.push({ pathname: "/detail/[id]", params: { id: item.id } } as any)}
                >
                  <View style={styles.posterContainer}>
                    <FallbackImage
                      source={getPosterSource(item.posterPath, item.id)}
                      fallbackSource={require("../../assets/images/lp3i.png")}
                      style={styles.posterImage}
                    />
                    <View style={styles.posterFormatBadge}>
                      <Text style={styles.posterFormatBadgeText}>{getMovieFormat(item.id)}</Text>
                    </View>
                  </View>

                  <View style={styles.nowPlayingDetails}>
                    <Text numberOfLines={1} style={styles.nowPlayingTitle}>{item.title}</Text>
                    
                    <View style={styles.nowPlayingMetaRow}>
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <Text style={styles.nowPlayingRating}>{item.voteAverage.toFixed(1)}</Text>
                      <Text style={styles.nowPlayingGenre}> • {getGenreLabel(item.genreIds)}</Text>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>{formatRupiah(getTicketPrice(item.id))}</Text>
                      <View style={styles.ticketBtn}>
                        <Ionicons name="ticket" size={14} color="#020617" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 50,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    marginBottom: 14,
    zIndex: 10,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0284c7",
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  headerTextCol: {
    justifyContent: "center",
  },
  eyebrow: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
  },
  brandTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "bold",
    maxWidth: 130,
  },
  rightHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cityBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  cityText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "bold",
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  cityDropdownMenu: {
    position: "absolute",
    top: 100,
    right: 22,
    backgroundColor: "#0f172a",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.25)",
    borderRadius: 14,
    padding: 6,
    width: 150,
    zIndex: 999,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  cityDropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cityDropdownItemActive: {
    backgroundColor: "rgba(56, 189, 248, 0.08)",
  },
  cityItemText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "500",
  },
  cityItemTextActive: {
    color: "#38bdf8",
    fontWeight: "bold",
  },
  searchSection: {
    paddingHorizontal: 22,
    marginBottom: 16,
    zIndex: 1,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 14,
    paddingVertical: 8,
  },
  promoSection: {
    marginBottom: 20,
    paddingHorizontal: 22,
  },
  promoCard: {
    width: 250,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginRight: 12,
  },
  promoBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  promoBadgeText: {
    color: "#020617",
    fontSize: 9,
    fontWeight: "900",
  },
  promoTitle: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "bold",
  },
  promoSubtitle: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  horizontalList: {
    paddingRight: 10,
  },
  comingSoonCard: {
    width: COMING_SOON_CARD_WIDTH,
    height: 160,
    marginRight: CARD_GAP,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  comingSoonImageWrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  comingSoonOverlay: {
    padding: 12,
    backgroundColor: "rgba(2, 6, 23, 0.35)",
    height: "100%",
    justifyContent: "space-between",
  },
  headerBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  comingSoonBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#0284c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  comingSoonBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  formatBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.25)",
    borderWidth: 1,
    borderColor: "#38bdf8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  formatBadgeText: {
    color: "#38bdf8",
    fontSize: 8,
    fontWeight: "900",
  },
  comingSoonTextContainer: {
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
  },
  comingSoonTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  comingSoonMeta: {
    color: "#cbd5e1",
    fontSize: 11,
    marginTop: 2,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 22,
  },
  filterChip: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  filterChipActive: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },
  filterText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#020617",
    fontWeight: "bold",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  liveBadgeText: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "bold",
  },
  nowPlayingCard: {
    width: CARD_WIDTH,
    backgroundColor: "#0f172a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginRight: CARD_GAP,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  posterContainer: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  posterImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1e293b",
  },
  posterFormatBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    borderWidth: 1,
    borderColor: "#38bdf8",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  posterFormatBadgeText: {
    color: "#38bdf8",
    fontSize: 8,
    fontWeight: "900",
  },
  nowPlayingDetails: {
    padding: 12,
  },
  nowPlayingTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "bold",
  },
  nowPlayingMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  nowPlayingRating: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 3,
  },
  nowPlayingGenre: {
    color: "#64748b",
    fontSize: 11,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  priceText: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "bold",
  },
  ticketBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#38bdf8",
    justifyContent: "center",
    alignItems: "center",
  },
  emptySearch: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    width: "100%",
  },
  emptySearchText: {
    color: "#475569",
    marginTop: 10,
    fontSize: 14,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: 280,
    backgroundColor: "#0f172a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 8,
  },
  skeletonPoster: {
    width: "100%",
    height: 180,
    backgroundColor: "#1e293b",
    borderRadius: 12,
  },
  skeletonTitle: {
    width: "70%",
    height: 14,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    marginTop: 12,
  },
  skeletonMeta: {
    width: "40%",
    height: 10,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    marginTop: 8,
  },
});

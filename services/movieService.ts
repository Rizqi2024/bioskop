import { API_CONFIG, OMDB_CONFIG } from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Movie {
  id: string;
  title: string;
  posterPath: string;
  backdropPath: string;
  voteAverage: number;
  releaseDate: string;
  genreIds: number[];
  overview: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

type OmdbMovie = {
  imdbID: string;
  Title: string;
  Year: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Plot?: string;
  Poster?: string;
  imdbRating?: string;
  Actors?: string;
  Response: "True" | "False";
  Error?: string;
};

type CachedData<T> = {
  data: T;
  timestamp: number;
};

const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 10749, name: "Romance" },
];

const GENRE_ID_BY_NAME: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  drama: 18,
  horror: 27,
  mystery: 9648,
  "sci-fi": 878,
  thriller: 53,
  family: 10751,
  fantasy: 14,
  romance: 10749,
};

const NOW_PLAYING_IDS = [
  "tt4154796",
  "tt4154756",
  "tt10872600",
  "tt0816692",
  "tt1375666",
  "tt1745960",
  "tt2380307",
  "tt0111161",
  "tt0109830",
  "tt0110912",
  "tt0120737",
  "tt0133093",
  "tt0110357",
  "tt2294629",
  "tt4633694",
  "tt7286456",
  "tt6751668",
  "tt1201607",
  "tt1392190",
  "tt15398776",
];

const UPCOMING_IDS = [
  "tt6263850",
  "tt22022452",
  "tt9218128",
  "tt8790086",
  "tt1262426",
  "tt14948432",
  "tt13186482",
  "tt15239678",
];

const OFFLINE_MOVIES: Movie[] = [
  {
    id: "tt4154756",
    title: "Avengers: Infinity War",
    posterPath: "infinity",
    backdropPath: "infinity",
    voteAverage: 8.4,
    releaseDate: "2018",
    genreIds: [28, 12, 878],
    overview: "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat Thanos.",
    runtime: 149,
    genres: [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 878, name: "Sci-Fi" },
    ],
  },
  {
    id: "tt4154796",
    title: "Avengers: Endgame",
    posterPath: "endgame",
    backdropPath: "endgame",
    voteAverage: 8.4,
    releaseDate: "2019",
    genreIds: [28, 12, 18],
    overview: "After the devastating events of Infinity War, the Avengers assemble once more.",
    runtime: 181,
    genres: [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 18, name: "Drama" },
    ],
  },
  {
    id: "local-kkn",
    title: "KKN di Desa Penari",
    posterPath: "kkn",
    backdropPath: "kkn",
    voteAverage: 6.8,
    releaseDate: "2022",
    genreIds: [27, 9648],
    overview: "Enam mahasiswa menjalani KKN di desa terpencil yang menyimpan misteri kelam.",
    runtime: 130,
    genres: [
      { id: 27, name: "Horror" },
      { id: 9648, name: "Mystery" },
    ],
  },
  {
    id: "local-upin",
    title: "Upin & Ipin: The Movie",
    posterPath: "upin",
    backdropPath: "upin",
    voteAverage: 7.2,
    releaseDate: "2019",
    genreIds: [16, 12, 10751],
    overview: "Upin, Ipin, dan teman-temannya memulai petualangan fantasi yang penuh kejutan.",
    runtime: 100,
    genres: [
      { id: 16, name: "Animation" },
      { id: 12, name: "Adventure" },
      { id: 10751, name: "Family" },
    ],
  },
  {
    id: "local-pabrik",
    title: "Pabrik Gula",
    posterPath: "pabrik",
    backdropPath: "pabrik",
    voteAverage: 6.0,
    releaseDate: "2024",
    genreIds: [27, 53],
    overview: "Misteri di balik pabrik gula tua yang menyimpan teror masa lalu.",
    runtime: 112,
    genres: [
      { id: 27, name: "Horror" },
      { id: 53, name: "Thriller" },
    ],
  },
];

const fetchFromOmdb = async (params: Record<string, string>, retryCount = 0): Promise<OmdbMovie> => {
  if (!OMDB_CONFIG.API_KEY || OMDB_CONFIG.API_KEY === "your_omdb_api_key") {
    throw new Error("OMDb API key belum diisi");
  }

  try {
    const query = new URLSearchParams({
      apikey: OMDB_CONFIG.API_KEY,
      type: "movie",
      plot: "full",
      r: "json",
      ...params,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);

    const response = await fetch(`${OMDB_CONFIG.BASE_URL}/?${query.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`OMDb request failed with status ${response.status}`);
    }

    const data = (await response.json()) as OmdbMovie;
    if (data.Response === "False") {
      throw new Error(data.Error || "OMDb returned an empty response");
    }

    return data;
  } catch (error) {
    // Retry logic
    if (retryCount < API_CONFIG.MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1)));
      return fetchFromOmdb(params, retryCount + 1);
    }
    throw error;
  }
};

// Cache management
const getCacheKey = (prefix: string, id?: string) => `movie_cache_${prefix}${id ? `_${id}` : ""}`;

const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const parsed: CachedData<T> = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > API_CONFIG.CACHE_DURATION * 1000;

    if (isExpired) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.warn("Cache read error:", error);
    return null;
  }
};

const saveToCache = async <T>(key: string, data: T): Promise<void> => {
  try {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.warn("Cache write error:", error);
  }
};

const parseRuntime = (runtime?: string) => {
  const match = runtime?.match(/\d+/);
  return match ? Number(match[0]) : undefined;
};

const parseRating = (rating?: string) => {
  const value = Number(rating);
  return Number.isFinite(value) ? value : 0;
};

const parseGenres = (genreText?: string) => {
  const names = genreText?.split(",").map((genre) => genre.trim()).filter(Boolean) || [];
  const genreIds = names
    .map((name) => GENRE_ID_BY_NAME[name.toLowerCase()])
    .filter((id): id is number => Boolean(id));

  const genres = names.map((name) => ({
    id: GENRE_ID_BY_NAME[name.toLowerCase()] || 18,
    name,
  }));

  return { genreIds, genres };
};

const mapOmdbMovie = (movie: OmdbMovie): Movie => {
  const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : "";
  const { genreIds, genres } = parseGenres(movie.Genre);

  return {
    id: movie.imdbID,
    title: movie.Title,
    posterPath: poster,
    backdropPath: poster,
    voteAverage: parseRating(movie.imdbRating),
    releaseDate: movie.Released && movie.Released !== "N/A" ? movie.Released : movie.Year,
    genreIds,
    overview: movie.Plot && movie.Plot !== "N/A" ? movie.Plot : "Sinopsis belum tersedia.",
    runtime: parseRuntime(movie.Runtime),
    genres,
  };
};

const getMoviesByIds = async (ids: string[], fallback: Movie[]) => {
  try {
    const movies = await Promise.all(ids.map((id) => fetchFromOmdb({ i: id })));
    return movies.map(mapOmdbMovie);
  } catch (error) {
    console.warn("OMDb API failed or unconfigured, using offline movie data:", error);
    return fallback;
  }
};

const getOfflineCatalog = (limit = 20) => {
  const repeated = Array.from({ length: Math.ceil(limit / OFFLINE_MOVIES.length) }, () => OFFLINE_MOVIES).flat();
  return repeated.slice(0, limit).map((movie, index) => ({
    ...movie,
    id: index < OFFLINE_MOVIES.length ? movie.id : `${movie.id}-${index}`,
  }));
};

const getCastFromText = (actors?: string): CastMember[] => {
  if (!actors || actors === "N/A") {
    return [];
  }

  return actors.split(",").map((name, index) => ({
    id: index + 1,
    name: name.trim(),
    character: "Pemeran",
    profilePath: null,
  }));
};

export const movieService = {
  getNowPlaying: async (): Promise<Movie[]> => {
    const cacheKey = getCacheKey("now_playing");
    const cached = await getFromCache<Movie[]>(cacheKey);
    if (cached) return cached;

    try {
      const movies = await Promise.all(NOW_PLAYING_IDS.map((id) => fetchFromOmdb({ i: id })));
      const result = movies.map(mapOmdbMovie);
      await saveToCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn("OMDb API failed or unconfigured, using offline movie data:", error);
      return getOfflineCatalog(20);
    }
  },

  getUpcoming: async (): Promise<Movie[]> => {
    const cacheKey = getCacheKey("upcoming");
    const cached = await getFromCache<Movie[]>(cacheKey);
    if (cached) return cached;

    try {
      const movies = await Promise.all(UPCOMING_IDS.map((id) => fetchFromOmdb({ i: id })));
      const result = movies.map(mapOmdbMovie);
      await saveToCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn("OMDb API failed or unconfigured, using offline movie data:", error);
      return getOfflineCatalog(8);
    }
  },

  getMovieDetails: async (movieId: string): Promise<Movie | null> => {
    if (movieId.startsWith("local-")) {
      return OFFLINE_MOVIES.find((movie) => movie.id === movieId) || OFFLINE_MOVIES[0];
    }

    const cacheKey = getCacheKey("detail", movieId);
    const cached = await getFromCache<Movie>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchFromOmdb({ i: movieId });
      const result = mapOmdbMovie(data);
      await saveToCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn(`OMDb getMovieDetails for ${movieId} failed, searching offline data:`, error);
      const offlineMovies = getOfflineCatalog(20);
      return offlineMovies.find((movie) => movie.id === movieId) || offlineMovies[0];
    }
  },

  getMovieCredits: async (movieId: string): Promise<CastMember[]> => {
    if (movieId.startsWith("local-")) {
      return [
        { id: 1, name: "Pemeran Utama", character: "Pemeran", profilePath: null },
        { id: 2, name: "Pemeran Pendukung", character: "Pemeran", profilePath: null },
      ];
    }

    const cacheKey = getCacheKey("credits", movieId);
    const cached = await getFromCache<CastMember[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchFromOmdb({ i: movieId });
      const result = getCastFromText(data.Actors);
      await saveToCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn(`OMDb getMovieCredits for ${movieId} failed:`, error);
      return [
        { id: 1, name: "Pemeran Utama", character: "Pemeran", profilePath: null },
        { id: 2, name: "Pemeran Pendukung", character: "Pemeran", profilePath: null },
      ];
    }
  },

  getGenres: async (): Promise<{ id: number; name: string }[]> => {
    return GENRES;
  },

  // Search functionality
  searchMovies: async (query: string): Promise<Movie[]> => {
    if (!query.trim()) return [];

    const cacheKey = getCacheKey("search", query);
    const cached = await getFromCache<Movie[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchFromOmdb({ s: query });
      
      // Note: OMDb search returns Search array, need to handle differently
      // For now, return empty as we need additional handling
      return [];
    } catch (error) {
      console.warn(`OMDb search for "${query}" failed:`, error);
      return [];
    }
  },

  // Clear cache when needed
  clearCache: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith("movie_cache_"));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn("Cache clear error:", error);
    }
  },
};

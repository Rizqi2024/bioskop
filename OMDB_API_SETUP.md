# 📱 Bioskop App - OMDb API Integration Guide

## 📋 Project Overview

Aplikasi bioskop booking dengan React Native + Expo yang terintegrasi dengan **OMDb API** untuk data film.

### Tech Stack
- **Framework**: React Native + Expo v54
- **UI Navigation**: Expo Router v6
- **Authentication**: Firebase Auth
- **Database**: Firestore  
- **External API**: OMDb API
- **State Management**: React Hooks
- **Storage**: AsyncStorage (caching)

---

## 🔑 OMDb API Configuration

### Setup API Key

#### 1. Update `.env.local` file
```env
EXPO_PUBLIC_OMDB_API_KEY=a30f0041
EXPO_PUBLIC_OMDB_BASE_URL=https://www.omdbapi.com
```

#### 2. Verify in `constants/config.ts`
```typescript
export const OMDB_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_OMDB_API_KEY || "a30f0041",
  BASE_URL: process.env.EXPO_PUBLIC_OMDB_BASE_URL || "https://www.omdbapi.com",
};
```

### Environment Variables
- `EXPO_PUBLIC_OMDB_API_KEY`: API key untuk OMDb (wajib)
- `EXPO_PUBLIC_OMDB_BASE_URL`: Base URL OMDb (default: https://www.omdbapi.com)

---

## 🎬 movieService API Reference

### Methods

#### `getNowPlaying()`
Mengambil daftar film yang sedang tayang.
```typescript
const movies = await movieService.getNowPlaying();
```

#### `getUpcoming()`  
Mengambil daftar film yang akan datang.
```typescript
const upcoming = await movieService.getUpcoming();
```

#### `getMovieDetails(movieId: string)`
Mengambil detail film berdasarkan ID (IMDb ID).
```typescript
const movie = await movieService.getMovieDetails("tt4154796");
```

#### `getMovieCredits(movieId: string)`
Mengambil daftar pemeran film.
```typescript
const credits = await movieService.getMovieCredits("tt4154796");
```

#### `getGenres()`
Mengambil daftar genre yang tersedia.
```typescript
const genres = await movieService.getGenres();
```

#### `searchMovies(query: string)`
Mencari film berdasarkan judul (beta).
```typescript
const results = await movieService.searchMovies("Avengers");
```

#### `clearCache()`
Menghapus cache film yang tersimpan.
```typescript
await movieService.clearCache();
```

---

## 💾 Caching & Performance

### Caching Strategy
- **Duration**: 1 jam (3600 detik)
- **Storage**: AsyncStorage
- **Automatic Expiry**: Cache otomatis terhapus setelah 1 jam

### Cache Keys
- `movie_cache_now_playing`: Film yang sedang tayang
- `movie_cache_upcoming`: Film yang akan datang
- `movie_cache_detail_[movieId]`: Detail film
- `movie_cache_credits_[movieId]`: Daftar pemeran

---

## 🔄 Retry & Error Handling

### Retry Logic
- **Max Retries**: 3 kali
- **Retry Delay**: Exponential backoff (1s → 2s → 4s)
- **Request Timeout**: 10 detik

### Fallback Mechanism
Jika API OMDb gagal, aplikasi akan menggunakan data offline (hardcoded movies).

**Offline Movies**:
- Avengers: Infinity War
- Avengers: Endgame  
- KKN di Desa Penari (lokal)
- Upin & Ipin: The Movie (lokal)
- Pabrik Gula (lokal)

---

## ⚠️ Known Limitations

1. **Search API** (OMDb search endpoint)
   - OMDb mengembalikan array hasil yang berbeda formatnya
   - Belum fully implemented
   - Plan: Handle array response properly

2. **Image CDN**
   - Poster menggunakan OMDb URLs langsung
   - Tidak ada fallback image untuk poster yang rusak
   - Plan: Implement image fallback component

3. **Genre Mapping**
   - OMDb tidak memiliki genre ID yang sama seperti TMDb
   - Manual mapping berdasarkan string genre
   - Beberapa genre mungkin tidak ter-map dengan sempurna

---

## 🐛 Troubleshooting

### "OMDb API key belum diisi"
**Solusi**: Pastikan `.env.local` memiliki `EXPO_PUBLIC_OMDB_API_KEY`

### Data Film Kosong
**Penyebab**: API OMDb gagal atau koneksi internet tidak stabil
**Solusi**: Aplikasi akan fallback ke offline movies, atau tunggu & coba refresh

### Cache Tidak Ter-clear
**Solusi**: Manual clear:
```typescript
await movieService.clearCache();
```

### Gambar/Poster Tidak Muncul
**Penyebab**: URL poster OMDb mungkin broken
**Solusi**: Gunakan `FallbackImage` component untuk handle error

---

## 📈 API Quota & Rate Limiting

- **Free Plan**: 1000 requests per hari
- **Rate Limit**: ~0.1 request per detik
- **Best Practice**: Gunakan caching untuk mengurangi requests

**Current Usage** (estimated):
- `getNowPlaying()`: 20 requests
- `getUpcoming()`: 8 requests  
- `getMovieDetails()`: 1 per detail view
- **Total**: ~29+ requests per session

---

## 🚀 Future Improvements

### Priority 1
- [ ] Implement full search functionality
- [ ] Add image caching
- [ ] Better error UI for users

### Priority 2
- [ ] Add offline mode indicator
- [ ] Implement infinite scroll untuk movie lists
- [ ] Add ratings/reviews dari users

### Priority 3  
- [ ] Support untuk trending movies
- [ ] Advanced filtering (genre, rating, etc)
- [ ] Movie recommendations

---

## 📚 Resources

- [OMDb API Documentation](http://www.omdbapi.com/)
- [Expo AsyncStorage](https://docs.expo.dev/versions/latest/sdk/async-storage/)
- [React Native Fetch API](https://reactnative.dev/docs/fetch)

---

## 📝 Version History

- **v1.0** (Current)
  - Initial OMDb integration
  - Caching with AsyncStorage
  - Retry logic with exponential backoff
  - 20 Now Playing + 8 Upcoming movies
  - Offline fallback data

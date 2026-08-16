// Script local para obtener datos reales desde TMDB y generar un JSON estático.
// NO se publica la API key en GitHub. Se usa solo en local.
// Requiere: TMDB_API_KEY en el entorno local.

const fs = require('fs');
const path = require('path');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/original';

const MOVIE_TITLES = [
  'Interstellar',
  'Inception',
  'The Batman',
  'Spider-Man: Into the Spider-Verse',
  'Toy Story',
  'Jurassic Park',
  'The Lord of the Rings: The Fellowship of the Ring',
  'Avatar',
  'Back to the Future',
  'How to Train Your Dragon',
  'The Martian',
  'Guardians of the Galaxy'
];

if (!TMDB_API_KEY) {
  console.error('Falta TMDB_API_KEY. Exporta la variable antes de ejecutar el script.');
  process.exit(1);
}

async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function formatRuntime(minutes) {
  if (!minutes || Number.isNaN(Number(minutes))) return 'RECURSO PENDIENTE';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

function formatYear(dateString) {
  return dateString ? new Date(dateString).getFullYear() : 'RECURSO PENDIENTE';
}

async function getMovieData(title) {
  const searchResult = await tmdbFetch('/search/movie', {
    query: title,
    include_adult: false,
    language: 'es-ES', // Cambiado a español para descripciones y géneros
    page: 1
  });

  if (!searchResult.results || searchResult.results.length === 0) {
    return null;
  }

  const movie = searchResult.results[0];

  const details = await tmdbFetch(`/movie/${movie.id}`, {
    language: 'es-ES',
    append_to_response: 'credits,videos,images'
  });

  const trailer = details.videos?.results?.find(
    (video) => video.site === 'YouTube' && ['Trailer', 'Official Trailer', 'Teaser'].includes(video.type)
  );

  const director = details.credits?.crew?.find((person) => person.job === 'Director')?.name || 'RECURSO PENDIENTE';
  const cast = details.credits?.cast?.slice(0, 5).map((person) => person.name) || ['RECURSO PENDIENTE'];

  const imdbId = details.imdb_id || '';
  const trailerKey = trailer ? trailer.key : null;

  return {
    id: movie.id,
    title: details.title || title,
    originalTitle: details.original_title || title,
    year: formatYear(details.release_date),
    genres: (details.genres || []).map((genre) => genre.name),
    duration: formatRuntime(details.runtime),
    rating: details.vote_average ?? 'RECURSO PENDIENTE',
    poster: details.poster_path ? `${IMAGE_BASE_URL}${details.poster_path}` : 'RECURSO PENDIENTE',
    backdrop: details.backdrop_path ? `${IMAGE_BASE_URL}${details.backdrop_path}` : 'RECURSO PENDIENTE',
    overview: details.overview || 'RECURSO PENDIENTE',
    description: details.overview || 'RECURSO PENDIENTE',
    epilogue: details.tagline || details.overview || 'RECURSO PENDIENTE',
    director,
    cast,
    // Propiedades de IMDb
    imdb: imdbId ? `https://www.imdb.com/title/${imdbId}/` : 'RECURSO PENDIENTE',
    imdb_id: imdbId,
    imdb_url: imdbId ? `https://www.imdb.com/title/${imdbId}/` : 'RECURSO PENDIENTE',
    imdb_trailer_url: trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : 'RECURSO PENDIENTE',
    // Propiedades de YouTube y Trailer
    youtube_id: trailerKey,
    trailer: trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : 'RECURSO PENDIENTE',
    trailerEmbed: trailerKey ? `https://www.youtube.com/embed/${trailerKey}` : 'RECURSO PENDIENTE',
    source: 'TMDB API (generado localmente)'
  };
}

(async () => {
  const movies = [];

  for (const title of MOVIE_TITLES) {
    try {
      const movie = await getMovieData(title);
      if (movie) {
        movies.push(movie);
      }
    } catch (error) {
      console.warn(`No se pudo obtener ${title}:`, error.message);
    }
  }

  const outputPath = path.join(__dirname, '..', 'data', 'movies.json');
  fs.writeFileSync(outputPath, JSON.stringify(movies, null, 2));

  console.log(`Se generó ${movies.length} películas en ${outputPath}`);
})();
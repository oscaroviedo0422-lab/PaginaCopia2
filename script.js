const PLACEHOLDER_POSTER = './img/placeholder-poster.svg';
const PLACEHOLDER_BACKDROP = './img/placeholder-backdrop.svg';

let movies = [];

const modal = document.getElementById('movie-modal');
const modalTitle = document.getElementById('movie-modal-title');
const modalPoster = document.getElementById('movie-modal-poster');
const modalMeta = document.getElementById('movie-modal-meta');
const modalDescription = document.getElementById('movie-modal-description');
const modalDirector = document.getElementById('movie-modal-director');
const modalCast = document.getElementById('movie-modal-cast');
const modalEpilogue = document.getElementById('movie-modal-epilogue');
const modalTrailer = document.getElementById('movie-modal-trailer');
const closeButton = document.querySelector('.movie-modal-close');

function formatRuntime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function getMovieImage(movie, fallback) {
  return movie?.poster || movie?.backdrop || fallback;
}

function openMovieModal(movieId) {
  const movie = movies.find((item) => item.id === movieId || item.title === movieId);
  if (!movie) return;

  modalTitle.textContent = movie.title;
  modalPoster.src = getMovieImage(movie, PLACEHOLDER_POSTER);
  modalPoster.alt = `Poster de ${movie.title}`;
  modalMeta.innerHTML = `
    <span>${movie.year}</span>
    <span>${formatRuntime(movie.duration)}</span>
    <span>${movie.genres?.join(', ') || 'Género pendiente'}</span>
    <span>${movie.rating}</span>
  `;
  modalDescription.textContent = movie.overview || 'Sinopsis pendiente de verificación.';
  modalDirector.textContent = movie.director || 'Director pendiente';
  modalCast.textContent = Array.isArray(movie.cast) ? movie.cast.join(', ') : 'Reparto pendiente';
  modalEpilogue.textContent = movie.epilogue || 'El epílogo será agregado según la versión final de datos verificados.';

  if (movie.trailer) {
    modalTrailer.src = movie.trailer;
    modalTrailer.style.display = 'block';
    modalTrailer.removeAttribute('hidden');
    const trailerPlaceholder = modalTrailer.parentElement?.querySelector('.trailer-pending');
    if (trailerPlaceholder) {
      trailerPlaceholder.remove();
    }
  } else {
    modalTrailer.src = '';
    modalTrailer.style.display = 'none';
    modalTrailer.setAttribute('hidden', 'hidden');
    const trailerPlaceholder = modalTrailer.parentElement?.querySelector('.trailer-pending');
    if (!trailerPlaceholder) {
      modalTrailer.parentElement.insertAdjacentHTML(
        'beforeend',
        '<div class="trailer-pending">Trailer oficial pendiente de verificación.</div>'
      );
    }
  }

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeMovieModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  if (modalTrailer) {
    modalTrailer.src = '';
  }
}

function attachQuickViewButtons() {
  document.querySelectorAll('.movie-card').forEach((card) => {
    const title = card.querySelector('h3')?.textContent?.trim();
    if (!title) return;

    let button = card.querySelector('.quick-view');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'quick-view';
      button.textContent = 'Ver detalles';
      card.querySelector('.movie-card-content')?.appendChild(button);
    }

    button.addEventListener('click', () => {
      const selected = movies.find((movie) => movie.title === title);
      openMovieModal(selected ? selected.id : title);
    });
  });
}

async function loadMovies() {
  try {
    const response = await fetch('./data/movies.json');
    if (!response.ok) throw new Error('No se pudo cargar movies.json');
    movies = await response.json();

    const movieMap = new Map(movies.map((movie) => [movie.title, movie]));
    document.querySelectorAll('.movie-card').forEach((card) => {
      const title = card.querySelector('h3')?.textContent?.trim();
      const movie = movieMap.get(title);
      if (!movie) return;

      const image = card.querySelector('img');
      if (image) {
        image.src = movie.poster || PLACEHOLDER_POSTER;
        image.alt = `Portada de ${movie.title}`;
      }

      const content = card.querySelector('.movie-card-content');
      const meta = content?.querySelector('.movie-meta');
      if (meta) {
        meta.innerHTML = `
          <span>${movie.year}</span>
          <span>${movie.genres?.[0] || 'Sin género'}</span>
        `;
      }

      const rating = content?.querySelector('p');
      if (rating) {
        rating.textContent = movie.rating || 'N/A';
      }
    });

    attachQuickViewButtons();
  } catch (error) {
    console.warn('No se pudo cargar el JSON de películas:', error.message);
    attachQuickViewButtons();
  }
}

if (closeButton) {
  closeButton.addEventListener('click', closeMovieModal);
}

if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeMovieModal();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal && modal.classList.contains('is-open')) {
    closeMovieModal();
  }
});

loadMovies();

/* ===== TRAILER MODAL FUNCTIONALITY ===== */

const trailerModal = document.getElementById('trailer-modal');
const trailerPlayer = document.getElementById('trailer-player');
const trailerModalClose = document.querySelector('.trailer-modal-close');
const playTrailerBtn = document.getElementById('play-trailer-btn');
const imdbTrailerLink = document.getElementById('imdb-trailer-link');
const trailerImdbBtn = document.getElementById('trailer-imdb-btn');

function getMovieIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || 'interstellar';
}

function getMovieData(movieId) {
  return movies.find((m) => m.id === movieId);
}

function openTrailerModal(movieId) {
  const movie = getMovieData(movieId);
  if (!movie) return;

  if (movie.youtube_id) {
    trailerPlayer.src = `https://www.youtube-nocookie.com/embed/${movie.youtube_id}?autoplay=1&rel=0`;
  }

  if (movie.imdb_trailer_url) {
    trailerImdbBtn.href = movie.imdb_trailer_url;
  }

  trailerModal.classList.add('is-open');
  trailerModal.setAttribute('aria-hidden', 'false');
}

function closeTrailerModal() {
  trailerModal.classList.remove('is-open');
  trailerModal.setAttribute('aria-hidden', 'true');
  trailerPlayer.src = '';
}

function initializeTrailerPage() {
  if (!playTrailerBtn) return;

  const movieId = getMovieIdFromQuery();
  const movie = getMovieData(movieId);

  if (!movie) return;

  if (movie.youtube_id) {
    playTrailerBtn.style.display = 'block';
  } else {
    playTrailerBtn.style.display = 'none';
  }

  if (movie.imdb_trailer_url) {
    imdbTrailerLink.href = movie.imdb_trailer_url;
    imdbTrailerLink.style.display = 'inline-block';
  } else {
    imdbTrailerLink.style.display = 'none';
  }

  playTrailerBtn.addEventListener('click', () => {
    openTrailerModal(movieId);
  });

  imdbTrailerLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(movie.imdb_trailer_url, '_blank');
  });
}

if (trailerModalClose) {
  trailerModalClose.addEventListener('click', closeTrailerModal);
}

if (trailerModal) {
  trailerModal.addEventListener('click', (event) => {
    if (event.target === trailerModal) {
      closeTrailerModal();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && trailerModal && trailerModal.classList.contains('is-open')) {
    closeTrailerModal();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initializeTrailerPage();
  
  // Hero trailer button for index.html
  const heroPlayTrailerBtn = document.getElementById('hero-play-trailer');
  if (heroPlayTrailerBtn) {
    heroPlayTrailerBtn.addEventListener('click', () => {
      openTrailerModal('interstellar');
    });
  }
});

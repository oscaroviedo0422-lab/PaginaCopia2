# Implementación de Funcionalidad de Trailer - Interstellar

## 1. DATOS ACTUALIZADOS EN JSON

**Archivo:** `data/movies.json` (Interstellar)

Los siguientes campos fueron añadidos/actualizados:

```json
{
  "id": "interstellar",
  "title": "Interstellar",
  ...
  "imdb_id": "tt0816692",
  "imdb_url": "https://www.imdb.com/title/tt0816692/",
  "imdb_trailer_url": "https://www.imdb.com/title/tt0816692/trailers/",
  "youtube_id": "zSWdZVtXT7E"
}
```

---

## 2. INTERFAZ HTML

### En `index.html` - Sección Hero:
- Botón **"▶ Ver Trailer"** agregado con id `hero-play-trailer`
- Al hacer clic abre el modal de trailer
- Modal de trailer con:
  - Reproductor YouTube (iframe con youtube-nocookie)
  - Botón "Ver trailer en IMDb" (enlace externo)
  - Botón de cierre (X)
  - Fondo oscuro (backdrop)

### En `pelicula.html` - Página de Película:
- Botones de acción en sección de trailer:
  - **"▶ Ver Trailer"** (id `play-trailer-btn`)
  - **"Ver en IMDb"** (id `imdb-trailer-link`)
- Modal de trailer idéntico al de index.html

---

## 3. ESTILOS CSS

**Archivo:** `css/styles.css`

Nuevas clases agregadas:
- `.trailer-modal` - Modal principal (fixed, centered, z-index 1001)
- `.trailer-modal-content` - Contenedor del modal
- `.trailer-modal-wrapper` - Wrapper del video y footer
- `.trailer-modal-footer` - Pie del modal con botón IMDb
- `.trailer-modal-close` - Botón de cierre (X)
- `.trailer-actions` - Contenedor de botones de acción

Características:
- Diseño dark/streaming consistente con Cineverse
- Responsive para móviles
- Video en relación 16:9 (padding-bottom: 56.25%)
- Transiciones suaves en hover

---

## 4. FUNCIONALIDAD JAVASCRIPT

**Archivo:** `js/script.js`

### Nuevas Funciones:

1. **`openTrailerModal(movieId)`**
   - Abre el modal de trailer
   - Carga la URL de YouTube con youtube-nocookie embed
   - Habilita autoplay
   - Configura el enlace a IMDb

2. **`closeTrailerModal()`**
   - Cierra el modal
   - **IMPORTANTE:** Vacía el src del iframe para detener reproducción inmediata

3. **`getMovieIdFromQuery()`**
   - Extrae el ID de película de la URL query string
   - Por defecto usa 'interstellar'

4. **`getMovieData(movieId)`**
   - Busca los datos de la película en el array movies[]

5. **`initializeTrailerPage()`**
   - Se ejecuta en la página de película (pelicula.html)
   - Vincula botones a eventos
   - Oculta botones si no hay trailer disponible

### Event Listeners:

- Botón "Ver Trailer" → abre modal
- Botón "Ver en IMDb" → abre enlace en pestaña nueva
- Botón de cierre (X) → cierra modal
- Clic en backdrop → cierra modal
- Tecla ESC → cierra modal
- Botón hero trailer → abre modal con Interstellar

---

## 5. COMPORTAMIENTO DE LA APLICACIÓN

### En Inicio (index.html):
1. Usuario ve película destacada "Interstellar"
2. Hace clic en botón **"▶ Ver Trailer"**
3. Se abre modal centrado con reproductor
4. YouTube comienza autoplay
5. Usuario puede ver botón "Ver trailer en IMDb"
6. Cierra con X o ESC

### En Página de Película (pelicula.html?id=interstellar):
1. Se carga Interstellar automáticamente
2. Muestra sección "Trailer" con dos botones
3. Botón "▶ Ver Trailer" abre modal
4. Botón "Ver en IMDb" abre en nueva pestaña
5. Mismo comportamiento de modal

---

## 6. VALIDACIÓN DE SEGURIDAD

✅ URL de YouTube usa `youtube-nocookie.com` (privacidad)
✅ IMDb links usan `target="_blank"` y `rel="noreferrer"`
✅ iframe tiene atributo `allow="autoplay"`
✅ src se vacía al cerrar (previene reproducción accidental)

---

## 7. PRÓXIMOS PASOS

Para agregar trailers a las otras 11 películas:

1. Actualizar `data/movies.json` con:
   - `imdb_id`
   - `imdb_url`
   - `imdb_trailer_url`
   - `youtube_id`

2. El código JavaScript detectará automáticamente:
   - Si hay `youtube_id` → muestra botón "Ver Trailer"
   - Si hay `imdb_trailer_url` → muestra botón "Ver en IMDb"

---

## 8. CÓMO PROBAR

Ejecuta en la terminal:
```bash
cd c:\programacion\cineverse
python -m http.server 8000
```

Luego abre en navegador:
- `http://localhost:8000/index.html`
- Busca el botón "▶ Ver Trailer" en el hero
- Haz clic para reproducir el trailer de Interstellar

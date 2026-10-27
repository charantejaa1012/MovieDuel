# Movie Duel

> **Discover. Compare. Decide.**  
> A cinematic movie discovery and decision-making platform that pairs an explainable Weighted Sum Model (WSM) comparison engine with personalized recommendations, persistent watchlists, and robust offline TMDB fallbacks.

---

## 🎥 Project Demo Video

[![Watch Movie Duel Demo Video](https://img.shields.io/badge/Demo_Video-Watch_on_Google_Drive-E50914?style=for-the-badge&logo=google-drive&logoColor=white)](https://drive.google.com/file/d/1Xs3agJyvBoqFhX7JXKY3S6u4IRvJMHic/view?usp=sharing)

> 🎬 **Watch the full walkthrough & feature demo:** [**Click here to view the Demo Video**](https://drive.google.com/file/d/1Xs3agJyvBoqFhX7JXKY3S6u4IRvJMHic/view?usp=sharing)

---

## 1. Project Overview & Problem Statement

Movie enthusiasts and casual viewers frequently experience decision paralysis when trying to pick what to watch. Existing movie databases offer overwhelming lists and generic popularity charts, but lack transparent decision tools to compare two titles side-by-side based on user preferences (genres, runtime tolerance, rating thresholds, and popularity).

**Movie Duel** solves this by providing a cinematic, dark-mode web application backed by an explainable Multi-Criteria Decision Analysis (MCDA) engine. Users don't merely browse—they configure their priorities, compare films with clear mathematical justifications, save items to authenticated watchlists, and receive personalized recommendations tailored to their taste profiles.

---

## 2. Target Users

- **Casual viewers & students:** Quickly resolve "what should we watch tonight?" disputes.
- **Cinephiles:** Perform analytical comparisons between two films with custom weight distributions.
- **Preference-driven explorers:** Discover curated movies matching exact genre and duration tolerances.
- **Watchlist builders:** Maintain a unified list across sessions with instant status indicators.

---

## 3. Proposed Solution & Value Proposition

- **Transparent Decision Engine:** Evaluates two films across genre affinity, audience ratings, runtime suitability, and popularity using normalized scores.
- **Zero-Downtime TMDB Integration:** Production-grade caching (10m–24h TTL) and a 20-film offline static fallback system guarantee uninterrupted operation even during TMDB API outages or missing API keys.
- **Personalized Recommendations:** Rule-based and content-based ranking engine explaining *why* each film was recommended.
- **Persistent User Accounts:** Secure JWT authentication protecting private watchlists and customized movie preference profiles.

---

## 4. Key Features & Core Workflows

### Workflow 1: Discover & Search
- Cinematic hero with featured trending titles and live trailer previews.
- "Trending Now" (day/week toggles) and "Upcoming Releases" carousels with smooth horizontal snap scrolling.
- Global debounced search (300ms) with request cancellation, instant dropdown results, and full search results pages.
- Detailed movie pages displaying synopsis, runtime, genres, director, full cast gallery, trailer modals, and similar film recommendations.

### Workflow 2: Movie Duel Arena (Decision Algorithm)
- Dual-slot selector supporting live search, preview cards, and swap controls.
- Interactive weight sliders with presets: **Balanced**, **Story-Focused**, **Popular Pick**, or **Custom**.
- Side-by-side comparison displaying final scores, criterion breakdown bars, verdict banners (*Winner* or *Tie / Too Close to Call*), and clear explanatory rationale.
- Shareable duel URLs (`/duel/:movie1/:movie2`) allowing instant peer review.

### Workflow 3: Persistent Watchlist
- One-click watchlist toggle from movie cards, hero banners, details pages, and duel results.
- Compound unique indexing (`userId + movieId`) to prevent duplicate entries.
- Sortable watchlist views (Date Added, Rating, Title) with instant removal and persistence across sessions.

### Workflow 4: Personalized Recommendations
- Multi-select genre preferences, preferred runtime ranges, target languages, and release period filters on the user Profile page.
- Weighted candidate scoring combining genre overlaps, runtime proximity, and user ratings.
- Transparent match tags (e.g., *"Matches your Sci-Fi preference"*, *"Fits your preferred runtime"*).
- Graceful anonymous fallback surfacing trending and critically acclaimed selections.

---

## 5. Technology Stack

### Frontend
- **Framework:** React 18 (Strict Mode)
- **Tooling:** Vite 6
- **Styling:** Tailwind CSS v4 with custom cinematic dark palette
- **Routing:** React Router v6
- **HTTP Client:** Axios with JWT request interceptors & 401 response handling
- **Animations:** Framer Motion (respects `prefers-reduced-motion`)
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database / ODM:** MongoDB Atlas with Mongoose 8
- **Validation:** Zod schemas
- **Security:** Helmet headers, Express-Rate-Limit, CORS, Bcrypt.js (12 rounds) password hashing
- **Authentication:** Stateless JSON Web Tokens (JWT)
- **Caching & Resilience:** NodeCache in-memory caching with exponential backoff retries (3 attempts) and offline static fallbacks

---

## 6. Architecture Overview

```text
               ┌─────────────────────────────────────────┐
               │        React Client (Vite + SPA)        │
               │   Tailwind CSS v4 · Framer Motion · UI  │
               └────────────────────┬────────────────────┘
                                    │ HTTPS / JSON
                                    ▼
               ┌─────────────────────────────────────────┐
               │         Express REST API Gateway        │
               │  Helmet · Rate Limiting · JWT Auth · Zod│
               └─────────┬───────────────┬───────────────┘
                         │               │
        ┌────────────────▼───┐       ┌───▼────────────────┐
        │  Database Services │       │  External Services │
        │   MongoDB Atlas    │       │     TMDB API       │
        │ Users · Watchlists │       │ (Cached/Fallbacks) │
        │    DuelHistory     │       └────────────────────┘
        └────────────────────┘
```

See [`docs/architecture.md`](file:///c:/project/Movie-endTerm/docs/architecture.md) for full architectural documentation.

---

## 7. Duel Engine: Decision Algorithm (WSM)

The comparison engine uses **Multi-Criteria Decision Analysis (MCDA)** via the **Weighted Sum Model (WSM)**:

$$S(m) = \sum_{i=1}^{n} w_i \cdot s_i(m)$$

Where:
- $S(m)$ is the aggregate normalized score $[0, 100]$.
- $w_i$ is the normalized criterion weight such that $\sum w_i = 1$.
- $s_i(m)$ is the criterion sub-score $[0, 100]$.

### Criteria Transformations:
1. **Audience Rating ($s_{\text{rating}}$):** Converts TMDB $0\text{--}10$ scale to $0\text{--}100$. Incorporates a Bayesian confidence damper if vote count $< 50$: $\text{Score} \times \min(1, \text{voteCount} / 50)$.
2. **Genre Match ($s_{\text{genre}}$):** Calculates Jaccard similarity between candidate genres and user preferred genres: $\frac{|G_m \cap G_{\text{pref}}|}{|G_m \cup G_{\text{pref}}|} \times 100$. Returns neutral $50$ when no preferences are specified.
3. **Runtime Proximity ($s_{\text{runtime}}$):** Scores $100$ if within $[\text{min}, \text{max}]$ duration; applies linear proximity penalties for deviations. Returns $50$ when unconstrained.
4. **Popularity ($s_{\text{popularity}}$):** Uses a logarithmic scale to compress wide ranges: $\min\left(100, \frac{\log_{10}(\text{pop} + 1)}{\log_{10}(1000)} \times 100\right)$.
5. **Missing Metadata Resilience:** Excluded criteria dynamically trigger weight renormalization across remaining valid criteria.
6. **Verdict & Ties:** Score differential $> 3.0$ declares a definitive winner. Differences $\le 3.0$ produce a "Too Close to Call / Tie" verdict.

---

## 8. Local Setup Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Optional: MongoDB instance (local or Atlas) and a free TMDB API key

### 1. Clone the repository
```bash
git clone https://github.com/your-username/movie-duel.git
cd movie-duel
```

### 2. Install dependencies
```bash
# Install root, backend, and frontend packages
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Environment configuration
Copy the sample environment files:

```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

Edit `server/.env` if you have custom MongoDB or TMDB credentials. **Note:** If TMDB API keys or MongoDB are omitted, the application automatically uses offline mock fallbacks and local memory safety.

### 4. Run the development environment
From the root directory:
```bash
npm run dev
```
- Client runs at: `http://localhost:5173`
- Server runs at: `http://localhost:5000`

---

## 9. Environment Variables

### Backend (`server/.env`)
| Variable | Description | Default |
|---|---|---|
| `PORT` | Express listening port | `5000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb://localhost:27017/movie-duel` |
| `TMDB_API_KEY` | TMDB v3 API Key | `""` *(triggers static fallback)* |
| `TMDB_ACCESS_TOKEN` | TMDB v4 Bearer Token | `""` |
| `JWT_SECRET` | Secret key for signing auth tokens | `movie_duel_dev_secret_key_change_in_production` |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `CLIENT_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

### Frontend (`client/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base API target URL | `http://localhost:5000` |

---

## 10. Testing Instructions

### Run Unit & Decision Engine Tests
The backend includes a comprehensive Jest test suite covering weight validation, criterion normalization, missing-data handling, tie logic, and explanation generation:

```bash
cd server
npm test
```

### Run Standalone Engine Runner (Zero Dependencies)
```bash
cd server
node tests/standalone-runner.js
```

### Build Frontend Bundle
```bash
cd client
npm run build
```

---

## 11. Deployment

- **Frontend:** Deployed via Vercel or Netlify (points to `client/`, build command `npm run build`, output directory `dist`).
- **Backend:** Deployed via Render, Railway, or Fly.io (points to `server/`, start command `npm start`).
- **Database:** MongoDB Atlas M0 Free Cluster.

---

## 12. Known Limitations & Future Scope

- **Pairwise Learning:** Current MVP uses user-configured MCDA weights. Future iterations will include implicit logistic regression learning from user duel clicks.
- **Streaming Provider Availability:** Depends on region-specific TMDB JustWatch feeds (planned for v1.1).
- **Social Duels:** Real-time synchronized duel voting via WebSockets will be introduced in future updates.

---

## 13. Credits & Attribution

- Film metadata, poster imagery, and media references provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).
- This product uses the TMDB API but is not endorsed or certified by TMDB.
- Icons provided by [Lucide](https://lucide.dev/).

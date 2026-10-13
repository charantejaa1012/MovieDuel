# Movie Duel Backend Server

Production-grade Node.js / Express backend service powering the **Movie Duel** discovery and multi-criteria comparison platform.

## Architecture Highlights

1. **Multi-Attribute Decision Engine (WSM)**
   - Normalized criteria: Genre alignment (Jaccard similarity), Critic/Audience rating (Bayesian-penalized), Target runtime proximity, and Logarithmic popularity.
   - Dynamic weight renormalization for missing metadata.
   - Intelligent tie threshold (default: 3 points) and analytical natural language explanations.

2. **Resilient TMDB Integration**
   - In-memory caching via `node-cache` (10-minute TTL for trending/popular, 1-hour for details, 24-hour for genre taxonomy).
   - Exponential backoff retry logic (3 retries).
   - Static fallback dataset containing 20 high-acclaim films for 100% offline uptime and resilience.

3. **Enterprise Security & Reliability**
   - Helmet HTTP headers protection.
   - Request rate limiters (general API, auth brute-force protection, duel calculation throttle).
   - Zod request body/query validation.
   - Stateless JWT authentication with optional and strict middleware variants.
   - Mongoose connection retry logic and graceful process termination (`SIGINT` / `SIGTERM`).

---

## Directory Structure

```
server/
├── .env.example
├── .gitignore
├── package.json
├── src/
│   ├── app.js                          # Express entry point & lifecycle handlers
│   ├── config/
│   │   ├── index.js                    # Environment validation & constants
│   │   └── db.js                       # Mongoose connection & retry management
│   ├── controllers/
│   │   ├── authController.js           # Auth & profile handlers
│   │   ├── duelController.js           # Movie comparison & history handlers
│   │   ├── movieController.js          # TMDB proxy & discovery handlers
│   │   ├── preferencesController.js    # User preferences handlers
│   │   ├── recommendationController.js # Personalized recommendation handlers
│   │   └── watchlistController.js      # Watchlist CRUD & batch checking handlers
│   ├── middleware/
│   │   ├── auth.js                     # JWT verification & optionalAuth
│   │   ├── errorHandler.js             # Centralized error formatter
│   │   ├── rateLimiter.js              # Rate limit policies
│   │   └── validate.js                 # Generic Zod validation factory
│   ├── models/
│   │   ├── DuelHistory.js              # Duel comparison log schema
│   │   ├── User.js                     # User profile & credentials schema
│   │   └── Watchlist.js                # Watchlist bookmark schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── duelRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── preferencesRoutes.js
│   │   ├── recommendationRoutes.js
│   │   └── watchlistRoutes.js
│   ├── services/
│   │   ├── duelEngine.js               # Weighted Sum Model comparison logic
│   │   ├── recommendationEngine.js     # Content-based recommendation scoring
│   │   └── tmdbService.js              # TMDB client with caching & fallback
│   └── utils/
│       ├── apiResponse.js              # Consistent JSON envelope helpers
│       └── logger.js                   # Colorized structured console logger
└── tests/
    └── duelEngine.test.js              # Comprehensive unit tests for WSM engine
```

---

## API Endpoints

### Health & System
- `GET /api/health` - Server health status and uptime.

### Authentication
- `POST /api/auth/register` - Create account (`name`, `email`, `password`).
- `POST /api/auth/login` - Authenticate credentials, returns JWT.
- `POST /api/auth/logout` - Logout acknowledgment.
- `GET /api/auth/me` - Authenticated user profile.

### Movies (TMDB Gateway)
- `GET /api/movies/trending` - Current trending movies (`timeWindow=day|week`).
- `GET /api/movies/search?query=...` - Search TMDB catalog.
- `GET /api/movies/popular` - Popular movies.
- `GET /api/movies/upcoming` - Upcoming theatrical releases.
- `GET /api/movies/genres` - Available genre taxonomies.
- `GET /api/movies/:id` - Detailed movie metadata with cast and videos.

### Duel Engine
- `POST /api/duels/compare` - Compare two movies by ID using WSM weights.
- `GET /api/duels/history` - User's previous duel records.

### Watchlist
- `GET /api/watchlist` - List user's saved movies.
- `POST /api/watchlist` - Add movie to watchlist.
- `DELETE /api/watchlist/:movieId` - Remove movie from watchlist.
- `GET /api/watchlist/check/:movieId` - Check if movie is saved.
- `POST /api/watchlist/check-multiple` - Batch check list of movie IDs.

### Preferences & Recommendations
- `GET /api/preferences` - User genre affinities and runtime limits.
- `PUT /api/preferences` - Update user preferences.
- `GET /api/recommendations` - Content-based recommendations with explanation reasons.

---

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in any required keys:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Test Suite
```bash
npm test
```

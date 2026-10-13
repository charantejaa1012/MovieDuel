/**
 * @fileoverview TMDB Service with Resilient Networking, In-Memory Caching, and Offline Fallbacks.
 * Handles fetching movie datasets, search results, trailers, and credits with
 * exponential backoff retry logic, node-cache layer, and graceful static failover.
 */

import axios from 'axios';
import NodeCache from 'node-cache';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// In-memory cache with standard TTL of 600 seconds (10 mins) and eviction check every 120 seconds
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// TMDB Standard Genres Fallback List
const FALLBACK_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

// High-fidelity fallback catalog containing 20 critically acclaimed and popular films
const FALLBACK_MOVIES = [
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who steals corporate secrets through dream-sharing technology, is given the inverse task of planting an idea into the mind of a C.E.O.',
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    vote_average: 8.36,
    vote_count: 35240,
    release_date: '2010-07-15',
    genre_ids: [28, 878, 12],
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
    popularity: 98.4,
    runtime: 148,
    tagline: 'Your mind is the scene of the crime.',
    budget: 160000000,
    revenue: 825532764,
    status: 'Released'
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
    vote_average: 8.51,
    vote_count: 31200,
    release_date: '2008-07-16',
    genre_ids: [18, 28, 80, 53],
    genres: [{ id: 18, name: 'Drama' }, { id: 28, name: 'Action' }, { id: 80, name: 'Crime' }, { id: 53, name: 'Thriller' }],
    popularity: 112.5,
    runtime: 152,
    tagline: 'Why So Serious?',
    budget: 185000000,
    revenue: 1004558444,
    status: 'Released'
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    vote_average: 8.43,
    vote_count: 33500,
    release_date: '2014-11-05',
    genre_ids: [12, 18, 878],
    genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }, { id: 878, name: 'Science Fiction' }],
    popularity: 145.2,
    runtime: 169,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    budget: 165000000,
    revenue: 701729206,
    status: 'Released'
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    overview: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in this sprawling, comedic crime caper.',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    vote_average: 8.49,
    vote_count: 26800,
    release_date: '1994-09-10',
    genre_ids: [53, 80],
    genres: [{ id: 53, name: 'Thriller' }, { id: 80, name: 'Crime' }],
    popularity: 78.9,
    runtime: 154,
    tagline: 'Just because you are a character doesn\'t mean that you have character.',
    budget: 8000000,
    revenue: 213928762,
    status: 'Released'
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    overview: 'Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.',
    poster_path: '/9cqNFs9FBWhSGT57crE2Yadguox.jpg',
    backdrop_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    vote_average: 8.70,
    vote_count: 26200,
    release_date: '1994-09-23',
    genre_ids: [18, 80],
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }],
    popularity: 135.0,
    runtime: 142,
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    budget: 25000000,
    revenue: 28341469,
    status: 'Released'
  },
  {
    id: 550,
    title: 'Fight Club',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town.',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    vote_average: 8.43,
    vote_count: 28100,
    release_date: '1999-10-15',
    genre_ids: [18],
    genres: [{ id: 18, name: 'Drama' }],
    popularity: 85.3,
    runtime: 139,
    tagline: 'Mischief. Mayhem. Soap.',
    budget: 63000000,
    revenue: 100853753,
    status: 'Released'
  },
  {
    id: 603,
    title: 'The Matrix',
    overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
    poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdrop_path: '/7u3pxc0K1uhETH2EnTUtvll23QY.jpg',
    vote_average: 8.21,
    vote_count: 24700,
    release_date: '1999-03-30',
    genre_ids: [28, 878],
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }],
    popularity: 91.2,
    runtime: 136,
    tagline: 'Welcome to the Real World.',
    budget: 63000000,
    revenue: 463517383,
    status: 'Released'
  },
  {
    id: 13,
    title: 'Forrest Gump',
    overview: 'A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. Yet, despite all the things he has attained, his only true love eludes him.',
    poster_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    backdrop_path: '/qdIMHdbtatzyIfPPdUAlOU8aZ7m.jpg',
    vote_average: 8.48,
    vote_count: 26300,
    release_date: '1994-06-23',
    genre_ids: [35, 18, 10749],
    genres: [{ id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' }, { id: 10749, name: 'Romance' }],
    popularity: 110.1,
    runtime: 142,
    tagline: 'The world will never be the same once you\'ve seen it through the eyes of Forrest Gump.',
    budget: 55000000,
    revenue: 677387716,
    status: 'Released'
  },
  {
    id: 238,
    title: 'The Godfather',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps up to take care of the would-be killers.',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    vote_average: 8.70,
    vote_count: 19600,
    release_date: '1972-03-14',
    genre_ids: [18, 80],
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }],
    popularity: 120.4,
    runtime: 175,
    tagline: 'An offer you can\'t refuse.',
    budget: 6000000,
    revenue: 245066411,
    status: 'Released'
  },
  {
    id: 496243,
    title: 'Parasite',
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_path: '/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    vote_average: 8.51,
    vote_count: 17200,
    release_date: '2019-05-30',
    genre_ids: [35, 53, 18],
    genres: [{ id: 35, name: 'Comedy' }, { id: 53, name: 'Thriller' }, { id: 18, name: 'Drama' }],
    popularity: 95.8,
    runtime: 133,
    tagline: 'Act like you own the place.',
    budget: 11400000,
    revenue: 258773050,
    status: 'Released'
  },
  {
    id: 129,
    title: 'Spirited Away',
    overview: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
    poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdrop_path: '/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    vote_average: 8.54,
    vote_count: 15600,
    release_date: '2001-07-20',
    genre_ids: [16, 10751, 14],
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' }],
    popularity: 88.7,
    runtime: 125,
    tagline: 'Tunnel to the other side.',
    budget: 19000000,
    revenue: 274925095,
    status: 'Released'
  },
  {
    id: 120,
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    overview: 'Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home behind in order to begin an epic quest to the fires of Mount Doom to destroy it.',
    poster_path: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    backdrop_path: '/vRQnzOnJeTXoiv1Yfdvyc08UmUI.jpg',
    vote_average: 8.41,
    vote_count: 24200,
    release_date: '2001-12-18',
    genre_ids: [12, 14, 28],
    genres: [{ id: 12, name: 'Adventure' }, { id: 14, name: 'Fantasy' }, { id: 28, name: 'Action' }],
    popularity: 118.6,
    runtime: 178,
    tagline: 'One ring to rule them all.',
    budget: 93000000,
    revenue: 871368364,
    status: 'Released'
  },
  {
    id: 122,
    title: 'The Lord of the Rings: The Return of the King',
    overview: 'As armies mass for a final battle that will decide the fate of the world--and powerful, ancient forces of Light and Dark compete to determine the outcome--one member of the Fellowship of the Ring is revealed as the noble heir to the throne of the Kings of Men.',
    poster_path: '/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
    backdrop_path: '/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg',
    vote_average: 8.48,
    vote_count: 23100,
    release_date: '2003-12-01',
    genre_ids: [12, 14, 28],
    genres: [{ id: 12, name: 'Adventure' }, { id: 14, name: 'Fantasy' }, { id: 28, name: 'Action' }],
    popularity: 105.4,
    runtime: 201,
    tagline: 'The eye of the enemy is moving.',
    budget: 94000000,
    revenue: 1118888979,
    status: 'Released'
  },
  {
    id: 240,
    title: 'The Godfather Part II',
    overview: 'The continuing saga of the Corleone crime family tells the story of a young Vito Corleone growing up in Sicily and in 1910s New York; and follows Michael Corleone in the 1950s as he attempts to expand the family business into Las Vegas, Hollywood and Cuba.',
    poster_path: '/hek3koDUyMrk7ilW5en6Ev7c35G.jpg',
    backdrop_path: '/kGzFbGhp99zva6vdZ2yoVI5thPS.jpg',
    vote_average: 8.59,
    vote_count: 12100,
    release_date: '1974-12-20',
    genre_ids: [18, 80],
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }],
    popularity: 82.5,
    runtime: 202,
    tagline: 'I know it was you, Fredo.',
    budget: 13000000,
    revenue: 102600000,
    status: 'Released'
  },
  {
    id: 424,
    title: 'Schindler\'s List',
    overview: 'The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II.',
    poster_path: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    backdrop_path: '/zb6fM1CX41D9rF9hdgclu0sqUe.jpg',
    vote_average: 8.57,
    vote_count: 15200,
    release_date: '1993-12-15',
    genre_ids: [18, 36, 10752],
    genres: [{ id: 18, name: 'Drama' }, { id: 36, name: 'History' }, { id: 10752, name: 'War' }],
    popularity: 74.3,
    runtime: 195,
    tagline: 'Whoever saves one life, saves the world entire.',
    budget: 22000000,
    revenue: 321365567,
    status: 'Released'
  },
  {
    id: 1555,
    title: 'Gladiator',
    overview: 'In the year 180, the death of emperor Marcus Aurelius throws the Roman Empire into turmoil. Maximus, one of the Roman army\'s most capable generals and a favorite of Marcus, is captured and condemned to death by the ambitious young Commodus.',
    poster_path: '/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
    backdrop_path: '/Ar7y1t6d5PqLlhT03k1E04V7oB6.jpg',
    vote_average: 8.21,
    vote_count: 17800,
    release_date: '2000-05-04',
    genre_ids: [28, 18, 12],
    genres: [{ id: 28, name: 'Action' }, { id: 18, name: 'Drama' }, { id: 12, name: 'Adventure' }],
    popularity: 89.6,
    runtime: 155,
    tagline: 'A Hero Will Rise.',
    budget: 103000000,
    revenue: 460583960,
    status: 'Released'
  },
  {
    id: 389,
    title: '12 Angry Men',
    overview: 'The defense and the prosecution have rested and the jury is filing into the jury room to decide if an 18-year-old is guilty or innocent of murdering his father.',
    poster_path: '/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg',
    backdrop_path: '/qqHQsStV6Z9uhxww19teSnvXYEG.jpg',
    vote_average: 8.54,
    vote_count: 8200,
    release_date: '1957-04-10',
    genre_ids: [18],
    genres: [{ id: 18, name: 'Drama' }],
    popularity: 58.2,
    runtime: 96,
    tagline: 'Life is in their hands. Death is on their minds.',
    budget: 350000,
    revenue: 1000000,
    status: 'Released'
  },
  {
    id: 299534,
    title: 'Avengers: Endgame',
    overview: 'After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos\'s actions and restore order to the universe once and for all.',
    poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    vote_average: 8.25,
    vote_count: 24600,
    release_date: '2019-04-24',
    genre_ids: [12, 878, 28],
    genres: [{ id: 12, name: 'Adventure' }, { id: 878, name: 'Science Fiction' }, { id: 28, name: 'Action' }],
    popularity: 132.8,
    runtime: 181,
    tagline: 'Part of the journey is the end.',
    budget: 356000000,
    revenue: 2797800564,
    status: 'Released'
  },
  {
    id: 77,
    title: 'Memento',
    overview: 'Leonard Shelby is tracking down the man who raped and murdered his wife. The difficulty of locating his wife\'s killer, however, is compounded by the fact that he suffers from a rare, untreatable form of short-term memory loss.',
    poster_path: '/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg',
    backdrop_path: '/bdW868i1Zf7XJ618R76F0E0o2rG.jpg',
    vote_average: 8.18,
    vote_count: 14200,
    release_date: '2000-10-11',
    genre_ids: [9648, 53],
    genres: [{ id: 9648, name: 'Mystery' }, { id: 53, name: 'Thriller' }],
    popularity: 49.3,
    runtime: 113,
    tagline: 'Some memories are best forgotten.',
    budget: 9000000,
    revenue: 39723096,
    status: 'Released'
  },
  {
    id: 429,
    title: 'The Good, the Bad and the Ugly',
    overview: 'While the Civil War rages between the Union and the Confederacy, three men – a quiet loner, a ruthless hitman and a Mexican bandit – comb the American Southwest in search of a strongbox containing $200,000 in stolen gold.',
    poster_path: '/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg',
    backdrop_path: '/alQqTpmEkxSLgAjCs2WTV5W5OI8.jpg',
    vote_average: 8.46,
    vote_count: 8200,
    release_date: '1966-12-23',
    genre_ids: [37],
    genres: [{ id: 37, name: 'Western' }],
    popularity: 67.5,
    runtime: 161,
    tagline: 'For three men the Civil War wasn\'t about peace. It was about gold.',
    budget: 1200000,
    revenue: 25100000,
    status: 'Released'
  }
];

// Configure Axios instance for TMDB API
const tmdbClient = axios.create({
  baseURL: config.tmdb.baseUrl,
  timeout: 10000,
  headers: {
    Accept: 'application/json'
  }
});

// Request interceptor to attach Bearer token or api_key
tmdbClient.interceptors.request.use((reqConfig) => {
  if (config.tmdb.accessToken) {
    reqConfig.headers.Authorization = `Bearer ${config.tmdb.accessToken}`;
  } else if (config.tmdb.apiKey) {
    reqConfig.params = {
      ...reqConfig.params,
      api_key: config.tmdb.apiKey
    };
  }
  return reqConfig;
});

/**
 * Executes an asynchronous function with exponential backoff retries.
 * @template T
 * @param {() => Promise<T>} fn - Asynchronous operation to retry
 * @param {number} [retries=3] - Maximum retry attempts
 * @param {number} [delay=1000] - Initial delay in milliseconds
 * @returns {Promise<T>}
 */
export async function withRetry(fn, retries = 3, delay = 1000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      // Do not retry on 404 Not Found or 400 Bad Request
      if (err.response && (err.response.status === 404 || err.response.status === 400)) {
        throw err;
      }
      if (attempt >= retries) {
        throw err;
      }
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      logger.warn(`TMDB request attempt ${attempt} failed: ${err.message}. Retrying in ${backoffDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }
}

/**
 * Generic cached TMDB API caller with retry and static fallback support.
 * @template T
 * @param {string} cacheKey - Unique cache key
 * @param {number} ttlSeconds - Cache TTL in seconds
 * @param {() => Promise<T>} fetchFn - Fetching logic
 * @param {() => T} [fallbackFn] - Optional fallback supplier
 * @returns {Promise<T>}
 */
async function fetchWithCache(cacheKey, ttlSeconds, fetchFn, fallbackFn) {
  const cachedData = cache.get(cacheKey);
  if (cachedData !== undefined) {
    logger.debug(`Cache hit for key: ${cacheKey}`);
    return cachedData;
  }

  try {
    const data = await withRetry(fetchFn, 3, 1000);
    cache.set(cacheKey, data, ttlSeconds);
    return data;
  } catch (err) {
    logger.warn(`TMDB fetch failed for '${cacheKey}': ${err.message}. Checking fallback...`);
    if (typeof fallbackFn === 'function') {
      const fallbackData = fallbackFn();
      if (fallbackData !== undefined && fallbackData !== null) {
        logger.info(`Serving static fallback for key: ${cacheKey}`);
        return fallbackData;
      }
    }
    throw err;
  }
}

/**
 * Enriches a fallback movie with mock credits, videos, and keywords.
 * @param {object} movie - Basic movie object
 * @returns {object} Full movie object
 */
function enrichFallbackDetails(movie) {
  return {
    ...movie,
    credits: {
      cast: [
        { id: 101, name: 'Leonardo DiCaprio', character: 'Lead Actor', order: 0 },
        { id: 102, name: 'Christian Bale', character: 'Protagonist', order: 1 },
        { id: 103, name: 'Morgan Freeman', character: 'Supporting Mentor', order: 2 }
      ],
      crew: [
        { id: 201, name: 'Christopher Nolan', job: 'Director', department: 'Directing' },
        { id: 202, name: 'Hans Zimmer', job: 'Original Music Composer', department: 'Sound' }
      ]
    },
    videos: {
      results: [
        {
          id: 'vid1',
          key: 'YoHD9XEInc0',
          site: 'YouTube',
          type: 'Trailer',
          name: 'Official Trailer'
        }
      ]
    },
    keywords: {
      keywords: [
        { id: 1, name: 'mind-bending' },
        { id: 2, name: 'space travel' },
        { id: 3, name: 'justice' },
        { id: 4, name: 'philosophy' }
      ]
    },
    similar: {
      results: FALLBACK_MOVIES.filter((m) => m.id !== movie.id).slice(0, 5)
    }
  };
}

/**
 * Service object containing all TMDB integration methods.
 */
export const tmdbService = {
  /**
   * Retrieves trending movies for a given window (day or week).
   * @param {'day'|'week'} [timeWindow='week']
   * @returns {Promise<{ page: number, results: Array, total_pages: number, total_results: number }>}
   */
  async getTrending(timeWindow = 'week') {
    const cacheKey = `trending_${timeWindow}`;
    return fetchWithCache(
      cacheKey,
      600, // 10 minutes TTL
      async () => {
        const res = await tmdbClient.get(`/trending/movie/${timeWindow}`);
        return res.data;
      },
      () => ({
        page: 1,
        results: FALLBACK_MOVIES,
        total_pages: 1,
        total_results: FALLBACK_MOVIES.length
      })
    );
  },

  /**
   * Searches movies by text query.
   * @param {string} query
   * @param {number} [page=1]
   * @returns {Promise<{ page: number, results: Array, total_pages: number, total_results: number }>}
   */
  async searchMovies(query, page = 1) {
    const cleanQuery = (query || '').trim().toLowerCase();
    const cacheKey = `search_${cleanQuery}_${page}`;
    return fetchWithCache(
      cacheKey,
      300, // 5 minutes TTL
      async () => {
        const res = await tmdbClient.get('/search/movie', {
          params: { query: cleanQuery, page }
        });
        return res.data;
      },
      () => {
        const matched = FALLBACK_MOVIES.filter((m) =>
          m.title.toLowerCase().includes(cleanQuery) ||
          m.overview.toLowerCase().includes(cleanQuery)
        );
        return {
          page: 1,
          results: matched.length > 0 ? matched : FALLBACK_MOVIES.slice(0, 10),
          total_pages: 1,
          total_results: matched.length > 0 ? matched.length : 10
        };
      }
    );
  },

  /**
   * Gets comprehensive details for a movie, including credits, videos, keywords, similar.
   * @param {number|string} movieId
   * @returns {Promise<object>}
   */
  async getMovieDetails(movieId) {
    const id = parseInt(movieId, 10);
    const cacheKey = `movie_${id}_details`;
    return fetchWithCache(
      cacheKey,
      3600, // 1 hour TTL
      async () => {
        const res = await tmdbClient.get(`/movie/${id}`, {
          params: {
            append_to_response: 'credits,videos,similar,keywords'
          }
        });
        return res.data;
      },
      () => {
        const found = FALLBACK_MOVIES.find((m) => m.id === id);
        if (found) {
          return enrichFallbackDetails(found);
        }
        // Fallback default if specific movie not in array: return first movie with matching ID
        const generic = { ...FALLBACK_MOVIES[0], id, title: `Fallback Movie #${id}` };
        return enrichFallbackDetails(generic);
      }
    );
  },

  /**
   * Retrieves upcoming movies.
   * @param {number} [page=1]
   * @returns {Promise<{ page: number, results: Array, total_pages: number, total_results: number }>}
   */
  async getUpcoming(page = 1) {
    const cacheKey = `upcoming_${page}`;
    return fetchWithCache(
      cacheKey,
      1800, // 30 minutes TTL
      async () => {
        const res = await tmdbClient.get('/movie/upcoming', { params: { page } });
        return res.data;
      },
      () => ({
        page: 1,
        results: FALLBACK_MOVIES.slice(0, 10),
        total_pages: 1,
        total_results: 10
      })
    );
  },

  /**
   * Retrieves movie genre taxonomy list.
   * @returns {Promise<{ genres: Array<{ id: number, name: string }> }>}
   */
  async getGenres() {
    const cacheKey = 'genres_list';
    return fetchWithCache(
      cacheKey,
      86400, // 24 hours TTL
      async () => {
        const res = await tmdbClient.get('/genre/movie/list');
        return res.data;
      },
      () => ({ genres: FALLBACK_GENRES })
    );
  },

  /**
   * Discovers movies matching user criteria and filters.
   * @param {object} [params={}]
   * @returns {Promise<{ page: number, results: Array, total_pages: number, total_results: number }>}
   */
  async discoverMovies(params = {}) {
    const cacheKey = `discover_${JSON.stringify(params)}`;
    return fetchWithCache(
      cacheKey,
      900, // 15 minutes TTL
      async () => {
        const res = await tmdbClient.get('/discover/movie', { params });
        return res.data;
      },
      () => {
        let results = [...FALLBACK_MOVIES];
        if (params.with_genres) {
          const requestedGenreIds = String(params.with_genres)
            .split(',')
            .map((g) => parseInt(g.trim(), 10))
            .filter(Boolean);
          results = results.filter((m) =>
            m.genre_ids.some((gId) => requestedGenreIds.includes(gId))
          );
        }
        return {
          page: 1,
          results: results.length > 0 ? results : FALLBACK_MOVIES,
          total_pages: 1,
          total_results: results.length > 0 ? results.length : FALLBACK_MOVIES.length
        };
      }
    );
  },

  /**
   * Retrieves popular movies.
   * @param {number} [page=1]
   * @returns {Promise<{ page: number, results: Array, total_pages: number, total_results: number }>}
   */
  async getPopular(page = 1) {
    const cacheKey = `popular_${page}`;
    return fetchWithCache(
      cacheKey,
      600, // 10 minutes TTL
      async () => {
        const res = await tmdbClient.get('/movie/popular', { params: { page } });
        return res.data;
      },
      () => ({
        page: 1,
        results: FALLBACK_MOVIES,
        total_pages: 1,
        total_results: FALLBACK_MOVIES.length
      })
    );
  },

  /**
   * Retrieves similar movies for a given ID.
   * @param {number|string} movieId
   * @returns {Promise<{ page: number, results: Array, total_pages: number, total_results: number }>}
   */
  async getSimilar(movieId) {
    const id = parseInt(movieId, 10);
    const cacheKey = `similar_${id}`;
    return fetchWithCache(
      cacheKey,
      3600, // 1 hour TTL
      async () => {
        const res = await tmdbClient.get(`/movie/${id}/similar`);
        return res.data;
      },
      () => ({
        page: 1,
        results: FALLBACK_MOVIES.filter((m) => m.id !== id).slice(0, 6),
        total_pages: 1,
        total_results: 6
      })
    );
  },

  /**
   * Retrieves movie trailers and promo clips.
   * @param {number|string} movieId
   * @returns {Promise<{ id: number, results: Array }>}
   */
  async getMovieVideos(movieId) {
    const id = parseInt(movieId, 10);
    const cacheKey = `videos_${id}`;
    return fetchWithCache(
      cacheKey,
      3600, // 1 hour TTL
      async () => {
        const res = await tmdbClient.get(`/movie/${id}/videos`);
        return res.data;
      },
      () => ({
        id,
        results: [
          {
            id: 'fallback_video_1',
            key: 'YoHD9XEInc0',
            site: 'YouTube',
            type: 'Trailer',
            name: 'Official Trailer'
          }
        ]
      })
    );
  },

  /**
   * Retrieves cast and crew credits.
   * @param {number|string} movieId
   * @returns {Promise<{ id: number, cast: Array, crew: Array }>}
   */
  async getMovieCredits(movieId) {
    const id = parseInt(movieId, 10);
    const cacheKey = `credits_${id}`;
    return fetchWithCache(
      cacheKey,
      3600, // 1 hour TTL
      async () => {
        const res = await tmdbClient.get(`/movie/${id}/credits`);
        return res.data;
      },
      () => ({
        id,
        cast: [
          { id: 1, name: 'Leonardo DiCaprio', character: 'Cobb' },
          { id: 2, name: 'Joseph Gordon-Levitt', character: 'Arthur' }
        ],
        crew: [
          { id: 3, name: 'Christopher Nolan', job: 'Director' }
        ]
      })
    );
  },

  /**
   * Utility method to expose cache instance (e.g. for testing/flushing)
   */
  getCacheInstance() {
    return cache;
  },

  /**
   * Utility method to expose fallback movies array
   */
  getFallbackMovies() {
    return FALLBACK_MOVIES;
  }
};

export default tmdbService;

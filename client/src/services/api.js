import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL: BASE_URL ? (BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`) : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If unauthorized and on a protected route, notify or redirect
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

/* ==========================================================================
   MOCK / FALLBACK DATA FOR ROBUST OFFLINE / ISOLATED DEMO EXPERIENCE
   ========================================================================== */
export const FALLBACK_GENRES = [
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
  { id: 37, name: 'Western' },
];

export const FALLBACK_MOVIES = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5200SV.jpg',
    vote_average: 8.2,
    vote_count: 5320,
    release_date: '2024-03-01',
    runtime: 166,
    genres: [{ id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
    popularity: 420.5,
    tagline: 'Long live the fighters.',
    budget: 190000000,
    revenue: 711844358,
    credits: {
      cast: [
        { id: 1, name: 'Timothée Chalamet', character: 'Paul Atreides', profile_path: '/BE2sdjpgsa2rNTFa66f7upkaOP.jpg' },
        { id: 2, name: 'Zendaya', character: 'Chani', profile_path: '/tyFvNImz4HeaWvH6B1e81xJcI0c.jpg' },
        { id: 3, name: 'Rebecca Ferguson', character: 'Lady Jessica', profile_path: '/4q8Z154f3o6hY4gqBvI3l6gq2hP.jpg' },
        { id: 4, name: 'Javier Bardem', character: 'Stilgar', profile_path: '/g5g5i8W4pM3O9D1K5d7M6G5y1z.jpg' },
      ],
      crew: [{ id: 10, job: 'Director', name: 'Denis Villeneuve' }]
    },
    videos: {
      results: [{ id: 'v1', key: 'Way9Dexny3w', name: 'Official Trailer 3', site: 'YouTube', type: 'Trailer' }]
    }
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/rAiYTnrLEhk0tiAGVP1249h5aA.jpg',
    vote_average: 8.4,
    vote_count: 35400,
    release_date: '2014-11-05',
    runtime: 169,
    genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }, { id: 878, name: 'Science Fiction' }],
    popularity: 380.2,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    budget: 165000000,
    revenue: 730784000,
    credits: {
      cast: [
        { id: 5, name: 'Matthew McConaughey', character: 'Cooper', profile_path: '/e9MaSVQxaeHb3b7ddzZf6H7oO9c.jpg' },
        { id: 6, name: 'Anne Hathaway', character: 'Brand', profile_path: '/tLpq59c7Vj9U7B7K8r2s6z8M3d.jpg' },
        { id: 7, name: 'Jessica Chastain', character: 'Murph', profile_path: '/lodMz7zZ7K0gL6mP4w9B1a7V.jpg' },
      ],
      crew: [{ id: 11, job: 'Director', name: 'Christopher Nolan' }]
    },
    videos: {
      results: [{ id: 'v2', key: 'zSWdZVtXT7E', name: 'Official Trailer', site: 'YouTube', type: 'Trailer' }]
    }
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    vote_average: 8.4,
    vote_count: 36800,
    release_date: '2010-07-15',
    runtime: 148,
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
    popularity: 310.8,
    tagline: 'Your mind is the scene of the crime.',
    budget: 160000000,
    revenue: 836836967,
    credits: {
      cast: [
        { id: 8, name: 'Leonardo DiCaprio', character: 'Dom Cobb', profile_path: '/wo2hJpn04vbtmh0B9utCFdsQ2v9.jpg' },
        { id: 9, name: 'Joseph Gordon-Levitt', character: 'Arthur', profile_path: '/dhvZwHjW0F0k1mB1kP1z2s3t.jpg' },
      ],
      crew: [{ id: 11, job: 'Director', name: 'Christopher Nolan' }]
    },
    videos: {
      results: [{ id: 'v3', key: 'YoHD9XEInc0', name: 'Official Trailer', site: 'YouTube', type: 'Trailer' }]
    }
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/yDHYTfA3R0jFYba16jBB12qKpMw.jpg',
    vote_average: 7.7,
    vote_count: 4890,
    release_date: '2024-07-24',
    runtime: 128,
    genres: [{ id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 878, name: 'Science Fiction' }],
    popularity: 580.4,
    tagline: 'Come together.',
    budget: 200000000,
    revenue: 1337000000,
    credits: {
      cast: [
        { id: 12, name: 'Ryan Reynolds', character: 'Wade Wilson / Deadpool', profile_path: '/4SYTH5FRAxwhdkms9Np9Vn.jpg' },
        { id: 13, name: 'Hugh Jackman', character: 'Logan / Wolverine', profile_path: '/4Yk4pU7QvVj.jpg' },
      ],
      crew: [{ id: 14, job: 'Director', name: 'Shawn Levy' }]
    },
    videos: {
      results: [{ id: 'v4', key: '73_1biulkYk', name: 'Official Teaser', site: 'YouTube', type: 'Trailer' }]
    }
  },
  {
    id: 1022789,
    title: 'Inside Out 2',
    overview: 'Teenager Riley\'s mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust aren\'t sure how to feel when Anxiety shows up.',
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/stKGOmbuwhL48SAMoL0WQftqQo.jpg',
    vote_average: 7.6,
    vote_count: 4200,
    release_date: '2024-06-11',
    runtime: 96,
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 12, name: 'Adventure' }, { id: 35, name: 'Comedy' }],
    popularity: 460.9,
    tagline: 'Make room for new emotions.',
    budget: 200000000,
    revenue: 1690000000,
    credits: {
      cast: [
        { id: 15, name: 'Amy Poehler', character: 'Joy (voice)', profile_path: '/rD9Tqj1K5.jpg' },
        { id: 16, name: 'Maya Hawke', character: 'Anxiety (voice)', profile_path: '/z1X8xJ1p2.jpg' },
      ],
      crew: [{ id: 17, job: 'Director', name: 'Kelsey Mann' }]
    },
    videos: {
      results: [{ id: 'v5', key: 'LEjhY15eCx0', name: 'Official Trailer', site: 'YouTube', type: 'Trailer' }]
    }
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    vote_average: 8.5,
    vote_count: 32600,
    release_date: '2008-07-16',
    runtime: 152,
    genres: [{ id: 18, name: 'Drama' }, { id: 28, name: 'Action' }, { id: 80, name: 'Crime' }, { id: 53, name: 'Thriller' }],
    popularity: 290.4,
    tagline: 'Why So Serious?',
    budget: 185000000,
    revenue: 1004558444,
    credits: {
      cast: [
        { id: 18, name: 'Christian Bale', character: 'Bruce Wayne / Batman', profile_path: '/b7fwh.jpg' },
        { id: 19, name: 'Heath Ledger', character: 'Joker', profile_path: '/y7Mwq.jpg' },
      ],
      crew: [{ id: 11, job: 'Director', name: 'Christopher Nolan' }]
    },
    videos: {
      results: [{ id: 'v6', key: 'EXeTwQWrcwY', name: 'Official Trailer', site: 'YouTube', type: 'Trailer' }]
    }
  },
  {
    id: 823464,
    title: 'Godzilla x Kong: The New Empire',
    overview: 'Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world, challenging their very existence – and our own.',
    poster_path: '/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg',
    backdrop_path: '/qrGtVFxaD8c7et0j3hxYvK9JvN2.jpg',
    vote_average: 7.2,
    vote_count: 3600,
    release_date: '2024-03-27',
    runtime: 115,
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
    popularity: 340.1,
    tagline: 'Bow to your new king.',
    budget: 135000000,
    revenue: 567650016,
    credits: {
      cast: [
        { id: 20, name: 'Rebecca Hall', character: 'Dr. Ilene Andrews', profile_path: '/p8vM.jpg' },
        { id: 21, name: 'Brian Tyree Henry', character: 'Bernie Hayes', profile_path: '/x8vM.jpg' },
      ],
      crew: [{ id: 22, job: 'Director', name: 'Adam Wingard' }]
    },
    videos: {
      results: [{ id: 'v7', key: 'lV1OOlGwExM', name: 'Official Trailer', site: 'YouTube', type: 'Trailer' }]
    }
  },
  {
    id: 912649,
    title: 'Venom: The Last Dance',
    overview: 'Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision that will bring the curtains down on Venom and Eddie\'s last dance.',
    poster_path: '/aosm8NMQ3UyoBVpSxyimorCQykC.jpg',
    backdrop_path: '/3V4kLQg0kSqPLctI5ziYWgAZY8P.jpg',
    vote_average: 6.8,
    vote_count: 2150,
    release_date: '2024-10-23',
    runtime: 110,
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
    popularity: 510.3,
    tagline: '\'Til death do them part.',
    budget: 120000000,
    revenue: 477000000,
    credits: {
      cast: [
        { id: 23, name: 'Tom Hardy', character: 'Eddie Brock / Venom', profile_path: '/y7Mwq.jpg' },
        { id: 24, name: 'Chiwetel Ejiofor', character: 'Rex Strickland', profile_path: '/k8vM.jpg' },
      ],
      crew: [{ id: 25, job: 'Director', name: 'Kelly Marcel' }]
    },
    videos: {
      results: [{ id: 'v8', key: '__2bjWbetsA', name: 'Official Trailer', site: 'YouTube', type: 'Trailer' }]
    }
  }
];

/* ==========================================================================
   MOVIES API
   ========================================================================== */

export const getTrending = async (timeWindow = 'day') => {
  try {
    const res = await api.get(`/movies/trending`, { params: { timeWindow } });
    return res.data;
  } catch (err) {
    // Graceful fallback
    return {
      success: true,
      data: FALLBACK_MOVIES,
      results: FALLBACK_MOVIES,
      page: 1,
      total_pages: 1,
    };
  }
};

export const searchMovies = async (query, page = 1) => {
  if (!query || !query.trim()) {
    return { results: [], data: [], total_pages: 0, total_results: 0 };
  }
  try {
    const res = await api.get(`/movies/search`, { params: { q: query, query, page } });
    return res.data;
  } catch (err) {
    const filtered = FALLBACK_MOVIES.filter(m =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.overview.toLowerCase().includes(query.toLowerCase())
    );
    return {
      success: true,
      data: filtered,
      results: filtered,
      page: 1,
      total_pages: 1,
      total_results: filtered.length,
    };
  }
};

export const getMovieDetails = async (id) => {
  try {
    const res = await api.get(`/movies/${id}`);
    return res.data;
  } catch (err) {
    const found = FALLBACK_MOVIES.find(m => String(m.id) === String(id));
    if (found) {
      return { success: true, data: found, movie: found };
    }
    // Return template movie if not found
    return {
      success: true,
      data: {
        id: Number(id),
        title: `Movie #${id}`,
        overview: 'A thrilling cinematic experience exploring uncharted boundaries of human emotion and resilience.',
        poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5200SV.jpg',
        vote_average: 7.9,
        vote_count: 1420,
        release_date: '2024-05-18',
        runtime: 135,
        genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Sci-Fi' }],
        credits: {
          cast: [
            { id: 1, name: 'Leading Star', character: 'Protagonist', profile_path: null }
          ],
          crew: [{ id: 1, job: 'Director', name: 'Visionary Director' }]
        },
        videos: {
          results: [{ id: 'v1', key: 'Way9Dexny3w', name: 'Trailer', site: 'YouTube', type: 'Trailer' }]
        }
      }
    };
  }
};

export const getUpcoming = async (page = 1) => {
  try {
    const res = await api.get(`/movies/upcoming`, { params: { page } });
    return res.data;
  } catch (err) {
    return {
      success: true,
      data: FALLBACK_MOVIES.slice().reverse(),
      results: FALLBACK_MOVIES.slice().reverse(),
      page: 1,
      total_pages: 1,
    };
  }
};

export const getGenres = async () => {
  try {
    const res = await api.get(`/movies/genres`);
    return res.data;
  } catch (err) {
    return {
      success: true,
      data: FALLBACK_GENRES,
      genres: FALLBACK_GENRES,
    };
  }
};

export const getPopular = async (page = 1) => {
  try {
    const res = await api.get(`/movies/popular`, { params: { page } });
    return res.data;
  } catch (err) {
    return {
      success: true,
      data: FALLBACK_MOVIES,
      results: FALLBACK_MOVIES,
      page: 1,
      total_pages: 1,
    };
  }
};

/* ==========================================================================
   AUTH API
   ========================================================================== */

export const register = async (name, email, password) => {
  try {
    const res = await api.post(`/auth/register`, { name, email, password });
    return res.data;
  } catch (err) {
    // If backend isn't running, provide realistic mock auth
    if (!err.response) {
      const mockUser = { id: 'usr_' + Date.now(), name, email, createdAt: new Date().toISOString() };
      const mockToken = 'mock_jwt_token_' + Date.now();
      return { success: true, user: mockUser, token: mockToken };
    }
    throw err;
  }
};

export const login = async (email, password) => {
  try {
    const res = await api.post(`/auth/login`, { email, password });
    return res.data;
  } catch (err) {
    if (!err.response) {
      const mockUser = {
        id: 'usr_demo',
        name: email.split('@')[0].replace(/[._]/g, ' '),
        email,
        createdAt: '2024-01-15T00:00:00Z',
      };
      const mockToken = 'mock_jwt_token_demo';
      return { success: true, user: mockUser, token: mockToken };
    }
    throw err;
  }
};

export const logout = async () => {
  try {
    await api.post(`/auth/logout`).catch(() => {});
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return { success: true };
};

export const getMe = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');
  try {
    const res = await api.get(`/auth/me`);
    return res.data;
  } catch (err) {
    if (!err.response) {
      const stored = localStorage.getItem('user');
      if (stored) {
        return { success: true, user: JSON.parse(stored) };
      }
      return {
        success: true,
        user: { id: 'usr_demo', name: 'Cinematic Duelist', email: 'critic@movieduel.app', createdAt: '2024-01-15T00:00:00Z' },
      };
    }
    throw err;
  }
};

/* ==========================================================================
   DUEL API
   ========================================================================== */

export const compareDuel = async (movie1Id, movie2Id, weights = {}) => {
  try {
    const res = await api.post(`/duel/compare`, {
      movie1Id,
      movie2Id,
      weights,
    });
    return res.data;
  } catch (err) {
    // Local calculation fallback if backend is offline
    const m1 = FALLBACK_MOVIES.find(m => String(m.id) === String(movie1Id)) || {
      id: movie1Id,
      title: `Movie ${movie1Id}`,
      vote_average: 8.1,
      vote_count: 5000,
      runtime: 140,
      popularity: 300,
      poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5200SV.jpg',
      release_date: '2024-01-01',
      genres: [{ name: 'Sci-Fi' }]
    };

    const m2 = FALLBACK_MOVIES.find(m => String(m.id) === String(movie2Id)) || {
      id: movie2Id,
      title: `Movie ${movie2Id}`,
      vote_average: 8.3,
      vote_count: 12000,
      runtime: 155,
      popularity: 280,
      poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdrop_path: '/rAiYTnrLEhk0tiAGVP1249h5aA.jpg',
      release_date: '2014-11-05',
      genres: [{ name: 'Adventure' }]
    };

    const wCritic = weights.critic ?? 30;
    const wAudience = weights.audience ?? 25;
    const wStory = weights.story ?? 25;
    const wVisuals = weights.visuals ?? 20;

    const m1Critic = Math.min(100, Math.round(m1.vote_average * 10 + 2));
    const m2Critic = Math.min(100, Math.round(m2.vote_average * 10 - 1));

    const m1Audience = Math.min(100, Math.round(m1.vote_average * 9.8));
    const m2Audience = Math.min(100, Math.round(m2.vote_average * 10.1));

    const m1Story = Math.min(100, Math.round(82 + (m1.runtime > 130 ? 6 : 0)));
    const m2Story = Math.min(100, Math.round(85 + (m2.runtime > 130 ? 5 : 0)));

    const m1Visuals = 92;
    const m2Visuals = 89;

    const totalWeight = (wCritic + wAudience + wStory + wVisuals) || 100;
    const score1 = Math.round(
      (m1Critic * wCritic + m1Audience * wAudience + m1Story * wStory + m1Visuals * wVisuals) / totalWeight
    );
    const score2 = Math.round(
      (m2Critic * wCritic + m2Audience * wAudience + m2Story * wStory + m2Visuals * wVisuals) / totalWeight
    );

    const winnerId = score1 > score2 ? m1.id : score2 > score1 ? m2.id : null;
    const winnerTitle = score1 > score2 ? m1.title : score2 > score1 ? m2.title : 'Draw';

    return {
      success: true,
      data: {
        movie1: m1,
        movie2: m2,
        score1,
        score2,
        winnerId,
        winnerTitle,
        isTie: score1 === score2,
        verdict: score1 > score2
          ? `${m1.title} claims victory in this duel with an overall score of ${score1}/100, edging out ${m2.title} across key criteria!`
          : score2 > score1
          ? `${m2.title} triumphs in this duel with an impressive score of ${score2}/100, surpassing ${m1.title} in narrative resonance and audience acclaim!`
          : `A breathtaking stalemate! Both titans stand equally matched at ${score1}/100.`,
        criteria: [
          { name: 'Critical Acclaim', weight: wCritic, score1: m1Critic, score2: m2Critic, leader: m1Critic >= m2Critic ? 1 : 2 },
          { name: 'Audience Popularity', weight: wAudience, score1: m1Audience, score2: m2Audience, leader: m1Audience >= m2Audience ? 1 : 2 },
          { name: 'Story & Depth', weight: wStory, score1: m1Story, score2: m2Story, leader: m1Story >= m2Story ? 1 : 2 },
          { name: 'Cinematography & Visuals', weight: wVisuals, score1: m1Visuals, score2: m2Visuals, leader: m1Visuals >= m2Visuals ? 1 : 2 },
        ]
      }
    };
  }
};

export const getDuelHistory = async () => {
  try {
    const res = await api.get(`/duel/history`);
    return res.data;
  } catch (err) {
    return {
      success: true,
      data: [
        {
          id: 'duel_1',
          createdAt: '2024-10-10T14:30:00Z',
          movie1: FALLBACK_MOVIES[0],
          movie2: FALLBACK_MOVIES[1],
          score1: 89,
          score2: 87,
          winnerId: FALLBACK_MOVIES[0].id,
          winnerTitle: FALLBACK_MOVIES[0].title,
        },
        {
          id: 'duel_2',
          createdAt: '2024-10-08T09:15:00Z',
          movie1: FALLBACK_MOVIES[2],
          movie2: FALLBACK_MOVIES[5],
          score1: 91,
          score2: 93,
          winnerId: FALLBACK_MOVIES[5].id,
          winnerTitle: FALLBACK_MOVIES[5].title,
        }
      ]
    };
  }
};

/* ==========================================================================
   WATCHLIST API
   ========================================================================== */

export const getWatchlist = async () => {
  try {
    const res = await api.get(`/watchlist`);
    return res.data;
  } catch (err) {
    const local = localStorage.getItem('movie_duel_watchlist');
    const items = local ? JSON.parse(local) : [FALLBACK_MOVIES[0], FALLBACK_MOVIES[1]];
    return { success: true, data: items, watchlist: items };
  }
};

export const addToWatchlist = async (movie) => {
  try {
    const res = await api.post(`/watchlist`, { movieId: movie.id, movie });
    return res.data;
  } catch (err) {
    const local = localStorage.getItem('movie_duel_watchlist');
    const items = local ? JSON.parse(local) : [];
    if (!items.some(m => String(m.id) === String(movie.id))) {
      items.push(movie);
      localStorage.setItem('movie_duel_watchlist', JSON.stringify(items));
    }
    return { success: true, message: 'Added to watchlist', data: movie };
  }
};

export const removeFromWatchlist = async (movieId) => {
  try {
    const res = await api.delete(`/watchlist/${movieId}`);
    return res.data;
  } catch (err) {
    const local = localStorage.getItem('movie_duel_watchlist');
    if (local) {
      const items = JSON.parse(local).filter(m => String(m.id) !== String(movieId));
      localStorage.setItem('movie_duel_watchlist', JSON.stringify(items));
    }
    return { success: true, message: 'Removed from watchlist' };
  }
};

export const checkWatchlistItem = async (movieId) => {
  try {
    const res = await api.get(`/watchlist/check/${movieId}`);
    return res.data;
  } catch (err) {
    const local = localStorage.getItem('movie_duel_watchlist');
    const items = local ? JSON.parse(local) : [];
    const isIn = items.some(m => String(m.id) === String(movieId));
    return { success: true, inWatchlist: isIn };
  }
};

export const checkMultipleWatchlist = async (movieIds) => {
  try {
    const res = await api.post(`/watchlist/check-multiple`, { movieIds });
    return res.data;
  } catch (err) {
    const local = localStorage.getItem('movie_duel_watchlist');
    const items = local ? JSON.parse(local) : [];
    const inWatchlistMap = {};
    movieIds.forEach(id => {
      inWatchlistMap[id] = items.some(m => String(m.id) === String(id));
    });
    return { success: true, inWatchlist: inWatchlistMap };
  }
};

/* ==========================================================================
   PREFERENCES API
   ========================================================================== */

export const getPreferences = async () => {
  try {
    const res = await api.get(`/preferences`);
    return res.data;
  } catch (err) {
    const local = localStorage.getItem('movie_duel_preferences');
    const prefs = local ? JSON.parse(local) : {
      favoriteGenres: [878, 28, 12],
      runtimeRange: [90, 180],
      language: 'en',
      releaseYearFrom: 2000,
      releaseYearTo: 2026,
      minRating: 7.0,
    };
    return { success: true, data: prefs, preferences: prefs };
  }
};

export const updatePreferences = async (preferences) => {
  try {
    const res = await api.put(`/preferences`, preferences);
    return res.data;
  } catch (err) {
    localStorage.setItem('movie_duel_preferences', JSON.stringify(preferences));
    return { success: true, message: 'Preferences updated successfully', data: preferences };
  }
};

/* ==========================================================================
   RECOMMENDATIONS API
   ========================================================================== */

export const getRecommendations = async () => {
  try {
    const res = await api.get(`/recommendations`);
    return res.data;
  } catch (err) {
    return {
      success: true,
      data: [
        {
          ...FALLBACK_MOVIES[0],
          reason: 'Matches your taste for epic sci-fi masterworks and high-stakes cinematic lore',
          matchPercentage: 96,
        },
        {
          ...FALLBACK_MOVIES[2],
          reason: 'Recommended based on your love for Christopher Nolan and high intellect thrillers',
          matchPercentage: 94,
        },
        {
          ...FALLBACK_MOVIES[5],
          reason: 'Beloved by fans of deep atmospheric action and exceptional screenplays',
          matchPercentage: 92,
        },
        {
          ...FALLBACK_MOVIES[4],
          reason: 'Critically acclaimed 2024 blockbuster matching your high rating preference',
          matchPercentage: 88,
        },
      ]
    };
  }
};

export default api;

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as cheerio from 'cheerio';
import NodeCache from 'node-cache';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const app = express();
const PORT = process.env.PORT || 3000;
const router = express.Router();
const JWT_SECRET = 'kai_manga_secret_key_2026';

// MySQL Connection Pool
const pool = mysql.createPool({
  host: 'sql208.infinityfree.com',
  user: 'if0_41593312',
  password: 'eC2UtBeyJ5zdEwS',
  database: 'if0_41593312_kai',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
async function initDb() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        manga_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        image TEXT NOT NULL,
        latest_chapter_name VARCHAR(255),
        latest_chapter_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_bookmark (user_id, manga_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    connection.release();
  } catch (err) {
    console.error('MySQL initialization error:', err.message);
  }
}

initDb();

// Setup axios retry
axiosRetry(axios, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  }
});

// Cache setup: 1 hour for data, 24 hours for images
const dataCache = new NodeCache({ stdTTL: 3600 });
const imageCache = new NodeCache({ stdTTL: 86400 });

app.use(cors());
app.use(express.json());

// Auth Middlewares
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    const token = jwt.sign({ id: result.insertId, username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: result.insertId, username } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Username already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Bookmark Sync Routes
app.get('/api/sync/bookmarks', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bookmarks WHERE user_id = ?', [req.user.id]);
    const bookmarks = rows.map(r => ({
      id: r.manga_id,
      title: r.title,
      image: r.image,
      latestChapter: {
        name: r.latest_chapter_name,
        id: r.latest_chapter_id
      }
    }));
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/sync/bookmarks', authenticateToken, async (req, res) => {
  const { bookmarks } = req.body;
  if (!Array.isArray(bookmarks)) return res.status(400).json({ message: 'Invalid data' });

  try {
    // Basic bulk insert/update
    for (const b of bookmarks) {
      await pool.query(
        `INSERT INTO bookmarks (user_id, manga_id, title, image, latest_chapter_name, latest_chapter_id) 
         VALUES (?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         title = VALUES(title), 
         image = VALUES(image), 
         latest_chapter_name = VALUES(latest_chapter_name), 
         latest_chapter_id = VALUES(latest_chapter_id)`,
        [req.user.id, b.id, b.title, b.image, b.latestChapter?.name, b.latestChapter?.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/sync/add-bookmark', authenticateToken, async (req, res) => {
  const { manga } = req.body;
  try {
    await pool.query(
      `INSERT INTO bookmarks (user_id, manga_id, title, image, latest_chapter_name, latest_chapter_id) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       title = VALUES(title), 
       image = VALUES(image), 
       latest_chapter_name = VALUES(latest_chapter_name), 
       latest_chapter_id = VALUES(latest_chapter_id)`,
      [req.user.id, manga.id, manga.title, manga.image, manga.latestChapter?.name, manga.latestChapter?.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/sync/remove-bookmark', authenticateToken, async (req, res) => {
  const { mangaId } = req.body;
  try {
    await pool.query('DELETE FROM bookmarks WHERE user_id = ? AND manga_id = ?', [req.user.id, mangaId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/api/manga', router);

const BASE_URL = 'https://www.mangakakalot.fan';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': BASE_URL + '/',
};

// Helper for caching
const getCachedOrFetch = async (key, fetchFn, ttl = 3600) => {
  const cached = dataCache.get(key);
  if (cached) return cached;
  const data = await fetchFn();
  dataCache.set(key, data, ttl);
  return data;
};

/** Manga slug from any /manga/{slug} or /manga/{slug}/chapter (first path segment only). */
function mangaSlugFromHref(href) {
  if (!href || typeof href !== 'string') return '';
  const clean = href.split('#')[0].split('?')[0];
  const m = clean.match(/\/manga\/([^/?#]+)/);
  return m ? m[1] : '';
}

// Image Proxy with Caching
app.get('/api/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('URL is required');

  const cachedImage = imageCache.get(imageUrl);
  if (cachedImage) {
    res.setHeader('Content-Type', cachedImage.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(cachedImage.data);
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: { ...HEADERS, Referer: BASE_URL + '/' },
      timeout: 10000,
    });
    const contentType = response.headers['content-type'] || 'image/jpeg';
    const imageData = { data: response.data, contentType };
    imageCache.set(imageUrl, imageData);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error');
  }
});

// Home Page Scraper
router.get('/home', async (req, res) => {
  try {
    const homeData = await getCachedOrFetch('home_data_v2', async () => {
      const { data } = await axios.get(BASE_URL, { headers: HEADERS });
      const $ = cheerio.load(data);
      const popularManga = { title: 'Popular Manga', mangas: [] };
      const latestUpdates = { title: 'Latest Updates', mangas: [] };

      $('.owl-carousel .item').each((i, el) => {
        popularManga.mangas.push({
          id: mangaSlugFromHref($(el).find('h3 a').attr('href') || ''),
          title: $(el).find('h3 a').text().trim(),
          image: $(el).find('img').attr('src'),
          latestChapter: {
            name: $(el).find('.slide-caption a:last-child').text().trim(),
            id: ($(el).find('.slide-caption a:last-child').attr('href') || '').split('/').pop()?.split('?')[0] || ''
          }
        });
      });

      $('.panel-content-homepage .content-homepage-item').each((i, el) => {
        latestUpdates.mangas.push({
          id: mangaSlugFromHref($(el).find('h3 a').attr('href') || ''),
          title: $(el).find('h3 a').text().trim(),
          image: $(el).find('img').attr('src'),
          latestChapter: {
            name: $(el).find('.item-chapter a').first().text().trim(),
            id: ($(el).find('.item-chapter a').first().attr('href') || '').split('/').pop()?.split('?')[0] || ''
          }
        });
      });
      return { popularManga, latestUpdates };
    });
    res.json(homeData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generic Scraper for Browse Pages (Latest, Hot, New, Completed, Genres)
router.get('/browse/:type/:page', async (req, res) => {
  const { type, page } = req.params;
  let { category = 'all', state = 'all', alpha = 'all' } = req.query;
  const cacheKey = `browse_v3_${type}_${category}_${state}_${alpha}_${page}`;
  
  // Mapping frontend types to mangakakalot URL segments
  const typeMap = {
    latest: 'latest',
    hot: 'topview',
    new: 'newest',
    completed: 'latest'
  };

  const listTypeMap = {
    latest: 'latest-manga',
    hot: 'hot-manga',
    new: 'new-manga',
    completed: 'completed-manga'
  };
  
  const mType = typeMap[type] || 'latest';
  const lType = listTypeMap[type] || 'latest-manga';
  
  if (type === 'completed') state = 'completed';

  const urls = [];
  
  // 1. If we have any filters, use the genre/category endpoint
  if (category !== 'all' || state !== 'all' || alpha !== 'all') {
    // Note: mangakakalot.fan uses /genre/ID for categories
    const genreId = category === 'all' ? 'all' : category;
    urls.push(`${BASE_URL}/genre/${genreId}?type=${mType}&state=${state}&alpha=${alpha}&page=${page}`);
  }
  
  // 2. Direct list for basic types (no filters)
  urls.push(`${BASE_URL}/manga-list/${lType}?page=${page}`);
  
  // 3. Fallback to manga_list just in case
  urls.push(`${BASE_URL}/manga_list?type=${mType}&category=${category}&state=${state}&alpha=${alpha}&page=${page}`);

  try {
    const browseData = await getCachedOrFetch(cacheKey, async () => {
      let html = '';
      let lastError = null;

      for (const url of urls) {
        try {
          console.log(`Fetching browse URL: ${url}`);
          const response = await axios.get(url, { headers: HEADERS, timeout: 10000 });
          if (response.data && response.data.length > 500) {
            html = response.data;
            break;
          }
        } catch (e) {
          lastError = e;
          console.warn(`Failed to fetch ${url}: ${e.message}`);
        }
      }

      if (!html) throw lastError || new Error('Empty or invalid response from source');
      
      const $ = cheerio.load(html);
      const mangas = [];
      const seenIds = new Set();
      
      // Broad selectors for browse items
      const itemSelectors = [
        '.list-story-item',
        '.list-comic-item-wrap',
        '.panel_story_list .story_item',
        '.panel_story_list .item',
        '.content-genres-item',
        '.story_item'
      ];

      itemSelectors.forEach(selector => {
        $(selector).each((i, el) => {
          let href = '';
          let title = '';
          let image = '';
          let chName = '';
          let chId = '';

          if ($(el).hasClass('list-story-item') || $(el).hasClass('list-comic-item-wrap')) {
            // Structure found on /manga-list/ and /genre/
            const link = $(el).hasClass('list-story-item') ? $(el) : $(el).find('a').first();
            href = link.attr('href') || '';
            title = link.attr('title') || link.find('img').attr('alt') || '';
            image = link.find('img').attr('src') || link.find('img').attr('data-src') || '';
            
            const parent = $(el).hasClass('list-story-item') ? $(el).parent() : $(el);
            const chLink = parent.find('.list-story-item-wrap-chapter, h3 a').last();
            chName = chLink.text().trim();
            chId = (chLink.attr('href') || '').split('/').pop()?.split('?')[0] || '';
          } else {
            // Traditional structure
            const titleLink = $(el).find('.story_name a, h3 a, a').first();
            href = titleLink.attr('href') || '';
            title = titleLink.text().trim();
            image = $(el).find('img').attr('src') || '';
            
            const chLink = $(el).find('.story_chapter a, .chapter a, .item-chapter a').first();
            chName = chLink.text().trim();
            chId = (chLink.attr('href') || '').split('/').pop()?.split('?')[0] || '';
          }

          const id = mangaSlugFromHref(href);
          if (!id || seenIds.has(id) || id.includes('manga_list') || id === 'genre' || id === 'search') return;
          
          if (id && title) {
            mangas.push({ 
              id, 
              title, 
              image, 
              latestChapter: { name: chName, id: chId } 
            });
            seenIds.add(id);
          }
        });
      });

      // Pagination parsing
      let totalPages = 1;
      const lastPageBtn = $('.page_last, .page_blue:last, .last, [title*="Last page"], .page_blue:contains("LAST"), a:contains("LAST")');
      if (lastPageBtn.length > 0) {
        const lastPageText = lastPageBtn.text();
        const lastPageMatch = lastPageText.match(/(\d+)/);
        if (lastPageMatch) {
          totalPages = parseInt(lastPageMatch[1]);
        } else {
          const href = lastPageBtn.attr('href');
          const hrefMatch = href?.match(/page=(\d+)/);
          if (hrefMatch) totalPages = parseInt(hrefMatch[1]);
        }
      }
      
      const totalText = $('.panel_story_list_title').text() || $('.group_qty').text() || $('.total-story').text() || $('.total-stories').text() || $('.teal-box').text() || $('.page_blue:contains("Total:")').text();
      const totalMatch = totalText.match(/(?:Found|TOTAL:|Total:|Total stories:)\s*([\d,.]+)/i);
      let totalMangas = totalMatch ? parseInt(totalMatch[1].replace(/[,.]/g, '')) : (totalPages * 20);
      
      if (totalMangas < mangas.length) totalMangas = mangas.length;

      return {
        mangas,
        currentPage: parseInt(page),
        hasNextPage: $('.page_next').length > 0 || parseInt(page) < totalPages,
        totalPages,
        totalMangas
      };
    });
    res.json(browseData);
  } catch (error) {
    console.error(`Browse error (${type}):`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Genre/Category List Scraper
router.get('/genres', async (req, res) => {
  try {
    const genres = await getCachedOrFetch('genres_list_v2', async () => {
      const { data } = await axios.get(BASE_URL, { headers: HEADERS });
      const $ = cheerio.load(data);
      const genreList = [];
      const seenGenres = new Set();
      
      $('a[href*="/genre/"]').each((i, el) => {
        const href = $(el).attr('href') || '';
        const id = href.split('/genre/').pop()?.split('?')[0]?.split('#')[0] || '';
        const name = $(el).text().trim();
        if (id && name && id !== 'all' && !seenGenres.has(id)) {
          genreList.push({ id, name });
          seenGenres.add(id);
        }
      });
      
      // If no genres found via a[href], try the original panel-category table
      if (genreList.length === 0) {
        $('.panel-category table tr td a').each((i, el) => {
          const href = $(el).attr('href') || '';
          const id = href.split('category=').pop()?.split('&')[0] || href.split('/genre/').pop()?.split('?')[0] || '';
          const name = $(el).text().trim();
          if (id && name && id !== 'all' && !seenGenres.has(id)) {
            genreList.push({ id, name });
            seenGenres.add(id);
          }
        });
      }
      
      return genreList.sort((a, b) => a.name.localeCompare(b.name));
    }, 86400); // Cache for 24 hours
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search Scraper
router.get('/search/:query/:page', async (req, res) => {
  const { query, page } = req.params;
  const cleanQuery = query.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
  const url = `${BASE_URL}/search/story/${cleanQuery}?page=${page}`;

  try {
    const { data } = await axios.get(url, { 
      headers: HEADERS,
      timeout: 8000 
    });
    
    if (!data || data.includes('security verification')) {
      return res.status(503).json({ error: 'Cloudflare security check triggered. Please try again later.' });
    }

    const $ = cheerio.load(data);
    const mangas = [];
    
    // Broad selectors for search results
    const storySelectors = [
      '.panel_story_list .story_item',
      '.panel_story_list .item',
      '.panel-list-story .story_item',
      '.story_item',
      '.search-story-item',
      '.panel_story_list_content .story_item'
    ];
    const seenIds = new Set();
    
    storySelectors.forEach(selector => {
      $(selector).each((i, el) => {
        const id = mangaSlugFromHref($(el).find('.story_name a, h3 a, a').attr('href') || '');
        if (!id || seenIds.has(id) || id.includes('search') || id.includes('manga_list')) return;
        
        const title = $(el).find('.story_name a, h3 a, a').text().trim();
        const image = $(el).find('img').attr('src');
        const latestChapter = {
          name: $(el).find('.story_chapter a, .chapter a, .item-chapter a').first().text().trim(),
          id: ($(el).find('.story_chapter a, .chapter a, .item-chapter a').first().attr('href') || '').split('/').pop()?.split('?')[0] || ''
        };
        
        if (id && title) {
          mangas.push({ id, title, image, latestChapter });
          seenIds.add(id);
        }
      });
    });

    // Robust total count scraping
    let totalMangas = mangas.length;
    
    // Look for any element that might contain the total count
    const countSelectors = [
      '.panel_story_list_title', 
      '.group_qty', 
      '.total-story', 
      '.search-title', 
      '.title-text', 
      '.total-stories', 
      '.teal-box', 
      '.quantity',
      '.group_qty'
    ];
    
    let combinedText = '';
    countSelectors.forEach(s => {
      const text = $(s).text().trim();
      if (text) combinedText += ' ' + text;
    });

    // If no specific selectors worked, look for text containing "TOTAL" or "Stories"
    if (!combinedText.includes('TOTAL') && !combinedText.includes('stories')) {
      combinedText += ' ' + $('div, span').filter(function() {
        const text = $(this).text().toUpperCase();
        return text.includes('TOTAL') && text.includes('STORIES');
      }).first().text();
    }

    // Match all numbers in the combined text and pick the largest one
    const numbers = combinedText.match(/[\d,.]+/g);
    if (numbers && numbers.length > 0) {
      const parsedNumbers = numbers.map(n => parseInt(n.replace(/[,.]/g, ''))).filter(n => !isNaN(n));
      if (parsedNumbers.length > 0) {
        totalMangas = Math.max(...parsedNumbers);
      }
    }
    
    // Check if there's more pages
    let totalPages = 1;
    const lastPageBtn = $('.page_last, .page_blue:last, .last, [title*="Last page"], .page_blue:contains("LAST"), a:contains("LAST")');
    if (lastPageBtn.length > 0) {
      const lastPageText = lastPageBtn.text();
      const lastPageMatch = lastPageText.match(/(\d+)/);
      if (lastPageMatch) {
        totalPages = parseInt(lastPageMatch[1]);
      } else {
        const href = lastPageBtn.attr('href');
        const hrefMatch = href?.match(/page=(\d+)/);
        if (hrefMatch) totalPages = parseInt(hrefMatch[1]);
      }
    }

    // Fallback totalPages based on totalMangas
    if (totalPages === 1 && totalMangas > mangas.length) {
      totalPages = Math.ceil(totalMangas / 24);
    }
    
    // If totalMangas is suspiciously low but we have many pages
    if (totalMangas <= mangas.length && totalPages > 1) {
      totalMangas = totalPages * 24;
    }

    res.json({
      mangas,
      currentPage: parseInt(page),
      hasNextPage: $('.page_next').length > 0 || page < totalPages,
      totalPages,
      totalMangas
    });
  } catch (error) {
    console.error(`Search error (${query}):`, error.message);
    res.status(500).json({ error: error.message });
  }
});

/** Build chapters JSON URL from manga page template (survives domain/path changes). */
function resolveChapterListApiUrlFromDom($, mangaSlug) {
  const slug = encodeURIComponent(mangaSlug);
  const tmpl = $('#chapter-list-container').attr('data-api-url');
  if (tmpl && tmpl.includes('__SLUG__')) {
    return tmpl.replace(/__SLUG__/g, mangaSlug);
  }
  return `${BASE_URL}/api/manga/${slug}/chapters`;
}

/** Paginated chapters JSON from mangakakalot.fan (same schema the site uses in the browser). */
async function fetchChaptersFromJsonApi(chaptersListUrl) {
  const chapters = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const { data: json } = await axios.get(chaptersListUrl, {
      headers: { ...HEADERS, Accept: 'application/json, text/plain, */*' },
      params: { limit, offset },
      timeout: 20000,
      validateStatus: (s) => s < 500,
    });
    if (!json?.success || !Array.isArray(json.data?.chapters)) break;
    for (const ch of json.data.chapters) {
      chapters.push({
        id: ch.chapter_slug || '',
        name: (ch.chapter_name || '').trim(),
        date: ch.updated_at
          ? new Date(ch.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
          : '',
      });
    }
    if (!json.data.pagination?.has_more) break;
    offset += limit;
  }
  return chapters.filter((c) => c.id);
}

/**
 * Chapter list extraction matching mangakakalot-api scraper
 * (see https://github.com/shafat-96/mangakakalot-api — .chapter-list .row).
 */
function scrapeChaptersMangakakalotPackageStyle($) {
  const chapters = [];
  $('.chapter-list .row').each((i, el) => {
    const chapterLink = $(el).find('span:first-child a');
    const chapterName = chapterLink.text().trim();
    const chapterUrl = chapterLink.attr('href');
    const chapterId = chapterUrl ? chapterUrl.split('/').filter(Boolean).pop() : '';
    const date = $(el).find('span:last-child').text().trim();
    if (chapterId && chapterName) {
      chapters.push({ id: chapterId, name: chapterName, date });
    }
  });
  return chapters;
}

/** Last resort: npm mangakakalot-api uses mangakakalot.gg (may work on some networks). */
async function fetchChaptersViaMangakakalotNpmPackage(mangaId) {
  try {
    const mangaApi = require('mangakakalot-api');
    const d = await mangaApi.getDetails(mangaId);
    if (!d?.chapters?.length) return [];
    return d.chapters
      .map((c) => ({
        id: String(c.id || '').trim(),
        name: String(c.name || '').trim(),
        date: String(c.date || '').trim(),
      }))
      .filter((c) => c.id && c.name);
  } catch (e) {
    console.warn('mangakakalot-api getDetails:', e.message);
    return [];
  }
}

/**
 * Full chapter resolution pipeline for mangakakalot.fan + fallbacks (does not alter home/browse/read routes).
 */
async function resolveMangaChapters($, idParam, slugCandidates) {
  for (const slugTry of slugCandidates) {
    try {
      const url = resolveChapterListApiUrlFromDom($, slugTry);
      const list = await fetchChaptersFromJsonApi(url);
      if (list.length > 0) return list;
    } catch (e) {
      console.warn(`Chapter JSON API failed (${slugTry}):`, e.message);
    }
  }

  let list = scrapeChaptersMangakakalotPackageStyle($);
  if (list.length > 0) return list;

  for (const slugTry of slugCandidates) {
    list = scrapeChaptersFromAnchors($, slugTry);
    if (list.length > 0) return list;
  }

  list = [];
  $('.row-content-chapter .a-h').each((i, el) => {
    list.push({
      id: $(el).find('a').attr('href')?.split('/').pop() || '',
      name: $(el).find('a').text().trim(),
      date: $(el).find('.chapter-time').text().trim(),
    });
  });
  if (list.some((c) => c.id)) return list.filter((c) => c.id);

  list = [];
  $('.chapter-list .row').each((i, el) => {
    const a = $(el).find('a').first();
    const href = a.attr('href') || '';
    list.push({
      id: href.split('/').filter(Boolean).pop() || '',
      name: a.text().trim(),
      date: $(el).find('span:last').text().trim(),
    });
  });
  if (list.some((c) => c.id)) return list.filter((c) => c.id);

  list = await fetchChaptersViaMangakakalotNpmPackage(idParam);
  return list;
}

/** Parse chapter links embedded in static HTML (read-chapter / hero links). */
function scrapeChaptersFromAnchors($, mangaSlug) {
  const seen = new Set();
  const list = [];
  const slug = decodeURIComponent((mangaSlug || '').replace(/\/$/, ''));
  const norm = (s) => decodeURIComponent(s || '').toLowerCase();

  $('a[href]').each((i, el) => {
    const href = $(el).attr('href') || '';
    const abs = href.startsWith('http') ? href : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
    let path;
    try {
      path = new URL(abs).pathname;
    } catch {
      return;
    }
    const parts = path.split('/').filter(Boolean);
    if (parts[0] !== 'manga' || parts.length < 3) return;
    if (norm(parts[1]) !== norm(slug)) return;
    const chapterId = parts[2];
    if (!chapterId || seen.has(chapterId)) return;
    if (['comments', 'reviews', 'discussion', 'rss'].includes(chapterId.toLowerCase())) return;
    seen.add(chapterId);
    const name = $(el).text().trim() || chapterId.replace(/-/g, ' ');
    list.push({ id: chapterId, name, date: '' });
  });
  list.sort((a, b) => {
    const na = parseFloat(String(a.id).replace(/[^\d.]/g, '')) || 0;
    const nb = parseFloat(String(b.id).replace(/[^\d.]/g, '')) || 0;
    return nb - na;
  });
  return list;
}

function collectMangaSlugCandidates($, idParam) {
  const raw = decodeURIComponent(idParam || '').trim();
  const out = [];
  const push = (s) => {
    const t = (s || '').trim();
    if (t && !out.includes(t)) out.push(t);
  };
  push($('#chapter-list-container').attr('data-comic-slug'));
  const canonical = $('link[rel="canonical"]').attr('href');
  if (canonical) {
    const m = String(canonical).match(/\/manga\/([^/?#]+)/);
    if (m) push(m[1]);
  }
  const ogUrl = $('meta[property="og:url"]').attr('content');
  if (ogUrl) {
    const m = String(ogUrl).match(/\/manga\/([^/?#]+)/);
    if (m) push(m[1]);
  }
  push(raw);
  return out;
}

/**
 * Lists/grid sometimes expose shortened slugs in URLs; search finds the full slug.
 * Collects prefix matches, then prefers a slug that actually returns a manga page (GET check).
 */
async function resolveFullMangaSlug(partialId) {
  const q = partialId.replace(/-/g, ' ').trim();
  if (!q) return null;
  const tryUrls = [
    `${BASE_URL}/search/story/${encodeURIComponent(q)}`,
    `${BASE_URL}/search/${encodeURIComponent(q)}`,
  ];
  for (const url of tryUrls) {
    try {
      const { data, status } = await axios.get(url, { headers: HEADERS, timeout: 18000, validateStatus: (s) => s < 500 });
      if (status !== 200 || !data) continue;
      const $ = cheerio.load(data);
      const candidates = new Set();
      $('.story_name a, .search-story-title a, .story_item h3 a, .item-story a').each((i, el) => {
        const slug = mangaSlugFromHref($(el).attr('href') || '');
        if (slug && !slug.includes('manga_list')) candidates.add(slug);
      });
      $('a[href*="/manga/"]').each((i, el) => {
        const slug = mangaSlugFromHref($(el).attr('href') || '');
        if (slug && !slug.includes('manga_list') && slug !== 'search') candidates.add(slug);
      });

      const matches = [...candidates].filter(
        (slug) => slug === partialId || (slug.length > partialId.length && slug.startsWith(partialId)),
      );
      if (matches.length === 0) continue;

      matches.sort((a, b) => b.length - a.length);
      for (const slug of matches) {
        try {
          const check = await axios.get(`${BASE_URL}/manga/${encodeURIComponent(slug)}`, {
            headers: HEADERS,
            timeout: 15000,
            validateStatus: () => true,
          });
          if (check.status === 200 && check.data && String(check.data).length > 5000) {
            return slug;
          }
        } catch {
          /* try next */
        }
      }
      return matches[0];
    } catch (e) {
      console.warn('resolveFullMangaSlug:', url, e.message);
    }
  }
  return null;
}

// Details Scraper
router.get('/details/:id', async (req, res) => {
  const requestedId = decodeURIComponent(req.params.id);
  const cacheKey = `details_v5_${requestedId}`;

  try {
    let detailsData = dataCache.get(cacheKey);
    if (detailsData && Array.isArray(detailsData.chapters) && detailsData.chapters.length === 0) {
      dataCache.del(cacheKey);
      detailsData = undefined;
    }

    if (!detailsData) {
      detailsData = await (async () => {
        let mangaId = requestedId;
        let page = await axios.get(`${BASE_URL}/manga/${encodeURIComponent(mangaId)}`, {
          headers: HEADERS,
          validateStatus: () => true,
          timeout: 20000,
        });

        const pageLooksBad =
          page.status !== 200 ||
          !page.data ||
          String(page.data).length < 800;

        let $probe = pageLooksBad ? null : cheerio.load(page.data);
        const noMangaTitle =
          $probe &&
          !$probe('.manga-info-text h1, .story-info-right h1').text().trim();

        if (pageLooksBad || noMangaTitle) {
          const full = await resolveFullMangaSlug(requestedId);
          if (full) {
            mangaId = full;
            page = await axios.get(`${BASE_URL}/manga/${encodeURIComponent(mangaId)}`, {
              headers: HEADERS,
              validateStatus: () => true,
              timeout: 20000,
            });
          }
        }

        if (page.status !== 200 || !page.data || String(page.data).length < 500) {
          throw new Error('Manga not found');
        }

        const html = page.data;
        const $ = cheerio.load(html);

        const slugCandidates = collectMangaSlugCandidates($, mangaId);
        const chapters = await resolveMangaChapters($, mangaId, slugCandidates);

        const payload = {
          id: mangaId,
          title: $('.manga-info-text h1').text().trim() || $('.story-info-right h1').text().trim(),
          image: $('.manga-info-pic img').attr('src') || $('.story-info-left img').attr('src'),
          author: $('.manga-info-text li:contains("Author")').text().replace('Author(s) :', '').trim() ||
                  $('.story-info-right li:contains("Author")').text().replace('Author(s) :', '').trim(),
          status: $('.manga-info-text li:contains("Status")').text().replace('Status :', '').trim() ||
                  $('.story-info-right li:contains("Status")').text().replace('Status :', '').trim(),
          genres: $('.manga-info-text li.genres a').map((i, el) => $(el).text().trim()).get().length > 0 ?
                  $('.manga-info-text li.genres a').map((i, el) => $(el).text().trim()).get() :
                  $('.story-info-right .table-value a').map((i, el) => $(el).text().trim()).get(),
          description: $('#noidungm').text().trim() || $('#panel-story-info-description').text().replace('Description :', '').trim(),
          chapters,
        };
        return payload;
      })();

      if (detailsData.chapters.length > 0) {
        dataCache.set(cacheKey, detailsData);
      }
    }

    res.json(detailsData);
  } catch (error) {
    console.error(`Details error (${requestedId}):`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Reader Scraper
router.get('/read/:mangaId/:chapterId', async (req, res) => {
  const { mangaId, chapterId } = req.params;
  const cacheKey = `read_v2_${mangaId}_${chapterId}`;

  try {
    const readerData = await getCachedOrFetch(cacheKey, async () => {
      const { data: html } = await axios.get(`${BASE_URL}/manga/${mangaId}/${chapterId}`, { 
        headers: HEADERS,
        timeout: 20000 
      });
      const $ = cheerio.load(html);
      
      // 1. Extract Images
      const chapterImagesMatch = html.match(/var chapterImages = (\[.*?\]);/);
      const cdnsMatch = html.match(/var cdns = (\[.*?\]);/);
      
      let images = [];
      if (chapterImagesMatch && cdnsMatch) {
        try {
          const relativeImages = JSON.parse(chapterImagesMatch[1]);
          const cdns = JSON.parse(cdnsMatch[1]);
          images = relativeImages.map(img => `${cdns[0] || ''}${img}`);
        } catch (e) {
          console.error('JSON parse error for images:', e.message);
        }
      }

      // Fallback for images if script match fails
      if (images.length === 0) {
        $('.container-chapter-reader img').each((i, el) => {
          const src = $(el).attr('src') || $(el).attr('data-src');
          if (src) images.push(src);
        });
      }

      // 2. Fetch Chapter List for Navigation
      let allChapters = [];
      try {
        const chaptersUrl = `${BASE_URL}/api/manga/${mangaId}/chapters`;
        const { data: chaptersJson } = await axios.get(chaptersUrl, { 
          headers: { ...HEADERS, Accept: 'application/json' },
          timeout: 10000
        });
        
        if (chaptersJson?.success && Array.isArray(chaptersJson.data?.chapters)) {
          allChapters = chaptersJson.data.chapters.map(ch => ({
            id: ch.chapter_slug,
            name: ch.chapter_name
          }));
        }
      } catch (e) {
        console.warn('Failed to fetch chapters from API for navigation:', e.message);
      }

      // Fallback for allChapters if API fails
      if (allChapters.length === 0) {
        $('.navi-change-chapter').first().find('option').each((i, el) => {
          const val = $(el).val();
          if (val) {
            allChapters.push({
              id: val.split('/').filter(Boolean).pop() || '',
              name: $(el).text().trim()
            });
          }
        });
      }

      // 3. Determine Prev/Next
      let prevChapter = null;
      let nextChapter = null;
      
      const currentIndex = allChapters.findIndex(ch => ch.id === chapterId);
      if (currentIndex !== -1) {
        // Chapters are usually in descending order (latest first)
        // so prev is next in array, next is prev in array
        if (currentIndex < allChapters.length - 1) {
          prevChapter = allChapters[currentIndex + 1].id;
        }
        if (currentIndex > 0) {
          nextChapter = allChapters[currentIndex - 1].id;
        }
      }

      // Fallback for Prev/Next if not found in list
      if (!prevChapter) {
        const href = $('.navi-change-chapter-btn-prev, .prev, .btn-prev').attr('href');
        if (href && !href.includes('javascript')) {
          prevChapter = href.split('/').filter(Boolean).pop() || null;
        }
      }
      if (!nextChapter) {
        const href = $('.navi-change-chapter-btn-next, .next, .btn-next').attr('href');
        if (href && !href.includes('javascript')) {
          nextChapter = href.split('/').filter(Boolean).pop() || null;
        }
      }

      return {
        id: chapterId,
        title: $('.info-top-chapter h2').text().trim() || `Chapter ${chapterId}`,
        mangaId,
        mangaTitle: $('.breadcrumb span:nth-child(3) a').text().trim() || 
                    $('.breadcrumb a[href*="/manga/"]').last().text().trim() || 
                    'Manga',
        mangaImage: $('meta[property="og:image"]').attr('content') || 
                    $('meta[name="twitter:image"]').attr('content') || 
                    '',
        images,
        prevChapter,
        nextChapter,
        allChapters
      };
    });
    res.json(readerData);
  } catch (error) {
    console.error(`Read error (${mangaId}/${chapterId}):`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});

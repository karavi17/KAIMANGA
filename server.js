import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const BASE_URL = 'https://www.mangakakalot.fan';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': BASE_URL + '/',
};

// Image Proxy
app.get('/api/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('URL is required');

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: { ...HEADERS, Referer: BASE_URL + '/' },
      timeout: 10000,
    });
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(response.data);
  } catch (error) {
    console.error('Proxy Image Error:', error.message);
    res.status(500).send('Error');
  }
});

// Home Page Scraper
app.get('/api/manga/home', async (req, res) => {
  try {
    const { data } = await axios.get(BASE_URL, { headers: HEADERS });
    const $ = cheerio.load(data);
    
    const popularManga = { title: 'Popular Manga', mangas: [] };
    const latestUpdates = { title: 'Latest Updates', mangas: [] };

    // Popular section (top slider)
    $('.owl-carousel .item').each((i, el) => {
      const title = $(el).find('h3 a').text().trim();
      const url = $(el).find('h3 a').attr('href');
      const id = url ? url.split('/').pop() : '';
      const image = $(el).find('img').attr('src');
      const latestChapter = {
        name: $(el).find('.slide-caption a:last-child').text().trim(),
        id: $(el).find('.slide-caption a:last-child').attr('href')?.split('/').pop() || ''
      };
      popularManga.mangas.push({ id, title, image, latestChapter });
    });

    // Latest updates section
    $('.panel-content-homepage .content-homepage-item').each((i, el) => {
      const title = $(el).find('h3 a').text().trim();
      const url = $(el).find('h3 a').attr('href');
      const id = url ? url.split('/').pop() : '';
      const image = $(el).find('img').attr('src');
      const latestChapter = {
        name: $(el).find('.item-chapter a').first().text().trim(),
        id: $(el).find('.item-chapter a').first().attr('href')?.split('/').pop() || ''
      };
      latestUpdates.mangas.push({ id, title, image, latestChapter });
    });

    res.json({ popularManga, latestUpdates });
  } catch (error) {
    console.error('Home Scraper Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Search Scraper
app.get('/api/manga/search/:query/:page', async (req, res) => {
  const { query, page } = req.params;
  const url = `${BASE_URL}/search/story/${query.replace(/ /g, '_')}?page=${page}`;

  try {
    const { data } = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(data);
    const mangas = [];
    
    $('.panel_story_list .story_item').each((i, el) => {
      const title = $(el).find('.story_name a').text().trim();
      const url = $(el).find('.story_name a').attr('href');
      const id = url ? url.split('/').pop() : '';
      const image = $(el).find('img').attr('src');
      const latestChapter = {
        name: $(el).find('.story_chapter a').first().text().trim(),
        id: $(el).find('.story_chapter a').first().attr('href')?.split('/').pop() || ''
      };
      mangas.push({ id, title, image, latestChapter });
    });

    res.json({
      mangas,
      currentPage: parseInt(page),
      hasNextPage: $('.page_next').length > 0,
      totalPages: 100, // Placeholder
      totalMangas: 0
    });
  } catch (error) {
    console.error('Search Scraper Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Details Scraper
app.get('/api/manga/details/:id', async (req, res) => {
  const { id } = req.params;
  const url = `${BASE_URL}/manga/${id}`;

  try {
    const { data: html } = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(html);
    
    const title = $('.manga-info-text h1').text().trim();
    const image = $('.manga-info-pic img').attr('src');
    const author = $('.manga-info-text li:contains("Author")').text().replace('Author(s) :', '').trim();
    const status = $('.manga-info-text li:contains("Status")').text().replace('Status :', '').trim();
    const genres = [];
    $('.manga-info-text li.genres a').each((i, el) => {
      genres.push($(el).text().trim());
    });
    const description = $('#noidungm').text().trim();

    // Fetch chapters from the internal API
    const chaptersUrl = `${BASE_URL}/api/manga/${id}/chapters`;
    const { data: chaptersData } = await axios.get(chaptersUrl, { headers: HEADERS });
    
    const chapters = (chaptersData.data?.chapters || []).map(ch => ({
      id: ch.chapter_slug,
      name: ch.chapter_name,
      date: ch.updated_at ? new Date(ch.updated_at).toLocaleDateString() : ''
    }));

    res.json({
      id, title, image, author, status, genres, description, chapters
    });
  } catch (error) {
    console.error('Details Scraper Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Reader Scraper
app.get('/api/manga/read/:mangaId/:chapterId', async (req, res) => {
  const { mangaId, chapterId } = req.params;
  const url = `${BASE_URL}/manga/${mangaId}/${chapterId}`;

  try {
    const { data: html } = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(html);
    
    // Extract images and CDNs using regex
    const chapterImagesMatch = html.match(/var chapterImages = (\[.*?\]);/);
    const cdnsMatch = html.match(/var cdns = (\[.*?\]);/);
    
    let images = [];
    if (chapterImagesMatch && cdnsMatch) {
      const relativeImages = JSON.parse(chapterImagesMatch[1]);
      const cdns = JSON.parse(cdnsMatch[1]);
      const primaryCdn = cdns[0] || '';
      images = relativeImages.map(img => `${primaryCdn}${img}`);
    }

    const title = $('.info-top-chapter h2').text().trim();
    const mangaTitle = $('.breadcrumb span:nth-child(3) a').text().trim();
    
    const allChapters = [];
    $('.navi-change-chapter').first().find('option').each((i, el) => {
      const name = $(el).text().trim();
      const id = $(el).val()?.split('/').pop() || '';
      allChapters.push({ id, name });
    });

    const prevChapter = $('.navi-change-chapter-btn-prev').attr('href')?.split('/').pop() || null;
    const nextChapter = $('.navi-change-chapter-btn-next').attr('href')?.split('/').pop() || null;

    res.json({
      id: chapterId, title, mangaId, mangaTitle, images, prevChapter, nextChapter, allChapters
    });
  } catch (error) {
    console.error('Reader Scraper Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});

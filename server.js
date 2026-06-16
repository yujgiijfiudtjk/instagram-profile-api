import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ১৫ মিনিট
  max: 30, // প্রতি উইন্ডোতে ৩০ রিকোয়েস্ট
  message: 'অনেক বেশি রিকোয়েস্ট পাঠিয়েছেন। কিছুক্ষণ অপেক্ষা করুন।',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ── FREE PROXY লিস্ট (একাধিক আইপি সাপোর্ট) ──
const proxyList = [
  'http://10.10.1.10:3128',
  'http://45.33.32.197:80',
  'http://185.220.100.252:9090',
  'http://103.168.76.65:6666',
  'http://103.145.185.97:8080',
  'http://159.89.228.238:8080',
  'http://165.16.0.1:8080',
  'http://41.78.146.70:8080',
  'http://195.211.97.249:80',
  'http://188.40.98.169:8080',
];

let proxyIndex = 0;

// ইউজার এজেন্ট লিস্ট
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
];

// রেন্ডম ইউজার এজেন্ট পান
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// রেন্ডম প্রক্সি পান
function getRandomProxy() {
  const proxy = proxyList[proxyIndex % proxyList.length];
  proxyIndex++;
  return proxy;
}

// ইউজারনেম ভ্যালিডেট করুন
function validateUsername(username) {
  if (!username || username.length < 1) {
    return { valid: false, error: 'ইউজারনেম ফাঁকা' };
  }
  if (username.length > 30) {
    return { valid: false, error: 'ইউজারনেম খুব লম্বা' };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return { valid: false, error: 'ইউজারনেমে অবৈধ ক্যারেক্টার' };
  }
  return { valid: true };
}

// Instagram ওয়েব থেকে ডেটা স্ক্র্যাপ করুন (InstagramAPI ফল-ব্যাক)
async function scrapeInstagramWeb(username) {
  try {
    const proxy = getRandomProxy();
    const httpAgent = new HttpProxyAgent(proxy);
    const httpsAgent = new HttpsProxyAgent(proxy);

    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
    
    const headers = {
      'User-Agent': getRandomUserAgent(),
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': `https://www.instagram.com/${username}/`,
      'Cookie': `ig_did=12345; ig_nrcb=1;`,
    };

    const response = await axios.get(url, {
      headers,
      httpAgent,
      httpsAgent,
      timeout: 10000,
      validateStatus: function() { return true; }
    });

    if (response.status === 200 && response.data?.data?.user) {
      const user = response.data.data.user;
      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          biography: user.biography,
          followers_count: user.follower_count,
          following_count: user.following_count,
          posts_count: user.media_count,
          profile_pic_url: user.profile_pic_url_hd,
          is_verified: user.is_verified,
          is_business_account: user.is_business,
          website: user.external_url,
          private: user.is_private,
          created_at: new Date().toISOString(),
          proxy_used: proxy,
          source: 'instagram_web_api'
        }
      };
    }

    return { success: false, error: 'Profile not found or Instagram blocked the request' };
  } catch (error) {
    console.error(`Scrape error for ${username}:`, error.message);
    return { 
      success: false, 
      error: error.message || 'Scraping failed',
      proxy_error: true 
    };
  }
}

// InstagramAPI (rapid API) থেকে ডেটা পান
async function getInstagramDataFromAPI(username) {
  try {
    const apiKey = process.env.INSTAGRAM_API_KEY || process.env.RAPIDAPI_KEY;
    
    if (!apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    const headers = {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'instagram-api1.p.rapidapi.com'
    };

    const response = await axios.get(
      `https://instagram-api1.p.rapidapi.com/user/info/${username}`,
      { headers, timeout: 10000 }
    );

    if (response.data?.data) {
      const user = response.data.data;
      return {
        success: true,
        data: {
          id: user.pk,
          username: user.username,
          full_name: user.full_name,
          biography: user.biography,
          followers_count: user.follower_count,
          following_count: user.following_count,
          posts_count: user.media_count,
          profile_pic_url: user.profile_pic_url_hd,
          is_verified: user.is_verified,
          is_business_account: user.is_business,
          website: user.external_url,
          private: user.is_private,
          created_at: new Date().toISOString(),
          source: 'rapidapi'
        }
      };
    }

    return { success: false, error: 'No data from API' };
  } catch (error) {
    console.error(`API error:`, error.message);
    return { success: false, error: error.message };
  }
}

// ─── MAIN ENDPOINT ───
app.get('/api/instagram/:username', async (req, res) => {
  try {
    let { username } = req.params;
    username = username.toLowerCase().trim();

    // ভ্যালিডেশন
    const validation = validateUsername(username);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: validation.error 
      });
    }

    console.log(`📸 Fetching Instagram profile: @${username}`);

    // প্রথম চেষ্টা: Web Scraping (ফ্রি)
    let result = await scrapeInstagramWeb(username);

    // যদি স্ক্র্যাপিং ব্যর্থ হয় এবং API কী আছে, API ব্যবহার করুন
    if (!result.success && process.env.INSTAGRAM_API_KEY) {
      console.log(`⚠️ Web scraping failed, trying API...`);
      result = await getInstagramDataFromAPI(username);
    }

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
        message: `Successfully fetched @${username}'s profile`
      });
    } else {
      return res.status(404).json({
        success: false,
        error: result.error || 'Could not fetch profile',
        username: username
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// ── প্রফাইল সার্চ (একাধিক ইউজারনেম) ──
app.post('/api/instagram/search', async (req, res) => {
  try {
    const { usernames } = req.body;

    if (!Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid usernames array' 
      });
    }

    if (usernames.length > 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'Maximum 10 usernames allowed per request' 
      });
    }

    const results = [];

    for (const username of usernames) {
      const result = await scrapeInstagramWeb(username);
      results.push({
        username,
        ...result
      });
      // প্রতিটি রিকোয়েস্টের মধ্যে বিলম্ব যাতে Instagram ব্লক না করে
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    }

    res.status(200).json({
      success: true,
      count: results.filter(r => r.success).length,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ── হেলথ চেক ──
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ── হোম এন্ডপয়েন্ট ──
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Instagram Profile Info API',
    endpoints: {
      'GET /api/instagram/:username': 'একটি Instagram প্রোফাইলের তথ্য পান',
      'POST /api/instagram/search': 'একাধিক প্রোফাইল সার্চ করুন',
      'GET /api/health': 'সার্ভার স্ট্যাটাস চেক করুন'
    },
    example: 'GET /api/instagram/cristiano'
  });
});

// ── ত্রুটি হ্যান্ডলিং ──
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: 'Something went wrong',
    message: err.message
  });
});

// ── পোর্ট শুনুন ──
app.listen(PORT, () => {
  console.log(`🚀 Instagram API Server running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/instagram/:username`);
});

export default app;

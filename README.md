# 📸 Instagram Profile Info API

Instagram প্রোফাইলের তথ্য পেতে Web Scraping + IP Rotation ব্যবহার করে Node.js API।

## 🎯 ফিচার

✅ **Instagram Profile Info** - Follower, Post, Bio ইত্যাদি  
✅ **Web Scraping** - কোন API Key ছাড়াই কাজ করে (ফ্রি)  
✅ **IP Rotation** - ফ্রি প্রক্সি লিস্ট দিয়ে IP পরিবর্তন  
✅ **Rate Limiting** - অপব্যবহার প্রতিরোধ  
✅ **CORS Support** - যেকোনো ডোমেইন থেকে API কল করুন  
✅ **Fallback API** - Web Scraping ব্যর্থ হলে RapidAPI ব্যবহার  

---

## 🚀 দ্রুত শুরু করুন (Local)

### ১. রিপোজিটরি ক্লোন করুন
```bash
git clone https://github.com/your-username/instagram-profile-api.git
cd instagram-profile-api
```

### ২. Dependencies ইনস্টল করুন
```bash
npm install
```

### ৩. .env ফাইল তৈরি করুন
```bash
cp .env.example .env
```

### ৪. সার্ভার চালু করুন
```bash
npm start
```

সার্ভার শুরু হবে: `http://localhost:3000`

---

## 📡 API এন্ডপয়েন্ট

### ১. একটি প্রোফাইল ফেচ করুন

**Request:**
```bash
GET /api/instagram/:username

# Example:
curl http://localhost:3000/api/instagram/cristiano
```

**Response (সফল):**
```json
{
  "success": true,
  "data": {
    "id": "25025320",
    "username": "cristiano",
    "full_name": "Cristiano Ronaldo",
    "followers_count": 611000000,
    "following_count": 1234,
    "posts_count": 3456,
    "biography": "Football's Greatest 🐐",
    "profile_pic_url": "https://...",
    "is_verified": true,
    "website": "https://...",
    "private": false,
    "source": "instagram_web_api"
  }
}
```

### ২. একাধিক প্রোফাইল সার্চ করুন

**Request:**
```bash
POST /api/instagram/search
Content-Type: application/json

{
  "usernames": ["cristiano", "leomessi", "neymarjr"]
}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "results": [
    {
      "username": "cristiano",
      "success": true,
      "data": {...}
    },
    {
      "username": "leomessi",
      "success": true,
      "data": {...}
    }
  ]
}
```

### ৩. সার্ভার স্ট্যাটাস চেক করুন

**Request:**
```bash
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

---

## 🌐 Render এ ডিপ্লয় করুন

### ধাপ ১: GitHub এ রিপোজিটরি পুশ করুন

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/instagram-profile-api.git
git push -u origin main
```

### ধাপ ২: Render.com এ লগইন করুন
- https://render.com এ যান
- GitHub দিয়ে সাইন আপ করুন

### ধাপ ৩: নতুন Web Service তৈরি করুন
1. Dashboard এ যান
2. **New +** ক্লিক করুন
3. **Web Service** নির্বাচন করুন
4. আপনার GitHub রিপোজিটরি সংযুক্ত করুন
5. এই সেটিংস ব্যবহার করুন:

| সেটিং | মান |
|------|-----|
| Name | `instagram-profile-api` |
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Node Version | `18.16.0` |

### ধাপ ৪: Environment Variables যোগ করুন
1. **Environment** ট্যাব এ যান
2. যোগ করুন:
   - `PORT`: `3000` (অপশনাল - Render স্বয়ংক্রিয়ভাবে নির্ধারণ করে)
   - `INSTAGRAM_API_KEY`: আপনার RapidAPI কী (অপশনাল)
   - `NODE_ENV`: `production`

### ধাপ ৫: ডিপ্লয় করুন
1. **Deploy** ক্লিক করুন
2. Render আপনার সার্ভার চালু করবে (~2 মিনিট)
3. আপনার public URL পাবেন: `https://instagram-profile-api-xxx.onrender.com`

---

## 🔑 API Key সেটআপ (Optional)

### RapidAPI Key পান (Fallback API এর জন্য)

1. https://rapidapi.com/hub এ যান
2. "Instagram API" সার্চ করুন
3. একটি ফ্রি প্ল্যান নির্বাচন করুন
4. Subscribe করুন
5. আপনার **X-RapidAPI-Key** কপি করুন
6. Render Environment Variables এ যোগ করুন:
   ```
   INSTAGRAM_API_KEY=your_key_here
   ```

---

## 📊 রেট লিমিটিং

- **15 মিনিটে 30 রিকোয়েস্ট** (প্রতি IP)
- Exceed করলে: `429 Too Many Requests`

---

## 🛡️ IP Rotation / Proxy

API স্বয়ংক্রিয়ভাবে ফ্রি প্রক্সি লিস্ট ব্যবহার করে IP পরিবর্তন করে:
- প্রতিটি রিকোয়েস্টে নতুন প্রক্সি
- Instagram এর ব্লক এড়াতে
- Random User-Agent ব্যবহার

---

## 🐛 ট্রাবলশুটিং

### ❌ "Profile not found" Error

**সমস্যা:** ইউজারনেম সঠিক নেই বা প্রোফাইল private

**সমাধান:**
```bash
# সঠিক ইউজারনেম চেক করুন
GET /api/instagram/cristiano  # সঠিক ✅
GET /api/instagram/cristiano_ronaldo  # ভুল ❌
```

### ❌ 429 Rate Limit Error

**সমস্যা:** অনেক বেশি রিকোয়েস্ট পাঠিয়েছেন

**সমাধান:** ১৫ মিনিট অপেক্ষা করুন

### ❌ Proxy Connection Error

**সমস্যা:** সমস্ত প্রক্সি ব্যর্থ হয়েছে

**সমাধান:** 
- Render সার্ভার রিস্টার্ট করুন
- নতুন প্রক্সি লিস্ট যোগ করুন `server.js` এ
- RapidAPI কী সেট করুন ফলব্যাক এর জন্য

---

## 🔧 কাস্টমাইজেশন

### প্রক্সি লিস্ট আপডেট করুন

`server.js` এ `proxyList` আপডেট করুন:
```javascript
const proxyList = [
  'http://your-proxy-1:port',
  'http://your-proxy-2:port',
  // আরও প্রক্সি যোগ করুন...
];
```

### User-Agent আপডেট করুন

```javascript
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...',
  // নতুন User-Agent যোগ করুন...
];
```

### Rate Limit পরিবর্তন করুন

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // সময়সীমা
  max: 30,                    // সর্বোচ্চ রিকোয়েস্ট
});
```

---

## 📝 লাইভ টেস্টিং

### cURL দিয়ে
```bash
# Local
curl http://localhost:3000/api/instagram/cristiano

# Render (আপনার URL দিয়ে)
curl https://instagram-profile-api-xxx.onrender.com/api/instagram/cristiano
```

### JavaScript/Fetch দিয়ে
```javascript
const username = 'cristiano';
const response = await fetch(`https://your-api.onrender.com/api/instagram/${username}`);
const data = await response.json();
console.log(data);
```

---

## 📋 ফাইল স্ট্রাকচার

```
instagram-profile-api/
├── server.js              # Main API সার্ভার
├── package.json           # NPM ডিপেন্ডেন্সি
├── .env.example          # এনভায়রনমেন্ট ভ্যারিয়েবল উদাহরণ
├── README.md             # ডকুমেন্টেশন
└── .gitignore           # Git এ শামিল করবেন না
```

---

## ⚖️ আইনি নোট

এই API শুধুমাত্র **শিক্ষামূলক উদ্দেশ্যে** এবং **ব্যক্তিগত ব্যবহারের** জন্য।

- Instagram এর Terms of Service মেনে চলুন
- অপব্যবহার করবেন না
- Rate Limiting এবং মেনে চলুন
- যে ডেটা পাবেন তা দায়িত্বশীলভাবে ব্যবহার করুন

---

## 🤝 অবদান রাখুন

1. Fork করুন
2. নতুন ব্রাঞ্চ তৈরি করুন (`git checkout -b feature/your-feature`)
3. পরিবর্তন কমিট করুন (`git commit -m 'Add feature'`)
4. পুশ করুন (`git push origin feature/your-feature`)
5. Pull Request খুলুন

---

## 📄 লাইসেন্স

MIT License - ফ্রি ব্যবহারের জন্য!

---

## 💬 সাপোর্ট

সমস্যা হলে:
1. GitHub Issues খুলুন
2. Error message শেয়ার করুন
3. যা করার চেষ্টা করছেন তা ব্যাখ্যা করুন

---

**Happy API Building! 🚀**

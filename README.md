# የተሰራ ስራ መመዝገቢያ — Telegram Mini App

Frontend (ስራ መመዝገቢያ ፎርም + መቆጣጠሪያ ፓናል) እና Backend (Node.js/Express API + Telegram Bot) ሙሉ ፕሮጀክት።

## 📁 የፕሮጀክት አወቃቀር

```
telegram-job-app/
├── backend/
│   ├── server.js        # Express server + REST API
│   ├── bot.js            # Telegram bot (Mini App ቁልፎችን ይልካል)
│   ├── package.json
│   ├── .env.example       # ወደ .env ኮፒ አድርገው ይሙሉ
│   ├── data/               # jobs.json በራስ-ሰር እዚህ ይፈጠራል (git-ignored)
│   └── uploads/            # የተላኩ ፎቶዎች እዚህ ይቀመጣሉ (git-ignored)
├── frontend/
│   ├── register.html       # ስራ መመዝገቢያ ፎርም
│   └── admin.html          # መቆጣጠሪያ ፓናል (ሁሉንም የተመዘገቡ ስራዎች ይመለከታል)
└── .gitignore
```

## ⚙️ በኮምፒውተርዎ ላይ እንዴት ማስኬድ እንደሚቻል

1. Node.js (v18 ወይም ከዚያ በላይ) መጫኑን ያረጋግጡ።
2. Dependencies ይጫኑ፦

   ```bash
   cd backend
   npm install
   ```

3. `.env.example`ን ኮፒ አድርገው `.env` ብለው ይሰይሙ፣ ከዚያ ይሙሉ፦

   ```bash
   cp .env.example .env
   ```

   - `BOT_TOKEN` — ከ [@BotFather](https://t.me/BotFather) ጋር `/newbot` ብለው ሲፈጥሩ የሚያገኙት ቶከን።
   - `WEBAPP_URL` — Backend የሚያሰማራበት ፐብሊክ HTTPS አድራሻ (ከታች ይመልከቱ)። በኮምፒውተርዎ ላይ ብቻ ለመሞከር ከፈለጉ ባዶ ይተውት፤ ቦት ያለ Mini App ቁልፎች ይሰራል፣ ግን ድረ-ገፆቹን በቀጥታ በአሳሽ (browser) ውስጥ መክፈት ይችላሉ።

4. Server ያስነሱ፦

   ```bash
   npm start
   ```

5. በአሳሽ ውስጥ ይክፈቱ፦
   - መመዝገቢያ ፎርም፦ `http://localhost:3000/register`
   - መቆጣጠሪያ ፓናል፦ `http://localhost:3000/admin`

## 🌐 REST API

| Method | Endpoint            | መግለጫ                                   |
|--------|----------------------|-----------------------------------------|
| GET    | `/api/workers`       | ሁሉንም የተመዘገቡ ስራዎች ይመልሳል                 |
| POST   | `/api/workers`       | አዲስ ስራ ይመዘግባል (multipart/form-data, ፎቶ አማራጭ) |
| PATCH  | `/api/workers/:id`   | ሁኔታውን (active ⇄ finished) ይቀያይራል        |
| DELETE | `/api/workers/:id`   | ስራውን ይሰርዛል                              |

## 🚀 ወደ ኢንተርኔት ማስማራት (Deploy)

Telegram Mini App HTTPS URL ብቻ ስለሚቀበል፣ backend ማስተናገጃ (hosting) ላይ ማስቀመጥ ያስፈልጋል። ነጻ አማራጮች፦ **Render**፣ **Railway**፣ ወይም **Fly.io**።

### በ Render ምሳሌ፦

1. ይህን ፕሮጀክት ወደ GitHub repo ይስቀሉ (ከታች ይመልከቱ)።
2. Render ላይ **New → Web Service** ይምረጡ እና repo ያገናኙ።
3. እነዚህን ያዘጋጁ፦
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Environment Variables ውስጥ `BOT_TOKEN` እና `WEBAPP_URL` ያክሉ (WEBAPP_URL Render ከሰጠዎት URL ጋር ተመሳሳይ መሆን አለበት፣ ለምሳሌ `https://job-app.onrender.com`)።
5. Deploy ካለቀ በኋላ ወደ [@BotFather](https://t.me/BotFather) ሄደው `/mybots` → ቦትዎን ይምረጡ → **Bot Settings → Menu Button** ላይ URL ያክሉ፦ `https://job-app.onrender.com/register`

> ማሳሰቢያ፦ ነጻ Render sevices ካልተጠቀሙባቸው ይተኛሉ (sleep) እና `uploads/`፣ `data/jobs.json` በእያንዳንዱ deploy ሊጠፉ ይችላሉ (ephemeral disk)። ለረጅም ጊዜ አገልግሎት Render Disk ወይም እንደ PostgreSQL/S3 ያለ persistent storage መጠቀም ይመከራል።

## 📤 ወደ GitHub መስቀል

```bash
cd telegram-job-app
git init
git add .
git commit -m "Initial commit: Telegram job registration mini app"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

`.env`፣ `node_modules/`፣ `backend/uploads/*` እና `backend/data/jobs.json` በ `.gitignore` ውስጥ ተካትተዋል፣ ስለዚህ ወደ GitHub አይላኩም (ደህንነትዎ የተጠበቀ ነው)።

## 🛠 ያደረኳቸው ማስተካከያዎች (ከዋናዎቹ ፋይሎች)

- ከ Gemini export የመጡ ልክ ያልሆኑ `[cite: 3]` ምልክቶች ከ HTML attributes ውስጥ ተነስተዋል (የ browser rendering ላይ ጣልቃ ይገቡ ነበር)።
- መመዝገቢያ ፎርሙ አሁን በ `fetch` በኩል በቀጥታ ወደ backend `/api/workers` POST ያደርጋል (ፎቶን ጨምሮ) — ውሂቡ በትክክል ይቀመጣል፣ ብቻ ወደ ቴሌግራም ቻት አይላክም ነበር ቀድሞ።
- መቆጣጠሪያ ፓናሉ ላይ የ"Status" ቁልፍ አሁን ከ backend ጋር (PATCH request) ይገናኛል፣ ስለዚህ ገፁ ሲያድስ (refresh) ለውጡ አይጠፋም (ቀድሞ በ browser memory ብቻ ነበር የሚቀመጠው)።
- ለ XSS መከላከያ (input sanitization) በፓናሉ ላይ ተጨምሯል፣ እና የፎቶ አገናኝ (link) አምድ ተጨምሯል።
- Backend የ image upload (multer)፣ JSON-file storage፣ እና ሁለት Telegram bot commands (`/start`, `/admin`) ያካትታል።


const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL; // e.g. https://your-app.onrender.com (must be HTTPS)

if (!BOT_TOKEN) {
  console.log('ℹ️  BOT_TOKEN አልተገኘም — Telegram bot ያለ polling ብቻ ድረ-ገፅ/API ይሰራል።');
  module.exports = null;
} else if (!WEBAPP_URL) {
  console.log('⚠️  WEBAPP_URL አልተገኘም — .env ውስጥ WEBAPP_URL ያክሉ (ለምሳሌ https://yourapp.onrender.com)።');
  module.exports = null;
} else {
  const bot = new TelegramBot(BOT_TOKEN, { polling: true });

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'እንኳን ደህና መጡ! ስራ ለመመዝገብ ከታች ያለውን ቁልፍ ይጫኑ።', {
      reply_markup: {
        keyboard: [[
          { text: '📋 ስራ መዝግብ', web_app: { url: `${WEBAPP_URL}/register` } }
        ]],
        resize_keyboard: true
      }
    });
  });

  bot.onText(/\/admin/, (msg) => {
    bot.sendMessage(msg.chat.id, 'የቁጥጥር ፓናል ለመክፈት፦', {
      reply_markup: {
        inline_keyboard: [[
          { text: '📊 ፓናል ክፈት', web_app: { url: `${WEBAPP_URL}/admin` } }
        ]]
      }
    });
  });

  bot.on('polling_error', (err) => {
    console.error('Telegram polling error:', err.message);
  });

  console.log('✅ Telegram bot polling ተጀምሯል።');
  module.exports = bot;
}

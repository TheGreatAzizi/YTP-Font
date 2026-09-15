# YTP - Font

**فونت فارسی دلخواه برای یوتیوب — ۲۰+ فونت زیبا | فقط متن فارسی تغییر می‌کند | نسخه پایدار v2.2.0**

> برنامه‌نویس: **TheAzizi** — بدون فیکس باگ‌دار Bidi

<p align="center">
  <a href="https://www.youtube.com/@AziziWC"><img src="https://img.shields.io/badge/YouTube-AziziWC-red?style=for-the-badge&logo=youtube" /></a>
  <a href="https://www.youtube.com/@The_azizi"><img src="https://img.shields.io/badge/YouTube-The_azizi-red?style=for-the-badge&logo=youtube" /></a>
  <a href="https://t.me/luluch_code"><img src="https://img.shields.io/badge/Telegram-luluch_code-27A5E7?style=for-the-badge&logo=telegram" /></a>
  <a href="https://x.com/the_azzi"><img src="https://img.shields.io/badge/X-the_azzi-black?style=for-the-badge&logo=x" /></a>
  <a href="https://github.com/TheGreatAzizi"><img src="https://img.shields.io/badge/GitHub-TheGreatAzizi-181717?style=for-the-badge&logo=github" /></a>
</p>

---

## ✨ ویژگی‌ها (پایدار)
- 🎨 **۲۰+ فونت فارسی**: وزیرمتن، شبنم، ساحل، صمیم، استعداد، لاله‌زار، یکان‌بخ، ایران‌سنس، نوتو نسخ و ...
- 🎯 **فقط فارسی دقیق**: Regex شامل `ZWNJ \u200C` و عدم اعمال روی آیکن/ورودی/کد (`shouldSkipElement()` در `content.js:64`)
- ⚡ **پرفورمنس ۳ برابر**: `WeakSet` برای عدم پردازش دوباره، `requestIdleCallback` + `requestAnimationFrame`، توقف وقتی تب `hidden` است، بک‌آپ ۴ ثانیه (قبلاً ۲.۵)
- 🔤 **وزن هوشمند**: `getClosestWeight()` در `fonts.js:105` — اگر مثلاً لاله‌زار فقط ۴۰۰ دارد و کاربر ۹۰۰ انتخاب کند، ۴۰۰ اعمال می‌شود و hint زرد نمایش داده می‌شود
- ✨ **خوانایی تضمینی**: `line-height:1.7`, `letter-spacing:-0.01em`, `-webkit-font-smoothing:antialiased`, `text-rendering:optimizeLegibility` در `content.js:40`
- 🛡️ **فال‌بک CDN**: اگر `cdn.jsdelivr.net` فیلتر/خطا داد، خودکار به وزیرمتن گوگل سوئیچ می‌کند (`content.js:14` `onerror`)
- 🔍 **جستجو و ⭐ علاقه‌مندی** در `options.html` + فیلتر دسته‌بندی + `فقط علاقه‌مندی‌ها`
- 🔄 **بازنشانی** در popup و options + مهاجرت خودکار و پاکسازی `bidiFix` قدیمی از `chrome.storage`
- 🚀 **سازگار با SPA یوتیوب**: `yt-navigate-finish` و کامنت‌های داینامیک

## 📦 نصب
1. `chrome://extensions` → `Developer mode` → `Load unpacked` → پوشه `YTP-Font`
2. آیکون پلاگین → انتخاب فونت → ذخیره خودکار
3. `⚙️ تنظیمات کامل` برای جستجو، علاقه‌مندی و پیش‌نمایش

## 📂 ساختار v2.2.0
```
YTP-Font/
├── manifest.json   # v2.2.0 پایدار
├── fonts.js        # ۲۱ فونت + getClosestWeight() + YTP_DEFAULTS (favorites)
├── content.js      # WeakSet + وزن هوشمند + خوانایی + اسکیپ آیکن/اینپوت + فال‌بک
├── background.js   # مهاجرت و پاکسازی bidiFix
├── popup.html/js   # hint وزن + بازنشانی
├── options.html/js # جستجو + دسته + علاقه‌مندی + hint
└── icon*.png
```

## 🔄 تغییرات از v2.1 (برگشت)
- ❌ حذف کامل `BIDI_CLASS` / `TITLE_BIDI_CLASS` / `bidiFix` / `bidiMode` که باعث باگ چیدمان تایتل‌ها می‌شد
- ✅ برگشت به منطق پایدار v2.0 (فقط فونت، بدون دستکاری `direction`/`unicode-bidi`)
- ✅ افزودن موارد بالا که همگی تست‌شده و بدون ریسک هستند

## 🔗 لینک‌ها
- YouTube: https://www.youtube.com/@AziziWC
- YouTube: https://www.youtube.com/@The_azizi
- Telegram: https://t.me/luluch_code
- X: https://x.com/the_azzi
- GitHub: https://github.com/TheGreatAzizi

---
ساخته شده با ❤️ توسط TheAzizi — v2.2.0 Stable

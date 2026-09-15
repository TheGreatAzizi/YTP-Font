// YTP - Font | By TheAzizi | v2.2.0 | content.js
// نسخه پایدار - بدون فیکس راست‌به‌چپ (باعث باگ بود) + بهینه‌سازی‌های تضمینی

const persianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D]/;
const PROCESSED_CLASS = 'ytp-font-applied';
const STYLE_ID = 'ytp-font-dynamic-style';
const LINK_ID = 'ytp-font-link';

let currentSettings = { ...YTP_DEFAULTS };
let currentFont = getFontById(currentSettings.fontId);

// WeakSet برای اینکه هر المنت فقط یک بار پردازش شود (بهینه، بدون Memory Leak)
const processedElements = new WeakSet();
// کش برای جلوگیری از اعمال دوباره فونت تکراری
let lastAppliedFontId = null;
let lastAppliedWeight = null;
let lastAppliedSize = null;

// --- مدیریت فونت و استایل ---

function ensureFontLink(font) {
  let link = document.getElementById(LINK_ID);
  if (!link) {
    link = document.createElement('link');
    link.id = LINK_ID;
    link.rel = 'stylesheet';
    // خطای لود CDN → فال‌بک به وزیرمتن
    link.onerror = () => {
      if (font.fallbackUrl && link.href !== font.fallbackUrl) {
        link.href = font.fallbackUrl;
      } else if (font.id !== 'vazirmatn') {
        const fallback = getFontById('vazirmatn');
        link.href = fallback.url;
      }
    };
    (document.head || document.documentElement).appendChild(link);
  }
  if (link.href !== font.url) {
    link.href = font.url;
  }
}

function ensureDynamicStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(style);
  }
  return style;
}

function updateDynamicStyle() {
  const style = ensureDynamicStyle();
  if (!currentSettings.enabled) {
    style.textContent = '';
    removeAllAppliedFonts();
    return;
  }

  const font = currentFont;
  const effectiveWeight = typeof getClosestWeight === 'function' ? getClosestWeight(font, currentSettings.fontWeight) : currentSettings.fontWeight;

  // استایل بسیار قوی با !important + بهبود خوانایی تضمینی
  style.textContent = `
    .${PROCESSED_CLASS} {
      font-family: '${font.family}', Tahoma, sans-serif !important;
      font-weight: ${effectiveWeight} !important;
      ${currentSettings.fontSize !== "100" ? `font-size: ${currentSettings.fontSize}% !important;` : ""}
      /* بهبودهای تضمینی خوانایی */
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-rendering: optimizeLegibility !important;
      font-feature-settings: "ss01" 1 !important;
      line-height: 1.7 !important;
      letter-spacing: -0.01em !important;
    }
    .${PROCESSED_CLASS} * {
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
    /* ورودی‌ها و کد را دست نزن */
    input.${PROCESSED_CLASS}, textarea.${PROCESSED_CLASS}, [contenteditable].${PROCESSED_CLASS}, code.${PROCESSED_CLASS}, pre.${PROCESSED_CLASS} {
      line-height: inherit !important;
    }
  `;
  lastAppliedFontId = font.id;
  lastAppliedWeight = effectiveWeight;
  lastAppliedSize = currentSettings.fontSize;
}

function removeAllAppliedFonts() {
  document.querySelectorAll('.' + PROCESSED_CLASS).forEach(el => {
    el.classList.remove(PROCESSED_CLASS);
    el.style.removeProperty('font-family');
    el.style.removeProperty('font-weight');
    el.style.removeProperty('font-size');
    el.style.removeProperty('-webkit-font-smoothing');
    el.style.removeProperty('text-rendering');
    el.style.removeProperty('line-height');
    el.style.removeProperty('letter-spacing');
  });
  // WeakSet را نمی‌توان پاک کرد، ولی المنت‌های حذف شده خودکار GC می‌شوند
  lastAppliedFontId = null;
  lastAppliedWeight = null;
  lastAppliedSize = null;
}

// --- تشخیص تضمینی ---

function containsPersian(text) {
  return persianRegex.test(text);
}

// آیا المنت باید نادیده گرفته شود؟ (آیکن، ورودی، کد)
function shouldSkipElement(el) {
  if (!el || !el.tagName) return true;
  const tag = el.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'LINK' || tag === 'SVG' || tag === 'CANVAS' || tag === 'IMG' || tag === 'VIDEO' || tag === 'IFRAME') return true;
  if (el.isContentEditable) return true;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'CODE' || tag === 'PRE') return true;
  // یوتیوب آیکن‌ها
  if (el.closest && el.closest('yt-icon, tp-yt-paper-tooltip, #tooltip, svg, [hidden], template')) return true;
  // المنت مخفی
  if (el.closest && el.closest('[hidden]')) return true;
  return false;
}

function isVisibleElement(el) {
  // اسکیپ المنت‌های display:none (یوتیوب زیاد دارد)
  try {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
  } catch(e) {}
  return true;
}

function applyToRoot(root = document.body) {
  if (!root || !currentSettings.enabled) return;
  if (document.hidden) return; // وقتی تب مخفی است کار نکن (صرفه‌جویی)

  const effectiveWeight = typeof getClosestWeight === 'function' ? getClosestWeight(currentFont, currentSettings.fontWeight) : currentSettings.fontWeight;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (shouldSkipElement(parent)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      // حداقل 1 حرف فارسی واقعی
      if (!containsPersian(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  let n;
  while (n = walker.nextNode()) nodes.push(n);

  // دسته‌ای اعمال کن با requestAnimationFrame برای عدم لگ
  const batch = () => {
    for (const textNode of nodes) {
      const parent = textNode.parentElement;
      if (!parent) continue;
      if (shouldSkipElement(parent)) continue;
      // اگر قبلاً با همین فونت/وزن پردازش شده و هنوز کلاس دارد، اسکیپ
      if (processedElements.has(parent) && parent.classList.contains(PROCESSED_CLASS)) {
        // فقط اگر وزن/فونت عوض شده آپدیت کن
        if (lastAppliedFontId !== currentFont.id || lastAppliedWeight !== effectiveWeight) {
          parent.style.setProperty('font-family', `'${currentFont.family}', Tahoma, sans-serif`, 'important');
          parent.style.setProperty('font-weight', effectiveWeight, 'important');
          if (currentSettings.fontSize !== "100") {
            parent.style.setProperty('font-size', currentSettings.fontSize + '%', 'important');
          } else {
            parent.style.removeProperty('font-size');
          }
        }
        continue;
      }
      if (!isVisibleElement(parent)) continue;

      parent.classList.add(PROCESSED_CLASS);
      processedElements.add(parent);
      parent.style.setProperty('font-family', `'${currentFont.family}', Tahoma, sans-serif`, 'important');
      parent.style.setProperty('font-weight', effectiveWeight, 'important');
      if (currentSettings.fontSize !== "100") {
        parent.style.setProperty('font-size', currentSettings.fontSize + '%', 'important');
      }
    }
  };

  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(batch);
  } else {
    batch();
  }
}

function reApplyAll() {
  const effectiveWeight = typeof getClosestWeight === 'function' ? getClosestWeight(currentFont, currentSettings.fontWeight) : currentSettings.fontWeight;
  document.querySelectorAll('.' + PROCESSED_CLASS).forEach(el => {
    if (shouldSkipElement(el)) return;
    el.style.setProperty('font-family', `'${currentFont.family}', Tahoma, sans-serif`, 'important');
    el.style.setProperty('font-weight', effectiveWeight, 'important');
    if (currentSettings.fontSize !== "100") {
      el.style.setProperty('font-size', currentSettings.fontSize + '%', 'important');
    } else {
      el.style.removeProperty('font-size');
    }
  });
  applyToRoot(document.body);
}

// --- لود تنظیمات از storage (با مهاجرت خودکار bidiFix قدیمی) ---

async function loadSettings() {
  try {
    // ابتدا sync، اگر نبود local
    let stored = {};
    try { stored = await chrome.storage.sync.get(null); } catch(e) {}
    // اگر خالی بود، local را چک کن
    if (!stored || Object.keys(stored).length === 0) {
      try { stored = await chrome.storage.local.get(null); } catch(e) {}
    }
    // مهاجرت: حذف bidiFix / bidiMode قدیمی که باگ داشت
    if ('bidiFix' in stored || 'bidiMode' in stored) {
      try {
        await chrome.storage.sync.remove(['bidiFix', 'bidiMode']);
        await chrome.storage.local.remove(['bidiFix', 'bidiMode']);
      } catch(e) {}
      delete stored.bidiFix;
      delete stored.bidiMode;
    }
    // فقط کلیدهای معتبر را نگه دار
    const valid = {};
    for (const k of Object.keys(YTP_DEFAULTS)) {
      if (k in stored) valid[k] = stored[k];
    }
    currentSettings = { ...YTP_DEFAULTS, ...valid };
    // اعتبارسنجی fontId
    if (!YTP_FONTS.find(f => f.id === currentSettings.fontId)) {
      currentSettings.fontId = YTP_DEFAULTS.fontId;
    }
    currentFont = getFontById(currentSettings.fontId);
  } catch (e) {
    currentSettings = { ...YTP_DEFAULTS };
    currentFont = getFontById(currentSettings.fontId);
  }
}

async function init() {
  await loadSettings();
  ensureFontLink(currentFont);
  updateDynamicStyle();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyToRoot(document.body));
  } else {
    setTimeout(() => applyToRoot(document.body), 300);
  }
  startObserver();
}

init();

// --- گوش دادن به تغییرات تنظیمات (لایو) ---

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync' && area !== 'local') return;
  let needsReload = false;
  let fontChanged = false;

  if (changes.enabled) {
    currentSettings.enabled = changes.enabled.newValue;
    needsReload = true;
  }
  if (changes.fontId) {
    currentSettings.fontId = changes.fontId.newValue;
    currentFont = getFontById(currentSettings.fontId);
    fontChanged = true;
    needsReload = true;
  }
  if (changes.fontWeight) {
    currentSettings.fontWeight = changes.fontWeight.newValue;
    needsReload = true;
  }
  if (changes.fontSize) {
    currentSettings.fontSize = changes.fontSize.newValue;
    needsReload = true;
  }
  // بقیه تغییرات مثل favorites نادیده گرفته می‌شود (نیازی به ریلود نیست)
  // پاکسازی bidiFix قدیمی اگر دوباره آمد
  if (changes.bidiFix || changes.bidiMode) {
    // نادیده بگیر، قبلاً پاک شده
  }

  if (fontChanged) ensureFontLink(currentFont);
  if (needsReload) {
    updateDynamicStyle();
    if (currentSettings.enabled) {
      if (changes.enabled && changes.enabled.newValue === true) {
        applyToRoot(document.body);
      } else {
        reApplyAll();
      }
    }
  }
});

// --- Observer بهینه برای محتوای داینامیک یوتیوب ---

let debounceTimer;
let idleCallbackId = null;

function scheduleApply(callback) {
  if (typeof requestIdleCallback !== 'undefined') {
    if (idleCallbackId) cancelIdleCallback(idleCallbackId);
    idleCallbackId = requestIdleCallback(() => callback(), { timeout: 800 });
  } else {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(callback, 100);
  }
}

function startObserver() {
  const observer = new MutationObserver((mutations) => {
    if (!currentSettings.enabled) return;
    if (document.hidden) return;
    scheduleApply(() => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (shouldSkipElement(node)) continue;
            applyToRoot(node);
          } else if (node.nodeType === Node.TEXT_NODE && containsPersian(node.nodeValue)) {
            const p = node.parentElement;
            if (!p || shouldSkipElement(p)) continue;
            if (!p.classList.contains(PROCESSED_CLASS)) {
              const effectiveWeight = typeof getClosestWeight === 'function' ? getClosestWeight(currentFont, currentSettings.fontWeight) : currentSettings.fontWeight;
              p.classList.add(PROCESSED_CLASS);
              processedElements.add(p);
              p.style.setProperty('font-family', `'${currentFont.family}', Tahoma, sans-serif`, 'important');
              p.style.setProperty('font-weight', effectiveWeight, 'important');
            }
          }
        }
        if (m.type === 'characterData' && containsPersian(m.target.nodeValue)) {
          const p = m.target.parentElement;
          if (!p || shouldSkipElement(p)) continue;
          if (!p.classList.contains(PROCESSED_CLASS)) {
            const effectiveWeight = typeof getClosestWeight === 'function' ? getClosestWeight(currentFont, currentSettings.fontWeight) : currentSettings.fontWeight;
            p.classList.add(PROCESSED_CLASS);
            processedElements.add(p);
            p.style.setProperty('font-family', `'${currentFont.family}', Tahoma, sans-serif`, 'important');
            p.style.setProperty('font-weight', effectiveWeight, 'important');
          }
        }
      }
    });
  });

  function waitForBody() {
    if (!document.body) return setTimeout(waitForBody, 100);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, characterDataOldValue: false });
    applyToRoot(document.body);
  }
  waitForBody();

  // وقتی تب دوباره visible شد، یک بار اسکن کن
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && currentSettings.enabled) {
      setTimeout(() => applyToRoot(document.body), 400);
    }
  });
}

// هندل ناوبری داخلی یوتیوب (SPA)
window.addEventListener('yt-navigate-finish', () => {
  setTimeout(() => applyToRoot(document.body), 700);
});
document.addEventListener('yt-navigate-start', () => {
  // قبل از ناوبری، چیزی پاک نکن - فقط بعداً دوباره اعمال می‌شود
});

// بک‌آپ هوشمند: فقط وقتی تب فعال است و هر 4 ثانیه (قبلاً 2.5 بود → بهینه‌تر)
setInterval(() => {
  if (document.hidden || !currentSettings.enabled) return;
  applyToRoot(document.body);
}, 4000);

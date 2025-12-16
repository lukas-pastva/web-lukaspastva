(function() {
  const SUPPORTED_LANGS = ['en', 'sk', 'es'];
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'preferred-language';

  let translations = {};
  let currentLang = DEFAULT_LANG;

  function getLanguageFromURL() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    if (lang && SUPPORTED_LANGS.includes(lang)) {
      return lang;
    }
    return null;
  }

  function getPreferredLanguage() {
    // Priority: URL > localStorage > browser
    const urlLang = getLanguageFromURL();
    if (urlLang) return urlLang;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      return stored;
    }

    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGS.includes(browserLang)) {
      return browserLang;
    }

    return DEFAULT_LANG;
  }

  function updateURL(lang) {
    const url = new URL(window.location);
    if (lang === DEFAULT_LANG) {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', lang);
    }
    window.history.pushState({lang: lang}, '', url);
  }

  function setLanguage(lang, updateHistory = true) {
    if (!SUPPORTED_LANGS.includes(lang)) return;

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    if (updateHistory) {
      updateURL(lang);
    }

    applyTranslations();
    updateLanguageSwitcher();
  }

  async function loadTranslations(lang) {
    if (translations[lang]) return translations[lang];
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}: ${response.status}`);
      const data = await response.json();
      translations[lang] = data;
      return data;
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
      return null;
    }
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  function applyTranslations() {
    const t = translations[currentLang];
    if (!t) {
      console.warn(`No translations available for ${currentLang}`);
      return;
    }

    // Update page title
    if (t.meta?.title) {
      document.title = t.meta.title;
    }

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && t.meta?.description) {
      metaDesc.content = t.meta.description;
    }

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(t, key);
      if (value !== undefined && value !== null) {
        el.textContent = value;
      }
    });

    // Update all elements with data-i18n-html attribute (for innerHTML)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const value = getNestedValue(t, key);
      if (value !== undefined && value !== null) {
        el.innerHTML = value;
      }
    });

    // Update soft skills list
    const softList = document.getElementById('soft-skills-list');
    if (softList && t.soft?.items && Array.isArray(t.soft.items)) {
      softList.innerHTML = t.soft.items.map(item => `<li>${item}</li>`).join('');
    }

    // Update languages pills
    const langPills = document.getElementById('lang-pills');
    if (langPills && t.languages?.items) {
      langPills.innerHTML = Object.values(t.languages.items)
        .map(item => `<span class="pill">${item}</span>`)
        .join('');
    }

    // Update experience section
    const xpContainer = document.getElementById('xp-container');
    if (xpContainer && t.experience?.jobs && Array.isArray(t.experience.jobs)) {
      xpContainer.innerHTML = t.experience.jobs.map(job => `
        <div class="xp-item">
          <h3>${job.company} — ${job.role}</h3>
          <p class="xp-meta">${job.meta}</p>
          <p>${job.description}</p>
        </div>
      `).join('');
    }

    // Update education list
    const eduList = document.getElementById('edu-list');
    if (eduList && t.education?.items && Array.isArray(t.education.items)) {
      eduList.innerHTML = t.education.items.map(item =>
        `<li><strong>${item.school}</strong> — ${item.description}</li>`
      ).join('');
    }

    // Update hobbies list
    const hobbiesList = document.getElementById('hobbies-list');
    if (hobbiesList && t.hobbies?.items && Array.isArray(t.hobbies.items)) {
      hobbiesList.innerHTML = t.hobbies.items.map(item => `<li>${item}</li>`).join('');
    }

    // Update roast content
    const roastContent = document.getElementById('roast-content');
    if (roastContent && t.roast?.content && Array.isArray(t.roast.content)) {
      roastContent.innerHTML = t.roast.content.map(p => `<p>${p}</p>`).join('');
    }
  }

  function updateLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', lang === currentLang);
    });
  }

  function createLanguageSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'lang-switcher';
    switcher.innerHTML = SUPPORTED_LANGS.map(lang => {
      const labels = { en: 'EN', sk: 'SK', es: 'ES' };
      return `<button class="lang-btn${lang === currentLang ? ' active' : ''}" data-lang="${lang}" aria-label="Switch to ${lang === 'en' ? 'English' : lang === 'sk' ? 'Slovak' : 'Spanish'}">${labels[lang]}</button>`;
    }).join('');

    switcher.addEventListener('click', (e) => {
      const btn = e.target.closest('.lang-btn');
      if (btn) {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
      }
    });

    const header = document.querySelector('header');
    if (header) {
      header.insertBefore(switcher, header.firstChild);
    }
  }

  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    const lang = e.state?.lang || getLanguageFromURL() || DEFAULT_LANG;
    setLanguage(lang, false);
  });

  async function init() {
    currentLang = getPreferredLanguage();

    // Load all translations in parallel
    const results = await Promise.all(
      SUPPORTED_LANGS.map(lang => loadTranslations(lang))
    );

    // Check if translations loaded
    const loadedCount = results.filter(Boolean).length;
    console.log(`Loaded ${loadedCount}/${SUPPORTED_LANGS.length} translation files`);

    createLanguageSwitcher();
    document.documentElement.lang = currentLang;

    // Update URL if coming from localStorage/browser preference
    if (!getLanguageFromURL() && currentLang !== DEFAULT_LANG) {
      updateURL(currentLang);
    }

    applyTranslations();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

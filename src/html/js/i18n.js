(function() {
  const SUPPORTED_LANGS = ['en', 'sk', 'es'];
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'preferred-language';

  let translations = {};
  let currentLang = DEFAULT_LANG;

  function getPreferredLanguage() {
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

  function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    applyTranslations();
    updateLanguageSwitcher();
  }

  async function loadTranslations(lang) {
    if (translations[lang]) return translations[lang];
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}`);
      translations[lang] = await response.json();
      return translations[lang];
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
    if (!t) return;

    // Update page title
    document.title = t.meta?.title || document.title;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && t.meta?.description) {
      metaDesc.content = t.meta.description;
    }

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(t, key);
      if (value !== undefined) {
        el.textContent = value;
      }
    });

    // Update all elements with data-i18n-html attribute (for innerHTML)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const value = getNestedValue(t, key);
      if (value !== undefined) {
        el.innerHTML = value;
      }
    });

    // Update soft skills list
    const softList = document.getElementById('soft-skills-list');
    if (softList && t.soft?.items) {
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
    if (xpContainer && t.experience?.jobs) {
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
    if (eduList && t.education?.items) {
      eduList.innerHTML = t.education.items.map(item =>
        `<li><strong>${item.school}</strong> — ${item.description}</li>`
      ).join('');
    }

    // Update hobbies list
    const hobbiesList = document.getElementById('hobbies-list');
    if (hobbiesList && t.hobbies?.items) {
      hobbiesList.innerHTML = t.hobbies.items.map(item => `<li>${item}</li>`).join('');
    }

    // Update roast content
    const roastContent = document.getElementById('roast-content');
    if (roastContent && t.roast?.content) {
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
      return `<button class="lang-btn${lang === currentLang ? ' active' : ''}" data-lang="${lang}">${labels[lang]}</button>`;
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

  async function init() {
    currentLang = getPreferredLanguage();

    // Load all translations in parallel
    await Promise.all(SUPPORTED_LANGS.map(lang => loadTranslations(lang)));

    createLanguageSwitcher();
    document.documentElement.lang = currentLang;
    applyTranslations();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(function() {
  'use strict';

  const SUPPORTED_LANGS = ['en', 'sk', 'es'];
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'preferred-language';

  let translations = {};
  let currentLang = DEFAULT_LANG;

  // Get language from URL path or query param
  function getLanguageFromURL() {
    // Check query parameter first
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    if (langParam && SUPPORTED_LANGS.includes(langParam)) {
      return langParam;
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

    const browserLang = (navigator.language || navigator.userLanguage || '').split('-')[0].toLowerCase();
    if (SUPPORTED_LANGS.includes(browserLang)) {
      return browserLang;
    }

    return DEFAULT_LANG;
  }

  function updateURL(lang) {
    const url = new URL(window.location.href);

    if (lang === DEFAULT_LANG) {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', lang);
    }

    // Use replaceState to update URL without adding to history
    window.history.replaceState({ lang: lang }, '', url.toString());
  }

  function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    // Update the URL
    updateURL(lang);

    // Apply translations
    applyTranslations();
    updateLanguageSwitcher();
  }

  async function loadTranslations(lang) {
    if (translations[lang]) return translations[lang];

    try {
      const cacheBuster = Date.now();
      const response = await fetch(`/locales/${lang}.json?v=${cacheBuster}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      translations[lang] = data;
      return data;
    } catch (error) {
      console.error(`Failed to load ${lang} translations:`, error);
      return null;
    }
  }

  function getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  function applyTranslations() {
    const t = translations[currentLang];
    if (!t) {
      console.warn(`No translations loaded for: ${currentLang}`);
      return;
    }

    // Update page title
    if (t.meta && t.meta.title) {
      document.title = t.meta.title;
    }

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && t.meta && t.meta.description) {
      metaDesc.setAttribute('content', t.meta.description);
    }

    // Update all elements with data-i18n attribute
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach(function(el) {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(t, key);
      if (value !== undefined) {
        el.textContent = value;
      }
    });

    // Update soft skills list
    const softList = document.getElementById('soft-skills-list');
    if (softList && t.soft && t.soft.items && Array.isArray(t.soft.items)) {
      softList.innerHTML = t.soft.items.map(function(item) {
        return '<li>' + item + '</li>';
      }).join('');
    }

    // Update languages pills
    const langPills = document.getElementById('lang-pills');
    if (langPills && t.languages && t.languages.items) {
      const items = Object.values(t.languages.items);
      langPills.innerHTML = items.map(function(item) {
        return '<span class="pill">' + item + '</span>';
      }).join('');
    }

    // Update experience section
    const xpContainer = document.getElementById('xp-container');
    if (xpContainer && t.experience && t.experience.jobs && Array.isArray(t.experience.jobs)) {
      xpContainer.innerHTML = t.experience.jobs.map(function(job) {
        return '<div class="xp-item">' +
          '<h3>' + job.company + ' — ' + job.role + '</h3>' +
          '<p class="xp-meta">' + job.meta + '</p>' +
          '<p>' + job.description + '</p>' +
        '</div>';
      }).join('');
    }

    // Update education list
    const eduList = document.getElementById('edu-list');
    if (eduList && t.education && t.education.items && Array.isArray(t.education.items)) {
      eduList.innerHTML = t.education.items.map(function(item) {
        return '<li><strong>' + item.school + '</strong> — ' + item.description + '</li>';
      }).join('');
    }

    // Update hobbies list
    const hobbiesList = document.getElementById('hobbies-list');
    if (hobbiesList && t.hobbies && t.hobbies.items && Array.isArray(t.hobbies.items)) {
      hobbiesList.innerHTML = t.hobbies.items.map(function(item) {
        return '<li>' + item + '</li>';
      }).join('');
    }

    // Update roast content
    const roastContent = document.getElementById('roast-content');
    if (roastContent && t.roast && t.roast.content && Array.isArray(t.roast.content)) {
      roastContent.innerHTML = t.roast.content.map(function(p) {
        return '<p>' + p + '</p>';
      }).join('');
    }
  }

  function updateLanguageSwitcher() {
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(function(btn) {
      const lang = btn.getAttribute('data-lang');
      if (lang === currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function createLanguageSwitcher() {
    // Check if already exists
    if (document.querySelector('.lang-switcher')) {
      return;
    }

    const switcher = document.createElement('div');
    switcher.className = 'lang-switcher';

    var html = '';
    SUPPORTED_LANGS.forEach(function(lang) {
      const labels = { en: 'EN', sk: 'SK', es: 'ES' };
      const fullNames = { en: 'English', sk: 'Slovensky', es: 'Espanol' };
      const isActive = lang === currentLang ? ' active' : '';
      html += '<button class="lang-btn' + isActive + '" data-lang="' + lang + '" title="' + fullNames[lang] + '">' + labels[lang] + '</button>';
    });
    switcher.innerHTML = html;

    // Add click handler
    switcher.addEventListener('click', function(e) {
      const btn = e.target.closest('.lang-btn');
      if (btn) {
        const lang = btn.getAttribute('data-lang');
        if (lang && lang !== currentLang) {
          setLanguage(lang);
        }
      }
    });

    // Insert at beginning of body (fixed position)
    document.body.insertBefore(switcher, document.body.firstChild);
  }

  // Handle browser back/forward navigation
  window.addEventListener('popstate', function(e) {
    const lang = (e.state && e.state.lang) ? e.state.lang : getLanguageFromURL() || DEFAULT_LANG;
    if (lang !== currentLang) {
      currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      applyTranslations();
      updateLanguageSwitcher();
    }
  });

  async function init() {
    // Determine initial language
    currentLang = getPreferredLanguage();

    // Load all translations
    const loadPromises = SUPPORTED_LANGS.map(function(lang) {
      return loadTranslations(lang);
    });

    await Promise.all(loadPromises);

    // Log what we loaded
    const loadedLangs = SUPPORTED_LANGS.filter(function(lang) {
      return translations[lang] !== undefined;
    });
    console.log('Loaded languages:', loadedLangs.join(', '));

    // Create UI
    createLanguageSwitcher();

    // Set document language
    document.documentElement.lang = currentLang;

    // Update URL to reflect current language
    updateURL(currentLang);

    // Apply translations
    applyTranslations();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

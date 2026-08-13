(function () {
  'use strict';

  var RAW = window.NAV_DATA || [];
  var KEY_THEME = 'yck-nav-theme';
  var KEY_VIEW = 'yck-nav-view';
  var KEY_ADULT = 'yck-nav-adult';
  var LOAD_STEP = 120;

  var ICONS = {
    copy: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>',
    moon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>',
    sun: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>',
    lock: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    eyeOff: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>',
    empty: '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path><path d="m8 8 6 6"></path><path d="m14 8-6 6"></path></svg>'
  };

  var CATEGORY_COLORS = {
    '小说阅读': '#0f766e',
    '影视动漫': '#c2410c',
    'AI工具': '#7c3aed',
    '工具搜索': '#2563eb',
    '阅读书源': '#a21caf',
    '资源网盘': '#ca8a04',
    '社区论坛': '#15803d',
    '新闻资讯': '#dc2626',
    '其他': '#64748b',
    '美女图片': '#db2777',
    '成人内容': '#9f1239'
  };

  var CATEGORY_ORDER = ['小说阅读', '影视动漫', 'AI工具', '工具搜索', '阅读书源', '资源网盘', '社区论坛', '新闻资讯', '其他', '美女图片', '成人内容'];
  var ADULT_CATEGORIES = new Set(['成人内容', '美女图片']);
  var CATEGORY_LABELS = {
    '成人内容': '私密收藏',
    '美女图片': '图片收藏'
  };

  function catLabel(name) {
    return CATEGORY_LABELS[name] || name;
  }

  var FAV_SOURCES = [
    function (host) { return 'https://icons.duckduckgo.com/ip3/' + host + '.ico'; },
    function (host) { return 'https://favicon.im/' + host + '?larger=true'; }
  ];

  var $ = function (id) { return document.getElementById(id); };

  var state = {
    category: 'all',
    query: '',
    adult: false,
    sort: 'default',
    view: 'grid',
    theme: 'auto',
    visibleCount: LOAD_STEP,
    groupLimit: 36,
    groupMore: {}
  };

  try {
    state.adult = localStorage.getItem(KEY_ADULT) === '1';
    state.view = localStorage.getItem(KEY_VIEW) === 'list' ? 'list' : 'grid';
    state.theme = localStorage.getItem(KEY_THEME) || 'auto';
  } catch (e) {}

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function cleanName(value) {
    return String(value || '')
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u200b-\u200f\u2028\u2029\ufeff]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getDomain(url) {
    try {
      var u = new URL(url);
      if (u.protocol === 'http:' || u.protocol === 'https:') {
        return u.hostname.replace(/^www\./i, '').toLowerCase();
      }
    } catch (e) {}
    return '';
  }

  function hashSeed(value) {
    var h = 0;
    var s = String(value || '');
    for (var i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0;
    }
    return h % 360;
  }

  var items = RAW.map(function (raw, index) {
    var name = cleanName(raw && raw.name);
    var url = String((raw && raw.url) || '').trim();
    var category = String((raw && raw.category) || '未分类').trim();
    var domain = getDomain(url);
    var isScript = !/^https?:\/\//i.test(url) || /@js:|#@js:/i.test(url);
    return {
      id: index,
      name: name,
      url: url,
      category: category,
      domain: domain,
      displayHost: domain || '书源脚本',
      initial: (name || '?').slice(0, 1).toUpperCase(),
      isScript: isScript,
      seed: hashSeed(domain || name),
      accent: CATEGORY_COLORS[category] || '#64748b'
    };
  });

  var categoryMap = new Map();
  items.forEach(function (item) {
    categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
  });

  var categories = [];
  CATEGORY_ORDER.forEach(function (name) {
    if (categoryMap.has(name)) {
      categories.push({ name: name, count: categoryMap.get(name), color: CATEGORY_COLORS[name] || '#64748b' });
    }
  });
  categoryMap.forEach(function (count, name) {
    if (!categories.some(function (c) { return c.name === name; })) {
      categories.push({ name: name, count: count, color: CATEGORY_COLORS[name] || '#64748b' });
    }
  });

  var results = $('results');
  var loadWrap = $('loadWrap');
  var loadMoreBtn = $('loadMore');
  var searchInput = $('searchInput');
  var clearBtn = $('clearBtn');
  var sortSelect = $('sortSelect');
  var gridViewBtn = $('gridViewBtn');
  var listViewBtn = $('listViewBtn');
  var themeBtn = $('themeBtn');
  var catList = $('catList');
  var catStrip = $('catStrip');
  var adultBtn = $('adultBtn');
  var adultModal = $('adultModal');
  var adultYes = $('adultYes');
  var adultNo = $('adultNo');
  var pageTitle = $('pageTitle');
  var pageMeta = $('pageMeta');
  var toastEl = $('toast');
  var loadObserver = null;
  var searchTimer = null;

  function allButtonHTML(active) {
    return '<button type="button" class="cat-item' + (active ? ' active' : '') + '" data-cat="all">' +
      '<span class="cat-label"><span class="dot" style="background:var(--accent)"></span><span>全部</span></span>' +
      '<span class="cat-count">' + items.length + '</span></button>';
  }

  function catButtonHTML(cat, active, locked) {
    var cls = 'cat-item' + (active ? ' active' : '') + (locked ? ' locked' : '');
    return '<button type="button" class="' + cls + '" data-cat="' + esc(cat.name) + '"' +
      (locked ? ' aria-label="需先启用私密分类"' : '') + '>' +
      '<span class="cat-label"><span class="dot" style="background:' + cat.color + '"></span><span>' + esc(catLabel(cat.name)) + '</span></span>' +
      '<span class="cat-count">' + cat.count + '</span></button>';
  }

  function allChipHTML(active) {
    return '<button type="button" class="chip' + (active ? ' active' : '') + '" data-cat="all">' +
      '<span class="dot" style="background:var(--accent)"></span>全部<span class="cat-count">' + items.length + '</span></button>';
  }

  function chipHTML(cat, active, locked) {
    var cls = 'chip' + (active ? ' active' : '') + (locked ? ' locked' : '');
    return '<button type="button" class="' + cls + '" data-cat="' + esc(cat.name) + '"' +
      (locked ? ' aria-label="需先启用私密分类"' : '') + '>' +
      '<span class="dot" style="background:' + cat.color + '"></span>' + esc(catLabel(cat.name)) +
      '<span class="cat-count">' + cat.count + '</span></button>';
  }

  function renderCategoryNav() {
    var active = state.category;
    var listHTML = allButtonHTML(active === 'all');
    var stripHTML = allChipHTML(active === 'all');

    categories.forEach(function (cat) {
      var locked = ADULT_CATEGORIES.has(cat.name) && !state.adult;
      if (locked) return;
      listHTML += catButtonHTML(cat, active === cat.name, false);
      stripHTML += chipHTML(cat, active === cat.name, false);
    });

    if (!state.adult && categories.some(function (c) { return ADULT_CATEGORIES.has(c.name); })) {
      stripHTML += '<button type="button" class="chip locked" data-adult-toggle aria-label="显示私密分类">' +
        ICONS.lock + ' 显示私密分类</button>';
    }

    catList.innerHTML = listHTML;
    catStrip.innerHTML = stripHTML;
  }

  function renderAdultButton() {
    var hasAdult = categories.some(function (c) { return ADULT_CATEGORIES.has(c.name); });
    adultBtn.hidden = !hasAdult;
    if (!hasAdult) return;
    adultBtn.innerHTML = state.adult ? ICONS.lock + ' 隐藏私密分类' : ICONS.eyeOff + ' 显示私密分类';
    adultBtn.classList.toggle('enabled', state.adult);
  }

  function getFiltered() {
    var list = items.filter(function (item) {
      return state.adult || !ADULT_CATEGORIES.has(item.category);
    });

    if (state.category !== 'all') {
      list = list.filter(function (item) {
        return item.category === state.category;
      });
    }

    var q = state.query.trim().toLowerCase();
    if (q) {
      list = list.filter(function (item) {
        return item.name.toLowerCase().indexOf(q) !== -1 ||
          item.url.toLowerCase().indexOf(q) !== -1 ||
          item.domain.toLowerCase().indexOf(q) !== -1 ||
          item.category.toLowerCase().indexOf(q) !== -1 ||
          catLabel(item.category).toLowerCase().indexOf(q) !== -1;
      });
    }

    if (state.sort === 'name') {
      list = list.slice().sort(function (a, b) {
        return a.name.localeCompare(b.name, 'zh-CN');
      });
    } else if (state.sort === 'domain') {
      list = list.slice().sort(function (a, b) {
        return a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name, 'zh-CN');
      });
    }

    return list;
  }

  function cardHTML(item) {
    var href = item.isScript ? '' : 'href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer"';
    var extra = item.isScript ? ' aria-disabled="true" title="脚本源，无法直接打开"' : '';
    return '<article class="site-card' + (item.isScript ? ' is-script' : '') + '">' +
      '<div class="card-top">' +
      '<div class="icon-wrap" style="background:hsl(' + item.seed + ' 48% 42%)">' +
      '<span class="letter">' + esc(item.initial) + '</span>' +
      (item.domain ? '<img class="favicon" loading="lazy" alt="" data-host="' + esc(item.domain) + '">' : '') +
      '</div>' +
      '<button class="icon-btn copy-btn" type="button" title="复制链接" aria-label="复制 ' + esc(item.name) + ' 的链接" data-url="' + esc(item.url) + '">' + ICONS.copy + '</button>' +
      '</div>' +
      '<a class="card-link" ' + href + extra + '>' +
      '<div class="card-name">' + esc(item.name) + '</div>' +
      '<div class="card-domain">' + esc(item.displayHost) + '</div>' +
      '</a>' +
      '<div class="card-foot"><span class="dot" style="background:' + item.accent + '"></span><span>' + esc(catLabel(item.category)) + '</span></div>' +
      '</article>';
  }

  function rowHTML(item) {
    var href = item.isScript ? '' : 'href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer"';
    var extra = item.isScript ? ' aria-disabled="true" title="脚本源，无法直接打开"' : '';
    return '<article class="site-row' + (item.isScript ? ' is-script' : '') + '">' +
      '<a class="row-main" ' + href + extra + '>' +
      '<div class="icon-wrap" style="background:hsl(' + item.seed + ' 48% 42%)">' +
      '<span class="letter">' + esc(item.initial) + '</span>' +
      (item.domain ? '<img class="favicon" loading="lazy" alt="" data-host="' + esc(item.domain) + '">' : '') +
      '</div>' +
      '<div class="row-meta"><div class="row-name">' + esc(item.name) + '</div><div class="row-domain">' + esc(item.displayHost) + '</div></div>' +
      '</a>' +
      '<span class="row-cat"><span class="dot" style="background:' + item.accent + '"></span><span>' + esc(catLabel(item.category)) + '</span></span>' +
      '<button class="icon-btn copy-btn" type="button" title="复制链接" aria-label="复制 ' + esc(item.name) + ' 的链接" data-url="' + esc(item.url) + '">' + ICONS.copy + '</button>' +
      '</article>';
  }

  function sectionHTML(cat, list, hasMore) {
    return '<section class="cat-section" data-cat-section="' + esc(cat.name) + '">' +
      '<h2><span class="dot" style="background:' + cat.color + '"></span>' + esc(catLabel(cat.name)) +
      '<span class="section-count">' + cat.count + ' 个</span></h2>' +
      '<div class="grid">' + list.map(function (item) {
        return state.view === 'list' ? rowHTML(item) : cardHTML(item);
      }).join('') + '</div>' +
      (hasMore ? '<button type="button" class="section-more" data-expand="' + esc(cat.name) + '">' +
        '显示更多 · 已显示 ' + list.length + ' / ' + cat.count + '</button>' : '') +
      '</section>';
  }

  function emptyHTML() {
    return '<div class="empty"><div class="empty-icon">' + ICONS.empty + '</div>' +
      '<h3>没有找到匹配的站点</h3><p>换个关键词，或清空搜索条件再试试。</p></div>';
  }

  function renderResults() {
    var filtered = getFiltered();
    var total = filtered.length;
    var isGrouped = state.category === 'all' && !state.query;
    var html = '';

    if (total === 0) {
      results.className = 'results ' + state.view;
      results.innerHTML = emptyHTML();
      loadWrap.hidden = true;
      updateMeta(total);
      return;
    }

    if (isGrouped) {
      categories.forEach(function (cat) {
        if (!state.adult && ADULT_CATEGORIES.has(cat.name)) return;
        var catItems = filtered.filter(function (item) {
          return item.category === cat.name;
        });
        var limit = state.groupLimit * ((state.groupMore[cat.name] || 0) + 1);
        var slice = catItems.slice(0, limit);
        if (!slice.length) return;
        html += sectionHTML(cat, slice, catItems.length > slice.length);
      });
      loadWrap.hidden = true;
      if (loadObserver) {
        loadObserver.disconnect();
        loadObserver = null;
      }
    } else {
      var slice = filtered.slice(0, state.visibleCount);
      html = '<section class="cat-section"><div class="grid">' + slice.map(function (item) {
        return state.view === 'list' ? rowHTML(item) : cardHTML(item);
      }).join('') + '</div></section>';
      updateLoad(slice.length, total);
    }

    results.className = 'results ' + state.view;
    results.innerHTML = html;
    bindFavicons();
    updateMeta(total);
  }

  function updateLoad(shown, total) {
    var hasMore = shown < total;
    loadWrap.hidden = !hasMore;
    if (!hasMore) {
      if (loadObserver) {
        loadObserver.disconnect();
        loadObserver = null;
      }
      return;
    }
    loadMoreBtn.textContent = '加载更多 · 已显示 ' + shown + ' / ' + total;
    if ('IntersectionObserver' in window) {
      if (loadObserver) loadObserver.disconnect();
      loadObserver = new IntersectionObserver(function (entries) {
        if (entries[0] && entries[0].isIntersecting) {
          loadMore();
        }
      }, { rootMargin: '600px 0px' });
      loadObserver.observe(loadWrap);
    }
  }

  function bindFavicons() {
    results.querySelectorAll('img.favicon').forEach(function (img) {
      var host = img.dataset.host;
      var index = 0;
      var tryNext = function () {
        if (index < FAV_SOURCES.length) {
          img.src = FAV_SOURCES[index++](host);
        } else {
          img.remove();
        }
      };
      img.addEventListener('error', tryNext);
      tryNext();
    });
  }

  function updateMeta(total) {
    var cat = state.category === 'all' ? null : categories.find(function (c) { return c.name === state.category; });
    pageTitle.textContent = state.category === 'all' ? '全部收藏' : catLabel(state.category);
    var q = state.query.trim();
    if (q) {
      pageMeta.textContent = '找到 ' + total + ' 个结果 · 搜索“' + q + '”';
    } else if (cat) {
      pageMeta.textContent = cat.count + ' 个站点 · ' + catLabel(cat.name);
    } else {
      var adultNote = !state.adult && categories.some(function (c) { return ADULT_CATEGORIES.has(c.name); })
        ? ' · 私密分类已隐藏'
        : ' · ' + categories.length + ' 个分类';
      pageMeta.textContent = total + ' 个站点' + adultNote;
    }
  }

  function setCategory(name) {
    if (ADULT_CATEGORIES.has(name) && !state.adult) {
      openAdultModal();
      return;
    }
    state.category = name;
    state.visibleCount = LOAD_STEP;
    state.groupMore = {};
    renderCategoryNav();
    renderResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setView(view) {
    state.view = view;
    try { localStorage.setItem(KEY_VIEW, view); } catch (e) {}
    gridViewBtn.classList.toggle('active', view === 'grid');
    listViewBtn.classList.toggle('active', view === 'list');
    renderResults();
  }

  function applyTheme() {
    var resolved = state.theme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : state.theme;
    document.documentElement.dataset.theme = resolved;
    themeBtn.innerHTML = resolved === 'dark' ? ICONS.sun : ICONS.moon;
    themeBtn.title = resolved === 'dark' ? '切换为浅色' : '切换为深色';
  }

  function openAdultModal() {
    adultModal.hidden = false;
    adultYes.focus();
  }

  function closeAdultModal() {
    adultModal.hidden = true;
  }

  function enableAdult() {
    state.adult = true;
    try { localStorage.setItem(KEY_ADULT, '1'); } catch (e) {}
    closeAdultModal();
    renderCategoryNav();
    renderAdultButton();
    renderResults();
  }

  function disableAdult() {
    state.adult = false;
    try { localStorage.removeItem(KEY_ADULT); } catch (e) {}
    if (ADULT_CATEGORIES.has(state.category)) state.category = 'all';
    renderCategoryNav();
    renderAdultButton();
    renderResults();
  }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast('链接已复制');
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast('链接已复制');
    } catch (e) {
      toast('复制失败，请手动复制');
    }
    document.body.removeChild(ta);
  }

  function loadMore() {
    state.visibleCount += LOAD_STEP;
    renderResults();
  }

  function handleCategoryClick(e) {
    var btn = e.target.closest('[data-cat], [data-adult-toggle]');
    if (!btn) return;
    if (btn.dataset.adultToggle) {
      openAdultModal();
      return;
    }
    var name = btn.dataset.cat;
    if (ADULT_CATEGORIES.has(name) && !state.adult) {
      openAdultModal();
      return;
    }
    setCategory(name);
  }

  results.addEventListener('click', function (e) {
    var expandBtn = e.target.closest('.section-more');
    if (expandBtn) {
      var cat = expandBtn.dataset.expand;
      state.groupMore[cat] = (state.groupMore[cat] || 0) + 1;
      renderResults();
      return;
    }
    var btn = e.target.closest('.copy-btn');
    if (btn) {
      e.preventDefault();
      copyText(btn.dataset.url);
    }
  });

  catList.addEventListener('click', handleCategoryClick);
  catStrip.addEventListener('click', handleCategoryClick);

  searchInput.addEventListener('input', function () {
    clearBtn.hidden = !searchInput.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.query = searchInput.value;
      state.visibleCount = LOAD_STEP;
      state.groupMore = {};
      renderResults();
    }, 100);
  });

  clearBtn.addEventListener('click', function () {
    searchInput.value = '';
    clearBtn.hidden = true;
    state.query = '';
    state.visibleCount = LOAD_STEP;
    state.groupMore = {};
    renderResults();
    searchInput.focus();
  });

  sortSelect.addEventListener('change', function () {
    state.sort = sortSelect.value;
    state.visibleCount = LOAD_STEP;
    state.groupMore = {};
    renderResults();
  });

  gridViewBtn.addEventListener('click', function () { setView('grid'); });
  listViewBtn.addEventListener('click', function () { setView('list'); });

  themeBtn.addEventListener('click', function () {
    var resolved = document.documentElement.dataset.theme;
    state.theme = resolved === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY_THEME, state.theme); } catch (e) {}
    applyTheme();
  });

  adultBtn.addEventListener('click', function () {
    if (state.adult) {
      disableAdult();
    } else {
      openAdultModal();
    }
  });

  adultYes.addEventListener('click', enableAdult);
  adultNo.addEventListener('click', closeAdultModal);

  adultModal.addEventListener('click', function (e) {
    if (e.target === adultModal) closeAdultModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== searchInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      if (searchInput.value) {
        searchInput.value = '';
        clearBtn.hidden = true;
        state.query = '';
        state.visibleCount = LOAD_STEP;
        state.groupMore = {};
        renderResults();
      } else {
        searchInput.blur();
      }
    }
  });

  loadMoreBtn.addEventListener('click', loadMore);

  function init() {
    renderCategoryNav();
    renderAdultButton();
    applyTheme();
    setView(state.view);
    sortSelect.value = state.sort;
    $('statTotal').textContent = items.length;
    $('statCats').textContent = categories.length;
    renderResults();
  }

  init();
})();

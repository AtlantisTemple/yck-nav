(function () {
  'use strict';

  var RAW = window.NAV_DATA || [];
  var KEY_THEME = 'yck-nav-theme';
  var KEY_VIEW = 'yck-nav-view';
  var LOAD_STEP = 120;

  var ICONS = {
    copy: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>',
    moon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>',
    sun: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>',
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
  var SUBCATEGORY_ORDER = {
    '小说阅读': ['在线阅读', '排行榜/书单', '文学出版', '漫画/轻小说'],
    '影视动漫': ['在线影视', '动漫/二次元', '直播/短视频'],
    'AI工具': ['AI对话', 'AI图像', 'AI写作/平台'],
    '工具搜索': ['搜索引擎', '软件下载', '在线工具', '开发设计'],
    '阅读书源': ['书源仓库', '订阅合集', '阅读工具/教程'],
    '资源网盘': ['网盘资源', '资源检索/下载'],
    '社区论坛': ['综合论坛', '阅读/书友', '技术兴趣'],
    '新闻资讯': ['综合新闻', '科技/数码', '文史/杂志'],
    '其他': ['游戏', '音乐', '生活服务', '未分类'],
    '美女图片': ['写真美图', '壁纸摄影', '模特套图'],
    '成人内容': ['私密视频', '私密直播', '私密图文/社区']
  };
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
    subcategory: 'all',
    query: '',
    sort: 'default',
    view: 'grid',
    theme: 'auto',
    visibleCount: LOAD_STEP,
    groupLimit: 36,
    groupMore: {}
  };

  try {
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
    var subcategory = String((raw && raw.subcategory) || '未分类').trim();
    var tags = Array.isArray(raw && raw.tags) ? raw.tags.map(cleanName).filter(Boolean) : [];
    var domain = getDomain(url);
    var isScript = !/^https?:\/\//i.test(url) || /@js:|#@js:/i.test(url);
    return {
      id: index,
      name: name,
      url: url,
      category: category,
      subcategory: subcategory,
      tags: tags,
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

  var subcategoryMap = new Map();
  items.forEach(function (item) {
    if (!subcategoryMap.has(item.category)) subcategoryMap.set(item.category, new Map());
    var map = subcategoryMap.get(item.category);
    map.set(item.subcategory, (map.get(item.subcategory) || 0) + 1);
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
  var subcatStrip = $('subcatStrip');
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

  function catButtonHTML(cat, active) {
    var cls = 'cat-item' + (active ? ' active' : '');
    return '<button type="button" class="' + cls + '" data-cat="' + esc(cat.name) + '">' +
      '<span class="cat-label"><span class="dot" style="background:' + cat.color + '"></span><span>' + esc(catLabel(cat.name)) + '</span></span>' +
      '<span class="cat-count">' + cat.count + '</span></button>';
  }

  function allChipHTML(active) {
    return '<button type="button" class="chip' + (active ? ' active' : '') + '" data-cat="all">' +
      '<span class="dot" style="background:var(--accent)"></span>全部<span class="cat-count">' + items.length + '</span></button>';
  }

  function chipHTML(cat, active) {
    var cls = 'chip' + (active ? ' active' : '');
    return '<button type="button" class="' + cls + '" data-cat="' + esc(cat.name) + '">' +
      '<span class="dot" style="background:' + cat.color + '"></span>' + esc(catLabel(cat.name)) +
      '<span class="cat-count">' + cat.count + '</span></button>';
  }

  function renderCategoryNav() {
    var active = state.category;
    var listHTML = allButtonHTML(active === 'all');
    var stripHTML = allChipHTML(active === 'all');

    categories.forEach(function (cat) {
      listHTML += catButtonHTML(cat, active === cat.name);
      stripHTML += chipHTML(cat, active === cat.name);
    });

    catList.innerHTML = listHTML;
    catStrip.innerHTML = stripHTML;
  }

  function renderSubcategoryNav() {
    if (state.category === 'all') {
      subcatStrip.hidden = true;
      subcatStrip.innerHTML = '';
      return;
    }

    var counts = subcategoryMap.get(state.category) || new Map();
    var order = SUBCATEGORY_ORDER[state.category] || [];
    var names = order.filter(function (name) { return counts.has(name); });
    counts.forEach(function (count, name) {
      if (names.indexOf(name) === -1) names.push(name);
    });

    var total = categories.find(function (cat) { return cat.name === state.category; });
    var html = '<button type="button" class="chip subcat-chip' + (state.subcategory === 'all' ? ' active' : '') + '" data-subcat="all">' +
      '全部<span class="cat-count">' + (total ? total.count : items.length) + '</span></button>';
    names.forEach(function (name) {
      html += '<button type="button" class="chip subcat-chip' + (state.subcategory === name ? ' active' : '') + '" data-subcat="' + esc(name) + '">' +
        esc(name) + '<span class="cat-count">' + counts.get(name) + '</span></button>';
    });
    subcatStrip.innerHTML = html;
    subcatStrip.hidden = false;
  }

  function getFiltered() {
    var list = items.slice();

    if (state.category !== 'all') {
      list = list.filter(function (item) {
        return item.category === state.category;
      });
    }

    if (state.subcategory !== 'all') {
      list = list.filter(function (item) {
        return item.subcategory === state.subcategory;
      });
    }

    var q = state.query.trim().toLowerCase();
    if (q) {
      list = list.filter(function (item) {
        return item.name.toLowerCase().indexOf(q) !== -1 ||
          item.url.toLowerCase().indexOf(q) !== -1 ||
          item.domain.toLowerCase().indexOf(q) !== -1 ||
          item.category.toLowerCase().indexOf(q) !== -1 ||
          item.subcategory.toLowerCase().indexOf(q) !== -1 ||
          catLabel(item.category).toLowerCase().indexOf(q) !== -1 ||
          item.tags.some(function (tag) { return tag.toLowerCase().indexOf(q) !== -1; });
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

  function itemTagLabel(item) {
    return catLabel(item.category) + ' · ' + item.subcategory;
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
      '<div class="card-foot"><span class="cat-tag" title="' + esc(itemTagLabel(item)) + '"><span class="dot" style="background:' + item.accent + '"></span><span>' + esc(itemTagLabel(item)) + '</span></span></div>' +
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
      '<span class="row-cat" title="' + esc(itemTagLabel(item)) + '"><span class="dot" style="background:' + item.accent + '"></span><span>' + esc(itemTagLabel(item)) + '</span></span>' +
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
      results.className = 'results view-' + state.view;
      results.innerHTML = emptyHTML();
      loadWrap.hidden = true;
      updateMeta(total);
      return;
    }

    if (isGrouped) {
      categories.forEach(function (cat) {
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

    results.className = 'results view-' + state.view;
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
    } else if (cat && state.subcategory !== 'all') {
      pageMeta.textContent = total + ' 个站点 · ' + catLabel(cat.name) + ' · ' + state.subcategory;
    } else if (cat) {
      pageMeta.textContent = cat.count + ' 个站点 · ' + catLabel(cat.name) + ' · ' + (subcategoryMap.get(cat.name) || new Map()).size + ' 个子类';
    } else {
      pageMeta.textContent = total + ' 个站点 · ' + categories.length + ' 个分类';
    }
  }

  function setCategory(name) {
    state.category = name;
    state.subcategory = 'all';
    state.visibleCount = LOAD_STEP;
    state.groupMore = {};
    renderCategoryNav();
    renderSubcategoryNav();
    renderResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setSubcategory(name) {
    state.subcategory = name;
    state.visibleCount = LOAD_STEP;
    state.groupMore = {};
    renderSubcategoryNav();
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
    var btn = e.target.closest('[data-cat]');
    if (!btn) return;
    setCategory(btn.dataset.cat);
  }

  function handleSubcategoryClick(e) {
    var btn = e.target.closest('[data-subcat]');
    if (!btn) return;
    setSubcategory(btn.dataset.subcat);
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
  subcatStrip.addEventListener('click', handleSubcategoryClick);

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
    renderSubcategoryNav();
    applyTheme();
    setView(state.view);
    sortSelect.value = state.sort;
    $('statTotal').textContent = items.length;
    $('statCats').textContent = categories.length;
    renderResults();
  }

  init();
})();

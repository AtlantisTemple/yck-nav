(function () {
  'use strict';

  var RAW = window.NAV_DATA || [];
  var KEY_THEME = 'yck-nav-theme';
  var KEY_VIEW = 'yck-nav-view';
  var KEY_FAVORITES = 'yck-nav-favorites';
  var KEY_RECENT = 'yck-nav-recent';
  var LOAD_STEP = 120;
  var RECENT_LIMIT = 30;

  var ICONS = {
    copy: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>',
    moon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>',
    sun: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>',
    star: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"></path></svg>',
    recent: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l3 2"></path></svg>',
    bookOpen: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>',
    film: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 3v18"></path><path d="M17 3v18"></path><path d="M3 7.5h4"></path><path d="M17 7.5h4"></path><path d="M3 12h18"></path><path d="M3 16.5h4"></path><path d="M17 16.5h4"></path></svg>',
    sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9Z"></path><path d="M5 3v4"></path><path d="M3 5h4"></path><path d="M19 17v4"></path><path d="M17 19h4"></path></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>',
    library: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14"></path><path d="M12 6v14"></path><path d="M8 8v12"></path><path d="M4 4v16"></path></svg>',
    cloud: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"></path></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    newspaper: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8z"></path></svg>',
    grid: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>',
    image: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-5-5L5 21"></path></svg>',
    shield: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"></path><path d="m9 12 2 2 4-4"></path></svg>',
    empty: '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path><path d="m8 8 6 6"></path><path d="m14 8-6 6"></path></svg>'
  };

  var CATEGORY_ICONS = {
    '小说阅读': 'bookOpen',
    '影视动漫': 'film',
    'AI工具': 'sparkles',
    '工具搜索': 'search',
    '阅读书源': 'library',
    '资源网盘': 'cloud',
    '社区论坛': 'users',
    '新闻资讯': 'newspaper',
    '其他': 'grid',
    '美女图片': 'image',
    '成人内容': 'shield'
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
    special: 'all',
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

  function itemKey(url) {
    var value = String(url || '').trim();
    if (!/^https?:\/\//i.test(value)) return 'script:' + value;
    try {
      var u = new URL(value);
      u.searchParams.sort();
      var path = u.pathname === '/' ? '' : u.pathname.replace(/\/+$/, '');
      return 'http://' + u.hostname.replace(/^www\./i, '').toLowerCase() + path +
        (u.search ? '?' + u.searchParams.toString() : '');
    } catch (e) {
      return 'raw:' + value.toLowerCase();
    }
  }

  function loadStoredMap(key) {
    var map = new Map();
    try {
      var rows = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(rows)) return map;
      rows.forEach(function (row) {
        if (row && row.key) map.set(String(row.key), Number(row.at) || 0);
      });
    } catch (e) {}
    return map;
  }

  function saveStoredMap(key, map, limit) {
    var rows = Array.from(map.entries())
      .sort(function (a, b) { return b[1] - a[1]; });
    if (limit) rows = rows.slice(0, limit);
    try {
      localStorage.setItem(key, JSON.stringify(rows.map(function (row) {
        return { key: row[0], at: row[1] };
      })));
    } catch (e) {}
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
      key: itemKey(url),
      name: name,
      url: url,
      category: category,
      subcategory: subcategory,
      tags: tags,
      domain: domain,
      displayHost: domain || '书源脚本',
      initial: (name || '?').slice(0, 1).toUpperCase(),
      isScript: isScript,
      isSensitive: category === '成人内容' || category === '美女图片',
      seed: hashSeed(domain || name),
      accent: CATEGORY_COLORS[category] || '#64748b'
    };
  });

  var thumbnailTargets = new Map();
  items.forEach(function (item) {
    if (!item.isSensitive && item.domain && !thumbnailTargets.has(item.domain)) {
      thumbnailTargets.set(item.domain, item.url);
    }
  });
  items.forEach(function (item) {
    item.thumbTarget = thumbnailTargets.get(item.domain) || '';
  });

  var itemsByKey = new Map();
  items.forEach(function (item) {
    if (!itemsByKey.has(item.key)) itemsByKey.set(item.key, item);
  });

  var favoriteStore = loadStoredMap(KEY_FAVORITES);
  var recentStore = loadStoredMap(KEY_RECENT);

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
  var thumbQueue = [];
  var thumbActive = 0;
  var THUMB_CONCURRENCY = 6;

  function iconHTML(name) {
    return '<span class="nav-icon" aria-hidden="true">' + (ICONS[name] || ICONS.grid) + '</span>';
  }

  function allButtonHTML(active) {
    return '<button type="button" class="cat-item' + (active ? ' active' : '') + '" data-cat="all">' +
      '<span class="cat-label">' + iconHTML('grid') + '<span>全部</span></span>' +
      '<span class="cat-count">' + items.length + '</span></button>';
  }

  function specialButtonHTML(kind, active, icon, label, count) {
    return '<button type="button" class="cat-item special-item' + (active ? ' active' : '') + '" data-special="' + kind + '">' +
      '<span class="cat-label">' + iconHTML(icon) + '<span>' + label + '</span></span>' +
      '<span class="cat-count">' + count + '</span></button>';
  }

  function catButtonHTML(cat, active) {
    var cls = 'cat-item' + (active ? ' active' : '');
    return '<button type="button" class="' + cls + '" data-cat="' + esc(cat.name) + '" style="--cat-color:' + cat.color + '">' +
      '<span class="cat-label">' + iconHTML(CATEGORY_ICONS[cat.name]) + '<span>' + esc(catLabel(cat.name)) + '</span></span>' +
      '<span class="cat-count">' + cat.count + '</span></button>';
  }

  function allChipHTML(active) {
    return '<button type="button" class="chip' + (active ? ' active' : '') + '" data-cat="all">' +
      iconHTML('grid') + '全部<span class="cat-count">' + items.length + '</span></button>';
  }

  function specialChipHTML(kind, active, icon, label, count) {
    return '<button type="button" class="chip special-chip' + (active ? ' active' : '') + '" data-special="' + kind + '">' +
      iconHTML(icon) + label + '<span class="cat-count">' + count + '</span></button>';
  }

  function chipHTML(cat, active) {
    var cls = 'chip' + (active ? ' active' : '');
    return '<button type="button" class="' + cls + '" data-cat="' + esc(cat.name) + '" style="--cat-color:' + cat.color + '">' +
      iconHTML(CATEGORY_ICONS[cat.name]) + esc(catLabel(cat.name)) +
      '<span class="cat-count">' + cat.count + '</span></button>';
  }

  function renderCategoryNav() {
    var special = state.special;
    var active = state.category;
    var listHTML = allButtonHTML(special === 'all' && active === 'all');
    var stripHTML = allChipHTML(special === 'all' && active === 'all');
    var favoriteCount = Array.from(favoriteStore.keys()).filter(function (key) { return itemsByKey.has(key); }).length;
    var recentCount = Array.from(recentStore.keys()).filter(function (key) { return itemsByKey.has(key); }).length;

    listHTML += specialButtonHTML('favorites', special === 'favorites', 'star', '我的收藏', favoriteCount);
    listHTML += specialButtonHTML('recent', special === 'recent', 'recent', '最近访问', recentCount);
    stripHTML += specialChipHTML('favorites', special === 'favorites', 'star', '我的收藏', favoriteCount);
    stripHTML += specialChipHTML('recent', special === 'recent', 'recent', '最近访问', recentCount);

    categories.forEach(function (cat) {
      listHTML += catButtonHTML(cat, special === 'all' && active === cat.name);
      stripHTML += chipHTML(cat, special === 'all' && active === cat.name);
    });

    catList.innerHTML = listHTML;
    catStrip.innerHTML = stripHTML;
  }

  function renderSubcategoryNav() {
    if (state.special !== 'all' || state.category === 'all') {
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
    var list;
    if (state.special === 'favorites' || state.special === 'recent') {
      var store = state.special === 'favorites' ? favoriteStore : recentStore;
      list = Array.from(store.entries())
        .sort(function (a, b) { return b[1] - a[1]; })
        .map(function (row) { return itemsByKey.get(row[0]); })
        .filter(Boolean);
    } else {
      list = items.slice();
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

  function tagHTML(item) {
    return '<span class="cat-tag" title="' + esc(itemTagLabel(item)) + '">' +
      '<span class="dot" style="background:' + item.accent + '"></span>' +
      '<span class="tag-category">' + esc(catLabel(item.category)) + '</span>' +
      '<span class="tag-separator">·</span>' +
      '<span class="tag-detail">' + esc(item.subcategory) + '</span></span>';
  }

  function relativeTime(timestamp) {
    var diff = Math.max(0, Date.now() - Number(timestamp || 0));
    var minute = 60000;
    var hour = 60 * minute;
    var day = 24 * hour;
    if (diff < minute) return '刚刚';
    if (diff < hour) return Math.floor(diff / minute) + ' 分钟前';
    if (diff < day) return Math.floor(diff / hour) + ' 小时前';
    return Math.floor(diff / day) + ' 天前';
  }

  function favoriteButtonHTML(item) {
    var active = favoriteStore.has(item.key);
    return '<button class="icon-btn favorite-btn' + (active ? ' active' : '') + '" type="button" ' +
      'title="' + (active ? '取消收藏' : '收藏网站') + '" aria-label="' + (active ? '取消收藏 ' : '收藏 ') + esc(item.name) + '" ' +
      'data-favorite="' + esc(item.key) + '">' + ICONS.star + '</button>';
  }

  function thumbnailHTML(item, compact) {
    var canScreenshot = !item.isSensitive && !item.isScript && !!item.thumbTarget;
    var favicon = item.domain
      ? '<img class="thumb-favicon" loading="lazy" decoding="async" alt="" data-host="' + esc(item.domain) + '">'
      : '';
    var fallback = '<span class="thumb-fallback" style="--thumb-color:hsl(' + item.seed + ' 48% 42%)">' +
      favicon + '<span class="thumb-letter">' + esc(item.initial) + '</span></span>';
    var cls = 'site-thumb-wrap' + (compact ? ' compact' : '');
    if (!canScreenshot) {
      return '<div class="' + cls + ' is-fallback" aria-hidden="true">' + fallback + '</div>';
    }
    return '<div class="' + cls + '" aria-hidden="true">' + fallback +
      '<img class="site-thumb" loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="" ' +
      'data-thumb-url="' + esc(item.thumbTarget) + '" data-thumb-stage="0">' +
      '</div>';
  }

  function cardHTML(item) {
    var href = item.isScript ? '' : 'href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer"';
    var extra = item.isScript ? ' aria-disabled="true" title="脚本源，无法直接打开"' : '';
    var openAttr = item.isScript ? '' : ' data-open-key="' + esc(item.key) + '"';
    var recentAt = state.special === 'recent' ? recentStore.get(item.key) : 0;
    return '<article class="site-card' + (item.isScript ? ' is-script' : '') + '" data-item-key="' + esc(item.key) + '" style="--item-color:' + item.accent + '">' +
      '<div class="card-main">' + thumbnailHTML(item, false) +
      '<div class="card-content"><a class="card-link" ' + href + extra + openAttr + '>' +
      '<div class="card-name">' + esc(item.name) + '</div>' +
      '<div class="card-domain">' + esc(item.displayHost) + '</div>' +
      '</a>' + tagHTML(item) +
      '<div class="card-actions-row">' + (recentAt ? '<span class="recent-time">' + relativeTime(recentAt) + '</span>' : '') +
      '<span class="card-actions">' + favoriteButtonHTML(item) +
      '<button class="icon-btn copy-btn" type="button" title="复制链接" aria-label="复制 ' + esc(item.name) + ' 的链接" data-url="' + esc(item.url) + '">' + ICONS.copy + '</button></span></div></div>' +
      '</div>' +
      '</article>';
  }

  function rowHTML(item) {
    var href = item.isScript ? '' : 'href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer"';
    var extra = item.isScript ? ' aria-disabled="true" title="脚本源，无法直接打开"' : '';
    var openAttr = item.isScript ? '' : ' data-open-key="' + esc(item.key) + '"';
    var recentAt = state.special === 'recent' ? recentStore.get(item.key) : 0;
    return '<article class="site-row' + (item.isScript ? ' is-script' : '') + '" data-item-key="' + esc(item.key) + '" style="--item-color:' + item.accent + '">' +
      '<a class="row-main" ' + href + extra + openAttr + '>' +
      thumbnailHTML(item, true) +
      '<div class="row-meta"><div class="row-name">' + esc(item.name) + '</div><div class="row-domain">' + esc(item.displayHost) + '</div></div>' +
      '</a>' +
      '<span class="row-cat" title="' + esc(itemTagLabel(item)) + '"><span class="dot" style="background:' + item.accent + '"></span><span class="tag-category">' + esc(catLabel(item.category)) + '</span><span class="tag-separator">·</span><span class="tag-detail">' + esc(item.subcategory) + '</span></span>' +
      (recentAt ? '<span class="recent-time">' + relativeTime(recentAt) + '</span>' : '') +
      '<span class="card-actions">' + favoriteButtonHTML(item) +
      '<button class="icon-btn copy-btn" type="button" title="复制链接" aria-label="复制 ' + esc(item.name) + ' 的链接" data-url="' + esc(item.url) + '">' + ICONS.copy + '</button></span>' +
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
    var title = '没有找到匹配的站点';
    var detail = '换个关键词，或清空搜索条件再试试。';
    if (state.special === 'favorites') {
      title = '还没有收藏';
      detail = '点击卡片上的星标，把常用网站收进这里。';
    } else if (state.special === 'recent') {
      title = '还没有访问记录';
      detail = '打开网站后会自动记录最近访问。';
    }
    return '<div class="empty"><div class="empty-icon">' + ICONS.empty + '</div>' +
      '<h3>' + title + '</h3><p>' + detail + '</p></div>';
  }

  function renderResults() {
    var filtered = getFiltered();
    var total = filtered.length;
    var isGrouped = state.special === 'all' && state.category === 'all' && !state.query;
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
    bindMedia();
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

  function thumbnailURL(url, stage) {
    if (stage === 0) {
      return 'https://image.thum.io/get/width/480/crop/300/noanimate/' + url;
    }
    return 'https://s.wordpress.com/mshots/v1/' + encodeURIComponent(url) + '?w=480';
  }

  function loadFavicon(img) {
    if (!img || img.dataset.faviconLoaded === '1') return;
    img.dataset.faviconLoaded = '1';
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
  }

  function finishThumbnail() {
    thumbActive = Math.max(0, thumbActive - 1);
    pumpThumbQueue();
  }

  function loadThumbnail(img) {
    if (img.dataset.thumbLoaded === '1') return;
    img.dataset.thumbLoaded = '1';
    var url = img.dataset.thumbUrl;
    var stage = Number(img.dataset.thumbStage || 0);
    img.addEventListener('load', function () {
      img.classList.add('loaded');
      if (img.parentElement) img.parentElement.classList.add('has-thumb');
      finishThumbnail();
    }, { once: true });
    img.addEventListener('error', function () {
      if (stage < 1) {
        stage += 1;
        img.dataset.thumbStage = String(stage);
        img.src = thumbnailURL(url, stage);
      } else {
        img.classList.add('failed');
        loadFavicon(img.parentElement && img.parentElement.querySelector('.thumb-favicon'));
        finishThumbnail();
      }
    });
    img.src = thumbnailURL(url, stage);
  }

  function pumpThumbQueue() {
    while (thumbActive < THUMB_CONCURRENCY && thumbQueue.length) {
      var next = thumbQueue.shift();
      if (!next.isConnected || next.dataset.thumbQueued !== '1') continue;
      thumbActive += 1;
      loadThumbnail(next);
    }
  }

  function queueThumbnail(img) {
    if (!img || img.dataset.thumbLoaded === '1' || img.dataset.thumbQueued === '1') return;
    img.dataset.thumbQueued = '1';
    thumbQueue.push(img);
    pumpThumbQueue();
  }

  function bindMedia() {
    var thumbnails = Array.from(results.querySelectorAll('img.site-thumb, .site-thumb-wrap.is-fallback'));
    if (!thumbnails.length) return;
    if (!('IntersectionObserver' in window)) {
      thumbnails.forEach(function (node) {
        if (node.classList.contains('site-thumb')) queueThumbnail(node);
        else loadFavicon(node.querySelector('.thumb-favicon'));
      });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains('site-thumb')) {
          queueThumbnail(entry.target);
        } else {
          loadFavicon(entry.target.querySelector('.thumb-favicon'));
        }
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '600px 0px' });
    thumbnails.forEach(function (img) { observer.observe(img); });
  }

  function updateMeta(total) {
    var cat = state.category === 'all' ? null : categories.find(function (c) { return c.name === state.category; });
    if (state.special === 'favorites') {
      pageTitle.textContent = '我的收藏';
    } else if (state.special === 'recent') {
      pageTitle.textContent = '最近访问';
    } else {
      pageTitle.textContent = state.category === 'all' ? '全部收藏' : catLabel(state.category);
    }
    var q = state.query.trim();
    if (q) {
      pageMeta.textContent = '找到 ' + total + ' 个结果 · 搜索“' + q + '”';
    } else if (state.special === 'favorites') {
      pageMeta.textContent = total + ' 个收藏站点';
    } else if (state.special === 'recent') {
      pageMeta.textContent = total + ' 条近期访问 · 最多保留 30 条';
    } else if (cat && state.subcategory !== 'all') {
      pageMeta.textContent = total + ' 个站点 · ' + catLabel(cat.name) + ' · ' + state.subcategory;
    } else if (cat) {
      pageMeta.textContent = cat.count + ' 个站点 · ' + catLabel(cat.name) + ' · ' + (subcategoryMap.get(cat.name) || new Map()).size + ' 个子类';
    } else {
      pageMeta.textContent = total + ' 个站点 · ' + categories.length + ' 个分类';
    }
  }

  function setCategory(name) {
    state.special = 'all';
    state.category = name;
    state.subcategory = 'all';
    state.visibleCount = LOAD_STEP;
    state.groupMore = {};
    renderCategoryNav();
    renderSubcategoryNav();
    renderResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setSpecial(name) {
    state.special = name;
    state.category = 'all';
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

  function toggleFavorite(key) {
    var item = itemsByKey.get(key);
    if (!item) return;
    if (favoriteStore.has(key)) {
      favoriteStore.delete(key);
      toast('已取消收藏');
    } else {
      favoriteStore.set(key, Date.now());
      toast('已加入收藏');
    }
    saveStoredMap(KEY_FAVORITES, favoriteStore);
    renderCategoryNav();
    renderResults();
  }

  function recordRecent(key) {
    if (!itemsByKey.has(key)) return;
    recentStore.set(key, Date.now());
    saveStoredMap(KEY_RECENT, recentStore, RECENT_LIMIT);
    var kept = Array.from(recentStore.entries())
      .sort(function (a, b) { return b[1] - a[1]; })
      .slice(0, RECENT_LIMIT);
    recentStore = new Map(kept);
    renderCategoryNav();
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

  function handleSpecialClick(e) {
    var btn = e.target.closest('[data-special]');
    if (!btn) return;
    setSpecial(btn.dataset.special);
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
    var favoriteBtn = e.target.closest('.favorite-btn');
    if (favoriteBtn) {
      e.preventDefault();
      toggleFavorite(favoriteBtn.dataset.favorite);
      return;
    }
    var btn = e.target.closest('.copy-btn');
    if (btn) {
      e.preventDefault();
      copyText(btn.dataset.url);
      return;
    }
    var openLink = e.target.closest('[data-open-key]');
    if (openLink) {
      recordRecent(openLink.dataset.openKey);
    }
  });

  catList.addEventListener('click', handleCategoryClick);
  catStrip.addEventListener('click', handleCategoryClick);
  catList.addEventListener('click', handleSpecialClick);
  catStrip.addEventListener('click', handleSpecialClick);
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

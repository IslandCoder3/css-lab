// Site-wide search: a Search button in the nav (or press "/" or Ctrl/Cmd+K) opens a dialog that searches
// lessons, cheatsheet entries, practice drills, game levels and pages. Data is loaded the first time it opens.
(function () {
  'use strict';
  var ORDER = ['l18', 'l19', 'l20', 'l21', 'l29', 'l22', 'l30', 'l31', 'l23', 'l1', 'l2', 'l3', 'l7', 'l24', 'l4', 'l5', 'l6', 'l25', 'l8', 'l9', 'l26', 'l10', 'l13', 'l14', 'l11', 'l12', 'l15', 'l16', 'l17', 'l27', 'l28'];
  var GROUPS = [['HTML Basics', 'html', 9], ['CSS Basics', 'basics', 5], ['Box Model', 'box', 4], ['Layout', 'layout', 5], ['Advanced', 'adv', 6], ['Responsive', 'resp', 2]];
  var PAGES = [
    { t: 'Lessons', href: 'index.html', x: 'all lessons html css learn course' },
    { t: 'Practice drills', href: 'practice.html', x: 'write css exercises type check hint solution' },
    { t: 'Site Builder Quest (the game)', href: 'capstone.html', x: 'capstone game levels stars badges build a page' },
    { t: 'Capstone Pro (type the CSS)', href: 'capstone-pro.html', x: 'pro mode typing capstone' },
    { t: 'Quiz', href: 'quiz.html', x: 'test yourself questions score' },
    { t: 'Review your mistakes', href: 'review.html', x: 'missed questions wrong answers retry' },
    { t: 'Cheatsheet', href: 'cheatsheet.html', x: 'reference table quick lookup syntax' }
  ];
  // common spellings and phrasings -> what the lessons actually say
  var SYN = [['flexbox', 'flex'], ['colour', 'color'], ['centre', 'center'], ['css grid', 'grid'], ['media queries', 'media query'], ['mediaquery', 'media query'], ['font size', 'font-size'], ['z index', 'z-index'], ['box sizing', 'box-sizing'], ['border radius', 'border-radius'], ['text transform', 'text-transform'], ['nth child', 'nth-child'], ['pseudo element', 'pseudo-element'], ['hyperlink', 'link'], ['picture', 'image'], ['mobile', 'responsive'], ['animation', 'transition']];
  var SUGGEST = ['padding', 'flex', 'hover', 'media query', 'table', 'grid', 'z-index', 'link'];
  var RECENT_KEY = 'csslab-recent-search';

  var items = null, loading = null, results = [], sel = -1, lastFocus = null, current = '';
  var overlay, input, list, status, trigger;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function loadScript(src, have) {
    if (have()) return Promise.resolve();
    return new Promise(function (res) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = res; document.head.appendChild(s); });
  }

  function groupOf(i) { var n = 0; for (var g = 0; g < GROUPS.length; g++) { n += GROUPS[g][2]; if (i < n) return GROUPS[g]; } return GROUPS[GROUPS.length - 1]; }

  function build() {
    if (items) return Promise.resolve();
    if (loading) return loading;
    loading = Promise.all([
      loadScript('cheat-data.js', function () { return window.CHEAT_ROWS; }),
      loadScript('practice-data.js', function () { return window.PRACTICE_DRILLS; }),
      loadScript('game-data.js', function () { return window.GAME_LEVELS; })
    ]).then(function () {
      var C = window.CSSLAB || { DATA: {}, TITLES: {} }, out = [];
      ORDER.forEach(function (id, i) {
        var d = C.DATA[id] || ['', '', []], g = groupOf(i);
        out.push({ type: 'Lessons', chip: 'Lesson ' + (i + 1), meta: g[0], g: g[1], title: C.TITLES[id] || id, text: d[0] + ' ' + d[1] + ' ' + (d[2] || []).join(' '), href: 'index.html#' + id, lesson: id });
      });
      (window.CHEAT_ROWS || []).forEach(function (r) {
        var c = r.split('|');
        out.push({ type: 'Cheatsheet', chip: 'Cheatsheet', title: c[0], text: c[1] + ' ' + c[2], href: 'cheatsheet.html?q=' + encodeURIComponent(c[0]) });
      });
      (window.PRACTICE_DRILLS || []).forEach(function (d, i) {
        out.push({ type: 'Drills', chip: 'Drill ' + (i + 1), title: d.t, text: d.task + ' ' + d.hint, href: 'practice.html#drill-' + (i + 1) });
      });
      (window.GAME_LEVELS || []).forEach(function (L, i) {
        out.push({ type: 'Game', chip: 'Game level ' + (i + 1), title: L.t, text: L.bot + ' ' + L.learn, href: 'capstone.html' });
      });
      PAGES.forEach(function (p) { out.push({ type: 'Pages', chip: 'Page', title: p.t, text: p.x, href: p.href }); });
      out.forEach(function (it) { it.tl = it.title.toLowerCase(); it.xl = it.text.toLowerCase(); });
      items = out;
    });
    return loading;
  }

  function tokens(q) {
    q = q.toLowerCase().trim().replace(/\s+/g, ' ');
    SYN.forEach(function (s) { q = q.split(s[0]).join(s[1]); });
    return q ? q.split(' ') : [];
  }

  // plural / singular forms, so "query" finds "queries" and "borders" finds "border"
  function vars(t) {
    var v = [t];
    if (t.length > 3) {
      if (/ies$/.test(t)) v.push(t.slice(0, -3) + 'y');
      if (/es$/.test(t)) v.push(t.slice(0, -2));
      if (/s$/.test(t)) v.push(t.slice(0, -1));
      if (/y$/.test(t)) v.push(t.slice(0, -1) + 'ies');
      if (!/s$/.test(t)) v.push(t + 's');
    }
    return v.filter(function (x, i) { return v.indexOf(x) === i; });
  }
  function anyIn(str, v, atStart) { for (var i = 0; i < v.length; i++) { var p = str.indexOf(v[i]); if (atStart ? p === 0 : p > -1) return true; } return false; }

  function score(it, toks) {
    var s = 0;
    for (var i = 0; i < toks.length; i++) {
      var v = vars(toks[i]);
      if (v.indexOf(it.tl) > -1) s += 100;
      else if (anyIn(it.tl, v, true)) s += 60;
      else if (anyIn(it.tl, v)) s += 40;
      else if (anyIn(it.xl, v)) s += 10;
      else return 0;
    }
    return s + (it.type === 'Lessons' ? 5 : 0);
  }

  var CAPS = { Lessons: 6, Cheatsheet: 5, Drills: 4, Game: 3, Pages: 3 };
  function search(q) {
    var toks = tokens(q), by = {};
    if (!toks.length) return { toks: toks, groups: [] };
    items.forEach(function (it) { var s = score(it, toks); if (s) (by[it.type] = by[it.type] || []).push({ it: it, s: s }); });
    var groups = [];
    ['Lessons', 'Cheatsheet', 'Drills', 'Game', 'Pages'].forEach(function (t) {
      if (by[t]) groups.push({ name: t, list: by[t].sort(function (a, b) { return b.s - a.s; }).slice(0, CAPS[t]).map(function (x) { return x.it; }) });
    });
    return { toks: toks, groups: groups };
  }

  function hl(text, toks) {
    var frag = document.createDocumentFragment();
    if (!toks.length) { frag.appendChild(document.createTextNode(text)); return frag; }
    var all = []; toks.forEach(function (t) { vars(t).forEach(function (x) { if (x.length > 1 && all.indexOf(x) < 0) all.push(x); }); });
    if (!all.length) { frag.appendChild(document.createTextNode(text)); return frag; }
    var re = new RegExp('(' + all.sort(function (a, b) { return b.length - a.length; }).map(esc).join('|') + ')', 'gi'), last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      frag.appendChild(el('mark', '', m[0])); last = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    return frag;
  }

  function snippet(it, toks) {
    var pos = -1;
    toks.forEach(function (t) { vars(t).forEach(function (x) { var p = it.xl.indexOf(x); if (p > -1 && (pos < 0 || p < pos)) pos = p; }); });
    if (pos < 0) return '';
    var a = Math.max(0, pos - 45), b = Math.min(it.text.length, pos + 95);
    return (a > 0 ? '\u2026' : '') + it.text.slice(a, b).trim() + (b < it.text.length ? '\u2026' : '');
  }

  function remember(q) {
    q = q.trim(); if (q.length < 2) return;
    var r = load(RECENT_KEY, []).filter(function (x) { return x !== q; }); r.unshift(q); save(RECENT_KEY, r.slice(0, 5));
  }

  function setSel(i) {
    var opts = list.querySelectorAll('[role=option]');
    if (!opts.length) { sel = -1; input.removeAttribute('aria-activedescendant'); return; }
    sel = (i + opts.length) % opts.length;
    opts.forEach(function (o, k) { o.setAttribute('aria-selected', k === sel ? 'true' : 'false'); o.classList.toggle('on', k === sel); });
    input.setAttribute('aria-activedescendant', opts[sel].id);
    opts[sel].scrollIntoView({ block: 'nearest' });
  }

  function chips(label, words) {
    var box = el('div', 'sr_chips'); box.appendChild(el('div', 'sr_label', label));
    var row = el('div', 'sr_row');
    words.forEach(function (w) { var b = el('button', 'sr_chipbtn', w); b.type = 'button'; b.addEventListener('click', function () { input.value = w; run(); input.focus(); }); row.appendChild(b); });
    box.appendChild(row); return box;
  }

  function render() {
    list.textContent = ''; results = []; sel = -1; input.removeAttribute('aria-activedescendant');
    list.removeAttribute('role'); list.removeAttribute('aria-label');   // only a listbox while it actually holds options
    var q = input.value, r = search(q);
    if (!r.toks.length) {
      var rec = load(RECENT_KEY, []);
      if (rec.length) list.appendChild(chips('Recent searches', rec));
      list.appendChild(chips('Try searching for', SUGGEST));
      status.textContent = '';
      input.setAttribute('aria-expanded', 'false'); return;
    }
    var n = 0, idx = 0;
    r.groups.forEach(function (g) {
      var grp = el('div', 'sr_group'); grp.setAttribute('role', 'group'); grp.setAttribute('aria-label', g.name);
      var h = el('div', 'sr_h', g.name); h.setAttribute('aria-hidden', 'true'); grp.appendChild(h);
      g.list.forEach(function (it) {
        var a = el('a', 'sr_item'); a.href = it.href; a.id = 'sr-' + idx; a.tabIndex = -1; a.setAttribute('role', 'option'); a.setAttribute('aria-selected', 'false');
        if (it.g) a.setAttribute('data-g', it.g);
        a.appendChild(el('span', 'sr_chip', it.chip));
        var body = el('span', 'sr_body'), t = el('span', 'sr_title'); t.appendChild(hl(it.title, r.toks));
        if (it.meta) t.appendChild(el('span', 'sr_meta', ' \u00b7 ' + it.meta));
        body.appendChild(t);
        var sn = snippet(it, r.toks); if (sn) { var s = el('span', 'sr_snip'); s.appendChild(hl(sn, r.toks)); body.appendChild(s); }
        a.appendChild(body);
        (function (item, i) {
          a.addEventListener('click', function (e) { if (e.ctrlKey || e.metaKey || e.shiftKey) return; e.preventDefault(); go(item); });
          a.addEventListener('mousemove', function () { if (sel !== i) setSel(i); });
        })(it, idx);
        grp.appendChild(a); results.push(it); idx++; n++;
      });
      list.appendChild(grp);
    });
    if (!n) {
      list.appendChild(el('p', 'sr_none', 'No matches for \u201c' + q.trim() + '\u201d. Try a shorter or different word.'));
      list.appendChild(chips('Try searching for', SUGGEST));
      status.textContent = 'No results'; input.setAttribute('aria-expanded', 'false'); return;
    }
    list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', 'Search results');
    status.textContent = n + ' result' + (n === 1 ? '' : 's');
    input.setAttribute('aria-expanded', 'true');
    setSel(0);
  }

  function run() { build().then(render); }

  function go(it) {
    remember(input.value); close(true);
    var onIndex = /(^|\/)(index\.html)?$/.test(location.pathname);
    if (it.lesson && onIndex) {
      var t = document.getElementById(it.lesson);
      if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', '#' + it.lesson); if (window.CSSLAB && CSSLAB.flash) CSSLAB.flash(it.lesson); return; }
    }
    location.href = it.href;
  }

  function open() {
    if (!overlay.hidden) return;
    lastFocus = document.activeElement; overlay.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    input.value = current; run();
    setTimeout(function () { input.focus(); input.select(); }, 0);
  }
  function close(skipFocus) {
    if (overlay.hidden) return;
    current = input.value; overlay.hidden = true; document.documentElement.style.overflow = '';
    if (!skipFocus && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function init() {
    var wrap = document.querySelector('#nav_area .wrapper'); if (!wrap) return;
    trigger = el('button', 'search_btn'); trigger.type = 'button';
    trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-label', 'Search the site');
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2.4'); svg.setAttribute('stroke-linecap', 'round');
    var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('cx', '11'); c.setAttribute('cy', '11'); c.setAttribute('r', '7');
    var l = document.createElementNS('http://www.w3.org/2000/svg', 'path'); l.setAttribute('d', 'M20 20l-4-4');
    svg.appendChild(c); svg.appendChild(l); trigger.appendChild(svg);
    trigger.appendChild(el('span', 'lbl', 'Search')); trigger.appendChild(el('kbd', '', '/'));
    wrap.appendChild(trigger);

    overlay = el('div', 'sr_overlay'); overlay.hidden = true;
    var box = el('div', 'sr_box'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Search the site');
    var bar = el('div', 'sr_bar');
    input = el('input', 'sr_input'); input.type = 'search'; input.placeholder = 'Search lessons, drills, cheatsheet\u2026';
    input.setAttribute('autocomplete', 'off'); input.setAttribute('autocapitalize', 'off'); input.setAttribute('spellcheck', 'false');
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-label', 'Search'); input.setAttribute('aria-controls', 'sr-list'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-expanded', 'false');
    var x = el('button', 'sr_close', 'Close'); x.type = 'button';
    bar.appendChild(input); bar.appendChild(x);
    list = el('div', 'sr_list'); list.id = 'sr-list';
    status = el('div', 'sr_status'); status.setAttribute('aria-live', 'polite');
    var foot = el('div', 'sr_foot', 'Up and down to move, Enter to open, Esc to close'); foot.setAttribute('aria-hidden', 'true');
    box.appendChild(bar); box.appendChild(status); box.appendChild(list); box.appendChild(foot); overlay.appendChild(box); document.body.appendChild(overlay);

    trigger.addEventListener('click', open);
    x.addEventListener('click', function () { close(); });
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
    input.addEventListener('input', run);
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSel(sel + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(sel - 1); }
      else if (e.key === 'Enter' && e.target === input) { e.preventDefault(); if (results[sel]) go(results[sel]); }
      else if (e.key === 'Tab') {                                  // keep Tab inside the dialog
        var f = [input, x].concat([].slice.call(list.querySelectorAll('.sr_chipbtn'))), i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    document.addEventListener('keydown', function (e) {
      var t = e.target, tag = t && t.tagName, typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable);
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); overlay.hidden ? open() : close(); }
      else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && overlay.hidden) { e.preventDefault(); open(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.CSSLAB_SEARCH = { open: open, close: close, ready: build, _order: ORDER };
})();

// ---- Readout display helpers: indented, colored code instead of one cramped line ----
var BLOCK_TAGS = { ul: 1, ol: 1, li: 1, div: 1, p: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, select: 1, option: 1, form: 1 };

function prettyHtml(html) {
  var box = document.createElement('div'), out = [];
  box.innerHTML = html;
  function openTag(n) { var s = n.outerHTML; return s.slice(0, s.indexOf('>') + 1); }
  function hasBlockChild(n) { return Array.prototype.some.call(n.children, function (c) { return BLOCK_TAGS[c.tagName.toLowerCase()]; }); }
  function walk(n, depth) {
    var pad = new Array(depth + 1).join('  ');
    if (n.nodeType === 3) { var t = n.textContent.trim(); if (t) out.push(pad + t); return; }
    if (n.nodeType !== 1) return;
    if (!hasBlockChild(n)) { out.push(pad + n.outerHTML); return; }
    var kids = Array.prototype.slice.call(n.childNodes), line = pad + openTag(n);
    if (kids[0] && kids[0].nodeType === 3 && kids[0].textContent.trim()) { line += kids[0].textContent.trim(); kids.shift(); }
    out.push(line);
    kids.forEach(function (k) { walk(k, depth + 1); });
    out.push(pad + '</' + n.tagName.toLowerCase() + '>');
  }
  Array.prototype.forEach.call(box.childNodes, function (n) { walk(n, 0); });
  return out.join('\n');
}

function hx(cls, text) { var s = document.createElement('span'); s.className = cls; s.textContent = text; return s; }

function paintHtml(pre, code) {
  pre.textContent = '';
  var re = /(<\/?[a-zA-Z][^>]*>)|([^<]+)/g, m;
  while ((m = re.exec(code))) {
    if (m[2] !== undefined) { pre.appendChild(document.createTextNode(m[2])); continue; }
    var tm = /^<(\/?)([a-zA-Z0-9]+)([\s\S]*?)(\/?)>$/.exec(m[1]);
    if (!tm) { pre.appendChild(document.createTextNode(m[1])); continue; }
    pre.appendChild(hx('hx-p', '<' + tm[1])); pre.appendChild(hx('hx-t', tm[2]));
    var ar = /(\s+)|([\w:-]+)(=)?("[^"]*"|'[^']*')?/g, am;
    while ((am = ar.exec(tm[3]))) {
      if (am[1]) pre.appendChild(document.createTextNode(am[1]));
      else if (am[2]) {
        pre.appendChild(hx('hx-a', am[2]));
        if (am[3]) pre.appendChild(hx('hx-p', '='));
        if (am[4]) pre.appendChild(hx('hx-v', am[4]));
      }
    }
    pre.appendChild(hx('hx-p', tm[4] + '>'));
  }
}

function paintCss(pre, lines) {
  pre.textContent = '';
  lines.forEach(function (l, i) {
    if (i) pre.appendChild(document.createTextNode('\n'));
    var m = /^([a-zA-Z-]+):(\s?)([\s\S]*)$/.exec(l);
    if (m) { pre.appendChild(hx('hx-a', m[1])); pre.appendChild(document.createTextNode(':' + m[2])); pre.appendChild(hx('hx-v', m[3])); }
    else pre.appendChild(document.createTextNode(l));
  });
}

function paintReadout(pre, cssLines, htmlLine) {
  if (htmlLine) { paintHtml(pre, prettyHtml(htmlLine)); pre.setAttribute('data-kind', 'html'); }
  else if (cssLines.length) { paintCss(pre, cssLines); pre.setAttribute('data-kind', 'css'); }
  else { pre.textContent = ''; pre.removeAttribute('data-kind'); }
}

// Live demos: every control changes the .target element(s) in its own lesson
document.querySelectorAll('.lesson').forEach(function (lesson) {
  var out = lesson.querySelector('.readout');
  var lines = {};
  var propSels = {};

  // Live size readouts: <p class="measure" data-metric="width|fontsize" data-label="...">
  function measure() {
    lesson.querySelectorAll('.measure').forEach(function (m) {
      var t = lesson.querySelector(m.dataset.for || '.target');
      if (!t) return;
      var v = m.dataset.metric === 'fontsize' ? parseFloat(getComputedStyle(t).fontSize) : t.getBoundingClientRect().width;
      m.textContent = (m.dataset.label || 'Size') + ': ' + (Math.round(v * 10) / 10) + 'px';
    });
  }
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);   // again once the theme stylesheet has loaded

  lesson.querySelectorAll('.controls [data-prop], .controls [data-attr], .controls [data-class], .controls [data-html]').forEach(function (c) {
    function apply() {
      var targets = lesson.querySelectorAll(c.dataset.target || '.target');
      var v, key;

      if (c.hasAttribute('data-html')) {
        var h = c.value;
        targets.forEach(function (el) { el.innerHTML = h; });
        lines['html'] = h;
      } else if (c.dataset.class) {
        key = c.dataset.class;
        targets.forEach(function (el) { el.classList.toggle(key, c.checked); });
        lines[key] = c.checked ? 'class="' + key + '"' : null;
      } else if (c.dataset.attr) {
        key = c.dataset.attr;
        v = c.value;
        targets.forEach(function (el) { el.setAttribute(key, v); });
        lines[key] = (c.dataset.label || key) + ': ' + c.selectedOptions[0].text;
      } else {
        key = c.dataset.prop;
        v = c.value + (c.dataset.unit || '');
        targets.forEach(function (el) { el.style.setProperty(key, v); });
        if (c.hasAttribute('data-literal')) lines[key] = key + ': ' + v + ';';   // show the value as chosen (no shorthand rewriting)
        else propSels[c.dataset.target || '.target'] = 1;
      }

      // Show what the browser really applied (a shorthand replaces its longhands)
      var css = [];
      Object.keys(propSels).forEach(function (sel) {
        var el = lesson.querySelector(sel);
        if (el) el.style.cssText.split(/;\s*/).filter(Boolean).forEach(function (d) { css.push(d + ';'); });
      });
      var rest = Object.keys(lines).filter(function (k) { return k !== 'html'; }).map(function (k) { return lines[k]; }).filter(Boolean);
      paintReadout(out, css.concat(rest), lines['html']);
      measure();
    }
    c.addEventListener('input', apply);
    c.addEventListener('change', apply);
  });
});

// Mobile menu
var nav = document.getElementById('nav_area');
nav.querySelector('.hamburger').addEventListener('click', function () {
  nav.classList.toggle('open');
});
nav.querySelectorAll('a').forEach(function (a) {
  a.addEventListener('click', function () { nav.classList.remove('open'); });
});

// Back to top
var backTop = document.querySelector('.back_top');
window.addEventListener('scroll', function () {
  backTop.classList.toggle('show', window.scrollY > 400);
});
backTop.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

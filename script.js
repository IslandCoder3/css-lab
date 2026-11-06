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
      var rest = Object.keys(lines).map(function (k) { return lines[k]; }).filter(Boolean);
      out.textContent = css.concat(rest).join('\n');
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

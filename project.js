(function () {
  function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }

  // Styles (project.css first, then the theme on top)
  ['project.css', 'theme.css'].forEach(function (f) {
    if (!document.querySelector('link[href$="' + f + '"]')) {
      var l = el('link'); l.rel = 'stylesheet'; l.href = f; document.head.appendChild(l);
    }
  });

  // Theme (light / dark)
  var root = document.documentElement, saved = null;
  try { saved = localStorage.getItem('csslab-theme'); } catch (e) {}
  var theme = saved || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);
  var hi0 = document.querySelector('.head_info');
  if (hi0) {
    var right = el('div', 'hright'), tb = el('button', 'theme_btn');
    tb.type = 'button';
    function paint() { tb.textContent = root.getAttribute('data-theme') === 'dark' ? '\u2600 Light' : '\u263E Dark'; }
    tb.addEventListener('click', function () {
      var n = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', n);
      try { localStorage.setItem('csslab-theme', n); } catch (e) {}
      paint();
    });
    hi0.parentNode.insertBefore(right, hi0);
    right.appendChild(hi0); right.appendChild(tb); paint();
  }

  // Hero: typing code card
  var banner = document.getElementById('banner');
  if (banner && banner.querySelector('.wrapper')) {
    var card = el('div', 'codecard'), pre = el('pre');
    card.setAttribute('aria-hidden', 'true');
    card.innerHTML = '<div class="bar"><i></i><i></i><i></i><span>style.css</span></div>';
    card.appendChild(pre);
    banner.querySelector('.wrapper').appendChild(card);
    var SN = [
      '.cards {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: center;\n  gap: 24px;\n}',
      '.icon:before {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  margin: 0 auto;\n}',
      '.box {\n  display: inline-block;\n  vertical-align: top;\n  width: 32%;\n}',
      '.hero {\n  background: linear-gradient(\n    135deg, #6366f1, #22d3ee);\n}'
    ];
    var hl = function (t) {
      return t.split('\n').map(function (l) {
        var e = l.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        if (/\{\s*$/.test(e)) return '<span class="k">' + e + '</span>';
        var m = e.match(/^(\s*)([a-z-]+)(:)(.*)$/i);
        return m ? m[1] + '<span class="p">' + m[2] + '</span>' + m[3] + '<span class="v">' + m[4] + '</span>' : e;
      }).join('\n');
    };
    var si = 0, ci = 0, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    (function tick() {
      var t = SN[si];
      if (reduce) { pre.innerHTML = hl(t); return; }
      ci++;
      pre.innerHTML = hl(t.slice(0, ci));
      if (ci < t.length) setTimeout(tick, ci % 7 ? 24 : 70);
      else setTimeout(function () { si = (si + 1) % SN.length; ci = 0; tick(); }, 1900);
    })();
  }

  // Phone typing helper: tap-to-insert symbols for a textarea
  window.tokenBar = function (ta) {
    var bar = el('div', 'tokens');
    [['{}', '{\n  \n}', 4], [':', ':'], [';', ';'], ['.', '.'], ['#', '#'], ['%', '%'], ['px', 'px'], [',', ','], ['""', '""', 1], ['()', '()', 1], ['[]', '[]', 1]].forEach(function (t) {
      var b = el('button', '', t[0]);
      b.type = 'button'; b.setAttribute('aria-label', 'Insert ' + t[0]);
      function put() {
        ta.focus();
        var s = ta.selectionStart, e = ta.selectionEnd;
        ta.setRangeText(t[1], s, e, 'end');
        var pos = t[2] == null ? s + t[1].length : s + t[2];
        ta.setSelectionRange(pos, pos);
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('touchstart', function (e) { e.preventDefault(); put(); }, { passive: false });
      b.addEventListener('click', put);
      bar.appendChild(b);
    });
    return bar;
  };

  // CSS suggestions while typing (chips above the editor; Tab accepts the first one)
  var PROPS = ['display', 'position', 'float', 'clear', 'width', 'max-width', 'min-width', 'height', 'max-height', 'min-height', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'color', 'background', 'background-color', 'background-image', 'background-repeat', 'background-position', 'background-size', 'border', 'border-radius', 'border-top', 'border-bottom', 'box-sizing', 'font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'text-transform', 'text-decoration', 'vertical-align', 'word-wrap', 'white-space', 'overflow', 'opacity', 'cursor', 'z-index', 'top', 'right', 'bottom', 'left', 'content', 'transform', 'transition', 'list-style', 'flex', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'gap', 'row-gap', 'column-gap', 'box-shadow', 'grid-template-columns', 'border-style', 'border-width', 'border-color', 'border-left', 'border-right'];
  var COLORS = ['#fff', '#333', '#000', 'red', 'yellow', 'blue', 'rgba(0, 0, 0, 0.5)', 'transparent'];
  var VALS = {
    display: ['block', 'inline-block', 'inline', 'none', 'flex', 'table', 'grid'],
    position: ['relative', 'absolute', 'static', 'fixed', 'sticky'],
    float: ['left', 'right', 'none'],
    clear: ['both', 'left', 'right', 'none'],
    width: ['100%', '32%', '47%', '24%', '560px', 'auto'],
    'text-align': ['left', 'center', 'right', 'justify'],
    'text-transform': ['uppercase', 'lowercase', 'capitalize', 'none'],
    'text-decoration': ['none', 'underline'],
    'vertical-align': ['top', 'middle', 'bottom', 'baseline'],
    'word-wrap': ['break-word', 'normal'],
    'white-space': ['nowrap', 'normal'],
    'justify-content': ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'],
    'align-items': ['stretch', 'flex-start', 'center', 'flex-end'],
    'flex-direction': ['row', 'column', 'row-reverse', 'column-reverse'],
    'flex-wrap': ['wrap', 'nowrap'],
    'font-weight': ['400', '700', '900', 'bold', 'normal'],
    'font-style': ['italic', 'normal'],
    'font-family': ['Georgia, serif', 'Arial, sans-serif', '"Courier New", monospace', 'Helvetica, sans-serif'],
    'font-size': ['16px', '18px', '24px', '1.2rem'],
    'line-height': ['1.5', '22px'],
    font: ['italic 700 20px Georgia, serif', '400 16px Arial, sans-serif'],
    background: ['linear-gradient(135deg, #4f46e5, #06b6d4)', "url('images/bg.jpg') no-repeat center top #000", '#fff', '#eef2ff'],
    'background-image': ['linear-gradient(135deg, #4f46e5, #06b6d4)', "url('images/bg.jpg')", 'none'],
    'background-repeat': ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'],
    'background-size': ['cover', 'contain', '60px 60px'],
    'background-position': ['center top', 'center', 'left top', 'right bottom'],
    border: ['1px solid #ccc', 'none'],
    'border-radius': ['50%', '8px', '0'],
    'box-sizing': ['border-box', 'content-box'],
    overflow: ['hidden', 'auto', 'visible'],
    cursor: ['pointer', 'default'],
    opacity: ['1', '0.5', '0'],
    'z-index': ['1', '10', '-1'],
    content: ['""', 'none'],
    transform: ['translateY(-50%)', 'scale(1.1)', 'none'],
    transition: ['all .3s linear'],
    'list-style': ['none', 'disc'],
    gap: ['20px', '10px'],
    'row-gap': ['30px', '20px'],
    'column-gap': ['20px', '10px'],
    'box-shadow': ['0 4px 12px rgba(0, 0, 0, 0.2)', 'none'],
    'grid-template-columns': ['repeat(3, 1fr)', '1fr 1fr 1fr', '1fr 2fr', 'repeat(2, 1fr)', '100px 1fr', 'repeat(auto-fit, minmax(100px, 1fr))'],
    'border-style': ['solid', 'dashed', 'dotted', 'double', 'none'],
    'border-width': ['1px', '2px', '4px']
  };
  var PSEUDOS = [':before', ':after', ':hover', ':first-child', ':last-child', ':nth-child(odd)', ':nth-child(even)', ':nth-child(3n)', '::placeholder', '::before', '::after'];
  var TAGS = ['header', 'footer', 'nav', 'ul', 'li', 'a', 'p', 'h1', 'h2', 'h3', 'img', 'body'];
  function valuesFor(p) {
    if (VALS[p]) return VALS[p];
    if (/color$/.test(p)) return COLORS;
    if (/^margin/.test(p)) return p === 'margin' ? ['0 auto', '0', 'auto', '20px', '20px 15px', '20px 15px 0'] : ['0', 'auto', '10px', '20px'];
    if (/^padding/.test(p)) return p === 'padding' ? ['0', '10px', '20px', '20px 15px', '20px 15px 0', '5px 10px 15px 20px'] : ['0', '10px', '20px'];
    if (/^(top|right|bottom|left)$/.test(p)) return ['0', '50%', 'auto', '10px'];
    if (/^(min-|max-)?(width|height)$/.test(p)) return ['100%', 'auto', '560px', '50%'];
    return [];
  }

  window.cssSuggest = function (ta, opts) {
    opts = opts || {};
    var bar = el('div', 'suggest'), cur = [], dismissed = false;
    bar.setAttribute('aria-label', 'CSS suggestions');

    function focusText() { try { return ((opts.focus && opts.focus()) || '').toLowerCase(); } catch (e) { return ''; } }
    // strong(f, x): does the focus text contain this exact choice in context (e.g. "max-width: 560px")?
    function rank(list, prefix, strong) {
      var f = focusText(), p = prefix.toLowerCase();
      var out = list.filter(function (x) { return !p || x.toLowerCase().indexOf(p) === 0; });
      if (!out.length && p) out = list.filter(function (x) { return x.toLowerCase().indexOf(p) > -1; });
      return out.map(function (x, i) {
        var xl = x.toLowerCase(), t = !f ? 2 : (strong && strong(f, xl)) ? 0 : f.indexOf(xl) > -1 ? 1 : 2;
        return { x: x, k: t * 1000 + i };
      }).sort(function (a, b) { return a.k - b.k; }).map(function (o) { return o.x; });
    }
    function has(f, x) { return f.indexOf(x) > -1; }

    function compute() {
      var res = [];
      if (ta.selectionStart !== ta.selectionEnd) return res;
      var v = ta.value, pos = ta.selectionStart, before = v.slice(0, pos), after = v.slice(pos);
      var lineRest = after.split('\n')[0].trim() === '';
      var inBlock = opts.bare || before.lastIndexOf('{') > before.lastIndexOf('}');
      var cut = Math.max(before.lastIndexOf(';'), before.lastIndexOf('{'), before.lastIndexOf('}'));
      var seg = before.slice(cut + 1);
      if (inBlock) {
        var ci = seg.indexOf(':');
        if (ci > -1) {                                            // a value
          var prop = seg.slice(0, ci).trim().toLowerCase(), prefix = seg.slice(ci + 1).replace(/^\s+/, '');
          rank(valuesFor(prop), prefix, function (f, x) { return has(f, prop + ': ' + x); }).slice(0, 10).forEach(function (x) {
            var tail = lineRest ? (opts.bare ? ';\n' : ';\n  ') : ';';
            res.push({ label: x, text: x + tail, from: pos - prefix.length, to: pos });
          });
        } else {                                                  // a property name
          var pre = seg.replace(/^\s+/, '');
          if (/^[a-z-]+$/i.test(pre)) {
            var colon = /^\s*:/.test(after);
            rank(PROPS, pre, function (f, x) { return new RegExp('(^|[\\s{;])' + x + '\\s*:').test(f); }).slice(0, 10).forEach(function (x) {
              res.push({ label: x, text: colon ? x : x + ': ', from: pos - pre.length, to: pos });
            });
          }
        }
      } else {                                                    // a selector
        var typed = seg.replace(/^\s+/, ''), tok = /[^\s,>+~]*$/.exec(typed)[0];
        if (tok.charAt(0) === ':') {
          rank(PSEUDOS, tok, has).slice(0, 8).forEach(function (x) { res.push({ label: x, text: x, from: pos - tok.length, to: pos }); });
        } else if (typed && /^[.#\[a-z*]/i.test(typed)) {
          var bare = typed.replace(/^[.#]/, '').toLowerCase();
          var cands = (opts.selectors || []).concat(/^[a-z]/i.test(typed) ? TAGS : []);
          var hits = cands.filter(function (s) { var l = s.toLowerCase(); return l.indexOf(typed.toLowerCase()) === 0 || (/^[a-z]/i.test(typed) && l.replace(/^[.#]/, '').indexOf(bare) === 0); });
          rank(hits.filter(function (s, i) { return hits.indexOf(s) === i; }), '', has).slice(0, 8).forEach(function (x) {
            var openBrace = /^\s*[{,]/.test(after);
            var add = (!openBrace && lineRest) ? x + ' {\n  \n}' : x;
            res.push({ label: x, text: add, from: pos - typed.length, to: pos, caret: add === x ? null : (x + ' {\n  ').length });
          });
        }
      }
      return res;
    }

    function apply(it) {
      ta.focus();
      ta.setRangeText(it.text, it.from, it.to, 'end');
      var c = it.caret == null ? it.from + it.text.length : it.from + it.caret;
      ta.setSelectionRange(c, c);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function render() {
      bar.textContent = '';
      if (!cur.length) { bar.appendChild(el('span', 'hintline', 'Suggestions appear as you type (Tab = first one)')); return; }
      bar.appendChild(el('span', 'hintline', 'Suggest:'));
      cur.forEach(function (it) {
        var b = el('button', '', it.label);
        b.type = 'button';
        b.addEventListener('mousedown', function (e) { e.preventDefault(); });
        b.addEventListener('touchstart', function (e) { e.preventDefault(); apply(it); }, { passive: false });
        b.addEventListener('click', function () { apply(it); });
        bar.appendChild(b);
      });
      bar.scrollLeft = 0;
    }

    function update() { cur = dismissed ? [] : compute(); render(); }

    ta.addEventListener('input', function () { dismissed = false; update(); });
    ta.addEventListener('click', update);
    ta.addEventListener('focus', update);
    ta.addEventListener('keyup', function (e) { if (e.key === 'Escape' || e.key === 'Tab' || e.key === 'Shift') return; update(); });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && cur.length) { e.preventDefault(); apply(cur[0]); }
      else if (e.key === 'Escape') { dismissed = true; update(); }
    });
    render();
    return bar;
  };

  // Shared navigation
  var ul = document.querySelector('#nav_area ul');
  var here = location.pathname.split('/').pop() || 'index.html';
  var reviewLink = null;
  [['Lessons', 'index.html'], ['Practice', 'practice.html'], ['Capstone', 'capstone.html'], ['Quiz', 'quiz.html'], ['Review', 'review.html'], ['Cheatsheet', 'cheatsheet.html']].forEach(function (p) {
    var li = el('li'), a = el('a', '', p[0]);
    a.href = p[1];
    if (p[1] === 'review.html') reviewLink = a;
    if (here === p[1] || (p[1] === 'capstone.html' && here === 'capstone-pro.html')) a.setAttribute('aria-current', 'page');
    if (!ul.querySelector('.pg') && ul.children.length) li.classList.add('pgfirst');
    li.classList.add('pg');
    li.appendChild(a); ul.appendChild(li);
  });
  paintBadge();

  // Reading progress bar
  var bar = el('div'); bar.id = 'readbar'; document.body.appendChild(bar);
  function onScroll() {
    var h = document.documentElement;
    bar.style.width = (h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1) * 100) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Scroll reveal
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.06 });
    document.querySelectorAll('.lesson, .card, .middle_con section').forEach(function (n) { n.classList.add('reveal'); io.observe(n); });
  }

  // Lesson content: [remember, question, options, correct index]
  var DATA = {
    l1: [`CSS styles your HTML and can control the layout of many pages at once. There are three ways to apply it: inline (a style="" attribute on one tag), internal (a <style> tag inside the <head>), and external (a .css file linked in the head with <link rel="stylesheet" href="style.css">). Real sites use external.`, `Which way keeps all the CSS in one file that every page can share?`, [`Inline style attribute`, `Internal <style> tag`, `External .css file`], 2],
    l2: [`Colors can be written four ways: a name (red), hex (#ff0000, always 6 characters, or #f00 shorthand), RGB (rgb(255, 0, 0)) and RGBA (rgba(255, 0, 0, 0.5)). In RGBA the "a" is alpha, the opacity from 0 (invisible) to 1 (solid).`, `What does the "a" in rgba() control?`, [`Angle`, `Alpha (opacity)`, `Area`], 1],
    l3: [`background can hold a color or an image. Shorthand: background: url('images/banner-bg.jpg') no-repeat center top #000; Here center is the horizontal position and top the vertical one. repeat / no-repeat sets whether the image tiles. Big images slow a page down, so use them with care.`, `In "no-repeat center top", what does top set?`, [`Horizontal position`, `Vertical position`, `Image size`], 1],
    l7: [`Font shorthand: font: italic 700 20px Georgia, serif; The LAST value is always the font-family. For a custom font, pick it on Google Fonts, copy the embed code into the <head>, then use its name in CSS. Always end with a fallback (serif or sans-serif).`, `In the font shorthand, which value comes last?`, [`font-size`, `font-family`, `font-weight`], 1],
    l4: [`width and height take px (a definite size) or % (the size depends on the parent container). Use % when a box should follow its parent, for example in responsive layouts.`, `Why use % instead of px for a width?`, [`It always makes the box bigger`, `It follows the parent container's size`, `It ignores the parent`], 1],
    l5: [`padding is the space around the content INSIDE the border. Longhand: padding-right: 15px; Shorthand: 4 values = top, right, bottom, left. 3 values = top, left and right, bottom. 2 values = top and bottom, left and right. It shows the element's background.`, `padding: 20px 15px 0; What is the bottom padding?`, [`20px`, `15px`, `0`], 2],
    l6: [`margin is the space OUTSIDE the border and follows the same longhand and shorthand rules as padding (margin-left: 15px; margin: 20px 15px 0;). margin: 0 auto centers a block that has a width. Vertical margins between siblings collapse to the larger one.`, `Which declaration centers a block that has a set width?`, [`padding: auto`, `margin: 0 auto`, `float: center`], 1],
    l8: [`block takes up the whole width of its container. inline-block puts boxes side by side and must always have vertical-align: top and a width. For balanced boxes use % widths: 2 boxes = 47%, 3 boxes = 32%, 4 boxes = 24%. none makes the element invisible and removes its space.`, `Three balanced inline-block boxes in a row: which width fits?`, [`50%`, `32%`, `100%`], 1],
    l9: [`display: flex goes on the PARENT. A common combination: display: flex; flex-wrap: wrap; justify-content: center; row-gap: 30px; justify-content works on the main axis, align-items on the cross axis, and flex-direction: column swaps them.`, `Which property lets flex items wrap onto new lines?`, [`flex-wrap: wrap`, `row-gap`, `justify-content`], 0],
    l10: [`float: left or right pushes an element sideways, like inline-block, but it works regardless of the element's position in the HTML. Reset it with float: none (for example in a responsive layout). Floats can disorient the layout and collapse the parent, so add a clearfix after them: .clearfix:before, .clearfix:after { content: ""; display: table; clear: both; }`, `How do you turn a float off for a mobile layout?`, [`float: reset;`, `float: none;`, `clear: float;`], 1],
    l13: [`position: relative keeps the normal place and is the PARENT of absolute. position: absolute lets an element float (icons, badges) and places it against the nearest ancestor that has a position, usually with top, left and right. Center horizontally: left: 0; right: 0; margin: 0 auto. Center vertically: top: 50%; transform: translateY(-50%). To reset: position: relative; left, right, top: unset.`, `An absolute element is positioned against...`, [`The nearest ancestor that has a position`, `The browser window, always`, `Its next sibling`], 0],
    l14: [`z-index sets front or back on the z-axis: the higher the number, the nearer to the front. Values have no unit (not px). It only works on positioned elements (relative or absolute). Common mistake: assuming the default is 1. The real default is auto.`, `Why does z-index: 5 do nothing on a static element?`, [`It only works on positioned elements`, `z-index needs px units`, `It only works on images`], 0],
    l11: [`::before and ::after add content from CSS and only appear if they have the content property. Icon recipe: give the heading position: relative and padding to make room, then h2:before { position: absolute; top: 0; left: 0; right: 0; margin: 0 auto; width; height; content: ""; background: url() no-repeat center top; }`, `What must the parent of an absolute ::before icon have?`, [`display: flex`, `position: relative`, `float: left`], 1],
    l12: [`Pseudo-classes: :nth-child(n), :first-child, :last-child, :hover (styles an element while the mouse is over it; it works on any element, not only links and divs) and ::placeholder (styles the hint text inside an input). nth-child: odd = 1,3,5. even = 2,4,6. 3n = 3,6,9.`, `Which selector picks the 3rd, 6th and 9th items?`, [`li:nth-child(3)`, `li:nth-child(3n)`, `li:last-child`], 1],
    l15: [`Selectors: .class, #id, tag, .a .b (descendant), .a > .b (direct child), .a + .b (next sibling), [id] (attribute) and [class*="mid_box"], which matches any element whose class contains mid_box, whatever characters follow it (mid_box1, mid_box2, mid_box_big...).`, `What does [class*="mid_box"] match?`, [`Only the class exactly named mid_box`, `Any class containing mid_box`, `Only ids that start with mid_box`], 1],
    l16: [`Gradients go in background-image or the background shorthand: linear-gradient(90deg, #f6d365, #fda085). Radial and conic gradients exist too. A gradient generator can add fallbacks for old browsers (look for its max-compatibility option).`, `Where does linear-gradient() go?`, [`color`, `background-image`, `border-color`], 1],
    l17: [`text-transform: uppercase makes text all caps. word-wrap: break-word breaks a long word so it doesn't overflow its box. border-radius rounds the corners, and 50% turns a square into a circle.`, `Which declaration turns a square box into a circle?`, [`border-radius: 50%`, `border: round`, `display: circle`], 0],
    l18: [`Every HTML page has the same skeleton. <!DOCTYPE html> tells the browser it is a modern HTML page, <html> wraps everything, <head> holds information about the page (like its <title>), and <body> holds everything people actually see.`, `Where does the content people see on the page go?`, [`<head>`, `<body>`, `<title>`], 1],
    l19: [`HTML marks up the meaning of text. <h1> is the most important heading (use one per page), then <h2>, <h3> and so on. <p> is a paragraph, <strong> marks important text (bold) and <em> marks emphasis (italic). Most tags open and close: <p>text</p>.`, `Which tag is the main heading of a page?`, [`<h1>`, `<h6>`, `<head>`], 0],
    l20: [`A link is <a href="url">text</a>. An image is <img src="file.jpg" alt="description">: img has no closing tag, and alt describes the image for people who cannot see it (and for search engines).`, `Which attribute describes an image for people who cannot see it?`, [`src`, `alt`, `href`], 1],
    l21: [`<ul> makes a bulleted list, <ol> a numbered list, and every item goes inside an <li>. A list can sit inside another list's <li>. Menus, like the one at the top of this site, are usually built from lists.`, `Which tag wraps each item in a list?`, [`<li>`, `<ul>`, `<ol>`], 0],
    l22: [`A form collects information. Fields include <input type="text">, type="email", type="checkbox", <textarea>, <select> with <option>s, and <button>. A <label> tells people what a field is for and makes it easier to tap.`, `Which tag gives people a multi-line text box?`, [`<input>`, `<textarea>`, `<select>`], 1],
    l23: [`class and id connect HTML to CSS. class="note" can be used on many elements and is styled with .note. id="intro" must be used only once per page and is styled with #intro. A <div> is a generic box used to group things.`, `Which one should be used on only ONE element per page?`, [`class`, `id`, `div`], 1],
    l24: [`px is a fixed size. % is relative to the parent. rem is relative to the root font size (16px by default), so 2rem = 32px. em is relative to the parent's font size. vw is 1% of the screen width. Use rem for text and % or vw for flexible layouts.`, `Which unit scales with the root font size?`, [`px`, `rem`, `%`], 1],
    l25: [`border: 2px solid #333 sets the width, style and color in one go, and border-radius rounds the corners. By default, width does NOT include padding and border (content-box), so boxes end up wider than you expect. box-sizing: border-box includes them, which is why the template reset sets it on everything.`, `What does box-sizing: border-box do?`, [`Includes padding and border in the width`, `Draws a border around the box`, `Removes the padding`], 0],
    l26: [`display: grid on the parent creates rows and columns. grid-template-columns: 1fr 1fr 1fr makes three equal columns (fr = one share of the free space) and gap adds space between cells. repeat(auto-fit, minmax(100px, 1fr)) makes columns that wrap on their own.`, `What does grid-template-columns: 1fr 2fr create?`, [`Two columns, the second twice as wide`, `Two equal columns`, `One column that is 3px wide`], 0],
    l27: [`a:hover styles an element while the pointer is over it (on phones, while it is tapped). Put transition: all .3s ease on the normal state, not on :hover, so the change animates both in and out. Never rely on hover alone for something important, because touch screens have no real hover.`, `Where should transition go so the change animates in and out?`, [`On the normal state (not :hover)`, `Only on :hover`, `On the body`], 0],
    l28: [`Responsive design makes one page fit every screen. Add <meta name="viewport" content="width=device-width, initial-scale=1"> in the head, use % or max-width instead of fixed widths, then add media queries: @media (max-width: 600px) { ... } applies those rules only on screens 600px wide or narrower.`, `What does @media (max-width: 600px) mean?`, [`Rules apply on screens 600px wide or narrower`, `Rules apply only above 600px`, `The page is always 600px wide`], 0]
  };

  // Shared with the Review page: lesson titles and the list of missed check questions
  var TITLES = { l1: 'What is CSS', l2: 'Color', l3: 'Background', l4: 'Width & Height', l5: 'Padding', l6: 'Margin', l7: 'Fonts', l8: 'Display', l9: 'Flex', l10: 'Float & clearfix', l11: '::before & ::after', l12: ':nth-child', l13: 'Position', l14: 'z-index', l15: 'CSS selectors', l16: 'Gradients', l17: 'Text & border-radius', l18: 'The page skeleton', l19: 'Headings & text', l20: 'Links & images', l21: 'Lists', l22: 'Forms', l23: 'Class & id', l24: 'Units', l25: 'Borders & box-sizing', l26: 'CSS Grid', l27: ':hover & transitions', l28: 'Responsive design' };
  function getMissed() { return load('csslab-missed', {}); }
  function setMissed(m) { save('csslab-missed', m); paintBadge(); }
  function paintBadge() {
    var n = Object.keys(getMissed()).length;
    if (reviewLink) reviewLink.textContent = n ? 'Review (' + n + ')' : 'Review';
  }
  window.CSSLAB = { DATA: DATA, TITLES: TITLES, getMissed: getMissed, setMissed: setMissed };

  // Links and forms inside the HTML demos should not navigate away
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.htmldemo a')) e.preventDefault(); });
  document.addEventListener('submit', function (e) { if (e.target.closest && e.target.closest('.htmldemo')) e.preventDefault(); });

  var lessons = document.querySelectorAll('main .lesson');
  var side = document.querySelector('.sidebar');
  if (!lessons.length || !side) return;

  // Group colors, number badges, sidebar group headings
  var gmap = { htmlbasics: 'html', basics: 'basics', boxmodel: 'box', layout: 'layout', advanced: 'adv', responsive: 'resp' }, gname = { html: 'HTML Basics', basics: 'CSS Basics', box: 'Box Model', layout: 'Layout', adv: 'Advanced', resp: 'Responsive' }, cur = 'html';
  Array.prototype.forEach.call(document.querySelector('main').children, function (n) {
    if (n.classList.contains('group')) cur = gmap[n.id] || cur;
    else if (n.classList.contains('lesson')) n.setAttribute('data-g', cur);
  });
  lessons.forEach(function (s, i) {
    var h = s.querySelector('h3'), m = h.textContent.match(/^\d+\.\s*(.*)$/);
    if (m) { h.textContent = ''; h.appendChild(el('span', 'num', String(i + 1))); h.appendChild(document.createTextNode(m[1])); }
  });
  var prevG = '';
  Array.prototype.slice.call(side.querySelectorAll('ol li')).forEach(function (li) {
    var a = li.querySelector('a'), tgt = a && document.getElementById(a.getAttribute('href').slice(1));
    if (!tgt) return;
    var g = tgt.getAttribute('data-g');
    li.setAttribute('data-g', g);
    if (g !== prevG) { var sg = el('li', 'sg', gname[g]); sg.setAttribute('data-g', g); li.parentNode.insertBefore(sg, li); prevG = g; }
  });

  var done = load('csslab-done', []);
  var wrap = el('div');
  wrap.innerHTML = '<div class="progress"><div class="progress_bar"></div></div><small class="progress_txt"></small>';
  side.insertBefore(wrap, side.querySelector('ol'));
  var reset = el('button', 'reset', 'Reset progress'); reset.type = 'button';
  reset.addEventListener('click', function () {
    if (confirm('Clear all lesson and practice progress?')) {
      try { localStorage.removeItem('csslab-done'); localStorage.removeItem('csslab-practice'); localStorage.removeItem('csslab-capstone'); localStorage.removeItem('csslab-missed'); } catch (e) {}
      location.reload();
    }
  });
  side.appendChild(reset);

  function render() {
    lessons.forEach(function (s) {
      var d = done.indexOf(s.id) > -1;
      s.classList.toggle('done', d);
      var a = side.querySelector('a[href="#' + s.id + '"]');
      if (a) a.classList.toggle('done', d);
    });
    side.querySelector('.progress_bar').style.width = Math.round(done.length / lessons.length * 100) + '%';
    side.querySelector('.progress_txt').textContent = done.length === lessons.length
      ? 'All lessons complete. Next: the Practice page.'
      : done.length + ' of ' + lessons.length + ' lessons complete';
    var hi = document.querySelector('.head_info');
    if (hi) hi.textContent = done.length + '/' + lessons.length + ' complete';
  }

  lessons.forEach(function (s) {
    var d = DATA[s.id];
    if (!d) return;

    var r = el('div', 'remember');
    r.appendChild(el('b', '', 'Remember'));
    r.appendChild(document.createTextNode(d[0]));
    s.appendChild(r);

    var c = el('div', 'check');
    c.appendChild(el('h4', '', d[1]));
    var fb = el('p', 'why');
    var opts = [];
    var already = done.indexOf(s.id) > -1;

    function lock() { opts.forEach(function (o) { o.disabled = true; }); }

    d[2].forEach(function (t, n) {
      var b = el('button', 'q_opt', t);
      b.type = 'button';
      b.addEventListener('click', function () {
        if (n === d[3]) {
          b.classList.add('right');
          lock();
          fb.textContent = 'Correct! Lesson complete.';
          if (done.indexOf(s.id) < 0) { done.push(s.id); save('csslab-done', done); }
          render();
        } else {
          b.classList.add('wrong');
          b.disabled = true;
          var mm = getMissed();
          mm[s.id] = { n: ((mm[s.id] && mm[s.id].n) || 0) + 1 };
          setMissed(mm);
          fb.textContent = 'Not quite. Re-read the Remember box and try again. (Saved to your Review list.)';
        }
      });
      opts.push(b);
      c.appendChild(b);
    });

    if (already) { opts[d[3]].classList.add('right'); lock(); fb.textContent = 'Completed.'; }
    c.appendChild(fb);
    s.appendChild(c);
  });
  render();

  // Responsive lesson: a real page in a frame, scaled to fit, with a screen width you control
  var rf = document.getElementById('resframe');
  if (rf) {
    var RES_DOC = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
      'body{margin:0;font:16px/1.4 Arial,sans-serif;background:#fff;color:#1d2433}' +
      'header{background:linear-gradient(135deg,#6366f1,#22d3ee);color:#fff;padding:16px}' +
      'h1{margin:0;font-size:28px}.cards{display:flex;gap:12px;padding:16px}' +
      '.card{flex:1;background:#eef2ff;border-radius:12px;padding:14px}' +
      '@media (max-width:600px){h1{font-size:20px}.cards{flex-direction:column}body{background:#fef3c7}}' +
      '</style></head><body><header><h1>My Responsive Page</h1></header><div class="cards"><div class="card">One</div><div class="card">Two</div><div class="card">Three</div></div></body></html>';
    var rw = document.getElementById('resW'), rbox = rf.parentNode, rinfo = document.getElementById('resinfo');
    var fitRes = function () {
      var W = +rw.value, s = Math.min(1, rbox.clientWidth / W);
      rf.style.width = W + 'px';
      rf.style.transform = 'scale(' + s + ')';
      rbox.style.height = Math.ceil(260 * s) + 'px';
      rinfo.textContent = 'Screen width: ' + W + 'px  ->  ' + (W <= 600 ? 'phone layout (the @media rule is ON)' : 'desktop layout (the @media rule is OFF)');
    };
    rf.addEventListener('load', fitRes);
    rw.addEventListener('input', fitRes);
    window.addEventListener('resize', fitRes);
    rf.srcdoc = RES_DOC;
    fitRes();
  }

  // Keep the current lesson visible inside the sidebar's own scrolling list (never scrolls the page)
  function keepInView(a) {
    var ol = side.querySelector('ol'), r = a.getBoundingClientRect(), o = ol.getBoundingClientRect();
    if (ol.scrollHeight <= ol.clientHeight + 1) return;
    if (r.top < o.top + 8 || r.bottom > o.bottom - 8) ol.scrollTop += (r.top - o.top) - (o.height / 2) + r.height / 2;
  }

  // Highlight the lesson you are reading in the sidebar
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        side.querySelectorAll('a.now').forEach(function (a) { a.classList.remove('now'); });
        var a = side.querySelector('a[href="#' + e.target.id + '"]');
        if (a) { a.classList.add('now'); keepInView(a); }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    lessons.forEach(function (s) { spy.observe(s); });
  }
})();

// Site Builder Quest levels. Each level: code lines with {n} slots; a slot has options (o), the right answer(s) (a) and a tip.
// Shared by capstone.html (the game) and review.html (which re-asks the blanks you got wrong).
// A missed blank is stored in Review as "g<level index>-<slot index>".
window.GAME_LEVELS = [
  { t: 'Center the page', badge: 'Centered!', sel: '.wrapper',
    bot: 'Our page is stuck to the edges. Let us put the content in a neat, centered box!',
    learn: 'max-width limits the box, and margin: 0 auto centers it.',
    code: ['.wrapper {', '  max-width: {0};', '  margin: {1};', '}'],
    slots: [
      { o: ['560px', '100%', '20px', 'auto'], a: '560px', tip: 'max-width limits how wide the box can grow, so there is room left over to center it.' },
      { o: ['0 auto', 'auto 0', '0', '20px'], a: '0 auto', tip: 'margin: 0 auto means 0 on top and bottom, and automatic, equal space on the left and right.' } ],
    test: function (d) { var r = d.querySelector('.wrapper').getBoundingClientRect(); return Math.abs(r.width - 560) < 2 && Math.abs(r.left - (d.documentElement.clientWidth - r.right)) < 2; } },

  { t: 'Color the banner', badge: 'Gradient Guru', sel: '#banner',
    bot: 'The banner looks plain. Time for a colorful gradient and text you can actually read.',
    learn: 'A gradient is an image, so it goes in background (or background-image).',
    code: ['#banner {', '  padding: 50px 0;', '  color: {0};', '  background: {1};', '}'],
    slots: [
      { o: ['#fff', '#333', 'red', 'yellow'], a: '#fff', tip: 'Light text is easy to read on a dark gradient.' },
      { o: ['linear-gradient(135deg, #4f46e5, #06b6d4)', '#fff', 'none', 'blue'], a: 'linear-gradient(135deg, #4f46e5, #06b6d4)', tip: 'A gradient is an image, so it goes in background. The plain colors are not gradients.' } ],
    test: function (d, w) { return /gradient|url\(/.test(w.getComputedStyle(d.querySelector('#banner')).backgroundImage); } },

  { t: 'Three boxes in a row', badge: 'Row Master', sel: '.mid_box1,.mid_box2,.mid_box3', cam: '.mid_box1',
    bot: 'These three boxes are stacked like pancakes. Let us line them up in a row!',
    learn: 'inline-block + vertical-align: top + 32% gives three even boxes in a row.',
    code: ['[class*="mid_box"] {', '  display: {0};', '  vertical-align: {1};', '  width: {2};', '}'],
    slots: [
      { o: ['inline-block', 'block', 'flex', 'none'], a: 'inline-block', tip: 'inline-block puts boxes side by side and keeps their width.' },
      { o: ['top', 'middle', 'baseline', 'bottom'], a: 'top', tip: 'The rule for inline-block boxes: always vertical-align: top.' },
      { o: ['32%', '100%', '50%', '24%'], a: '32%', tip: 'Three boxes use 32% each (two boxes use 47%, four use 24%) so they fit with a little room.' } ],
    test: function (d) { var b = ['.mid_box1', '.mid_box2', '.mid_box3'].map(function (s) { return d.querySelector(s).getBoundingClientRect(); }); return Math.abs(b[0].top - b[1].top) < 2 && Math.abs(b[1].top - b[2].top) < 2 && b[0].left < b[1].left && b[1].left < b[2].left; } },

  { t: 'Hang an icon on each heading', badge: 'Icon Designer', sel: '.middle_con h2', cam: '.mid_box1',
    bot: 'Each heading needs an icon on top. We will hang a circle above it using absolute positioning.',
    learn: 'The parent is position: relative. The icon (:before) is position: absolute.',
    code: ['.middle_con h2 {', '  position: {0};', '  padding-top: 70px;', '  text-align: center;', '}', '.middle_con h2:before {', '  content: "";', '  position: {1};', '  top: 0;', '  left: 0;', '  right: 0;', '  margin: 0 auto;', '  width: 57px;', '  height: 57px;', '  border-radius: 50%;', '  background: #4f46e5;', '}'],
    slots: [
      { o: ['relative', 'absolute', 'static', 'fixed'], a: 'relative', tip: 'The heading is the parent, so it needs position: relative. Then the icon can be placed inside it.' },
      { o: ['absolute', 'relative', 'static', 'fixed'], a: 'absolute', tip: 'The icon floats freely at top, left and right inside its parent, so it is absolute.' } ],
    test: function (d, w) { var h = d.querySelector('.middle_con h2'), cs = w.getComputedStyle(h), b = w.getComputedStyle(h, '::before'); return cs.position === 'relative' && b.position === 'absolute' && b.content !== 'none' && b.content !== 'normal' && parseFloat(b.width) > 0 && parseFloat(b.height) > 0; } },

  { t: 'Content and sidebar', badge: 'Float Pilot', sel: '.main_info,.main_side', cam: '.main_con',
    bot: 'Let us split the content: main text on the right, sidebar on the left.',
    learn: 'float: left or right plus a % width makes columns.',
    code: ['.main_info {', '  float: {0};', '  width: 68%;', '}', '.main_side {', '  float: {1};', '  width: 28%;', '}'],
    slots: [
      { o: ['right', 'left', 'none', 'center'], a: 'right', tip: 'The main content goes on the right.' },
      { o: ['left', 'right', 'none', 'center'], a: 'left', tip: 'The sidebar goes on the left, opposite the main content.' } ],
    test: function (d, w) { var a = w.getComputedStyle(d.querySelector('.main_info')).getPropertyValue('float'), b = w.getComputedStyle(d.querySelector('.main_side')).getPropertyValue('float'); return a !== 'none' && b !== 'none' && a !== b; } },

  { t: 'Rescue the footer', badge: 'Clearfix Cleaner', sel: '.main_con', cam: '.main_con',
    bot: 'Oh no, the footer crawled up over the content! Floats leave their parent behind. A clearfix brings it back.',
    learn: 'A clearfix (:before and :after with clear: both) makes a parent wrap its floated children.',
    code: ['.clearfix:before,', '.clearfix:after {', '  content: {0};', '  display: {1};', '  clear: {2};', '}'],
    slots: [
      { o: ['""', 'none', '"x"', 'auto'], a: '""', tip: 'A pseudo-element needs the content property, even if it is just empty quotes.' },
      { o: ['table', 'block', 'inline', 'none'], a: 'table', tip: 'display: table makes the pseudo-elements take their own row.' },
      { o: ['both', 'left', 'none', 'float'], a: 'both', tip: 'clear: both pushes below floats on both sides, so the parent wraps them.' } ],
    test: function (d, w) { var m = d.querySelector('.main_con').offsetHeight, i = d.querySelector('.main_info'), s = d.querySelector('.main_side'); return w.getComputedStyle(i).getPropertyValue('float') !== 'none' && m > 0 && m >= Math.max(i.offsetHeight, s.offsetHeight); } },

  { t: 'Turn the menu sideways', badge: 'Menu Maker', sel: '#nav_area li', cam: '#nav_area',
    bot: 'The menu is a tall list. Let us turn it into a row.',
    learn: 'inline-block + vertical-align: top puts list items in a row.',
    code: ['#nav_area {', '  background: #1d2433;', '}', '#nav_area li {', '  display: {0};', '  vertical-align: {1};', '}', '#nav_area a {', '  display: block;', '  padding: 12px 14px;', '  color: #fff;', '}'],
    slots: [
      { o: ['inline-block', 'block', 'table', 'none'], a: 'inline-block', tip: 'inline-block lays the items out in a row.' },
      { o: ['top', 'bottom', 'middle', 'baseline'], a: 'top', tip: 'vertical-align: top keeps every item lined up at the top.' } ],
    test: function (d, w) { var li = d.querySelector('#nav_area li'), cs = w.getComputedStyle(li), ul = w.getComputedStyle(li.parentElement); return (cs.display === 'inline-block' && cs.verticalAlign === 'top') || ul.display === 'flex'; } },

  { t: 'Stripe the paragraphs', badge: 'Zebra Striper', sel: '.main_info p', cam: '.main_info',
    bot: 'Long text is hard to scan. Let us stripe every other paragraph!',
    learn: ':nth-child(odd) styles the 1st, 3rd, 5th... element.',
    code: ['.main_info p:nth-child({0}) {', '  background: {1};', '}'],
    slots: [
      { o: ['odd', 'even', '1', '3n'], a: ['odd', 'even'], tip: 'odd picks the 1st, 3rd, 5th paragraph (even also works: 2nd, 4th).' },
      { o: ['#eef2ff', 'transparent', '#fff', 'none'], a: '#eef2ff', tip: 'A light tint makes the stripes visible. White or transparent would hide them.' } ],
    test: function (d, w) { var p = d.querySelectorAll('.main_info p'); return w.getComputedStyle(p[0]).backgroundColor !== w.getComputedStyle(p[1]).backgroundColor; } },

  { t: 'Shout in the footer', badge: 'Capital Hero', sel: 'footer p', cam: 'footer',
    bot: 'Last level! Make the footer text shout in capital letters, without retyping it.',
    learn: 'text-transform changes capitalization without touching the HTML.',
    code: ['footer {', '  padding: 20px 0;', '  text-transform: {0};', '}'],
    slots: [
      { o: ['uppercase', 'lowercase', 'capitalize', 'none'], a: 'uppercase', tip: 'uppercase turns every letter into a capital.' } ],
    test: function (d, w) { return w.getComputedStyle(d.querySelector('footer p')).textTransform === 'uppercase'; } }
];

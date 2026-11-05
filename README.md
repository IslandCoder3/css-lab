# CSS Lab

A hands-on CSS course built around a website template. Each lesson has a live demo, a "Remember" box with the course's own rules, and a check question you must answer correctly to complete it. Practice drills make you write real CSS, and the capstone has you style the template page yourself.

## Run it
Open index.html in a browser. The capstone preview works best through a local server:
  python3 -m http.server 8000
then visit http://localhost:8000

## Pages
- index.html       17 lessons in learning order: demo, Remember box, check question
- practice.html    12 drills: write CSS, the page tests the computed styles
- capstone.html    Site Builder Quest: a 9-level game that builds a real page. Pick the right CSS
                   (no typing), earn stars and badges, peek at the goal.
- capstone-pro.html  Pro mode: the same page, but you type the CSS yourself (guided steps,
                   symbol bar, live suggestions)
- quiz.html        10 questions on the rules from the lessons
- cheatsheet.html  searchable table of every rule, linked to its lesson

## What the lessons cover
Three ways to apply CSS, color formats, background and font shorthand, width and height,
padding and margin shorthand, display (block, inline-block with vertical-align: top and
47% / 32% / 24% widths, none, flex), float and clearfix, :before icon recipe,
pseudo-classes, positions (relative / absolute and centering recipes), z-index, selectors
([class*="..."]), text-transform, word-wrap, border-radius, gradients.
Two common myths are corrected in the lessons: z-index defaults to auto (not 1), and
:hover works on any element (not only links and divs).

## Suggestions while typing
The code editors (Practice and Capstone) suggest as you type: property names (dis -> display),
values for the property you just typed (display: -> block, inline-block, flex), selectors
(.wr -> .wrapper) and pseudo-elements (:bef -> :before). Tap a chip to insert it, or press Tab
to accept the first one (Esc hides them). Suggestions that match the current step or challenge
are listed first. The lists live in project.js (PROPS, VALS, PSEUDOS, TAGS).

## Files
- style.css    base styles and lesson demos (template-style class names)
- theme.css    design system: group colors (Basics indigo, Box Model teal, Layout orange,
               Advanced pink), labelled demo canvas, dark mode, hero code card
- project.css  progress, quiz and cheatsheet styles
- script.js    lesson controls, mobile menu, back-to-top
- project.js   shared nav, lesson text and checks, progress, scroll effects

## Add a lesson
1. Copy a <section class="lesson" id="lN"> block in index.html and give it a new id.
2. Add controls inside .controls:
   data-prop="css-property"  changes a CSS property
   data-attr="data-mode"     switches a selector via an attribute (select only)
   data-class="name"         toggles a class (checkbox only)
   data-target="selector"    optional, applies to other elements in the lesson
   Default target is the element with class "target".
3. Add an entry for the lesson id to DATA in project.js (remember text,
   question, options, correct index).
4. Add it to the sidebar list, the quiz and the cheatsheet.

## Add a practice drill
Add an object to the C array in practice.html: title, task, starting CSS, preview HTML
(the styled element has class "t", or set sel to style other elements), hint,
solution, and checks that test getComputedStyle values.

## Saved data (browser localStorage)
- csslab-done      completed lesson ids
- csslab-practice  solved drill indexes
- csslab-best      best quiz score
- csslab-capstone  capstone complete (plus csslab-capstone-css, your stylesheet)
Use "Reset progress" in the lessons sidebar to clear them.

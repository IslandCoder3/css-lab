// Quiz questions: [question, options, index of the right answer, explanation]
// Shared by quiz.html and review.html. A question's id in the Review list is "q" + its position here.
window.QUIZ_Q = [
  [`Which is NOT one of the three ways to apply CSS?`, [`Inline style attribute`, `Internal <style> tag`, `External .css file`, `Embedded <css> tag`], 3, `The three ways are inline, internal and external. There is no <css> tag.`],
  [`What does the "a" in rgba() stand for?`, [`Alpha, the opacity`, `Area`, `Angle`, `Absolute`], 0, `Alpha is opacity from 0 (invisible) to 1 (solid).`],
  [`In background: url('bg.jpg') no-repeat center top #000; what does top set?`, [`Horizontal position`, `Vertical position`, `Image repeat`, `Image size`], 1, `center is the horizontal position and top is the vertical position.`],
  [`padding: 20px 15px 0; What is the bottom padding?`, [`20px`, `15px`, `0`, `35px`], 2, `Three values mean top, left and right, bottom.`],
  [`Three balanced inline-block boxes in a row: which width fits?`, [`50%`, `47%`, `32%`, `24%`], 2, `2 boxes use 47%, 3 boxes 32%, 4 boxes 24%. Add vertical-align: top too.`],
  [`How do you cancel a float for a mobile layout?`, [`float: reset;`, `float: none;`, `clear: float;`, `float: off;`], 1, `float: none resets it.`],
  [`An absolute ::before icon needs which declaration on its parent?`, [`display: flex`, `position: relative`, `float: left`, `overflow: hidden`], 1, `The parent must be positioned (usually relative) so the icon is placed inside it.`],
  [`Which selector matches every element whose class contains mid_box?`, [`.mid_box`, `#mid_box`, `[class*="mid_box"]`, `mid_box:all`], 2, `The *= attribute selector matches mid_box1, mid_box2 and so on.`],
  [`Why does z-index do nothing on a static element?`, [`It only works on positioned elements`, `z-index needs px units`, `It only works on images`, `It needs display: flex`], 0, `Give the element position: relative or absolute first. Values have no unit.`],
  [`Which declaration turns a square box into a circle?`, [`border-radius: 50%`, `border: round`, `display: circle`, `radius: 100`], 0, `border-radius: 50% rounds all corners into a circle on a square.`],
  [`Which tag turns text into a link?`, [`<link>`, `<a>`, `<href>`, `<url>`], 1, `The <a> tag with an href attribute makes a link.`],
  [`Which attribute describes an image for people who cannot see it?`, [`src`, `href`, `alt`, `title`], 2, `alt is the description used by screen readers and search engines.`],
  [`What does box-sizing: border-box do?`, [`Includes padding and border in the width`, `Draws a border around the box`, `Removes the padding`, `Makes the box square`], 0, `The width stays exactly what you set, even with padding and a border.`],
  [`Which unit is relative to the root font size?`, [`px`, `rem`, `vh`, `pt`], 1, `2rem is twice the root font size (32px by default).`],
  [`What does @media (max-width: 600px) mean?`, [`Rules apply on screens 600px wide or narrower`, `Rules apply only above 600px`, `The page is always 600px wide`, `It blocks phones`], 0, `Media queries apply their rules only when the screen matches.`],
  [`What does a:hover do?`, [`Styles the link while the pointer is over it`, `Styles visited links`, `Removes the link`, `Opens the link in a new tab`], 0, `:hover applies while the pointer is over the element (or while it is tapped on a phone).`],
  [`Which tag is a header cell in a table?`, [`<td>`, `<th>`, `<tr>`, `<thead>`], 1, `<th> is a header cell. <td> is a normal data cell and <tr> is a whole row.`],
  [`A table cell that spans two columns uses which attribute?`, [`colspan="2"`, `rowspan="2"`, `span="2"`, `merge="2"`], 0, `colspan makes a cell stretch across columns (rowspan stretches across rows).`],
  [`Which attribute shows the play and pause buttons on a video?`, [`controls`, `autoplay`, `src`, `poster`], 0, `Without controls, people have no buttons to play or pause the video.`],
  [`Why use <nav> and <main> instead of plain <div>s?`, [`They describe the meaning of each part`, `They load faster`, `They add colors`, `They are required`], 0, `Screen readers and search engines understand semantic tags, and the HTML is easier to read.`]
];
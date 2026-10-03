import { q, type CatalogueQuestion } from "./helpers.js";

/** Interview questions for this topic group (see helpers.ts for the format). */
export const WEB_QUESTIONS: CatalogueQuestion[] = [
  // ---------------------------------------------------------------- HTML
  q(
    "html",
    "What is the purpose of the DOCTYPE declaration?",
    "Basics",
    "EASY",
    `
Every HTML page starts with <!DOCTYPE html>. What does this line do, and what happens if you leave it out?
`,
    `
- It is not a tag; it is an instruction telling the browser which version of HTML / rendering mode to use.
- <!DOCTYPE html> switches the browser into "standards mode" (HTML5).
- Without it the browser falls back to "quirks mode", emulating old browser bugs (for example the old IE box model), so layouts and CSS can behave inconsistently.
- It must be the very first line of the document.
`,
    { company: "TCS" },
  ),
  q(
    "html",
    "What are semantic HTML elements? Give examples.",
    "Semantics",
    "EASY",
    `
What do we mean by semantic HTML? Why would you use <header>, <nav> or <article> instead of plain <div> elements?
`,
    `
- Semantic elements describe the meaning of their content, not just how it looks.
- Examples: <header>, <nav>, <main>, <article>, <section>, <aside>, <footer>, <figure>, <time>.
- Benefits:
- Accessibility: screen readers use them as landmarks to navigate the page.
- SEO: search engines understand the structure and main content better.
- Readability: the code is easier to maintain than a "div soup".
- <div> and <span> are non-semantic and should be used only for styling/grouping.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "html",
    "What is the difference between block and inline elements?",
    "Basics",
    "EASY",
    `
Explain the difference between block-level and inline elements in HTML. Give two examples of each.
`,
    `
- Block elements start on a new line and take the full available width by default. Examples: <div>, <p>, <h1>, <ul>, <section>.
- Inline elements sit within a line of text and take only as much width as their content. Examples: <span>, <a>, <strong>, <img>, <em>.
- Width/height and vertical margins do not apply to inline elements (img is a "replaced" element, so it can be sized).
- CSS display (block, inline, inline-block) can change this behaviour.
`,
  ),
  q(
    "html",
    "What is the difference between the id and class attributes?",
    "Basics",
    "EASY",
    `
When would you use id and when would you use class on an HTML element?
`,
    `
- id must be unique in the page; class can be shared by many elements, and an element can have several classes.
- id is used for one specific element: fragment links (#section), label for=..., getElementById, ARIA references.
- class is used for reusable styling and for selecting groups of elements.
- In CSS, an id selector has higher specificity (0,1,0,0) than a class selector (0,0,1,0), so styling with classes is usually preferred.
`,
  ),
  q(
    "html",
    "Why is the alt attribute important on images?",
    "Accessibility",
    "EASY",
    `
What is the alt attribute on an <img> tag used for? What should you write for a purely decorative image?
`,
    `
- alt gives a text alternative for the image.
- Screen readers read it out, so blind users understand the image.
- It is shown if the image fails to load, and search engines use it.
- Write a short description of the image's purpose, not "image of...".
- For decorative images use an empty alt (alt="") so screen readers skip it. Do not omit alt entirely, or the reader may announce the file name.
`,
  ),
  q(
    "html",
    "What are the main HTML5 input types?",
    "Forms",
    "EASY",
    `
HTML5 added many new input types. Name some of them and explain why they are useful compared to a plain type="text".
`,
    `
- Examples: email, tel, url, number, range, date, time, datetime-local, color, search, password, checkbox, radio, file.
- Benefits:
- Built-in validation (for example type="email" checks the format on submit).
- Mobile browsers show a suitable keyboard (numeric keypad for tel/number).
- Native pickers for date, time and colour.
- Combine with attributes like required, min, max, pattern and placeholder.
`,
  ),
  q(
    "html",
    "What is the difference between the GET and POST form methods?",
    "Forms",
    "EASY",
    `
A <form> can use method="get" or method="post". What is the difference and when would you use each?
`,
    `
- GET puts the form data in the URL query string (?name=value). It is visible, can be bookmarked and cached, and has a length limit.
- POST sends data in the request body. It is not shown in the URL and suits large or sensitive data.
- Use GET for searches and filters that do not change data.
- Use POST for creating or changing data (sign up, login, payments).
- Note: POST is not encryption; use HTTPS to protect data in transit.
`,
    { company: "Infosys" },
  ),
  q(
    "html",
    "What is the difference between localStorage, sessionStorage and cookies?",
    "Web Storage",
    "MEDIUM",
    `
Compare localStorage, sessionStorage and cookies in terms of capacity, lifetime, and whether they are sent to the server.
`,
    `
- localStorage: about 5-10 MB per origin, persists until cleared, never sent to the server automatically.
- sessionStorage: similar size, scoped to one tab and cleared when the tab closes.
- Cookies: about 4 KB each, have an expiry you set, and are sent with every HTTP request to that domain.
- Only cookies can be HttpOnly (hidden from JavaScript), which makes them safer for session tokens.
- Web storage is synchronous and stores strings only (use JSON.stringify / JSON.parse).
`,
    { role: "Frontend Developer" },
  ),
  q(
    "html",
    "What do the async and defer attributes on a script tag do?",
    "Performance",
    "MEDIUM",
    `
How do these three script tags differ in how they load and execute?

\`\`\`
<script src="a.js"></script>
<script async src="b.js"></script>
<script defer src="c.js"></script>
\`\`\`
`,
    `
- Normal script: HTML parsing stops while the script downloads and runs.
- async: downloads in parallel with parsing and runs as soon as it is ready, pausing the parser then. Execution order between async scripts is not guaranteed. Good for independent scripts like analytics.
- defer: downloads in parallel and runs only after parsing finishes, just before DOMContentLoaded, in document order. Good for app scripts that need the DOM.
- Both only apply to external scripts (with src). Module scripts are deferred by default.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "html",
    "What are data-* attributes and how do you read them in JavaScript?",
    "Attributes",
    "MEDIUM",
    `
What are custom data attributes like data-user-id="42"? How do you access them from JavaScript and CSS?
`,
    `
- data-* attributes let you store custom data on any element without non-standard attributes.
- In JavaScript, use the dataset property. Hyphenated names become camelCase:

\`\`\`
const el = document.querySelector("#card");
el.dataset.userId;        // "42" (always a string)
el.dataset.status = "on"; // sets data-status="on"
\`\`\`

- In CSS: [data-status="on"] { ... } or content: attr(data-label).
- Do not store sensitive data there; it is visible in the page source.
`,
  ),
  q(
    "html",
    "What is ARIA and when should you use it?",
    "Accessibility",
    "MEDIUM",
    `
What are ARIA attributes such as role, aria-label and aria-expanded? What is the "first rule of ARIA"?
`,
    `
- ARIA (Accessible Rich Internet Applications) adds roles, states and properties that assistive technology can read.
- Examples: role="dialog", aria-label="Close", aria-expanded="true", aria-hidden="true", aria-live="polite".
- First rule of ARIA: if a native HTML element already gives the behaviour (button, nav, input), use it instead of adding ARIA to a div.
- ARIA only changes what is announced; it does not add keyboard behaviour. A div with role="button" still needs tabindex and Enter/Space handling.
- Use it for custom widgets (tabs, menus, modals) and live updates.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "html",
    "How does an HTML form become accessible?",
    "Accessibility",
    "MEDIUM",
    `
You are reviewing a sign-up form built with inputs and placeholder text only. What would you change to make it accessible?
`,
    `
- Give every input a visible <label>, linked with for="id" (or by wrapping the input). Placeholders are not labels.
- Group related controls (radio buttons) with <fieldset> and <legend>.
- Use correct input types and autocomplete attributes (email, new-password).
- Mark required fields with the required attribute, not just a red star.
- Show error messages in text next to the field and link them with aria-describedby; do not rely on colour alone.
- Make sure the whole form works with the keyboard and focus is visible.
`,
  ),
  q(
    "html",
    "What is the difference between <section>, <article> and <div>?",
    "Semantics",
    "MEDIUM",
    `
When should you use <section>, <article> and <div>? Give an example page structure.
`,
    `
- <article>: self-contained content that would make sense on its own (blog post, news item, comment, product card).
- <section>: a thematic group of content, usually with a heading (a "Features" or "Pricing" part of a page).
- <div>: no meaning, just a generic container for styling or layout.
- Example: <main> holds an <article> for a blog post; the post has <section>s for each chapter; a <div> wraps elements only for a flex layout.
- Rule of thumb: if it needs a heading and is a part of the outline, section; if it can be syndicated alone, article.
`,
  ),
  q(
    "html",
    "What are meta tags and which ones matter most?",
    "Basics",
    "MEDIUM",
    `
What are <meta> tags in the <head>? Which meta tags should every modern page have?
`,
    `
- Meta tags give metadata about the page to browsers, search engines and social sites.
- Essential ones:
- <meta charset="UTF-8"> for correct character encoding.
- <meta name="viewport" content="width=device-width, initial-scale=1"> for responsive layout on mobile.
- <meta name="description" content="..."> used as the search result snippet.
- Useful extras: Open Graph tags (og:title, og:image) for link previews, and robots to control indexing.
- Without the viewport tag, mobile browsers render a zoomed-out desktop layout.
`,
  ),
  q(
    "html",
    "How do you make images responsive and fast-loading in HTML?",
    "Performance",
    "MEDIUM",
    `
A page shows large photos that look fine on desktop but load slowly on phones. What HTML features help?
`,
    `
- srcset and sizes let the browser pick the right image size:

\`\`\`
<img src="photo-800.jpg"
     srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 50vw"
     alt="Team photo" width="800" height="600" loading="lazy">
\`\`\`

- <picture> with <source type="image/webp"> serves modern formats with a fallback.
- loading="lazy" delays off-screen images.
- Setting width and height reserves space and prevents layout shift (CLS).
`,
    { role: "Frontend Developer" },
  ),
  q(
    "html",
    "What happens in the browser from typing a URL to seeing the page?",
    "Rendering",
    "HARD",
    `
Walk through what happens when you type www.example.com in the browser and press Enter, until the page is painted.
`,
    `
- DNS lookup resolves the domain to an IP (browser cache, OS cache, resolver).
- TCP connection (and TLS handshake for HTTPS) to the server.
- Browser sends an HTTP GET request; server returns HTML.
- Browser parses HTML into the DOM; CSS is parsed into the CSSOM. Blocking scripts pause parsing.
- DOM + CSSOM form the render tree (only visible elements).
- Layout (reflow) computes sizes and positions.
- Paint fills pixels; composite combines layers on screen.
- More resources (images, scripts) are fetched as they are discovered.
`,
    { company: "Amazon", role: "Frontend Developer" },
  ),
  q(
    "html",
    "What is the critical rendering path and how do you optimise it?",
    "Rendering",
    "HARD",
    `
Explain the critical rendering path. What changes would you make to an HTML page to show content faster on first load?
`,
    `
- The critical rendering path is the steps from HTML/CSS/JS to the first paint: DOM, CSSOM, render tree, layout, paint.
- CSS is render-blocking and synchronous scripts are parser-blocking.
- Optimisations:
- Inline small critical CSS; load the rest without blocking.
- Use defer/async for scripts; move non-critical JS later.
- Reduce bytes: minify, compress (gzip/brotli), and cache.
- Preload key resources (<link rel="preload"> for fonts and hero images); preconnect to third-party origins.
- Lazy-load below-the-fold images and use font-display: swap.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "html",
    "What is the difference between reflow and repaint?",
    "Rendering",
    "HARD",
    `
What are reflow (layout) and repaint? Which DOM or CSS changes trigger each, and how can you avoid layout thrashing?
`,
    `
- Reflow: the browser recalculates positions and sizes. Triggered by changing width, height, margin, font size, adding/removing elements, or reading layout values like offsetHeight after a write.
- Repaint: redrawing pixels without layout change, for example changing colour or background.
- Reflow is more expensive and usually causes a repaint too.
- transform and opacity can often be handled by the compositor alone, so prefer them for animations.
- Avoid thrashing: batch DOM reads, then batch writes; do not read offsetWidth inside a loop that writes styles; use requestAnimationFrame; build DOM in a DocumentFragment.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "html",
    "What is the Shadow DOM and what problem does it solve?",
    "Web Components",
    "HARD",
    `
Explain Shadow DOM as part of Web Components. How is it different from the virtual DOM used by React?
`,
    `
- Shadow DOM attaches a hidden, encapsulated DOM tree to an element (element.attachShadow({ mode: "open" })).
- Styles inside do not leak out, and page styles do not leak in (except inherited properties and CSS custom properties).
- It is used by custom elements and built-in controls like <video>.
- <slot> lets the user's content be projected into the shadow tree.
- Virtual DOM is different: a JavaScript copy of the UI used by React to compute minimal DOM updates. It is about performance and programming model, not encapsulation.
`,
  ),
  q(
    "html",
    "What are common web security issues in HTML pages, like XSS?",
    "Security",
    "HARD",
    `
What is Cross-Site Scripting (XSS)? How can user-entered content in an HTML page become dangerous, and how do you prevent it?
`,
    `
- XSS: an attacker gets their script to run in another user's browser, for example by saving <script> or <img onerror=...> in a comment that is rendered as HTML.
- The script can steal tokens, act as the user, or change the page.
- Prevention:
- Escape output; insert user text with textContent, not innerHTML.
- Sanitise any HTML you must allow (for example DOMPurify).
- Set a Content-Security-Policy header to block inline scripts.
- Keep session cookies HttpOnly and SameSite.
- Use rel="noopener noreferrer" on target="_blank" links to untrusted sites.
`,
    { role: "Full Stack Developer" },
  ),

  // ---------------------------------------------------------------- CSS
  q(
    "css",
    "Explain the CSS box model.",
    "Box Model",
    "EASY",
    `
What is the CSS box model? If an element has width: 200px, padding: 10px and border: 2px, how wide is it on screen?
`,
    `
- Every element is a box made of content, padding, border and margin (from inside out).
- With the default box-sizing: content-box, width applies to the content only.
- Visible width = 200 + 2*10 + 2*2 = 224px (margin adds space outside but is not part of the box's own width).
- With box-sizing: border-box, width includes padding and border, so the box is exactly 200px and content is 176px.
- Many projects set *, *::before, *::after { box-sizing: border-box; }.
`,
    { company: "TCS" },
  ),
  q(
    "css",
    "What is CSS specificity and how is it calculated?",
    "Selectors",
    "EASY",
    `
Two rules target the same element with different colours. How does the browser decide which one wins?
`,
    `
- Order of importance: !important declarations, then specificity, then source order (later wins).
- Specificity is counted as (inline, ids, classes/attributes/pseudo-classes, elements/pseudo-elements).
- Examples:
- p = (0,0,0,1)
- .card p = (0,0,1,1)
- #main .card = (0,1,1,0)
- style="..." beats all selectors.
- The universal selector * and combinators add nothing. :where() adds zero; :is() and :not() take the specificity of their most specific argument.
`,
  ),
  q(
    "css",
    "What are the different values of the position property?",
    "Positioning",
    "EASY",
    `
Explain position: static, relative, absolute, fixed and sticky.
`,
    `
- static: default, normal flow; top/left have no effect.
- relative: stays in flow but can be shifted with top/left; it also becomes the reference for absolute children.
- absolute: removed from flow, positioned relative to the nearest positioned ancestor (non-static), else the initial containing block.
- fixed: removed from flow, positioned relative to the viewport; stays in place on scroll (unless an ancestor has a transform).
- sticky: behaves like relative until a scroll threshold (top: 0), then sticks inside its parent.
`,
  ),
  q(
    "css",
    "What is the difference between display: none and visibility: hidden?",
    "Display",
    "EASY",
    `
Both hide an element. What is the difference between display: none, visibility: hidden and opacity: 0?
`,
    `
- display: none removes the element from layout; it takes no space and is hidden from screen readers.
- visibility: hidden hides it but keeps its space in the layout; it cannot be clicked.
- opacity: 0 makes it transparent but it still takes space and can still receive clicks and focus.
- Only opacity can be smoothly transitioned; display cannot.
`,
  ),
  q(
    "css",
    "What are pseudo-classes and pseudo-elements?",
    "Selectors",
    "EASY",
    `
What is the difference between a pseudo-class like :hover and a pseudo-element like ::before? Give examples.
`,
    `
- A pseudo-class selects an element in a particular state or position: :hover, :focus, :checked, :disabled, :first-child, :nth-child(2n), :not(.x).
- A pseudo-element styles a part of an element or inserts generated content: ::before, ::after, ::first-line, ::placeholder, ::selection.
- Pseudo-elements use two colons (one colon still works for old ones).
- ::before/::after need a content property (even content: "") to render.
`,
  ),
  q(
    "css",
    "What are the different CSS units: px, em, rem, %, vh and vw?",
    "Units",
    "EASY",
    `
Explain px, em, rem, %, vh and vw. Which would you use for font sizes in a responsive design?
`,
    `
- px: absolute pixels (CSS pixels).
- em: relative to the element's own font size (for font-size, the parent's), so it compounds when nested.
- rem: relative to the root (html) font size, so it does not compound.
- %: relative to the parent (width for width; font size for font-size).
- vh / vw: 1% of the viewport height / width.
- Use rem for font sizes and spacing so the layout respects the user's browser font settings; use % or fr for fluid widths.
`,
  ),
  q(
    "css",
    "How do you center a div horizontally and vertically?",
    "Layout",
    "EASY",
    `
Write CSS to center a child box both horizontally and vertically inside its parent. Give at least two ways.
`,
    `
Flexbox:

\`\`\`
.parent { display: flex; justify-content: center; align-items: center; }
\`\`\`

Grid:

\`\`\`
.parent { display: grid; place-items: center; }
\`\`\`

Absolute positioning:

\`\`\`
.parent { position: relative; }
.child { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
\`\`\`

- For horizontal only on a block with a set width: margin: 0 auto.
- The parent needs a height for vertical centering to be visible.
`,
    { company: "Infosys" },
  ),
  q(
    "css",
    "What is Flexbox and what are its key properties?",
    "Flexbox",
    "MEDIUM",
    `
Explain the main Flexbox properties on the container and on the items. What is the difference between justify-content and align-items?
`,
    `
- Container: display: flex, flex-direction (row/column), flex-wrap, justify-content, align-items, align-content, gap.
- justify-content aligns items along the main axis (row = horizontal); align-items aligns them on the cross axis.
- Items: flex-grow, flex-shrink, flex-basis (shorthand flex: 1 1 0), align-self, order.
- flex: 1 makes items share free space equally.
- Flexbox is one-dimensional (a row or a column), which suits navbars, toolbars and card rows.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "css",
    "When would you use CSS Grid instead of Flexbox?",
    "Grid",
    "MEDIUM",
    `
Compare CSS Grid and Flexbox. Write a grid that shows cards in as many 200px-wide columns as fit the screen.
`,
    `
- Flexbox is one-dimensional: content flows in one direction and sizes are content-driven.
- Grid is two-dimensional: you define rows and columns, so it suits page layouts and galleries.
- They work well together: Grid for the page, Flexbox inside components.

\`\`\`
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
\`\`\`

- auto-fill creates as many columns as fit; minmax lets each grow to share leftover space (fr unit).
`,
    { role: "Frontend Developer" },
  ),
  q(
    "css",
    "What are media queries and what is mobile-first design?",
    "Responsive Design",
    "MEDIUM",
    `
How do media queries work? What does "mobile-first" mean and why is it recommended?
`,
    `
- Media queries apply CSS only when conditions match, for example screen width:

\`\`\`
.grid { display: block; }
@media (min-width: 768px) {
  .grid { display: grid; grid-template-columns: 1fr 1fr; }
}
\`\`\`

- Mobile-first: write base styles for small screens, then add min-width queries for larger ones.
- Benefits: simpler base CSS, phones download less overriding CSS, and it forces you to prioritise content.
- Also query features like prefers-color-scheme, prefers-reduced-motion and orientation.
`,
  ),
  q(
    "css",
    "What is z-index and what is a stacking context?",
    "Positioning",
    "MEDIUM",
    `
A modal with z-index: 9999 still appears behind a header with z-index: 10. What could cause this?
`,
    `
- z-index only works on positioned elements (and flex/grid items) and orders them within a stacking context.
- A stacking context is created by: the root, position with a z-index other than auto, position fixed/sticky, opacity < 1, transform, filter, isolation: isolate, and others.
- Elements inside one stacking context can never appear above elements outside it that have a higher stacking order, whatever their own z-index.
- So the modal is likely inside a parent that formed its own context with a lower z-index (or a transform).
- Fix: render the modal at the end of body (a portal) or adjust the parent's stacking.
`,
  ),
  q(
    "css",
    "What is margin collapsing?",
    "Box Model",
    "MEDIUM",
    `
Two paragraphs are stacked: the first has margin-bottom: 20px and the second has margin-top: 30px. What is the gap between them, and why?
`,
    `
- The gap is 30px, not 50px. Vertical margins of adjacent block elements collapse into the larger of the two.
- It also happens between a parent and its first/last child if nothing separates them (no border, padding or BFC).
- Only vertical margins collapse; horizontal margins never do.
- Margins do not collapse in flex or grid containers, or with floats/absolute positioning.
- Ways to avoid: use padding, use gap in flex/grid, or create a block formatting context (display: flow-root).
`,
  ),
  q(
    "css",
    "What are CSS custom properties (variables)?",
    "Variables",
    "MEDIUM",
    `
How do CSS variables work? How are they different from Sass variables? Show how you would build a light/dark theme with them.
`,
    `
\`\`\`
:root { --bg: #ffffff; --text: #111111; }
[data-theme="dark"] { --bg: #111111; --text: #eeeeee; }
body { background: var(--bg); color: var(--text, black); }
\`\`\`

- Declared with --name, read with var(--name, fallback).
- They cascade and inherit, so redefining them on a parent changes all children.
- They are live at runtime: JavaScript can change them with element.style.setProperty("--bg", "#000").
- Sass variables are compiled away at build time and cannot change at runtime.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "css",
    "What is the difference between transitions and animations in CSS?",
    "Animations",
    "MEDIUM",
    `
Compare CSS transition and @keyframes animation. Which properties are cheap to animate?
`,
    `
- transition animates between two states when a property changes (for example on :hover). It needs a trigger.
- @keyframes with animation can define many steps, loop, run automatically, and play in reverse or alternate.

\`\`\`
.btn { transition: transform 0.2s ease; }
.btn:hover { transform: scale(1.05); }
@keyframes spin { to { transform: rotate(360deg); } }
.loader { animation: spin 1s linear infinite; }
\`\`\`

- Prefer animating transform and opacity: they avoid layout and paint and run on the compositor.
- Respect prefers-reduced-motion.
`,
  ),
  q(
    "css",
    "What is a Block Formatting Context (BFC)?",
    "Layout",
    "HARD",
    `
What is a Block Formatting Context? Give a problem with floats that creating a BFC solves.
`,
    `
- A BFC is an independent layout region where block boxes are laid out and floats are contained.
- Created by: display: flow-root, overflow other than visible, float, position absolute/fixed, inline-block, flex/grid items, and others.
- Effects:
- A BFC contains its floated children, so the parent's height includes them (fixes "collapsed parent" when all children float).
- Margins do not collapse across a BFC boundary.
- A BFC does not overlap neighbouring floats.
- Modern clearfix: .parent { display: flow-root; }.
`,
  ),
  q(
    "css",
    "How would you improve CSS performance on a large site?",
    "Performance",
    "HARD",
    `
A large web app has 600 KB of CSS and janky scrolling. What would you look at to improve CSS loading and rendering performance?
`,
    `
- Loading: remove unused CSS (coverage tools, PurgeCSS), split CSS per route, inline critical CSS, minify and compress, cache with hashed file names.
- Rendering:
- Avoid animating layout properties (width, top); use transform/opacity.
- Use will-change sparingly to promote elements to layers.
- Avoid costly effects on large areas (big box-shadows, filters, backdrop-filter) during scroll.
- Use contain: content or content-visibility: auto for long off-screen sections.
- Keep selectors simple; deep descendant selectors are rarely the main issue but heavy style recalculation on huge DOMs is.
- Measure with DevTools Performance before and after.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "css",
    "Compare CSS methodologies: BEM, CSS Modules and utility-first CSS.",
    "Architecture",
    "HARD",
    `
How do you keep CSS maintainable in a big team? Compare BEM, CSS Modules / CSS-in-JS, and utility-first frameworks like Tailwind.
`,
    `
- BEM: naming convention block__element--modifier (card__title--large). Flat, low-specificity selectors and clear ownership; relies on discipline.
- CSS Modules: class names are scoped per file at build time (.title becomes title_x8f2), so no global clashes. CSS-in-JS gives similar scoping plus dynamic styles, with some runtime cost for runtime libraries.
- Utility-first (Tailwind): small single-purpose classes in markup; fast to build, consistent design tokens, CSS size stays small; markup gets verbose.
- Common goals: avoid global leaks, keep specificity low, use design tokens (variables), and avoid !important.
`,
  ),
  q(
    "css",
    "How do :nth-child and :nth-of-type differ?",
    "Selectors",
    "HARD",
    `
Given this HTML, which element does each selector match?

\`\`\`
<div>
  <h2>Title</h2>
  <p>One</p>
  <p>Two</p>
</div>
\`\`\`

p:nth-child(2), p:nth-of-type(2), p:nth-child(1)
`,
    `
- :nth-child(n) counts all sibling elements, then checks the type.
- :nth-of-type(n) counts only siblings of the same type.
- p:nth-child(2) matches "One" (it is the 2nd child and is a p).
- p:nth-of-type(2) matches "Two" (the 2nd p).
- p:nth-child(1) matches nothing, because the first child is the h2.
- Formulas: :nth-child(2n+1) = odd children, :nth-child(-n+3) = first three.
`,
  ),
  q(
    "css",
    "What causes layout shift (CLS) and how do you prevent it with CSS?",
    "Performance",
    "HARD",
    `
Users complain that buttons jump while the page loads, making them click the wrong thing. What causes this and how do you fix it?
`,
    `
- This is Cumulative Layout Shift (CLS), a Core Web Vital.
- Causes: images/iframes without dimensions, ads or embeds injected late, web fonts swapping (FOUT) with different metrics, content inserted above existing content.
- Fixes:
- Set width and height (or aspect-ratio) on images, videos and embeds.
- Reserve space for ads and dynamic banners with min-height.
- Use font-display: optional/swap with size-adjust or a fallback font with similar metrics; preload key fonts.
- Animate with transform instead of changing top/height.
- Use skeleton placeholders with the final size.
`,
    { role: "Frontend Developer" },
  ),

  // ---------------------------------------------------------------- JavaScript
  q(
    "javascript",
    "What is the difference between let, const and var?",
    "Scope",
    "EASY",
    `
Explain the differences between var, let and const in terms of scope, hoisting and re-assignment.
`,
    `
- var is function-scoped; let and const are block-scoped ({ }).
- All are hoisted, but var is initialised as undefined, while let/const sit in the "temporal dead zone" until the declaration line (accessing them earlier throws a ReferenceError).
- var can be re-declared in the same scope; let/const cannot.
- const cannot be re-assigned, but an object or array it holds can still be mutated.
- Prefer const by default, let when you need to re-assign, and avoid var.
`,
    { company: "TCS" },
  ),
  q(
    "javascript",
    "What is the difference between == and ===?",
    "Basics",
    "EASY",
    `
What is the output of each line, and why?

\`\`\`
console.log(0 == "0");
console.log(0 === "0");
console.log(null == undefined);
console.log(null === undefined);
console.log(NaN == NaN);
\`\`\`
`,
    `
- == compares after type coercion; === compares value and type without coercion.
- 0 == "0" is true ("0" becomes 0).
- 0 === "0" is false (number vs string).
- null == undefined is true (special rule).
- null === undefined is false.
- NaN == NaN is false; NaN is not equal to anything. Use Number.isNaN(x).
- Always prefer === to avoid surprising coercion.
`,
  ),
  q(
    "javascript",
    "What are the primitive data types in JavaScript?",
    "Basics",
    "EASY",
    `
List the data types in JavaScript. What does typeof return for null, an array and a function?
`,
    `
- Seven primitives: string, number, bigint, boolean, undefined, symbol, null.
- Everything else is an object (including arrays, functions, dates).
- typeof null is "object" (a historic bug).
- typeof [] is "object"; use Array.isArray([]) to check.
- typeof function() {} is "function".
- Primitives are immutable and compared by value; objects are compared by reference.
`,
  ),
  q(
    "javascript",
    "What is hoisting in JavaScript?",
    "Scope",
    "EASY",
    `
What will this print?

\`\`\`
console.log(a);
var a = 5;
sayHi();
function sayHi() { console.log("hi"); }
console.log(b);
let b = 10;
\`\`\`
`,
    `
- Hoisting: declarations are processed before code runs, so they are known at the top of their scope.
- console.log(a) prints undefined: var a is hoisted and initialised to undefined; the assignment stays in place.
- sayHi() prints "hi": function declarations are hoisted with their body.
- console.log(b) throws ReferenceError: let b is hoisted but in the temporal dead zone until its line.
- Function expressions (var f = function () {}) are hoisted only as the variable, so calling early throws TypeError.
`,
  ),
  q(
    "javascript",
    "What is the difference between null and undefined?",
    "Basics",
    "EASY",
    `
Explain null vs undefined. Where does each appear naturally in JavaScript?
`,
    `
- undefined: a variable declared but not assigned, a missing object property, a missing function argument, or a function with no return.
- null: an intentional "no value" set by the programmer.
- typeof undefined is "undefined"; typeof null is "object".
- null == undefined is true, but null === undefined is false.
- In arithmetic, null becomes 0 and undefined becomes NaN.
- The ?? operator treats both as missing: value ?? "default".
`,
  ),
  q(
    "javascript",
    "What is the difference between map, filter and reduce?",
    "Arrays",
    "EASY",
    `
Using [1, 2, 3, 4, 5], show how map, filter and reduce work. Then get the sum of squares of the even numbers.
`,
    `
- map returns a new array with each element transformed (same length).
- filter returns a new array with only the elements that pass a test.
- reduce combines all elements into a single value using an accumulator.

\`\`\`
const nums = [1, 2, 3, 4, 5];
nums.map((n) => n * 2);          // [2, 4, 6, 8, 10]
nums.filter((n) => n % 2 === 0); // [2, 4]
nums.reduce((s, n) => s + n, 0); // 15

nums.filter((n) => n % 2 === 0)
    .map((n) => n * n)
    .reduce((s, n) => s + n, 0); // 4 + 16 = 20
\`\`\`

- None of them change the original array.
`,
  ),
  q(
    "javascript",
    "What are arrow functions and how do they differ from regular functions?",
    "Functions",
    "EASY",
    `
How are arrow functions different from normal function declarations? When should you not use an arrow function?
`,
    `
- Shorter syntax with implicit return for single expressions: const add = (a, b) => a + b.
- No own this: they use this from the surrounding scope (lexical this).
- No arguments object (use rest parameters ...args).
- Cannot be used as constructors with new and have no prototype.
- Avoid them for object methods that need this, for prototype methods, and for event handlers where you need this to be the element.
`,
  ),
  q(
    "javascript",
    "What is a closure? Give a practical example.",
    "Closures",
    "MEDIUM",
    `
Explain closures with an example. What does this code print?

\`\`\`
function counter() {
  let count = 0;
  return () => ++count;
}
const c1 = counter();
c1(); c1();
console.log(c1());
\`\`\`
`,
    `
- A closure is a function together with the variables from the scope where it was created. The inner function keeps access to them even after the outer function has returned.
- The code prints 3: each call to c1 updates the same private count.
- A new counter() call creates a separate count.
- Uses: data privacy (module pattern), function factories, memoisation, callbacks and event handlers that remember state, debounce/throttle.
- Downside: captured variables stay in memory as long as the closure is reachable.
`,
    { company: "Zoho", role: "Frontend Developer" },
  ),
  q(
    "javascript",
    "Explain the event loop in JavaScript.",
    "Event Loop",
    "MEDIUM",
    `
What is the output order, and why?

\`\`\`
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
\`\`\`
`,
    `
- Output: A, D, C, B.
- JavaScript runs on one thread with a call stack. Async work (timers, network) is handled by the browser/Node, and callbacks are queued.
- Synchronous code runs first: A and D.
- When the stack is empty, the event loop runs all microtasks (promise callbacks, queueMicrotask) before the next macrotask.
- So C (microtask) runs before B (setTimeout macrotask), even with a 0 ms delay.
- Rendering happens between macrotasks, so long microtask chains can block the UI.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "javascript",
    "How does the this keyword work in JavaScript?",
    "Functions",
    "MEDIUM",
    `
What does this refer to in each case: a method call, a plain function call, an arrow function, and with call/apply/bind?
`,
    `
- Method call obj.fn(): this is obj.
- Plain call fn(): undefined in strict mode (modules, classes), the global object in sloppy mode.
- Arrow function: no own this; it uses this from the enclosing scope.
- new Fn(): this is the newly created object.
- fn.call(obj, a, b) and fn.apply(obj, [a, b]) call fn with this = obj; fn.bind(obj) returns a new function with this fixed.
- Common bug: passing obj.fn as a callback loses this; fix with bind or an arrow wrapper.
`,
  ),
  q(
    "javascript",
    "What are promises and how does async/await work?",
    "Async",
    "MEDIUM",
    `
What is a Promise and what are its states? Rewrite a .then() chain using async/await with error handling.
`,
    `
- A Promise represents a future value. States: pending, then fulfilled or rejected (settled once).
- async functions always return a promise; await pauses the function until the promise settles.

\`\`\`
async function loadUser(id) {
  try {
    const res = await fetch("/api/users/" + id);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}
\`\`\`

- Run independent calls in parallel with Promise.all instead of awaiting one by one.
`,
  ),
  q(
    "javascript",
    "Why does var in a loop with setTimeout print the same value?",
    "Closures",
    "MEDIUM",
    `
What does this print, and how do you fix it to print 0, 1, 2?

\`\`\`
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
\`\`\`
`,
    `
- It prints 3, 3, 3. var is function-scoped, so all three callbacks close over the same i, which is 3 when they run.
- Fix 1: use let, which creates a new binding for each iteration:

\`\`\`
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 100);
\`\`\`

- Fix 2: an IIFE to capture the value: (function (j) { setTimeout(() => console.log(j), 100); })(i);
- Fix 3: pass it as an extra setTimeout argument: setTimeout(console.log, 100, i).
`,
    { company: "Zoho" },
  ),
  q(
    "javascript",
    "What is the difference between shallow copy and deep copy?",
    "Objects",
    "MEDIUM",
    `
How do you copy an object in JavaScript? What goes wrong with { ...obj } when obj has nested objects?
`,
    `
- Shallow copy copies only the top level; nested objects are still shared by reference. Ways: { ...obj }, Object.assign({}, obj), [...arr], arr.slice().

\`\`\`
const a = { name: "Ravi", address: { city: "Pune" } };
const b = { ...a };
b.address.city = "Delhi";
console.log(a.address.city); // "Delhi" - shared!
\`\`\`

- Deep copy duplicates all levels. Use structuredClone(obj) (handles Dates, Maps, cycles).
- JSON.parse(JSON.stringify(obj)) works for plain data but drops functions and undefined, and turns Dates into strings.
`,
  ),
  q(
    "javascript",
    "What is prototypal inheritance?",
    "Prototypes",
    "MEDIUM",
    `
How does inheritance work in JavaScript? Explain the prototype chain and how ES6 classes relate to it.
`,
    `
- Every object has an internal link [[Prototype]] to another object. Property lookups walk up this prototype chain until found or null is reached.
- Functions have a prototype property; objects created with new Fn() get Fn.prototype as their prototype.
- Methods are shared via the prototype, saving memory.

\`\`\`
const animal = { speak() { return "..."; } };
const dog = Object.create(animal);
dog.speak(); // found on animal
\`\`\`

- ES6 class and extends are syntax on top of prototypes: class Dog extends Animal sets Dog.prototype's prototype to Animal.prototype.
`,
  ),
  q(
    "javascript",
    "What are event bubbling, capturing and delegation?",
    "DOM",
    "MEDIUM",
    `
Explain how a click event travels through the DOM. What is event delegation and why is it useful for a list of 1,000 items?
`,
    `
- Events travel in three phases: capturing (window down to the target), target, then bubbling (back up to window).
- addEventListener listens in the bubbling phase by default; pass { capture: true } for capturing.
- event.stopPropagation() stops further travel; event.preventDefault() stops the default action (like form submit).
- Delegation: attach one listener to a parent and use event.target to find the clicked child:

\`\`\`
list.addEventListener("click", (e) => {
  const item = e.target.closest("li");
  if (item) select(item.dataset.id);
});
\`\`\`

- Fewer listeners and it works for items added later.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "javascript",
    "Implement a debounce function.",
    "Functions",
    "HARD",
    `
A search box calls an API on every keystroke. Write a debounce(fn, delay) function so the API is called only after the user stops typing for 300 ms. How is throttle different?
`,
    `
\`\`\`
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

input.addEventListener("input", debounce((e) => search(e.target.value), 300));
\`\`\`

- Each call resets the timer, so fn runs only once after calls stop for delay ms.
- The closure keeps timer between calls; apply keeps this and arguments.
- Throttle runs fn at most once every N ms during continuous events (scroll, resize), instead of waiting for them to stop.
`,
    { company: "Flipkart", role: "Frontend Developer" },
  ),
  q(
    "javascript",
    "Write a polyfill for Promise.all.",
    "Async",
    "HARD",
    `
Implement your own promiseAll(promises) that behaves like Promise.all: resolve with results in the original order, or reject as soon as any input rejects.
`,
    `
\`\`\`
function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const results = [];
    let done = 0;
    if (items.length === 0) return resolve(results);
    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value;   // keep original order
        done += 1;
        if (done === items.length) resolve(results);
      }, reject);             // first rejection wins
    });
  });
}
\`\`\`

- Promise.resolve handles non-promise values.
- Count completions instead of using results.length (sparse array).
- Related: allSettled never rejects, race settles with the first, any resolves with the first success.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "javascript",
    "Implement Function.prototype.bind from scratch.",
    "Functions",
    "HARD",
    `
Write myBind so that fn.myBind(obj, a)(b) calls fn with this = obj and arguments (a, b).
`,
    `
\`\`\`
Function.prototype.myBind = function (context, ...boundArgs) {
  const fn = this;
  return function (...args) {
    return fn.apply(context, [...boundArgs, ...args]);
  };
};

function greet(greeting, mark) { return greeting + ", " + this.name + mark; }
const hi = greet.myBind({ name: "Asha" }, "Hello");
hi("!"); // "Hello, Asha!"
\`\`\`

- this inside myBind is the original function.
- Supports partial application by merging bound and call-time arguments.
- A full polyfill also handles being called with new (then this should be the new object, not context).
`,
  ),
  q(
    "javascript",
    "How do memory leaks happen in JavaScript and how do you find them?",
    "Memory",
    "HARD",
    `
A single-page app gets slower the longer it stays open. What kinds of JavaScript code cause memory leaks, and how would you investigate?
`,
    `
- JavaScript is garbage collected: objects are freed when unreachable. Leaks happen when something keeps an unwanted reference.
- Common causes:
- Event listeners and setInterval timers never removed when a component unmounts.
- Detached DOM nodes still referenced from JS variables.
- Growing global caches or arrays (unbounded memoisation).
- Closures capturing large objects that live a long time.
- Fixes: removeEventListener / clearInterval in cleanup, AbortController for listeners and fetches, WeakMap/WeakRef for caches, limit cache size.
- Investigate with Chrome DevTools Memory: take heap snapshots before and after repeating an action and compare retained objects; use the Performance monitor for JS heap size.
`,
  ),
  q(
    "javascript",
    "Flatten a deeply nested array without using flat().",
    "Arrays",
    "HARD",
    `
Write a function flatten(arr) that turns [1, [2, [3, [4]], 5]] into [1, 2, 3, 4, 5] without using Array.prototype.flat.
`,
    `
Recursive:

\`\`\`
function flatten(arr) {
  const out = [];
  for (const item of arr) {
    if (Array.isArray(item)) out.push(...flatten(item));
    else out.push(item);
  }
  return out;
}
\`\`\`

Iterative with a stack (no recursion depth limit):

\`\`\`
function flattenIter(arr) {
  const stack = [...arr], out = [];
  while (stack.length) {
    const x = stack.pop();
    if (Array.isArray(x)) stack.push(...x);
    else out.push(x);
  }
  return out.reverse();
}
\`\`\`

- Built-in: arr.flat(Infinity). Time O(n) for n total elements.
`,
    { company: "Zoho" },
  ),

  // ---------------------------------------------------------------- TypeScript
  q(
    "typescript",
    "What is TypeScript and why use it over JavaScript?",
    "Basics",
    "EASY",
    `
What is TypeScript? What are the advantages and the costs of using it in a project?
`,
    `
- TypeScript is a superset of JavaScript that adds static types. It compiles (transpiles) to plain JavaScript.
- Advantages:
- Catches many bugs at compile time (typos, wrong argument types, null access).
- Better editor support: autocomplete, safe refactoring, go-to-definition.
- Types act as documentation for teams.
- Costs: a build step, learning curve, and type definitions to maintain.
- Types are erased at runtime, so you still need runtime validation for external data (API input).
`,
  ),
  q(
    "typescript",
    "What is the difference between interface and type?",
    "Types",
    "EASY",
    `
TypeScript has both interface and type aliases. What is the difference, and which would you use for an object shape?
`,
    `
- Both can describe object shapes and can usually be used interchangeably.
- interface:
- Can be extended with extends and re-opened (declaration merging), useful for library augmentation.
- Only describes object shapes.
- type:
- Can name any type: unions (type Status = "ok" | "error"), tuples, primitives, mapped and conditional types.
- Combined with & (intersection); cannot be re-opened.
- Common practice: interface for public object shapes, type for unions and computed types. Consistency within a codebase matters most.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "typescript",
    "What is the difference between any, unknown and never?",
    "Types",
    "EASY",
    `
Explain any, unknown and never. Why is unknown safer than any?
`,
    `
- any turns off type checking: you can do anything with it, and errors are missed.
- unknown accepts any value but you must narrow it (typeof, instanceof, a type guard) before using it:

\`\`\`
function len(x: unknown) {
  if (typeof x === "string") return x.length; // OK after narrowing
  return 0;
}
\`\`\`

- never means a value that can never exist: return type of a function that always throws or loops forever, and the type left after exhausting all union cases.
- Prefer unknown for untyped data like JSON.parse results or caught errors.
`,
  ),
  q(
    "typescript",
    "What are union and intersection types?",
    "Types",
    "EASY",
    `
Explain union (A | B) and intersection (A & B) types with an example of each.
`,
    `
- Union: a value can be one of several types.

\`\`\`
type Id = string | number;
type Status = "idle" | "loading" | "done";
\`\`\`

- You can only use members common to all options until you narrow.
- Intersection: a value has all properties of every type combined.

\`\`\`
type Timestamps = { createdAt: Date };
type User = { name: string };
type SavedUser = User & Timestamps; // has name and createdAt
\`\`\`

- Intersecting incompatible primitives gives never (string & number).
`,
  ),
  q(
    "typescript",
    "What are optional properties and readonly in TypeScript?",
    "Types",
    "EASY",
    `
What do the ? and readonly modifiers mean in an interface? What is the optional chaining operator?
`,
    `
\`\`\`
interface User {
  readonly id: number;
  name: string;
  phone?: string; // string | undefined
}
\`\`\`

- ? makes a property optional; its type includes undefined.
- readonly prevents re-assignment after creation (compile-time only, shallow).
- ReadonlyArray / readonly string[] prevents push and other mutations.
- Optional chaining user.address?.city returns undefined instead of throwing if address is null or undefined.
- Nullish coalescing user.phone ?? "N/A" gives a default for null or undefined only.
`,
  ),
  q(
    "typescript",
    "What are enums in TypeScript and what are the alternatives?",
    "Types",
    "EASY",
    `
How do enums work in TypeScript? Why do some teams prefer string literal unions instead?
`,
    `
\`\`\`
enum Role { Admin, User }        // numeric: 0, 1
enum Color { Red = "RED" }       // string enum
type RoleU = "ADMIN" | "USER";   // literal union
\`\`\`

- Numeric enums get reverse mappings and accept any number in some cases, which is less safe.
- Enums generate runtime JavaScript objects; unions are erased completely.
- Literal unions work well with plain strings from APIs and need no import.
- An "as const" object gives named constants plus a union type:
const ROLES = ["ADMIN", "USER"] as const; type R = (typeof ROLES)[number];
`,
  ),
  q(
    "typescript",
    "What is type inference in TypeScript?",
    "Basics",
    "EASY",
    `
When do you need to write type annotations in TypeScript, and when can the compiler work them out?
`,
    `
- Type inference: TypeScript works out types from values and usage.
- let count = 5 is inferred as number; const mode = "dark" is inferred as the literal "dark".
- Return types of functions are inferred from return statements.
- Callback parameters are inferred from context (arr.map(x => ...) knows x's type).
- Annotate: function parameters, public API return types, empty arrays/objects that will be filled (const ids: number[] = []), and values from untyped sources.
- Rely on inference elsewhere to keep code short.
`,
  ),
  q(
    "typescript",
    "What are generics? Write a generic function.",
    "Generics",
    "MEDIUM",
    `
What problem do generics solve? Write a function first(arr) that returns the first element of any array with the correct type.
`,
    `
- Generics let functions, classes and types work with many types while keeping type information, instead of using any.

\`\`\`
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
const n = first([1, 2, 3]);    // number | undefined
const s = first(["a", "b"]);   // string | undefined
\`\`\`

- Constraints limit what T can be:

\`\`\`
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
\`\`\`

- Common in API helpers (fetchJson<T>), React state (useState<User | null>) and collections.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "typescript",
    "What are the common utility types like Partial, Pick and Omit?",
    "Utility Types",
    "MEDIUM",
    `
Given interface User { id: number; name: string; email: string }, how would you type an update payload where all fields are optional, and a public view without email?
`,
    `
\`\`\`
type UserUpdate = Partial<User>;          // all optional
type PublicUser = Omit<User, "email">;    // id, name
type UserName = Pick<User, "id" | "name">;
\`\`\`

- Partial<T>: all properties optional. Required<T>: all required.
- Readonly<T>: all properties readonly.
- Pick<T, K> keeps keys; Omit<T, K> removes keys.
- Record<K, V>: object with keys K and values V, e.g. Record<string, number>.
- ReturnType<F>, Parameters<F>, Awaited<P>, NonNullable<T>, Exclude/Extract for unions.
`,
  ),
  q(
    "typescript",
    "What is type narrowing and what are type guards?",
    "Narrowing",
    "MEDIUM",
    `
How does TypeScript narrow a union type inside an if block? Write a user-defined type guard.
`,
    `
- Narrowing: TypeScript refines a type based on checks in control flow.
- Built-in narrowing: typeof x === "string", x instanceof Date, "swim" in animal, equality checks, truthiness checks.
- User-defined type guard with a "value is Type" return type:

\`\`\`
interface Fish { swim(): void }
interface Bird { fly(): void }

function isFish(a: Fish | Bird): a is Fish {
  return "swim" in a;
}
if (isFish(pet)) pet.swim(); else pet.fly();
\`\`\`

- Assertion functions (asserts x is T) narrow after a call that throws on failure.
`,
  ),
  q(
    "typescript",
    "What is a discriminated union and how do you make a switch exhaustive?",
    "Narrowing",
    "MEDIUM",
    `
Model a network request state that can be loading, success (with data) or error (with a message). How do you make sure every case is handled?
`,
    `
\`\`\`
type State =
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };

function render(s: State): string {
  switch (s.status) {
    case "loading": return "Loading...";
    case "success": return s.data.join(", ");
    case "error":   return s.message;
    default: {
      const never: never = s; // error if a case is missing
      return never;
    }
  }
}
\`\`\`

- The shared literal field (status) is the discriminant; checking it narrows the type.
- Assigning to never makes adding a new variant a compile error until handled.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "typescript",
    "What does the keyof and typeof operator do in types?",
    "Type Operators",
    "MEDIUM",
    `
Explain keyof and typeof at the type level. Write a type-safe getProperty(obj, key) function.
`,
    `
- keyof T gives a union of T's property names: keyof { a: 1; b: 2 } is "a" | "b".
- typeof value (in a type position) gets the type of a variable: const config = { port: 3000 }; type Config = typeof config.
- Indexed access T[K] gets a property's type.

\`\`\`
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "Ravi", age: 21 };
getProperty(user, "age");   // number
getProperty(user, "email"); // compile error
\`\`\`
`,
  ),
  q(
    "typescript",
    "What are type assertions and why are they risky?",
    "Types",
    "MEDIUM",
    `
What does "as" do in TypeScript, and how is it different from a type annotation? What is the non-null assertion operator (!)?
`,
    `
- An assertion (value as Type) tells the compiler to treat a value as a type. It does no runtime check or conversion.
- An annotation (const u: User = ...) asks the compiler to check that the value fits; an assertion overrides it.

\`\`\`
const el = document.getElementById("name") as HTMLInputElement;
const data = JSON.parse(text) as User; // trusted blindly
\`\`\`

- The ! operator (user!.name) asserts the value is not null/undefined.
- Risk: if you are wrong, you get runtime errors the compiler could have caught.
- Prefer narrowing or runtime validation (for example zod) for external data; use as const for literal types, which is safe.
`,
  ),
  q(
    "typescript",
    "How do you type a function that fetches JSON from an API safely?",
    "Generics",
    "MEDIUM",
    `
Write a typed helper fetchJson that returns a Promise of a given type. What is the weakness of simply writing fetchJson<User>(url)?
`,
    `
\`\`\`
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return (await res.json()) as T;
}
const user = await fetchJson<User>("/api/me");
\`\`\`

- Weakness: the generic is just an unchecked assertion. If the API changes, TypeScript still believes it is a User.
- Better: validate at the boundary with a schema library and infer the type from it:

\`\`\`
const UserSchema = z.object({ id: z.number(), name: z.string() });
type User = z.infer<typeof UserSchema>;
const user = UserSchema.parse(await res.json());
\`\`\`
`,
    { role: "Full Stack Developer" },
  ),
  q(
    "typescript",
    "What are mapped types? Implement your own Partial and Readonly.",
    "Advanced Types",
    "HARD",
    `
Explain mapped types. Write MyPartial<T> and MyReadonly<T>, and a type that makes every property of T nullable.
`,
    `
- A mapped type builds a new type by looping over keys with [K in keyof T].

\`\`\`
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type Nullable<T> = { [K in keyof T]: T[K] | null };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
\`\`\`

- Modifiers can be added (+?, +readonly) or removed (-?, -readonly).
- Key remapping with "as" can rename or filter keys:

\`\`\`
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
\`\`\`
`,
  ),
  q(
    "typescript",
    "What are conditional types and the infer keyword?",
    "Advanced Types",
    "HARD",
    `
Explain conditional types (T extends U ? X : Y). Implement your own ReturnType<F> using infer.
`,
    `
- Conditional types choose a type based on whether T is assignable to U.

\`\`\`
type IsString<T> = T extends string ? true : false;
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
type ElementOf<A> = A extends (infer E)[] ? E : never;

type R = MyReturnType<() => number>; // number
type E = ElementOf<string[]>;          // string
\`\`\`

- infer declares a type variable captured from the matched pattern.
- Distributive: on a naked type parameter, a union is split, e.g. Exclude<T, U> = T extends U ? never : T.
- Wrap in [T] extends [U] to stop distribution.
`,
  ),
  q(
    "typescript",
    "Explain structural typing in TypeScript.",
    "Type System",
    "HARD",
    `
Why does this compile even though p is not declared as a Point? When does TypeScript reject extra properties?

\`\`\`
interface Point { x: number; y: number }
const p = { x: 1, y: 2, z: 3 };
const q: Point = p;
\`\`\`
`,
    `
- TypeScript is structurally typed: compatibility depends on the shape, not the declared name. p has x and y, so it is assignable to Point.
- Extra properties are fine when assigning a variable, but an object literal assigned directly is checked for excess properties: const q: Point = { x: 1, y: 2, z: 3 } is an error, because the extra field is likely a typo.
- Nominal behaviour can be simulated with "branded" types:

\`\`\`
type UserId = string & { readonly __brand: "UserId" };
\`\`\`

- Contrast with Java/C#, which are nominally typed.
`,
  ),
  q(
    "typescript",
    "What is the difference between strict and non-strict TypeScript settings?",
    "Configuration",
    "HARD",
    `
What does "strict": true in tsconfig.json enable? Which of those flags catches the most bugs, and how would you migrate an old codebase to strict mode?
`,
    `
- strict turns on a family of checks, including:
- strictNullChecks: null and undefined are not assignable to other types; catches "cannot read property of undefined" bugs. Usually the most valuable.
- noImplicitAny: error when a type falls back to any.
- strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, useUnknownInCatchVariables, alwaysStrict.
- Extra useful flags: noUncheckedIndexedAccess (arr[i] may be undefined), noImplicitReturns.
- Migration: enable flags one at a time, fix errors module by module, use // @ts-expect-error sparingly with a ticket, and block new violations in CI.
`,
  ),
  q(
    "typescript",
    "How do variance and function parameter types work in TypeScript?",
    "Type System",
    "HARD",
    `
If Dog extends Animal, is (a: Animal) => void assignable to (d: Dog) => void? What about the reverse? Why?
`,
    `
- Return types are covariant: a function returning Dog can be used where one returning Animal is expected.
- Parameter types are contravariant (with strictFunctionTypes): a handler accepting Animal can be used where a handler for Dog is expected, because it can handle any Dog.
- So (a: Animal) => void is assignable to (d: Dog) => void, but not the reverse; a Dog-only handler might be given a Cat.
- Method shorthand in interfaces (handle(d: Dog): void) is checked bivariantly for compatibility, which is less safe; property syntax (handle: (d: Dog) => void) is checked strictly.
- Arrays are treated as covariant, which is unsound for writes but practical.
`,
  ),

  // ---------------------------------------------------------------- React
  q(
    "react",
    "What is the virtual DOM in React?",
    "Fundamentals",
    "EASY",
    `
What is the virtual DOM and why does React use it?
`,
    `
- The virtual DOM is a lightweight JavaScript description of the UI (a tree of React elements).
- When state changes, React renders a new tree and compares it with the previous one (reconciliation, or "diffing").
- It then applies only the minimal changes to the real DOM, which is slower to touch.
- Benefit: you write declarative UI ("what it should look like") and React handles efficient updates.
- It is not magic speed: hand-written DOM code can be faster, but the virtual DOM gives good performance with simpler code.
`,
    { company: "Infosys" },
  ),
  q(
    "react",
    "What is the difference between state and props?",
    "Fundamentals",
    "EASY",
    `
Explain state and props in React. Can a child component change its props?
`,
    `
- Props are inputs passed from parent to child; they are read-only for the child.
- State is data owned by a component that can change over time (useState / useReducer); changing it re-renders the component.
- A child cannot change props directly. To change parent data, the parent passes a callback prop (onChange) that the child calls.
- Data flows one way: down via props, events up via callbacks.
- Keep state minimal; derive other values from props/state during render.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "react",
    "What is JSX?",
    "Fundamentals",
    "EASY",
    `
What is JSX and what does it compile to? Why do we write className instead of class?
`,
    `
- JSX is a syntax extension that looks like HTML inside JavaScript.
- It compiles to function calls that create React elements, e.g. <h1 className="t">Hi</h1> becomes jsx("h1", { className: "t", children: "Hi" }) (older: React.createElement).
- Because it is JavaScript, attribute names follow DOM properties: className, htmlFor, onClick (camelCase).
- Embed expressions with { }, for example {user.name} or {items.map(...)}.
- A component must return a single root element; use a Fragment (<>...</>) to group without extra DOM.
- JSX escapes embedded strings, which helps prevent XSS.
`,
  ),
  q(
    "react",
    "Why are keys important when rendering lists in React?",
    "Lists",
    "EASY",
    `
Why does React warn "Each child in a list should have a unique key prop"? Why is using the array index as key a problem?
`,
    `
- Keys tell React which item is which between renders, so it can reuse, move or remove the right DOM nodes and component state.
- Keys must be unique among siblings and stable over time; use an id from the data.

\`\`\`
{todos.map((t) => <TodoItem key={t.id} todo={t} />)}
\`\`\`

- Index as key breaks when items are inserted, removed or re-ordered: state (like input text or a checkbox) stays with the position and appears on the wrong item.
- Index is acceptable only for static lists that never change order.
`,
  ),
  q(
    "react",
    "What are controlled and uncontrolled components?",
    "Forms",
    "EASY",
    `
Explain controlled vs uncontrolled form inputs in React with a short example of each.
`,
    `
- Controlled: the input's value comes from React state, and onChange updates the state. React is the single source of truth.

\`\`\`
const [name, setName] = useState("");
<input value={name} onChange={(e) => setName(e.target.value)} />
\`\`\`

- Uncontrolled: the DOM keeps the value; you read it with a ref (or FormData) when needed.

\`\`\`
const ref = useRef(null);
<input defaultValue="" ref={ref} />  // later: ref.current.value
\`\`\`

- Controlled suits instant validation and dependent fields; uncontrolled is simpler and used by libraries like react-hook-form for performance.
`,
  ),
  q(
    "react",
    "What is the useState hook and how do state updates work?",
    "Hooks",
    "EASY",
    `
What does this button show after one click, and why? How do you fix it to add 3?

\`\`\`
const [count, setCount] = useState(0);
const add3 = () => { setCount(count + 1); setCount(count + 1); setCount(count + 1); };
\`\`\`
`,
    `
- It shows 1. count is a constant snapshot (0) for this render, so all three calls set 0 + 1.
- State updates are batched and applied on the next render; setCount does not change count immediately.
- Fix with the updater function, which receives the latest pending value:

\`\`\`
setCount((c) => c + 1);
setCount((c) => c + 1);
setCount((c) => c + 1); // 3
\`\`\`

- Use the updater form whenever the new state depends on the previous one.
- Never mutate state objects; create new ones ({ ...obj, x: 1 }).
`,
    { role: "Frontend Developer" },
  ),
  q(
    "react",
    "What are fragments and why use them?",
    "Fundamentals",
    "EASY",
    `
What is React.Fragment (<>...</>)? When do you need the long form <Fragment key={...}>?
`,
    `
- A Fragment groups several children without adding an extra DOM element.
- Useful because a component must return one root, and extra <div>s can break layouts (for example inside a table <tr> or a flex/grid container) and add DOM size.

\`\`\`
return (
  <>
    <td>{name}</td>
    <td>{age}</td>
  </>
);
\`\`\`

- The short syntax cannot take props. Use <Fragment key={item.id}> when rendering fragments in a list.
`,
  ),
  q(
    "react",
    "Explain the useEffect hook and its dependency array.",
    "Hooks",
    "MEDIUM",
    `
When does useEffect run with no dependency array, with [] and with [userId]? What is the cleanup function for?
`,
    `
- useEffect runs side effects after the render is committed to the screen.
- No array: after every render.
- []: once after the first mount (twice in development Strict Mode, to expose missing cleanup).
- [userId]: after mount and whenever userId changes.
- The returned function is cleanup: it runs before the effect re-runs and on unmount.

\`\`\`
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
\`\`\`

- List every reactive value used inside; missing deps cause stale values. Do not use effects for values you can compute during render.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "react",
    "What is the difference between useMemo and useCallback?",
    "Performance",
    "MEDIUM",
    `
Explain useMemo and useCallback. When are they actually useful, and when are they wasted effort?
`,
    `
- useMemo(() => compute(a, b), [a, b]) caches a computed value until deps change.
- useCallback(fn, [deps]) caches a function reference; it equals useMemo(() => fn, deps).
- Useful when:
- A calculation is expensive (filtering/sorting thousands of items).
- A value or function is passed to a child wrapped in React.memo, so a stable reference avoids re-rendering.
- A value is a dependency of another hook (useEffect) and must not change every render.
- Wasted when used on cheap computations or on props to non-memoised children; they add overhead and complexity.
- The React Compiler can memoise automatically in newer setups.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "react",
    "What is prop drilling and how do you avoid it?",
    "State Management",
    "MEDIUM",
    `
A theme value is passed through five levels of components that do not use it. What is this problem called and what are the solutions?
`,
    `
- Prop drilling: passing props through intermediate components only to reach a deep child.
- Solutions:
- Context API: createContext + a Provider high up + useContext in the consumer.
- Component composition: pass the child element itself (children or slot props) so middle layers do not need the data.
- State libraries (Redux Toolkit, Zustand) for complex global state; TanStack Query for server data.
- Caution: every consumer re-renders when a context value changes, so split contexts and memoise the value object.
- Drilling two or three levels is fine; do not reach for global state too early.
`,
  ),
  q(
    "react",
    "What are custom hooks? Write one.",
    "Hooks",
    "MEDIUM",
    `
What is a custom hook? Write useFetch(url) that returns { data, loading, error }.
`,
    `
- A custom hook is a function starting with "use" that calls other hooks, to reuse stateful logic between components. Each call has its own state.

\`\`\`
function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    const ctrl = new AbortController();
    setState({ data: null, loading: true, error: null });
    fetch(url, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== "AbortError") setState({ data: null, loading: false, error });
      });
    return () => ctrl.abort();
  }, [url]);
  return state;
}
\`\`\`

- Abort prevents setting state from a stale request when url changes.
`,
    { company: "Flipkart", role: "Frontend Developer" },
  ),
  q(
    "react",
    "What are the rules of hooks?",
    "Hooks",
    "MEDIUM",
    `
What are the rules of hooks, and why does React need them? What breaks if you call useState inside an if statement?
`,
    `
- Rule 1: Call hooks only at the top level of a component or custom hook, not inside conditions, loops or nested functions.
- Rule 2: Call hooks only from React function components or custom hooks, not regular functions or class components.
- Why: React stores hook state in a list per component and matches each call by its order. If a condition skips a hook, every following hook reads the wrong state.
- Put the condition inside the hook instead (if (!id) return; inside useEffect).
- The eslint-plugin-react-hooks enforces these rules and checks effect dependencies.
`,
  ),
  q(
    "react",
    "What is React.memo and when does a component re-render?",
    "Performance",
    "MEDIUM",
    `
List what causes a React component to re-render. How does React.memo change that?
`,
    `
- A component re-renders when:
- Its own state changes.
- Its parent re-renders (by default, even if props are the same).
- A context it uses changes.
- React.memo(Component) skips re-rendering when props are shallowly equal to the previous props.
- It does not help if you pass new object/array/function references each render; stabilise them with useMemo/useCallback.
- Re-rendering is not the same as DOM updates; React only touches the DOM if output changed. Optimise only measured slow spots (React DevTools Profiler).
`,
    { role: "Frontend Developer" },
  ),
  q(
    "react",
    "How does useRef differ from useState?",
    "Hooks",
    "MEDIUM",
    `
What is useRef used for? Why does changing ref.current not re-render the component?
`,
    `
- useRef returns a mutable object { current } that persists across renders.
- Changing ref.current does not trigger a re-render, unlike setState.
- Uses:
- Accessing DOM nodes: inputRef.current.focus().
- Storing values that do not affect what is shown: timer ids, previous value, AbortController, a flag for "is mounted".
- Do not read or write ref.current during rendering for values shown on screen; use state for those.
- Refs are the escape hatch to the imperative world.
`,
  ),
  q(
    "react",
    "How does React reconciliation decide what to update?",
    "Rendering",
    "HARD",
    `
Explain React's diffing algorithm. What happens to a component's state when its element type changes at the same position, for example from <Input /> to <TextArea />?
`,
    `
- A full tree diff is O(n^3), so React uses heuristics for O(n):
- Different element types at the same position: React destroys the old subtree (unmounting and losing state) and builds a new one.
- Same type: React keeps the instance/DOM node and updates only changed attributes/props, then recurses into children.
- In lists, keys match children between renders.
- So switching from <Input /> to <TextArea /> resets state. Even the same component moved to a different position in the tree loses state.
- Changing a key on purpose (key={userId}) is a common trick to reset a component's state.
- Fiber splits rendering work into units so React can pause and prioritise updates.
`,
    { role: "Frontend Developer" },
  ),
  q(
    "react",
    "How would you optimise a slow React list of 10,000 rows?",
    "Performance",
    "HARD",
    `
A dashboard renders a table of 10,000 rows with a search box. Typing in the search box is laggy. How do you diagnose and fix it?
`,
    `
- Measure first with React DevTools Profiler and the browser Performance tab.
- Fixes:
- Virtualise the list (react-window, TanStack Virtual): render only the 20-50 visible rows.
- Debounce the search input, or use useDeferredValue / useTransition so typing stays responsive while the filtered list renders at lower priority.
- Memoise the filtered result with useMemo([items, query]).
- Wrap Row in React.memo and pass stable props (ids, memoised callbacks); use stable keys.
- Keep input state local so typing does not re-render the whole page.
- Paginate or filter on the server if data keeps growing.
`,
    { company: "Flipkart", role: "Frontend Developer" },
  ),
  q(
    "react",
    "What are error boundaries in React?",
    "Error Handling",
    "HARD",
    `
What is an error boundary? Which errors does it catch and which does it not? Show how one is written.
`,
    `
- An error boundary catches errors thrown while rendering its child tree and shows a fallback UI instead of crashing the whole app.
- It must be a class component using getDerivedStateFromError and/or componentDidCatch (or the react-error-boundary library):

\`\`\`
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { logError(error, info); }
  render() { return this.state.hasError ? <p>Something went wrong.</p> : this.props.children; }
}
\`\`\`

- It does not catch errors in event handlers, async code (setTimeout, promises), server rendering, or inside itself. Use try/catch there.
`,
  ),
  q(
    "react",
    "What is the difference between CSR, SSR and SSG in React apps?",
    "Rendering",
    "HARD",
    `
Compare client-side rendering, server-side rendering and static site generation (for example in Next.js). What is hydration?
`,
    `
- CSR: the server sends an almost empty HTML plus JS; the browser builds the UI. Simple hosting, but slower first paint and weaker SEO.
- SSR: the server renders HTML for each request, so content appears quickly and is crawlable; costs server time per request.
- SSG: HTML is generated at build time and served from a CDN; fastest, but data is only as fresh as the last build (ISR can revalidate periodically).
- Hydration: React attaches event handlers and state to server-rendered HTML in the browser. Mismatches between server and client output cause warnings and re-rendering.
- React Server Components render on the server and send no JS for those components.
`,
    { role: "Full Stack Developer" },
  ),
  q(
    "react",
    "How does useEffect cause infinite loops, and how do you fix them?",
    "Hooks",
    "HARD",
    `
Why does this component keep re-rendering forever? Fix it.

\`\`\`
function Profile({ id }) {
  const [user, setUser] = useState(null);
  const options = { id };
  useEffect(() => {
    fetchUser(options).then(setUser);
  }, [options]);
  return <p>{user?.name}</p>;
}
\`\`\`
`,
    `
- options is a new object on every render, so the dependency always looks changed. The effect runs, sets state, re-renders, creates a new options, and repeats.
- Fix: depend on primitives, and create the object inside the effect:

\`\`\`
useEffect(() => {
  let ignore = false;
  fetchUser({ id }).then((u) => { if (!ignore) setUser(u); });
  return () => { ignore = true; };
}, [id]);
\`\`\`

- Other options: useMemo for the object, or move constants outside the component.
- The ignore flag avoids race conditions when id changes quickly.
- For real apps, a data-fetching library (TanStack Query) handles caching and races.
`,
    { role: "Frontend Developer" },
  ),
];

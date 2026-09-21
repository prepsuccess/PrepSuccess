# styles

Global styles live in `app/globals.css` (Tailwind entry point + color tokens),
since Next.js requires the global stylesheet to be imported from `app/layout.tsx`.
This folder holds any additional shared stylesheets (e.g. print styles,
third-party CSS overrides) that aren't Tailwind utility classes or
component-scoped styles.

# CMS Admin Platform — Design Spec

## Context

The portfolio site (`laflamme-studio-portfolio` GitHub repo, currently deployed
to GitHub Pages at `christopherlaflamme-ai.github.io/laflamme-studio-portfolio/`)
is a fully static Webflow export. It has no build step and no backend: every
project page was hand-generated (by Claude, via one-off Python scripts) from
content pulled off the still-live `laflammestudio.webflow.io` staging site,
after the original `laflamme.studio` Webflow-hosted production site went down.

The owner (Christopher Laflamme) wants to be able to add/edit/remove projects
and categories himself, going forward, without asking Claude to hand-write
HTML each time — via a real login-gated admin interface, with the ability to
mark certain projects as "featured" so they surface first on the homepage and
in the full portfolio grid, and to filter the portfolio grid by category tags.

He owns a custom domain through GoDaddy that currently is not pointed
anywhere in particular for this project; it will be repointed to the new host
as the final step of this work.

## Goals

1. A real, invite-only login (not a client-side password check that anyone
   viewing page source could bypass).
2. An admin UI to create/edit/delete **projects** (title, categories, client,
   year, images, description, live-version link, featured flag + order) and
   **categories** (name/slug), without hand-editing HTML or JSON.
3. Featured projects surface first in two places: the homepage's existing
   (currently empty) featured-projects section, and the top of the full
   portfolio grid.
4. The portfolio grid gets a multi-select category tag filter bar (OR logic
   across selected tags), driven by the same category data the admin UI
   manages.
5. Zero recurring dollar cost.
6. The existing visual design (HTML structure, CSS, fonts, JS) is preserved
   exactly — this is a content/tooling change, not a redesign.
7. A bad edit in the admin UI must never be able to take the live site down.

## Non-goals

- Dedicated per-category landing pages (e.g. `/categories/web-design`) — the
  category tags are an in-page client-side filter on the portfolio grid only.
- Multi-user accounts / roles — single admin (Christopher) only.
- Comments, analytics, or any feature beyond project/category content
  management and featured ordering.
- Redesigning the visual look of the site.

## Architecture

The current repo is flat, hand-authored HTML/CSS/JS with no templating and no
build step. That is the root blocker for "add a project without asking
Claude to write HTML," so this design introduces a small static site
generator layer on top of the existing markup, plus a git-backed CMS for
content editing:

```
Admin (browser)
   -> logs into /admin (Decap CMS UI, auth via DecapBridge)
   -> edits a Project or Category entry, uploads images
   -> Decap CMS commits the change to the GitHub repo (via DecapBridge's git proxy)
        -> content/projects/<slug>.md   (or content/categories/<slug>.md)
        -> images committed under images/projects/<slug>/
GitHub
   -> push triggers a Netlify build hook
Netlify
   -> runs `npx @11ty/eleventy` to regenerate the static site from
      content/ + the Eleventy templates
   -> deploys the new build (or keeps the last good deploy if the build fails)
Visitor (browser)
   -> sees the updated homepage / portfolio grid / project page
```

- **Content storage**: Markdown files with YAML front matter, one file per
  project under `content/projects/`, one per category under
  `content/categories/`. This is the single source of truth — no separate
  database.
- **Site generator**: [Eleventy](https://www.11ty.dev/) (11ty), a minimal
  Node-based static site generator with no opinionated framework baggage. It
  reads the `content/` files and existing `css/`, `js/`, `fonts/`, `images/`
  assets unchanged, and renders HTML through templates derived directly from
  the current hand-written pages (same classes, same structure — visually a
  no-op).
- **Admin UI**: [Decap CMS](https://decapcms.org/) (MIT-licensed, free), a
  ready-made content-editing UI that reads its schema from
  `admin/config.yml` and needs no custom backend code.
- **Auth**: [DecapBridge](https://decapbridge.com/) (free tier), the current
  standard replacement for Netlify Identity + Git Gateway (which is being
  deprecated for this exact use case). Christopher's email is the only
  invited account.
- **Hosting**: [Netlify](https://netlify.com) free tier, connected directly
  to the GitHub repo, auto-building on every push (including pushes made by
  Decap CMS itself).
- **Domain**: Christopher's existing GoDaddy domain, repointed to Netlify via
  DNS (CNAME/A records) as the last step, once the Netlify-hosted site is
  fully verified.

## Content schema

### `content/projects/<slug>.md`

```yaml
---
title: Amulet
slug: amulet
type_of_work: Academic work
categories:
  - Product and Packaging Design
  - Visual Identity
client: Amulet
year: 2024
live_url: ""                 # optional; hidden on the page when blank
hero_image: /images/projects/amulet/amulet-01.jpg
gallery_1:
  - /images/projects/amulet/amulet-03.png
  - /images/projects/amulet/amulet-04.png
gallery_2:
  - /images/projects/amulet/amulet-08.jpg
  - /images/projects/amulet/amulet-09.jpg
featured: false
featured_order: null         # only read when featured: true
---
Rich text description (Markdown) — becomes the case-study body copy.
```

`slug` doubles as the identifier Decap CMS uses and the URL segment
(`/projects/<slug>/`). Eleventy generates one page per file automatically —
adding a new Markdown file (via the CMS) is sufficient to publish a new
project page; no template changes are needed per project.

### `content/categories/<slug>.md`

```yaml
---
name: Visual Identity
slug: visual-identity
---
```

Every project's `categories` field is validated/autocompleted against this
list in the Decap CMS form (a multi-select checklist), and the same list
drives the filter tag bar rendered above the portfolio grid.

## Featured-project ordering

- Any project with `featured: true` is:
  1. Included in the homepage's featured-projects section
     (`index.html`, the section immediately after the hero).
  2. Sorted to the front of the full portfolio grid (`portfolio.html`).
- Among featured projects, `featured_order` (ascending, smaller = earlier)
  controls relative order; a null/tied value falls back to `year` descending
  (newest first).
- Non-featured projects fill the rest of the portfolio grid, sorted by
  `year` descending. They do not appear in the homepage featured section.

## Category tag filter (portfolio grid)

- A row of tag buttons is rendered above the project grid on
  `portfolio.html`, one per entry in `content/categories/`.
- Multi-select, **OR logic**: selecting more than one tag shows any project
  matching *at least one* selected category. A "Clear/All" control resets to
  the unfiltered grid.
- Pure client-side: each project grid item carries a `data-categories`
  attribute (its category slugs); a small vanilla-JS handler toggles a
  `hidden`/visibility class on grid items based on the active tag set. No
  page reload, no server round-trip, no separate per-category URLs.

## Admin UI

At `<domain>/admin`:
- Login screen (DecapBridge) — only Christopher's invited email can sign in.
- Sidebar with two collections:
  - **Projects** — list view of all entries; each opens a form matching the
    schema above (text fields, a categories checklist, image upload widgets
    for hero/gallery images, a Markdown editor for the description, a
    Featured checkbox, and a Featured order number field shown only when
    Featured is checked).
  - **Categories** — simple list of name/slug entries; adding one here makes
    it selectable on every project form and adds a new filter tag on the
    live portfolio grid.
- Saving commits directly to the GitHub repo; the live site updates roughly
  1-2 minutes later once Netlify's build completes.

## Error handling

- **Netlify build failures** (e.g. a malformed content file) never take the
  live site down — Netlify's default behavior keeps serving the last
  successful deploy and emails a build-failure notice. No extra tooling is
  built for this; it is Netlify's out-of-the-box behavior.
- **Required-field / duplicate-slug validation** happens in the Decap CMS
  form config before a save is even possible.
- **Auth** is fully delegated to DecapBridge; there is no custom
  password-check code to secure or maintain.
- **Image weight**: uploaded images keep the same size/format discipline
  already used for the migrated projects (no separate optimization pipeline
  is being built in this phase).

## Migration of existing content

The 21 project pages already hand-built (in `projects/*.html`, with images
under `images/projects/<slug>/`) get converted into
`content/projects/<slug>.md` front-matter + Markdown body, reusing the
already-downloaded images in place. `portfolio.html`'s grid and the
homepage's featured-projects section are rebuilt as Eleventy templates over
this same content, replacing their current empty-placeholder / hand-authored
states.

## Testing plan

1. After the Netlify site is building successfully from Eleventy + the
   migrated content, spot-check a handful of the 21 project pages against
   the current live GitHub Pages site to confirm no visual regression.
2. Log into `/admin` on the Netlify preview URL, create a real test project
   (image, category, `featured: true`), verify it appears correctly: in the
   homepage featured section, at the front of the portfolio grid, and
   filterable via its category tag — then delete the test entry.
3. Only after both checks pass, repoint the GoDaddy domain's DNS to Netlify,
   so the live custom domain is never at risk during the switch.

## Open items deferred to implementation

None — this spec is considered complete and ready to plan against.

# Synth website

Astro product website for Synth, deployed through GitHub Pages.

## Local preview

Install dependencies and start Astro:

```bash
pnpm install
pnpm dev
```

Then visit the local URL Astro prints, usually <http://localhost:4321>.

## GitHub Pages setup

The repository includes `.github/workflows/pages.yml`. In GitHub:

1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main` or run the workflow manually.

The site is configured for root serving (`base: "/"`), including local development. Set `SITE_URL` in CI when the final production domain is ready. If this remains a GitHub project page without a custom domain, change `base` to `/synth-website/` because GitHub will serve it below that path.

The product CTA links to the deployed Synth workspace at `https://app.synth.absmach.eu/login`.

## Design and content

The site follows the conversational PCB creation concept in
`../synth-ee/docs/product/design-concept`, reviewed at commit
`7a7ee77d1585f2ed0ae4b657c87ba84da98a6097` (October 6, 2026).

The visitor journey mirrors the new product direction: start with an idea on
Home, develop the board beside a persistent conversation, then open engineering
details when needed. The visual language is white and cool gray, near-black
text, a blue accent, and locally hosted DM Sans.

- The homepage prompt carries an idea into the interactive concept. Example
  suggestions fill the prompt; they do not start generation automatically.
- Workspace tabs show the new Home, board with chat, perspective illustration,
  and optional Source view, using unmodified concept captures.
- Source, Parts/BOM, Connections, physical settings, Checks, and Versions appear
  as optional depth. The compiler, MCP and KiCad foundations sit below the
  creation experience.
- The live application, design concept, and open-source compiler have distinct
  destinations. Enterprise support is a secondary contact path.

## Interactive concept

`public/preview/` contains the new concept’s runtime and assets. The native
Astro entry at `src/pages/preview.astro` serves it at `/preview/`. Its generation and replies are simulated; prompts use a bundled
example. Drawings are illustrative, and it does not create manufacturing files
or call model, compiler, account, or supplier services. The real source and
reference BOM are available for inspection.

The homepage sends `?idea=` to the preview. A small bridge transfers up to 2,000
characters into the Home prompt, removes the query parameter, and focuses the
input without submitting it. Prototype projects remain in this browser under
`synth-website-concept-projects-v1`; they do not sync to a live Synth account.

The copied prototype retains its notices and export restrictions, includes a
return link, and is marked `noindex, nofollow`. See
`public/preview/PROVENANCE.txt` for its source revision, asset inventory, and
website-specific changes. Font and source licenses are included alongside the
assets. The previous cockpit recording is no longer promoted by the homepage.

Product claims are grounded in the sibling `synth` and `synth-ee` repositories.
The new prototype changes product presentation; its compiler and production
integration remain separate. No performance, autonomous-generation, or
manufacturing-readiness claims are inferred from the prototype.

Earlier competitive research considered [Synth](https://www.absmach.eu/synth/),
[DeepPCB](https://deeppcb.ai/), [Quilter](https://www.quilter.ai/),
[Diode](https://www.diode.computer/), [Trace](https://buildwithtrace.com/),
[Flux](https://www.flux.ai/p), and [atopile](https://github.com/atopile/atopile).
The site does not claim that open-source circuit compilers or AI review are
exclusive to Synth.

## Verification

```bash
pnpm check
pnpm build
```

With dependencies already installed, `npm run dev`, `npm run check`, and
`npm run build` work as well. Set `SITE_URL` to the public website URL before release
so canonical and social metadata identify the intended deployment.

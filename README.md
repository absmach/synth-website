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

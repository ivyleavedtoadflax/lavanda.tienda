# lavanda.tienda

Shop for lavender direct from the grower in Osset (Andilla), la Serranía, inland Valencia: bagged lavender flowers and lavender-picking days. Spanish at `/`, English at `/en/`.

Same build as [mattupson.com](https://github.com/ivyleavedtoadflax/matt-upson-site): Astro, static, GitHub Pages.

## Editing

- **Contact details, products, prices:** `src/lib/site.ts`. Every `TODO` there is a placeholder to replace before launch.
- **Page copy:** the `t = { es, en }` block at the top of each page in `src/pages/[...lang]/`. One file builds both languages.
- **Orders and bookings** have no checkout. Buttons open WhatsApp or email with the message pre-filled.

## Development

```sh
npm install
npm run dev       # localhost:4321
npm run build     # ./dist/
```

## Deployment

The `main` branch deploys to `gh-pages` (`.github/workflows/deploy.yml`). Each PR gets a preview at `https://lavanda.tienda/pr-preview/pr-<n>/` (`.github/workflows/pr-preview.yml`). Internal links must go through `url()` from `src/lib/url.ts`, or they leave the preview.

Infrastructure lives in [cloudflare-tf](https://github.com/ivyleavedtoadflax/cloudflare-tf), `apps/lavanda-tienda/`:

- this repo itself, plus its Pages settings
- DNS: GitHub Pages' A and AAAA records and `www`, unproxied
- Email Routing's MX, SPF and DKIM records

`public/CNAME` keeps the custom domain in every build.

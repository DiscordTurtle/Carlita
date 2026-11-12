# Deployment — free hosting options

The site is a plain Vite build (`npm run build` → `frontend/dist/`). No backend, no server needed. Any static host works.

---

## Option 1 — Vercel (recommended)

**Free tier:** unlimited personal projects, custom domain, auto HTTPS.  
**Redeploy:** push to `main` → live in ~30 seconds automatically.

### First deploy

1. Push this repo to GitHub (if not already).
2. Go to [vercel.com](https://vercel.com) → Import Project → pick the repo.
3. Set **Root Directory** to `frontend`.
4. Framework preset: **Vite** (auto-detected).
5. Click Deploy.

### Redeploy

Just `git push`. Vercel redeploys on every push to `main` automatically.  
Or: Vercel dashboard → Deployments → Redeploy (one click, no push needed).

---

## Option 2 — Netlify

**Free tier:** 100GB bandwidth/month, custom domain, auto HTTPS.  
**Redeploy:** same as Vercel — push to `main` or drag-and-drop the `dist/` folder.

### First deploy (drag-and-drop, fastest)

1. `cd frontend && npm run build`
2. Go to [netlify.com](https://netlify.com) → Sites → drag the `frontend/dist/` folder onto the page.
3. Done. You get a `*.netlify.app` URL immediately.

### Git-connected deploy (auto-redeploy)

1. Netlify → Add new site → Import from Git → pick repo.
2. Base directory: `frontend`, Build command: `npm run build`, Publish directory: `frontend/dist`.
3. Every push to `main` redeploys automatically.

---

## Option 3 — Cloudflare Pages

**Free tier:** unlimited requests, fastest CDN globally, custom domain.

1. Cloudflare dashboard → Pages → Create a project → Connect to Git.
2. Build command: `npm run build`, Build output: `dist`, Root: `frontend`.
3. Push to redeploy.

---

## Vite config note for subdirectory deploys

If Vercel/Netlify puts the site at the repo root (they usually do with the `frontend` root dir set), no changes needed.  
If the site ever ends up at a subpath (e.g. `yourname.github.io/Carlita/`), add this to `frontend/vite.config.js`:

```js
base: '/Carlita/'
```

---

## Quick redeploy cheatsheet

| Platform | Auto on push | Manual (no push) |
|---|---|---|
| Vercel | ✅ | Dashboard → Redeploy |
| Netlify | ✅ | Drag new `dist/` folder OR dashboard → Trigger deploy |
| Cloudflare Pages | ✅ | Dashboard → Retry deployment |

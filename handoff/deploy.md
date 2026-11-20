# Deploy Handoff

## Goal
Get the Carlita game live on Vercel. The deploy branch is ready; what remains is finishing the Vercel project setup and merging.

## Repo
GitHub: `DiscordTurtle/Carlita`  
Active branch: `deploy` (3 commits ahead of `main`)

## What's already done
- `frontend/vercel.json` committed on `deploy` branch — sets framework, build command, output dir
- Case-sensitive import bug fixed (`autotile.js` casing) — was breaking the Linux build
- Vercel MCP added to this Claude Code session (`claude mcp add --transport http vercel https://mcp.vercel.com`)

## What still needs to happen

### 1. Vercel project settings — Root Directory
The Vercel project was imported with Root Directory = `./` (repo root).  
It must be changed to `frontend`.

**Via Vercel MCP** (preferred — use the vercel MCP tools available in this session):
- Find the project (name: `carlita-frontend` or similar)
- Update root directory to `frontend`
- Trigger a redeploy from the `deploy` branch

**Or manually**: vercel.com → Project → Settings → General → Root Directory → `frontend` → Save → Deployments → Redeploy.

### 2. Confirm build passes
Expected successful build output ends with:
```
✓ N modules transformed.
dist/index.html
dist/assets/...
```
No errors. The two entry points are `index.html` (main game) and `scene-builder.html` (dev tool).

### 3. Merge deploy → main
Once the Vercel preview URL works:
```
git checkout main
git merge deploy
git push origin main
```
After merge, every future `git push origin main` auto-redeploys.

## Project structure (what Vercel builds)
```
frontend/          ← Root Directory in Vercel
  vercel.json      ← framework: vite, buildCommand: npm run build, outputDirectory: dist
  package.json
  vite.config.js   ← builds index.html + scene-builder.html
  public/
    scenes/        ← static JSON files loaded by the game (Cristian_Tree.json, Parkour.json, world-picker.json)
    sprites/       ← gitignored (~8000 Growtopia sprites, NOT present on Vercel — game degrades gracefully)
  src/
```

## Known non-issues
- `/api/scenes` (SceneBuilder save/load) doesn't work on Vercel — local dev tool, main game never calls it
- Missing sprites show broken images for block tiles — expected, sprites are gitignored by design
- `scene-builder.html` deploys but its save/delete buttons won't work in production — fine

## If the build fails again
Most likely cause: another case-sensitive import. Linux is case-sensitive, Windows is not.  
Run `grep -rn "from '\.\." frontend/src --include="*.jsx" --include="*.js"` and cross-check each imported filename against the actual file on disk.

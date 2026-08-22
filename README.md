# GitHub Profile Fetcher (Vercel)

A GitHub profile lookup tool: static frontend + serverless backend, deployed entirely on Vercel's free tier — no card required.

Search any GitHub username and get back their bio, follower count, total stars/forks across all repos, top languages, and top repos.

## How it's structured

```
index.html                    # frontend (static, served as-is)
api/profile/[username].js     # serverless function — the actual API
lib/githubService.js          # shared logic: calls GitHub's REST API, aggregates stats
vercel.json                   # tells Vercel which runtime to use for the function
```

Vercel automatically treats anything in `/api` as a serverless function and serves
everything else as static files. No Express server needed — `[username].js` is a
dynamic route, so a request to `/api/profile/torvalds` runs that function with
`req.query.username === "torvalds"`.

## Deploy it (no CLI, no laptop needed)

1. Push this whole folder to a GitHub repo (same process as before — unzip on your
   phone, upload the contents to a new repo, e.g. `github-profile-fetcher-vercel`)
2. Go to **vercel.com** → sign in with GitHub → **Add New → Project**
3. Select your repo → Vercel auto-detects the `/api` folder → click **Deploy**
4. Wait ~30 seconds. You'll get a live link like `github-profile-fetcher.vercel.app`

That's it — no billing info, no server to manage, no separate backend host.

## Optional: raise the GitHub API rate limit

Unauthenticated requests are capped at 60/hour, which is plenty for testing. If you
want more, generate a token at github.com/settings/tokens (no scopes needed), then in
your Vercel project: **Settings → Environment Variables** → add `GITHUB_TOKEN` → redeploy.

## Testing it once live

Try usernames like `torvalds`, `sindresorhus`, `gaearon`, `octocat`, or your own
(`muizayo6`). Also try a nonsense username to confirm the "user not found" error path
works.

## Local development (optional)

If you get back on your PC and want to test before deploying:

```bash
npm install -g vercel
vercel dev
```

This runs the same serverless setup locally at `http://localhost:3000`.

## License

MIT

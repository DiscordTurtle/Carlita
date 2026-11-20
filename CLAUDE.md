# Carlita — project notes for Claude

## Deployment

After every production deployment to the `carlita` Vercel project (team `team_56jkOYxvf48N4q2g6yXkZoZE`, project `prj_baUnuBIGjg3PUVMLNHcKHCkQ5oyN`), reassign the alias:

```
mcp__vercel__assign_alias(id=<new deployment id>, alias="carlita-draga-mea.vercel.app")
```

Vercel only auto-updates `carlita-xiao-wei.vercel.app`; the custom alias must be pinned manually each time.

## After every code change

After every implementation (commit or batch of commits), always:
1. `git push origin deploy`
2. Trigger a new Vercel production deployment (project `prj_baUnuBIGjg3PUVMLNHcKHCkQ5oyN`, team `team_56jkOYxvf48N4q2g6yXkZoZE`, branch `deploy`)
3. Reassign alias `carlita-draga-mea.vercel.app` to the new deployment

Testing only happens on the live deployment — never ask the user to test locally.

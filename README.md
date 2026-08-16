# bryanbirth

Old Twitter style · light / normal / dark · Supabase backend

## 1. Run SQL
Open Supabase SQL Editor and run `setup.sql` (creates tables + Tomodachi admin).

## 2. Logo
`assets/logo.png` is included. Replace if you want.

## 3. Run site
```bash
cd bryanbirth
python -m http.server 8080
```

## Admin
- User: **Tomodachi**
- Password: **euteamo123**
- Can delete posts, remove image/video from posts, ban users

## Rate limit
- 8h between posts
- Spam retries → ~1000 years lock
- Clock rollback → permanent ban

## Blocked usernames
bento, cyano, blueno, bentothecoder, bluenothecoder (any case)

## Logs
```bash
python logs.py
```

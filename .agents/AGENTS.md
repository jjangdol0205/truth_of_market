# Truth of Market - Antigravity Guidelines

## Column Generation Policy
- **DO NOT** use the external Gemini API (or any API via node scripts) to generate market insight columns.
- The user has explicitly forbidden API-based generation for AdSense articles to avoid quota issues.
- **Antigravity Must Do It Directly**: Antigravity is responsible for generating and deploying the daily insight columns internally, manually crafting the markdown content and updating the `insights.json` or related files.

## Auto Deploy Policy (CRITICAL)
- **ALWAYS** run `git add -A && git commit -m "..." && git push origin main` after ANY modification to the following files:
  - `insights.json`
  - `news-archive.json`
  - `views/*.ejs`
  - `server.js`
  - `public/*`
- **NEVER** leave changes uncommitted. Every fix, every article injection, every column write must be followed immediately by a git push.
- After git push, also restart the server so changes are immediately live.
- The deploy sequence is always: **수정 → git push → 서버 재시작**

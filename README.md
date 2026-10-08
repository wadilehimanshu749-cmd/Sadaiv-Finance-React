# SADAIV Finance (React + Vite)

Pure React (Vite + React Router) port of the original Next.js `sadaiv-finance` project.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Routes
| Path         | Component                 |
| ------------ | ------------------------- |
| `/`          | `src/pages/Home.tsx`      |
| `/dashboard` | `src/pages/Dashboard.tsx` |
| `*`          | `src/pages/NotFound.tsx` ("Coming soon" placeholder for /login, /signup, /loan, ...) |

## Deploying
Because this is a single-page app using `BrowserRouter`, configure your host to serve
`index.html` for unknown paths (Netlify `_redirects`, Vercel rewrites, nginx `try_files`, etc.).

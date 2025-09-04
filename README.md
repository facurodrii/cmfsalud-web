# CMF Salud - Web

Aplicación React (TypeScript) para CMF Salud.

## Deploy en Netlify

1. Subí este folder `cmfsalud-web` a un repositorio propio en GitHub (nuevo repo recomendado).
2. En Netlify: New site from Git → conecta con GitHub.
3. Base directory: `cmfsalud-web`
4. Build command: `npm run build`
5. Publish directory: `build`
6. Deploy. Las rutas funcionan gracias a `netlify.toml` (redirect 200 a `index.html`).

## Variables y API
- El frontend usa `src/config.ts` con `API_BASE` ya apuntando al backend en Render.
- Si agregás variables (por ej. claves de Firebase), usá un `.env` y no lo subas (está en `.gitignore`).

## Scripts
- `npm start` – modo desarrollo
- `npm run build` – build de producción

## Requisitos
- Node 18+ recomendado

## Notas
- SPA: React Router  y Service redirects listo.

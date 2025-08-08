# Squiduuverse Tools (Clone)

Clone statique et open‑source des outils ThumbView, StatLab et Infinite Brainstorm. Conçu pour être hébergé facilement (GitHub Pages / Netlify / Vercel) et intégrable dans Canva via "Intégrer (Embed)".

## Aperçu des fonctionnalités
- ThumbView: prévisualisation de miniatures YouTube (flux, page, mobile), thème clair/sombre, badge durée, export PNG
- StatLab: KPI + tableau des dernières vidéos. Mode démo inclus. Mode “live” via clé API YouTube Data v3 (client‑side)
- Infinite Brainstorm: canvas infini (pan/zoom), post‑its, liens (touche L), import/export JSON et export image

## Lancer en local
1. Servez le dossier en statique (exemples):
   - Python: `python3 -m http.server -d . 8080`
   - Node (http-server): `npx http-server -p 8080` (ou `serve`)
2. Ouvrez `http://localhost:8080/index.html`

## Déploiement ultra‑rapide (Netlify Drop)
1. Rendez-vous sur `https://app.netlify.com/drop`
2. Glissez‑déposez tout le dossier (ou l’archive ZIP) `squiduuverse-clone`
3. Récupérez l’URL publique fournie

## Test dans Canva (Embed)
1. Ouvrez votre design Canva
2. Allez dans Apps > Intégrer (Embed)
3. Collez l’URL publique (Netlify/Vercel/GitHub Pages) de votre site
4. L’aperçu interactif s’intègre dans votre design

Astuce: pour StatLab “live”, créez une clé API YouTube Data v3 (console Google Cloud) et autorisez le référent de votre domaine d’hébergement (ex: `*.netlify.app`). Dans l’outil, renseignez la clé + la chaîne (@handle, ID `UC...` ou URL).

## Structure
- `index.html`: page unique avec onglets ThumbView / StatLab / Brainstorm
- `styles.css`: thème moderne responsive (foncé)
- `app.js`: logique des 3 modules (UI, export PNG, API YouTube, canvas)

## Licence
Usage éducatif. Les marques et contenus appartiennent à leurs propriétaires respectifs.
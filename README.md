# MORZ store (React + Vite)

## Run locally
    npm install
    npm run dev        # http://localhost:5173
    npm run build      # outputs dist/

## Deploy to Vercel
1. Put this folder in a GitHub repo, then in Vercel choose "Add New > Project" and import it.
2. Settings are detected automatically (Framework: Vite, Build: `npm run build`, Output: `dist`). Click Deploy.
   Or from the terminal: `npm i -g vercel && vercel --prod`.

## Edit content
- Prices and availability: `src/data/products.js` (price in USD, `null` = "Ask for price"; `available: false` = out of stock).
- Text (EN/MN): `src/data/content.js`. Order email and display exchange rates: `src/config.js`.
- Colors, layout: `src/styles.css`. Hero themes: `src/data/slides.js`.

## Important
- All prices, stock flags and exchange rates are SAMPLE PLACEHOLDERS. Replace them before launch.
- There is no payment or checkout. "Send order request" opens an email to `contactEmail`.
- Only confirm brands/products you are authorized to sell. Policy text in `content.js` (shipping, returns, privacy) is a draft: replace with your real terms.

% ExcelExtractor – Smart Document to Excel Converter

<div align="center">
  <img src="public/assets/img2.webp" alt="ExcelExtractor banner" width="720" />
  <p><em>Convert PDFs, invoices, bills, and images to clean Excel sheets with OCR.</em></p>
</div>

## Overview
ExcelExtractor is a web app that turns PDFs, scanned invoices, bills, and images into clean, editable Excel (XLSX) files. It removes manual copy-paste, preserves table structure, and ships with a responsive, animation-friendly UI.

## Live Preview Look
<div align="center">
  <img src="public/assets/img3.webp" alt="Hero and upload experience" width="560" />
  <p><small>Hero dropzone with drag/hover feedback and icon micro-interactions.</small></p>
</div>

<div align="center">
  <img src="public/assets/img1.svg" alt="Conversion workflow illustration" width="560" />
  <p><small>Conversion flow: upload → OCR → table extraction → Excel export.</small></p>
</div>

<div align="center">
  <img src="public/assets/img4.svg" alt="Collaboration and sharing" width="560" />
  <p><small>Shareable, structured outputs ready for teams.</small></p>
</div>

## Demo Highlights (animations-ready)
- Animated hero dropzone: drag-over glow, icon bounce, and smooth hover states.
- Sticky orange navbar with login/sign-up modals; mobile hamburger slides in/out.
- Section fade/slide reveals to guide the narrative.
- Cards and buttons lift subtly on hover (`hover:-translate-y-0.5 hover:shadow-xl`).

## Quick Pitch (demo script)
“I built ExcelExtractor, a React + Tailwind app that converts PDFs, invoices, bills, and images into structured Excel sheets. Users drag-and-drop, we validate size, run OCR for scanned docs, detect tables, and return a clean XLSX—no manual copy-paste. The UI is responsive with a sticky nav, auth modals, and animated cards. Backend (Node/Express with Multer + Tesseract) processes files temporarily and deletes them after conversion.”

## Key Features
- Drag-and-drop or click upload for PDFs, invoices, bills, and JPG/PNG images.
- File-size guardrails (5 MB default) with instant feedback.
- OCR text and table extraction; keeps numeric formatting aligned.
- Preview/download UX without registration.
- Mobile-first navigation, menus, and modals.

## Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Font Awesome icons.
- **Backend (planned/optional):** Node.js, Express, Multer for uploads.
- **OCR & Extraction:** Tesseract OCR; table detection for structured Excel output.
- **Output:** Excel (.xlsx).

## Project Structure (condensed)
- `src/App.jsx` – App entry wiring `LandingPage`.
- `src/Pages/LandingPage.jsx` – Hero, dropzone, feature sections, auth modals.
- `src/index.css` – Global styles and Tailwind setup.
- `public/assets/` – Images/illustrations (`img1.svg`, `img2.webp`, `img3.webp`, `img4.svg`).

## How It Works
1) User uploads a PDF/invoice/bill/image.  
2) Client validates type/size and posts to the API.  
3) OCR runs for scanned/image inputs; tables and numbers are parsed.  
4) Data is normalized into rows/columns and streamed back as XLSX.  
5) User previews/downloads; temporary files are cleaned up.

## Animations & UX Notes (HTML/CSS-ready)
- Tailwind helpers: `transition`, `duration-200`, `ease-out`, `hover:-translate-y-0.5`, `hover:shadow-xl`, `focus:ring-2 focus:ring-orange-500`.
- Dropzone states: add `data-drag` toggles to apply a soft glow (e.g., `shadow-[0_0_30px_rgba(249,115,22,0.35)]`).
- Navbar/mobile menu: slide the drawer with `translate-x` + opacity fade; animate the hamburger to an “X”.
- Section reveals: simple keyframes for fade/slide-up; trigger via intersection observer or utility classes (e.g., `animate-fade-in`, `animate-slide-up`).
- Keep motion subtle and fast (150–250 ms) to feel crisp.

## Running Locally
```bash
npm install
npm run dev
# open the printed local URL (Vite defaults to http://localhost:5173)
```

## Production Build
```bash
npm run build
npm run preview
```

## Future Enhancements
- Bulk uploads and job queueing.
- User accounts with history and re-downloads.
- Cloud exports (Drive, Dropbox) and webhooks.
- Smarter table recognition and multi-language OCR.

## Resume Bullet
- Built a responsive React + Tailwind tool that converts PDFs, invoices, bills, and images to Excel via OCR/table extraction, with auth-ready UI, validation, and secure processing.

---
If you want GIF snippets of the animations or a 2-minute pitch trimmed to your resume, tell me.% ExcelExtractor – Smart Document to Excel Converter

![Project Banner](public/assets/banner.png)

## Overview
ExcelExtractor converts PDFs, scanned invoices, bills, and images into clean, editable Excel (XLSX) files using OCR. It removes manual copy-paste, preserves table structure, and delivers a polished, responsive UI.

## Demo at a Glance
- Animated hero dropzone with drag/hover feedback and icon micro-interactions.
- Sticky orange navbar with login/sign-up modals; mobile hamburger with smooth slide.
- Section fade/slide reveals; cards and buttons lift on hover.
- Responsive layout that feels native on desktop and mobile.

## Quick Pitch (demo-ready)
“I built ExcelExtractor, a React + Tailwind app that turns PDFs, invoices, bills, and images into structured Excel sheets. Users drag-and-drop, we validate size, run OCR for scanned docs, detect tables, and return a clean XLSX—no manual copy-paste. The UI is responsive with sticky nav, auth modals, and animated cards. Backend (Node/Express with Multer + Tesseract) processes files temporarily and deletes them after conversion.”

## Key Features
- Drag-and-drop or click upload for PDFs, invoices, bills, and JPG/PNG images.
- File-size guardrails (5 MB default) with instant feedback.
- OCR text and table extraction; preserves numeric formatting.
- Preview/download UX without registration.
- Mobile-first navigation, menus, and modals.

## Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Font Awesome icons.
- **Backend (planned/optional):** Node.js, Express, Multer for uploads.
- **OCR & Extraction:** Tesseract OCR; table detection for structured Excel output.
- **Output:** Excel (.xlsx).

## Project Structure (condensed)
- `src/App.jsx` – App entry wiring LandingPage.
- `src/Pages/LandingPage.jsx` – Hero, dropzone, feature sections, auth modals.
- `src/index.css` – Global styles and Tailwind setup.
- `public/assets/` – Images/illustrations (`banner.png`, `img1.svg`, `img3.webp`, `img4.svg`).

## How It Works
1) User uploads a PDF/invoice/bill/image.  
2) Client validates type/size and posts to the API.  
3) OCR runs for scanned/image inputs; tables and numbers are parsed.  
4) Data is normalized into rows/columns and streamed back as XLSX.  
5) User previews/downloads; temporary files are cleaned up.

## Animations & UX Notes
- Use Tailwind transitions: `transition`, `duration-200`, `ease-out`.
- Card lift: `hover:-translate-y-0.5 hover:shadow-xl` with `transform` enabled.
- Fade/slide reveals: add a tiny keyframe (e.g., `animate-fade-in` or `animate-slide-up`).
- Keep focus states visible: `focus:ring-2 focus:ring-orange-500`.
- Navbar/mobile menu: slide/fade the drawer; add icon micro-animations.

## Running Locally
```bash
npm install
npm run dev
# open the printed local URL (Vite defaults to http://localhost:5173)
```

## Production Build
```bash
npm run build
npm run preview
```

## Screenshots (placeholders)
![Hero Dropzone](public/assets/screens/hero.png)
![Auth Modals](public/assets/screens/auth.png)
![Features Grid](public/assets/screens/features.png)

## Future Enhancements
- Bulk uploads and job queueing.
- User accounts with history and re-downloads.
- Cloud exports (Drive, Dropbox) and webhooks.
- Smarter table recognition and multi-language OCR.

## Resume Bullet
- Built a responsive React + Tailwind tool that converts PDFs, invoices, bills, and images to Excel via OCR/table extraction, with auth-ready UI, validation, and secure processing.

---
If you need a 2-minute pitch, architecture diagram, deployment steps (Vercel/Netlify/Render + backend), or animated GIF snippets for the README, tell me.% ExcelExtractor – Smart Document to Excel Converter

## Overview
- Web app to turn PDFs, scanned invoices, bills, and images into clean, editable Excel sheets (XLSX) with OCR-driven extraction.
- Eliminates manual copy-paste, keeps table structure, and works fully in the browser with a modern, responsive UI.

## Demo Highlights
- Animated hero dropzone with hover/drag feedback and icon micro-interactions.
- Sticky orange navbar with login/sign-up modals and mobile hamburger animation.
- Smooth section reveals (use simple CSS transitions or Tailwind utilities like `transition`, `duration-300`, `animate-fade-in` if you add a small keyframe).
- Cards and buttons lift on hover (`hover:translate-y-[-2px] hover:shadow-xl`).

## Key Features
- Upload PDFs, invoices, bills, or images (JPG, PNG) via drag-and-drop or click-to-upload.
- File-size guardrails (5 MB by default) and instant feedback.
- OCR text and table extraction to XLSX; keeps numbers and formatting aligned.
- No registration required; quick preview/download UX.
- Mobile-first layout with responsive navbar, menus, and modals.

## Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Font Awesome icons.
- **Backend (planned/optional):** Node.js, Express, Multer for uploads.
- **OCR & Extraction:** Tesseract OCR; table detection for structured Excel output.
- **Output:** Excel (.xlsx).

## Project Structure (condensed)
- `src/App.jsx` – App entry wiring LandingPage.
- `src/Pages/LandingPage.jsx` – Hero, dropzone, feature sections, auth modals.
- `src/index.css` – Global styles and Tailwind setup.
- `public/assets/` – Images/illustrations for feature sections.

## How It Works (Flow)
1) User uploads a PDF/invoice/bill/image.  
2) Client validates type/size and posts to the API.  
3) Server runs OCR for scanned/image inputs; parses tables/numerics.  
4) Data is normalized into rows/columns and streamed back as XLSX.  
5) User previews/downloads the Excel file; temporary files are cleaned up.

## Animations & UX Notes
- Use Tailwind transitions on buttons/links: `transition`, `duration-200`, `ease-out`.
- Add subtle card lift: `hover:-translate-y-0.5 hover:shadow-xl` (with `transform`).
- Fade/slide reveals for sections (e.g., a simple keyframe or `animate-fade-in` class if you add it).
- Keep focus rings visible for accessibility (`focus:ring-2 focus:ring-orange-500`).

## Running the Project
```bash
npm install
npm run dev
# open the printed local URL (Vite defaults to http://localhost:5173)
```

## Production Build
```bash
npm run build
npm run preview
```

## Interview/Demo Script (concise)
“I built **ExcelExtractor**, a React + Tailwind app that converts PDFs, invoices, bills, and images into structured Excel sheets. Users drag-and-drop a file, we validate size, run OCR for scanned docs, detect tables, and return a clean XLSX without any manual copy-paste. The UI is responsive with a sticky navbar, login/signup modals, and animated cards so it feels polished on desktop and mobile. On the backend (Node/Express with Multer and Tesseract), files are processed temporarily and deleted after conversion for security.”

## Future Enhancements
- Bulk uploads and job queueing.
- User accounts with history and re-downloads.
- Cloud exports (Drive, Dropbox) and webhooks.
- Smarter table recognition and multi-language OCR.

## Quick Resume Bullet
- Built a responsive React + Tailwind tool that converts PDFs, invoices, bills, and images to Excel via OCR/table extraction, adding auth-ready UI, file validation, and secure processing.

## Assets (optional references)
- Hero/feature art can live in `public/assets/` (e.g., `img1.svg`, `img3.webp`, `img4.svg`) and be referenced directly in components.

---
If you need a 2-minute pitch, architecture diagram, or deployment steps (Vercel/Netlify/Render + backend), let me know.# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

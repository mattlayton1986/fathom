# Fathom JSON Explorer

Fathom is a browser-based JSON explorer for inspecting API responses and other structured JSON data. Paste JSON into the editor to browse it as an interactive tree, search for keys and string values, and generate TypeScript or Zod schemas.

## Features

- Parse and inspect JSON in an expandable tree
- Search keys and string values with matched-text highlighting
- Copy keys, values, and JSON paths for direct pasting into code
- Generate TypeScript interfaces and Zod schemas
- Paginate large arrays and collapse long string values
- Switch between light and dark themes
- Install as a Progressive Web App with offline support

## Running locally

Install dependencies, then start the development server: 

```bash
npm install
npm run dev
```
Open http://localhost:3000 in your browser.

To create a local production build: 

```bash
npm run build
npm start
```

## Architecture notes
- The application uses Next.js with React and TypeScript.
- JSON is parsed and transformed into a normalized tree structure on the client; pasted data is never sent to a server.
- Search identifies matching nodes and their ancestors so relevant branches remain visible in the tree. 
- Schema inference generates TypeScript and Zod output directly from the parsed JSON tree.
- The app includes a small custom service worker so the installed PWA can reopen offline after its assets have been cached.

/**
 * Convert Cobecium markdown docs → public/docs/*.html + manifest.json
 * Run: bun run scripts/convert-docs-to-html.ts
 */
import { marked } from "marked";
import { mkdir, readFile, readdir, writeFile, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "docs");

type DocEntry = {
  slug: string;
  title: string;
  source: string;
  htmlFile: string;
};

function slugify(filePath: string, rootDir: string): string {
  const rel = path.relative(rootDir, filePath).replace(/\\/g, "/");
  return rel
    .replace(/\.md$/i, "")
    .replace(/[^a-zA-Z0-9/_-]+/g, "-")
    .replace(/\/+/g, "/")
    .toLowerCase();
}

function titleFromMarkdown(md: string, fallback: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  if (m?.[1]) return m[1].trim();
  return fallback.replace(/[-_]/g, " ");
}

function wrapHtml(title: string, body: string, source: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} · Lynx Docs</title>
  <style>
    :root {
      --bg: #1a1a1e;
      --card: #25252a;
      --text: #f0f0f2;
      --muted: #8a8a8e;
      --orange: #f59e0b;
      --teal: #0d9488;
      --border: #2e2e34;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Syne, system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.65;
      padding: 1.5rem;
    }
    .doc {
      max-width: 48rem;
      margin: 0 auto;
    }
    .meta {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--orange);
    }
    h1, h2, h3, h4 {
      line-height: 1.25;
      margin-top: 1.75rem;
      margin-bottom: 0.75rem;
    }
    h1 { font-size: 1.75rem; color: var(--text); }
    h2 { font-size: 1.25rem; color: var(--orange); border-bottom: 1px solid var(--border); padding-bottom: 0.35rem; }
    h3 { font-size: 1.05rem; color: var(--teal); }
    p, ul, ol, table, pre, blockquote { margin: 0 0 1rem; }
    a { color: var(--teal); }
    a:hover { color: var(--orange); }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.88em;
      background: var(--card);
      padding: 0.1em 0.35em;
      border-radius: 2px;
    }
    pre {
      background: var(--card);
      border: 1px solid var(--border);
      padding: 1rem;
      overflow-x: auto;
      border-radius: 2px;
    }
    pre code { background: none; padding: 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.92rem;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 0.5rem 0.65rem;
      text-align: left;
      vertical-align: top;
    }
    th { background: var(--card); color: var(--orange); }
    blockquote {
      margin-left: 0;
      padding: 0.5rem 1rem;
      border-left: 4px solid var(--teal);
      color: var(--muted);
      background: var(--card);
    }
    hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
  </style>
</head>
<body>
  <article class="doc">
    <p class="meta">Source: ${escapeHtml(source)}</p>
    ${body}
  </article>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function collectMarkdownFiles(): Promise<{ abs: string; label: string }[]> {
  const files: { abs: string; label: string }[] = [];

  // Root project docs
  for (const name of ["README.md", "AGENTS.md", "DONOTREPEAT.md"]) {
    const abs = path.join(root, name);
    try {
      await stat(abs);
      files.push({ abs, label: name });
    } catch {
      /* skip */
    }
  }

  // docs/ tree
  const docsDir = path.join(root, "docs");
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(abs);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) {
        files.push({ abs, label: path.relative(root, abs).replace(/\\/g, "/") });
      }
    }
  }
  await walk(docsDir);
  return files.sort((a, b) => a.label.localeCompare(b.label));
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const sources = await collectMarkdownFiles();
  const manifest: DocEntry[] = [];

  for (const { abs, label } of sources) {
    const md = await readFile(abs, "utf8");
    if (!md.trim()) {
      console.log(`skip empty: ${label}`);
      continue;
    }

    const slug =
      label.startsWith("docs/")
        ? slugify(abs, path.join(root, "docs"))
        : slugify(path.basename(abs), root);

    const title = titleFromMarkdown(md, slug);
    const body = await marked.parse(md, { gfm: true, breaks: false });
    const htmlFile = `${slug}.html`;
    const outPath = path.join(outDir, htmlFile);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, wrapHtml(title, body, label), "utf8");

    // Body-only fragment for in-app viewer (no full document chrome)
    const fragmentPath = path.join(outDir, `${slug}.fragment.html`);
    await writeFile(fragmentPath, body, "utf8");

    manifest.push({ slug, title, source: label, htmlFile });
    console.log(`wrote ${htmlFile}`);
  }

  manifest.sort((a, b) => a.title.localeCompare(b.title));
  await writeFile(
    path.join(outDir, "manifest.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), docs: manifest }, null, 2),
    "utf8"
  );
  console.log(`manifest: ${manifest.length} docs → public/docs/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

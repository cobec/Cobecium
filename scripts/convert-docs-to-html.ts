/**
 * Convert Cobecium markdown docs → public/docs/*.html + *.fragment.html + manifest.json
 * Run: bun run scripts/convert-docs-to-html.ts (also via `bun run docs:html` / build)
 */
import { marked } from "marked";
import { mkdir, readFile, readdir, writeFile, stat, rm } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "docs");

type DocEntry = {
  slug: string;
  title: string;
  description: string;
  source: string;
  htmlFile: string;
  fragmentFile: string;
};

/** Flat URL slug: docs/FOO_BAR.md → foo-bar */
function slugFromSource(label: string): string {
  return label
    .replace(/\\/g, "/")
    .replace(/\.md$/i, "")
    .replace(/^docs\//i, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function titleFromMarkdown(md: string, fallback: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  if (m?.[1]) return m[1].trim().replace(/\s+/g, " ");
  return fallback.replace(/[-_]/g, " ");
}

function descriptionFromMarkdown(md: string): string {
  const withoutTitle = md.replace(/^#\s+.+$/m, "").trim();
  const para = withoutTitle
    .split(/\n\n+/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith("#") && !p.startsWith("```") && !p.startsWith("|") && !p.startsWith("> **"));
  if (!para) return "";
  return para
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Rewrite .md links to in-app /docs/<slug> routes using the source→slug map. */
function rewriteMarkdownLinks(md: string, sourceLabel: string, slugBySource: Map<string, string>): string {
  const sourceDir = path.posix.dirname(sourceLabel.replace(/\\/g, "/"));

  return md.replace(/\]\(([^)]+)\)/g, (full, rawTarget: string) => {
    const target = rawTarget.trim();
    if (!/\.md([#?].*)?$/i.test(target)) return full;
    if (/^(https?:|mailto:)/i.test(target)) return full;

    const [filePart, hash = ""] = target.split(/#/, 2);
    let resolved: string;
    if (filePart.startsWith("/")) {
      resolved = filePart.slice(1);
    } else if (sourceDir === "." || sourceDir === "") {
      resolved = path.posix.normalize(filePart);
    } else {
      resolved = path.posix.normalize(`${sourceDir}/${filePart}`);
    }
    resolved = resolved.replace(/^\.\//, "");

    const slug =
      slugBySource.get(resolved) ??
      slugBySource.get(resolved.replace(/^docs\//, "")) ??
      slugFromSource(resolved.startsWith("docs/") ? resolved : `docs/${path.posix.basename(resolved)}`);

    const hashSuffix = hash ? `#${hash}` : "";
    return `](/docs/${slug}${hashSuffix})`;
  });
}

function wrapStandaloneHtml(title: string, body: string, source: string, slug: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} · Lynx Docs</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
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
    }
    .shell { min-height: 100vh; display: flex; flex-direction: column; }
    .top {
      border-bottom: 4px solid var(--orange);
      padding: 1rem 1.25rem 0.85rem;
      text-align: center;
    }
    .top a.brand {
      color: var(--text);
      text-decoration: none;
      font-weight: 800;
      letter-spacing: 0.08em;
      font-size: 1.75rem;
      text-transform: uppercase;
    }
    .top .tag {
      margin: 0.25rem 0 0;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--muted);
    }
    .top nav {
      margin-top: 0.75rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
    }
    .top nav a {
      border: 2px solid var(--teal);
      color: var(--text);
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.4rem 0.75rem;
    }
    .top nav a:hover, .top nav a.active {
      border-color: var(--orange);
      background: var(--orange);
      color: #111;
    }
    .doc {
      max-width: 48rem;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 3rem;
      flex: 1;
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
    h1, h2, h3, h4 { line-height: 1.25; margin-top: 1.75rem; margin-bottom: 0.75rem; }
    h1 { font-size: 1.75rem; }
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
    }
    pre {
      background: var(--card);
      border: 1px solid var(--border);
      padding: 1rem;
      overflow-x: auto;
    }
    pre code { background: none; padding: 0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    th, td { border: 1px solid var(--border); padding: 0.5rem 0.65rem; text-align: left; vertical-align: top; }
    th { background: var(--card); color: var(--orange); }
    blockquote {
      margin-left: 0;
      padding: 0.5rem 1rem;
      border-left: 4px solid var(--teal);
      color: var(--muted);
      background: var(--card);
    }
    hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
    .foot {
      border-top: 4px solid var(--orange);
      padding: 1rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <div class="shell">
    <header class="top">
      <a class="brand" href="/">Lynx</a>
      <p class="tag">Documentation</p>
      <nav aria-label="Docs">
        <a href="/docs">All docs</a>
        <a class="active" href="/docs/${escapeHtml(slug)}">${escapeHtml(title)}</a>
        <a href="/app">App</a>
      </nav>
    </header>
    <article class="doc">
      <p class="meta">Source: ${escapeHtml(source)} · slug: ${escapeHtml(slug)}</p>
      ${body}
    </article>
    <footer class="foot">Cobec · Lynx · HTML docs generated from Markdown</footer>
  </div>
</body>
</html>
`;
}

async function walkMarkdown(dir: string, files: { abs: string; label: string }[]) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".git") continue;
      await walkMarkdown(abs, files);
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) {
      files.push({ abs, label: path.relative(root, abs).replace(/\\/g, "/") });
    }
  }
}

async function collectMarkdownFiles(): Promise<{ abs: string; label: string }[]> {
  const files: { abs: string; label: string }[] = [];

  for (const name of ["README.md", "AGENTS.md", "DONOTREPEAT.md"]) {
    const abs = path.join(root, name);
    try {
      await stat(abs);
      files.push({ abs, label: name });
    } catch {
      /* skip */
    }
  }

  const docsDir = path.join(root, "docs");
  try {
    await walkMarkdown(docsDir, files);
  } catch {
    /* no docs/ */
  }

  const convexReadme = path.join(root, "convex", "README.md");
  try {
    await stat(convexReadme);
    files.push({ abs: convexReadme, label: "convex/README.md" });
  } catch {
    /* skip */
  }

  // Dedupe by absolute path
  const seen = new Set<string>();
  return files
    .filter((f) => {
      if (seen.has(f.abs)) return false;
      seen.add(f.abs);
      return true;
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

async function main() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const sources = await collectMarkdownFiles();
  const slugBySource = new Map<string, string>();
  for (const { label } of sources) {
    slugBySource.set(label, slugFromSource(label));
    // Also index basename under docs/ for relative links
    if (label.startsWith("docs/")) {
      slugBySource.set(path.posix.basename(label), slugFromSource(label));
    }
  }

  const usedSlugs = new Set<string>();
  const manifest: DocEntry[] = [];

  for (const { abs, label } of sources) {
    const mdRaw = await readFile(abs, "utf8");
    if (!mdRaw.trim()) {
      console.log(`skip empty: ${label}`);
      continue;
    }

    let slug = slugFromSource(label);
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${Buffer.from(label).toString("hex").slice(0, 6)}`;
    }
    usedSlugs.add(slug);
    slugBySource.set(label, slug);

    const title = titleFromMarkdown(mdRaw, slug);
    const description = descriptionFromMarkdown(mdRaw);
    const md = rewriteMarkdownLinks(mdRaw, label, slugBySource);
    const body = await marked.parse(md, { gfm: true, breaks: false });

    const htmlFile = `${slug}.html`;
    const fragmentFile = `${slug}.fragment.html`;
    await writeFile(path.join(outDir, htmlFile), wrapStandaloneHtml(title, body, label, slug), "utf8");
    await writeFile(path.join(outDir, fragmentFile), body, "utf8");

    manifest.push({
      slug,
      title,
      description,
      source: label,
      htmlFile,
      fragmentFile,
    });
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

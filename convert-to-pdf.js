const { marked } = require('marked');
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = path.join(__dirname, 'pdf_output');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const FILES = [
  'Stakeholder_Proposal.md',
  'Optional_AddOns.md',
  'Stakeholder_Questions.md',
  'WholesaleERP_LivingDoc.md',
];

// Custom renderer: convert .md links → .pdf links and fix anchor-only links
const renderer = new marked.Renderer();
renderer.link = ({ href, title, tokens }) => {
  const text = tokens.map(t => t.raw || t.text || '').join('');
  let resolvedHref = href;
  // Convert cross-document .md links to .pdf links
  if (href && href.endsWith('.md')) {
    resolvedHref = href.slice(0, -3) + '.pdf';
  }
  // Anchor links stay as-is (they work within the same PDF as internal links)
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${resolvedHref}"${titleAttr}>${text}</a>`;
};

marked.use({ renderer });

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a1a;
    padding: 28mm 22mm 28mm 22mm;
    max-width: 100%;
  }
  h1 { font-size: 20pt; margin: 0 0 6px 0; color: #0d1b2a; border-bottom: 2px solid #0d1b2a; padding-bottom: 6px; }
  h2 { font-size: 15pt; margin: 28px 0 10px 0; color: #0d1b2a; border-bottom: 1px solid #c0c8d0; padding-bottom: 4px; }
  h3 { font-size: 12pt; margin: 18px 0 6px 0; color: #1a3a5c; }
  h4 { font-size: 11pt; margin: 14px 0 4px 0; color: #1a3a5c; }
  p { margin: 8px 0; }
  ul, ol { margin: 8px 0 8px 22px; }
  li { margin: 3px 0; }
  a { color: #1a6bb5; text-decoration: underline; }
  a:hover { color: #0e4780; }
  table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 10pt; }
  th { background: #0d1b2a; color: #fff; padding: 7px 10px; text-align: left; }
  td { padding: 6px 10px; border-bottom: 1px solid #dde3ea; }
  tr:nth-child(even) td { background: #f4f6f9; }
  code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-family: Consolas, monospace; font-size: 9.5pt; }
  pre { background: #f7f7f7; border: 1px solid #ddd; border-radius: 5px; padding: 12px 16px; margin: 12px 0; overflow-x: auto; }
  pre code { background: none; padding: 0; font-size: 9pt; }
  blockquote { border-left: 4px solid #1a6bb5; margin: 12px 0; padding: 6px 14px; background: #f0f5fb; color: #2a4a6a; border-radius: 0 4px 4px 0; }
  hr { border: none; border-top: 1px solid #c0c8d0; margin: 20px 0; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  @media print {
    body { padding: 0; }
    a { color: #1a6bb5; }
    h2 { page-break-before: auto; }
    tr { page-break-inside: avoid; }
    pre { page-break-inside: avoid; }
  }
`;

function buildHtml(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${CSS}</style>
</head>
<body>
${body}
</body>
</html>`;
}

async function convertFile(mdFile) {
  const mdPath = path.join(__dirname, mdFile);
  if (!fs.existsSync(mdPath)) {
    console.log(`  Skipping ${mdFile} — not found`);
    return;
  }

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const htmlBody = marked(mdContent);
  const baseName = path.basename(mdFile, '.md');
  const title = baseName.replace(/_/g, ' ');
  const html = buildHtml(title, htmlBody);

  const htmlPath = path.join(OUTPUT_DIR, baseName + '.html');
  const pdfPath = path.join(OUTPUT_DIR, baseName + '.pdf');

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`  HTML written: ${htmlPath}`);

  // Use Edge headless to print to PDF
  const result = spawnSync(EDGE_PATH, [
    '--headless',
    '--disable-gpu',
    '--run-all-compositor-stages-before-draw',
    '--no-sandbox',
    `--print-to-pdf=${pdfPath}`,
    `--print-to-pdf-no-header`,
    htmlPath,
  ], { timeout: 30000 });

  if (result.status === 0 || fs.existsSync(pdfPath)) {
    console.log(`  PDF written:  ${pdfPath}`);
  } else {
    console.error(`  ERROR converting ${mdFile}:`);
    if (result.stderr) console.error(result.stderr.toString());
  }
}

(async () => {
  console.log('Converting Markdown files to PDF...\n');
  for (const file of FILES) {
    console.log(`Processing: ${file}`);
    await convertFile(file);
    console.log('');
  }
  console.log('Done! PDFs saved to: ' + OUTPUT_DIR);
  console.log('\nNote: Cross-document links (e.g. Stakeholder_Proposal → Optional_AddOns)');
  console.log('      work when both PDFs are in the same folder and opened in a PDF reader');
  console.log('      that supports relative file links (Acrobat Reader, Edge PDF, etc.).');
})();

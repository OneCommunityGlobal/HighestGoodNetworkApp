import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const WIDTH = 800;
const MAX_PNG_PIXELS = 16000000;
const MAX_PNG_HEIGHT = 16000;

function makeText(tag, text, size) {
  const element = document.createElement(tag);
  element.textContent = text;
  element.style.cssText = `margin:0;padding:12px 0;color:#172b3a;font-size:${size}px;overflow-wrap:anywhere;`;
  return element;
}

function createReport(summaries, selectionContext, generatedAt) {
  const stage = document.createElement('div');
  stage.style.cssText = `position:fixed;left:-10000px;top:0;width:${WIDTH}px;background:#fff;color:#172b3a;font-family:Arial,sans-serif;`;
  const blocks = [];
  const header = document.createElement('div');
  header.append(
    makeText('h1', 'Building Management KPI Summary', 28),
    makeText('p', `Generated: ${generatedAt.toISOString()}`, 16),
    makeText('p', selectionContext, 16),
  );
  stage.appendChild(header);
  blocks.push(header);

  summaries.forEach(summary => {
    const cards = Array.from(summary.querySelectorAll('article'));
    if (!cards.length) throw new Error('A project summary contains no KPI cards.');
    const heading = makeText('h2', summary.getAttribute('aria-label') || 'Project Summary', 22);
    cards.forEach((card, index) => {
      const block = document.createElement('div');
      block.style.cssText = 'padding:0 12px 12px;background:#fff;';
      if (index === 0) block.appendChild(heading);
      const copy = card.cloneNode(true);
      copy.querySelectorAll('button, a, [role="tooltip"]').forEach(control => control.remove());
      block.appendChild(copy);
      stage.appendChild(block);
      blocks.push(block);
    });
  });
  return { stage, blocks };
}

async function captureBlocks(stage, blocks) {
  document.body.appendChild(stage);
  const images = [];
  for (const block of blocks) {
    // The clone is moved into the viewport; the real page and scroll position stay untouched.
    const image = await html2canvas(block, {
      scale: 1,
      backgroundColor: '#ffffff',
      windowWidth: WIDTH,
      logging: false,
      onclone: clonedDocument => {
        const clone = clonedDocument.getElementById(stage.id);
        if (!clone) throw new Error('Unable to prepare the report for capture.');
        clone.style.position = 'absolute';
        clone.style.left = '0';
        clone.style.top = '0';
      },
    });
    if (!image?.width || !image?.height) throw new Error('Unable to capture report content.');
    images.push(image);
  }
  return images;
}

function savePng(images, filename) {
  const height = images.reduce((total, image) => total + image.height, 0);
  if (height > MAX_PNG_HEIGHT || WIDTH * height > MAX_PNG_PIXELS) {
    throw new Error('The PNG is too large. Select fewer projects or export a PDF.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create the PNG image.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, WIDTH, height);
  let y = 0;
  images.forEach(image => {
    context.drawImage(image, 0, y);
    y += image.height;
  });
  const data = canvas.toDataURL('image/png');
  if (!data || data === 'data:,') throw new Error('Unable to generate the PNG image.');
  const link = document.createElement('a');
  link.href = data;
  link.download = filename;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
  }
}

function savePdf(images, filename) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 10;
  const width = pdf.internal.pageSize.getWidth() - margin * 2;
  const bottom = pdf.internal.pageSize.getHeight() - margin;
  let y = margin;
  images.forEach(image => {
    const height = (image.height * width) / image.width;
    if (height > bottom - margin) {
      throw new Error('A report section is too tall for a PDF page.');
    }
    if (y + height > bottom) {
      pdf.addPage();
      y = margin;
    }
    const data = image.toDataURL('image/png');
    if (!data || data === 'data:,') throw new Error('Unable to generate PDF image data.');
    pdf.addImage(data, 'PNG', margin, y, width, height);
    y += height;
  });
  pdf.save(filename);
}

export async function exportProjectSummaries({ summaries, selectionContext, format }) {
  if (!summaries.length) throw new Error('No project summaries are available to export.');
  if (!['pdf', 'png'].includes(format)) throw new Error('Unsupported export format.');
  const generatedAt = new Date();
  const { stage, blocks } = createReport(summaries, selectionContext, generatedAt);
  stage.id = `kpi-export-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
  try {
    const images = await captureBlocks(stage, blocks);
    const filename = `building-kpi-summary-${generatedAt.toISOString().slice(0, 10)}.${format}`;
    if (format === 'pdf') savePdf(images, filename);
    else savePng(images, filename);
  } finally {
    stage.remove();
  }
}

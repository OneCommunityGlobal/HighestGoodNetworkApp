const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const defaultFormatter = ({ value, percentage }) => [String(value), `(${percentage}%)`];

const getMappedOption = (map, index, fallback) => {
  if (map == null) {
    return fallback;
  }
  if (Array.isArray(map)) {
    return map[index] ?? fallback;
  }
  if (typeof map === 'object') {
    return map[index] ?? fallback;
  }
  return fallback;
};

const externalLabelGuidesPlugin = {
  id: 'externalLabelGuides',
  afterDatasetsDraw(chart, args, pluginOpts = {}) {
    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data?.length) {
      return;
    }

    const dataset = chart.data.datasets[meta.index];
    if (!dataset) {
      return;
    }

    const options = {
      offset: 26,
      lineColor: '#4f4f4f',
      lineWidth: 1,
      markerRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#d0d0d0',
      borderWidth: 1,
      borderRadius: 6,
      fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 17,
      padding: { x: 10, y: 6 },
      guideBendRatio: 0.55,
      horizontalSpread: 32,
      sideMap: undefined,
      horizontalSpreadMap: undefined,
      verticalOffsetMap: undefined,
      containmentPadding: 12,
      total:
        pluginOpts.total ??
        dataset.data.reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0),
      formatter: pluginOpts.formatter || defaultFormatter,
      ...chart?.options?.plugins?.externalLabelGuides,
      ...pluginOpts,
    };

    const padding =
      typeof options.padding === 'number'
        ? { x: options.padding, y: options.padding }
        : {
            x: options.padding.x ?? options.padding.left ?? 10,
            y: options.padding.y ?? options.padding.top ?? 6,
          };

    const ctx = chart.ctx;
    ctx.save();
    ctx.lineWidth = options.lineWidth;
    ctx.strokeStyle = options.lineColor;
    ctx.font = `${options.fontWeight} ${options.fontSize}px ${options.fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = options.lineColor;

    meta.data.forEach((arc, index) => {
      const value = dataset.data[index];
      if (!value) {
        return;
      }

      const percentage = options.total ? Math.round((value / options.total) * 100) : 0;
      const lines = options.formatter({ value, percentage, index });
      const labelLines = Array.isArray(lines) ? lines : [String(lines)];

      const angle = (arc.startAngle + arc.endAngle) / 2;
      const { x, y, outerRadius } = arc;

      let direction = getMappedOption(options.sideMap, index, Math.cos(angle) >= 0 ? 1 : -1);
      direction = Math.sign(direction) || 1;
      direction = Math.cos(angle) >= 0 ? Math.abs(direction) : -Math.abs(direction);
      const baseX = x + Math.cos(angle) * outerRadius;
      const baseY = y + Math.sin(angle) * outerRadius;
      const midX = x + Math.cos(angle) * (outerRadius + options.offset * options.guideBendRatio);
      const midY = y + Math.sin(angle) * (outerRadius + options.offset * options.guideBendRatio);
      const elbowX = x + Math.cos(angle) * (outerRadius + options.offset);
      const elbowY = y + Math.sin(angle) * (outerRadius + options.offset);

      // Measure text block
      ctx.font = `${options.fontWeight} ${options.fontSize}px ${options.fontFamily}`;
      const textWidths = labelLines.map(line => ctx.measureText(line).width);
      const textWidth = Math.max(...textWidths);
      const textHeight = labelLines.length * options.lineHeight;

      const boxWidth = textWidth + padding.x * 2;
      const boxHeight = textHeight + padding.y * 2;

      const horizontalSpread = getMappedOption(
        options.horizontalSpreadMap,
        index,
        options.horizontalSpread,
      );

      let boxX = elbowX + direction * (padding.x + horizontalSpread);
      if (direction < 0) {
        boxX -= boxWidth;
      }
      let boxY =
        elbowY - boxHeight / 2 + (getMappedOption(options.verticalOffsetMap, index, 0) || 0);

      // Ensure box stays within chart area vertically
      const chartArea = chart.chartArea;
      if (chartArea) {
        const minY = chartArea.top + 4;
        const maxY = chartArea.bottom - boxHeight - 4;
        boxY = Math.max(minY, Math.min(boxY, maxY));
      }

      // Keep labels inside the drawable canvas horizontally to avoid clipping
      const paddingX = Math.max(0, options.containmentPadding || 0);
      if (chartArea) {
        const minX = chartArea.left + paddingX;
        const maxX = chartArea.right - boxWidth - paddingX;
        if (minX <= maxX) {
          boxX = Math.min(Math.max(boxX, minX), maxX);
        }
      } else if (chart?.width) {
        const minX = paddingX;
        const maxX = chart.width - boxWidth - paddingX;
        if (minX <= maxX) {
          boxX = Math.min(Math.max(boxX, minX), maxX);
        }
      }

      const isRightOfCenter = boxX + boxWidth / 2 >= x;
      const effectiveDirection = isRightOfCenter ? 1 : -1;

      const connectorX = effectiveDirection > 0 ? boxX : boxX + boxWidth;
      const connectorY = Math.max(boxY + padding.y, Math.min(elbowY, boxY + boxHeight - padding.y));

      // Draw guide line
      ctx.strokeStyle = options.lineColor;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(midX, midY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(connectorX, connectorY);
      ctx.stroke();

      if (options.markerRadius > 0) {
        ctx.fillStyle = options.lineColor;
        ctx.beginPath();
        ctx.arc(baseX, baseY, options.markerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw label background
      ctx.fillStyle = options.backgroundColor;
      drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, options.borderRadius);
      ctx.fill();

      if (options.borderWidth > 0) {
        ctx.strokeStyle = options.borderColor;
        ctx.lineWidth = options.borderWidth;
        drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, options.borderRadius);
        ctx.stroke();
      }

      // Draw text
      ctx.fillStyle = options.lineColor;
      ctx.font = `${options.fontWeight} ${options.fontSize}px ${options.fontFamily}`;
      ctx.textAlign = effectiveDirection > 0 ? 'left' : 'right';
      const textX = effectiveDirection > 0 ? boxX + padding.x : boxX + boxWidth - padding.x;
      let textY = boxY + padding.y + options.lineHeight / 2;

      labelLines.forEach((line, lineIndex) => {
        ctx.fillText(line, textX, textY + lineIndex * options.lineHeight);
      });
    });

    ctx.restore();
  },
};

export default externalLabelGuidesPlugin;

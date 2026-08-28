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

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

// Ensure box stays within chart area vertically
const clampLabelBoxY = (boxY, boxHeight, chartArea) => {
  if (!chartArea) {
    return boxY;
  }

  const minY = chartArea.top + 4;
  const maxY = chartArea.bottom - boxHeight - 4;
  return clampValue(boxY, minY, maxY);
};

const clampLabelBoxX = (boxX, boxWidth, chartArea, chartWidth, containmentPadding) => {
  const paddingX = Math.max(0, containmentPadding || 0);

  if (chartArea) {
    const minX = chartArea.left + paddingX;
    const maxX = chartArea.right - boxWidth - paddingX;
    return minX <= maxX ? clampValue(boxX, minX, maxX) : boxX;
  }

  if (chartWidth) {
    const minX = paddingX;
    const maxX = chartWidth - boxWidth - paddingX;
    return minX <= maxX ? clampValue(boxX, minX, maxX) : boxX;
  }

  return boxX;
};

const distributeLabelColumn = (labelBoxes, chartHeight, containmentPadding, minimumSpacing) => {
  if (!labelBoxes.length) {
    return;
  }

  const minY = containmentPadding;
  const maxY = chartHeight - containmentPadding;
  const sortedBoxes = [...labelBoxes].sort((box1, box2) => box1.baseY - box2.baseY);

  sortedBoxes.forEach((labelBox, index) => {
    const idealY = clampValue(
      labelBox.baseY - labelBox.boxHeight / 2,
      minY,
      maxY - labelBox.boxHeight,
    );

    if (index === 0) {
      labelBox.boxY = idealY;
      return;
    }

    const previousBox = sortedBoxes[index - 1];
    labelBox.boxY = Math.max(idealY, previousBox.boxY + previousBox.boxHeight + minimumSpacing);
  });

  for (let index = sortedBoxes.length - 1; index >= 0; index--) {
    const labelBox = sortedBoxes[index];
    const nextBox = sortedBoxes[index + 1];
    const latestY = nextBox
      ? nextBox.boxY - minimumSpacing - labelBox.boxHeight
      : maxY - labelBox.boxHeight;
    labelBox.boxY = Math.min(labelBox.boxY, latestY);
  }

  sortedBoxes.forEach((labelBox, index) => {
    if (index === 0) {
      labelBox.boxY = Math.max(labelBox.boxY, minY);
      return;
    }

    const previousBox = sortedBoxes[index - 1];
    labelBox.boxY = Math.max(
      labelBox.boxY,
      previousBox.boxY + previousBox.boxHeight + minimumSpacing,
    );
  });
};

export const layoutOutsideLabelBoxes = (
  labelBoxes,
  {
    chartHeight,
    containmentPadding = 4,
    outsideGap = 12,
    minimumSpacing = 8,
    connectorRadialOffset = 8,
  },
) => {
  const leftBoxes = [];
  const rightBoxes = [];

  labelBoxes.forEach(labelBox => {
    const direction = Math.cos(labelBox.angle) >= 0 ? 1 : -1;
    const arcLeft = labelBox.x - labelBox.arc.outerRadius;
    const arcRight = labelBox.x + labelBox.arc.outerRadius;

    labelBox.effectiveDirection = direction;
    labelBox.boxX =
      direction > 0 ? arcRight + outsideGap : arcLeft - outsideGap - labelBox.boxWidth;
    labelBox.radialX =
      labelBox.x + Math.cos(labelBox.angle) * (labelBox.arc.outerRadius + connectorRadialOffset);
    labelBox.radialY =
      labelBox.y + Math.sin(labelBox.angle) * (labelBox.arc.outerRadius + connectorRadialOffset);

    if (direction > 0) {
      rightBoxes.push(labelBox);
    } else {
      leftBoxes.push(labelBox);
    }
  });

  distributeLabelColumn(leftBoxes, chartHeight, containmentPadding, minimumSpacing);
  distributeLabelColumn(rightBoxes, chartHeight, containmentPadding, minimumSpacing);

  labelBoxes.forEach(labelBox => {
    labelBox.connectorX =
      labelBox.effectiveDirection > 0 ? labelBox.boxX : labelBox.boxX + labelBox.boxWidth;
    labelBox.connectorY = labelBox.boxY + labelBox.boxHeight / 2;
  });

  return labelBoxes;
};

const getLabelDirection = (options, index, angle) => {
  const naturalDirection = Math.cos(angle) >= 0 ? 1 : -1;
  if (options.placement === 'outside') {
    return naturalDirection;
  }

  const mappedDirection = Math.sign(getMappedOption(options.sideMap, index, naturalDirection)) || 1;
  if (options.allowSideMapOverride) {
    return mappedDirection;
  }

  return naturalDirection > 0 ? Math.abs(mappedDirection) : -Math.abs(mappedDirection);
};

const getInitialLabelBoxX = (elbowX, direction, paddingX, horizontalSpread, boxWidth) => {
  const labelEdgeX = elbowX + direction * (paddingX + horizontalSpread);
  return direction < 0 ? labelEdgeX - boxWidth : labelEdgeX;
};

const containLegacyLabelBox = (boxX, boxY, boxWidth, boxHeight, chartArea, chartWidth, options) => {
  if (options.placement === 'outside') {
    return { boxX, boxY };
  }

  return {
    boxX: clampLabelBoxX(boxX, boxWidth, chartArea, chartWidth, options.containmentPadding),
    boxY: clampLabelBoxY(boxY, boxHeight, chartArea),
  };
};

const getConnectorPosition = (labelBox, placement) => {
  if (placement === 'outside') {
    return { x: labelBox.connectorX, y: labelBox.connectorY };
  }

  return {
    x: labelBox.effectiveDirection > 0 ? labelBox.boxX : labelBox.boxX + labelBox.boxWidth,
    y: Math.max(
      labelBox.boxY + labelBox.padding.y,
      Math.min(labelBox.elbowY, labelBox.boxY + labelBox.boxHeight - labelBox.padding.y),
    ),
  };
};

const traceConnectorPath = (ctx, labelBox, placement, connectorPosition) => {
  ctx.moveTo(labelBox.baseX, labelBox.baseY);
  if (placement === 'outside') {
    ctx.lineTo(labelBox.radialX, labelBox.radialY);
  } else {
    ctx.lineTo(labelBox.midX, labelBox.midY);
    ctx.lineTo(labelBox.elbowX, labelBox.elbowY);
  }
  ctx.lineTo(connectorPosition.x, connectorPosition.y);
};

/**
 * Check if two label boxes overlap
 * @param {Object} box1 - First label box {left, right, top, bottom}
 * @param {Object} box2 - Second label box {left, right, top, bottom}
 * @param {number} padding - Minimum spacing required (default: 4px)
 * @returns {boolean} True if boxes overlap
 */
const checkLabelOverlap = (box1, box2, padding = 4) => {
  return !(
    box1.right + padding < box2.left ||
    box1.left - padding > box2.right ||
    box1.bottom + padding < box2.top ||
    box1.top - padding > box2.bottom
  );
};

/**
 * Resolve collision between two label boxes by adjusting horizontal positions
 * @param {Object} labelBox1 - First label box object (will be modified)
 * @param {Object} labelBox2 - Second label box object (will be modified)
 * @param {Object} chartArea - Chart area boundaries
 * @param {Object} options - Plugin options
 * @returns {boolean} True if collision was resolved
 */
const resolveCollision = (labelBox1, labelBox2, chartArea, options) => {
  const minSpacing = 4;
  const box1Width = labelBox1.boxWidth;
  const box2Width = labelBox2.boxWidth;

  // Calculate current positions
  const box1Left = labelBox1.boxX;
  const box1Right = labelBox1.boxX + box1Width;
  const box1Top = labelBox1.boxY;
  const box1Bottom = labelBox1.boxY + labelBox1.boxHeight;

  const box2Left = labelBox2.boxX;
  const box2Right = labelBox2.boxX + box2Width;
  const box2Top = labelBox2.boxY;
  const box2Bottom = labelBox2.boxY + labelBox2.boxHeight;

  // Calculate horizontal and vertical overlap
  const overlapLeft = Math.max(box1Left, box2Left);
  const overlapRight = Math.min(box1Right, box2Right);
  const overlapWidth = Math.max(0, overlapRight - overlapLeft);

  const overlapTop = Math.max(box1Top, box2Top);
  const overlapBottom = Math.min(box1Bottom, box2Bottom);
  const overlapHeight = Math.max(0, overlapBottom - overlapTop);

  // If no overlap, return true (no collision)
  if (overlapWidth <= 0 || overlapHeight <= 0) {
    return true;
  }

  // Determine which box is to the left
  const box1IsLeft = box1Left < box2Left;
  const leftBox = box1IsLeft ? labelBox1 : labelBox2;
  const rightBox = box1IsLeft ? labelBox2 : labelBox1;
  const leftBoxLeft = box1IsLeft ? box1Left : box2Left;
  const leftBoxRight = box1IsLeft ? box1Right : box2Right;
  const leftBoxWidth = box1IsLeft ? box1Width : box2Width;
  const rightBoxLeft = box1IsLeft ? box2Left : box1Left;
  const rightBoxRight = box1IsLeft ? box2Right : box1Right;
  const rightBoxWidth = box1IsLeft ? box2Width : box1Width;

  // Get chart center X for reference
  const chartCenterX = (chartArea.left + chartArea.right) / 2;

  // Determine which direction to push labels
  const leftBoxCenterX = leftBoxLeft + leftBoxWidth / 2;
  const rightBoxCenterX = rightBoxLeft + rightBoxWidth / 2;

  // Calculate required horizontal separation
  const separationNeeded = overlapWidth + minSpacing;
  const pushDistance = separationNeeded / 2;

  // Try pushing left box left and right box right
  let newLeftBoxLeft = leftBoxLeft - pushDistance;
  let newRightBoxLeft = rightBoxLeft + pushDistance;

  // Check horizontal boundaries
  const paddingX = Math.max(0, options.containmentPadding || 0);
  const minX = chartArea.left + paddingX;
  const maxXLeft = chartArea.right - leftBoxWidth - paddingX;
  const maxXRight = chartArea.right - rightBoxWidth - paddingX;

  // If both labels fit within boundaries, apply the adjustment
  if (
    newLeftBoxLeft >= minX &&
    newLeftBoxLeft <= maxXLeft &&
    newRightBoxLeft >= minX &&
    newRightBoxLeft <= maxXRight
  ) {
    leftBox.boxX = newLeftBoxLeft;
    rightBox.boxX = newRightBoxLeft;
    return true;
  }

  newLeftBoxLeft = Math.max(minX, Math.min(newLeftBoxLeft, maxXLeft));
  newRightBoxLeft = Math.max(minX, Math.min(newRightBoxLeft, maxXRight));

  const clampedLeftRight = newLeftBoxLeft + leftBoxWidth;
  if (newRightBoxLeft - clampedLeftRight < minSpacing) {
    const stillNeeded = minSpacing - (newRightBoxLeft - clampedLeftRight);

    const spaceLeft = newLeftBoxLeft - minX;
    const spaceRight = maxXRight - newRightBoxLeft;

    const totalAvailableSpace = spaceLeft + spaceRight;
    if (totalAvailableSpace >= stillNeeded) {
      const pushLeft = (spaceLeft / totalAvailableSpace) * stillNeeded;
      const pushRight = (spaceRight / totalAvailableSpace) * stillNeeded;

      newLeftBoxLeft = Math.max(minX, newLeftBoxLeft - pushLeft);
      newRightBoxLeft = Math.min(maxXRight, newRightBoxLeft + pushRight);
    } else {
      newLeftBoxLeft = minX;
      newRightBoxLeft = Math.max(
        newLeftBoxLeft + leftBoxWidth + minSpacing,
        maxXRight - rightBoxWidth,
      );
      if (newRightBoxLeft < newLeftBoxLeft + leftBoxWidth + minSpacing) {
        newRightBoxLeft = newLeftBoxLeft + leftBoxWidth + minSpacing;
        if (newRightBoxLeft > maxXRight) {
          newRightBoxLeft = Math.min(newRightBoxLeft, maxXRight);
          newLeftBoxLeft = Math.max(minX, newRightBoxLeft - leftBoxWidth - minSpacing);
        }
      }
    }
  }

  newLeftBoxLeft = Math.max(minX, Math.min(newLeftBoxLeft, maxXLeft));
  newRightBoxLeft = Math.max(minX, Math.min(newRightBoxLeft, maxXRight));

  leftBox.boxX = newLeftBoxLeft;
  rightBox.boxX = newRightBoxLeft;

  return true;
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
      placement: 'radial',
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
      allowSideMapOverride: false,
      horizontalSpreadMap: undefined,
      verticalOffsetMap: undefined,
      containmentPadding: 12,
      outsideGap: 12,
      minimumLabelSpacing: 8,
      connectorRadialOffset: 8,
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

    const chartArea = chart.chartArea;

    // Phase 1: Calculate initial positions for all labels
    const labelBoxes = [];
    meta.data.forEach((arc, index) => {
      const value = dataset.data[index];
      if (!value) {
        return;
      }

      // Updated calculation to pass unrounded percentage for decimal precision support
      const percentage = options.total && options.total > 0 ? (value / options.total) * 100 : 0;
      const lines = options.formatter({ value, percentage, index });
      const labelLines = Array.isArray(lines) ? lines : [String(lines)];

      const angle = (arc.startAngle + arc.endAngle) / 2;
      const { x, y, outerRadius } = arc;

      const direction = getLabelDirection(options, index, angle);
      const baseX = x + Math.cos(angle) * outerRadius;
      const baseY = y + Math.sin(angle) * outerRadius;
      const midX = x + Math.cos(angle) * (outerRadius + options.offset * options.guideBendRatio);
      const midY = y + Math.sin(angle) * (outerRadius + options.offset * options.guideBendRatio);
      const elbowX = x + Math.cos(angle) * (outerRadius + options.offset);
      const elbowY = y + Math.sin(angle) * (outerRadius + options.offset);

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

      let boxX = getInitialLabelBoxX(elbowX, direction, padding.x, horizontalSpread, boxWidth);
      let boxY =
        elbowY - boxHeight / 2 + (getMappedOption(options.verticalOffsetMap, index, 0) || 0);

      ({ boxX, boxY } = containLegacyLabelBox(
        boxX,
        boxY,
        boxWidth,
        boxHeight,
        chartArea,
        chart?.width,
        options,
      ));

      const isRightOfCenter = boxX + boxWidth / 2 >= x;
      const effectiveDirection = isRightOfCenter ? 1 : -1;

      labelBoxes.push({
        index,
        arc,
        x,
        y,
        angle,
        baseX,
        baseY,
        midX,
        midY,
        elbowX,
        elbowY,
        boxX,
        boxY,
        boxWidth,
        boxHeight,
        labelLines,
        effectiveDirection,
        padding,
      });
    });

    // Phase 2: Position outside labels or resolve legacy label collisions
    if (options.placement === 'outside') {
      layoutOutsideLabelBoxes(labelBoxes, {
        chartHeight: chart.height,
        containmentPadding: options.containmentPadding,
        outsideGap: options.outsideGap,
        minimumSpacing: options.minimumLabelSpacing,
        connectorRadialOffset: options.connectorRadialOffset,
      });
    } else if (chartArea && labelBoxes.length > 1) {
      let iterations = 0;
      const maxIterations = 5;
      let hasCollisions = true;

      while (hasCollisions && iterations < maxIterations) {
        hasCollisions = false;
        iterations++;

        for (let i = 0; i < labelBoxes.length; i++) {
          for (let j = i + 1; j < labelBoxes.length; j++) {
            const labelBox1 = labelBoxes[i];
            const labelBox2 = labelBoxes[j];

            const box1Bounds = {
              left: labelBox1.boxX,
              right: labelBox1.boxX + labelBox1.boxWidth,
              top: labelBox1.boxY,
              bottom: labelBox1.boxY + labelBox1.boxHeight,
            };

            const box2Bounds = {
              left: labelBox2.boxX,
              right: labelBox2.boxX + labelBox2.boxWidth,
              top: labelBox2.boxY,
              bottom: labelBox2.boxY + labelBox2.boxHeight,
            };

            if (checkLabelOverlap(box1Bounds, box2Bounds)) {
              hasCollisions = true;
              resolveCollision(labelBox1, labelBox2, chartArea, options);
            }
          }
        }
      }
    }

    // Phase 3: Draw all labels with final positions
    labelBoxes.forEach(labelBox => {
      const {
        baseX,
        baseY,
        boxX,
        boxY,
        boxWidth,
        boxHeight,
        labelLines,
        effectiveDirection,
        padding: labelPadding,
      } = labelBox;

      const connectorPosition = getConnectorPosition(labelBox, options.placement);

      ctx.strokeStyle = options.lineColor;
      ctx.beginPath();
      traceConnectorPath(ctx, labelBox, options.placement, connectorPosition);
      ctx.stroke();

      if (options.markerRadius > 0) {
        ctx.fillStyle = options.lineColor;
        ctx.beginPath();
        ctx.arc(baseX, baseY, options.markerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = options.backgroundColor;
      drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, options.borderRadius);
      ctx.fill();

      if (options.borderWidth > 0) {
        ctx.strokeStyle = options.borderColor;
        ctx.lineWidth = options.borderWidth;
        drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, options.borderRadius);
        ctx.stroke();
      }

      ctx.fillStyle = options.lineColor;
      ctx.font = `${options.fontWeight} ${options.fontSize}px ${options.fontFamily}`;
      ctx.textAlign = effectiveDirection > 0 ? 'left' : 'right';
      const textX =
        effectiveDirection > 0 ? boxX + labelPadding.x : boxX + boxWidth - labelPadding.x;
      const textY = boxY + labelPadding.y + options.lineHeight / 2;

      labelLines.forEach((line, lineIndex) => {
        ctx.fillText(line, textX, textY + lineIndex * options.lineHeight);
      });
    });

    ctx.restore();
  },
};

export default externalLabelGuidesPlugin;

import externalLabelGuidesPlugin, {
  layoutOutsideLabelBoxes,
  selectFittableLabelBoxes,
} from '../externalLabelGuidesPlugin';

const CHART_CENTER = 176;
const OUTER_RADIUS = 90;

const createLabelBox = ({ angle, baseY, boxWidth = 64, boxHeight = 42 }) => ({
  angle,
  baseY,
  x: CHART_CENTER,
  y: CHART_CENTER,
  arc: { outerRadius: OUTER_RADIUS },
  boxWidth,
  boxHeight,
});

describe('layoutOutsideLabelBoxes', () => {
  it('positions labels completely outside the donut with the configured gap', () => {
    const boxes = [
      createLabelBox({ angle: -0.8, baseY: 110 }),
      createLabelBox({ angle: 2.4, baseY: 235 }),
    ];

    layoutOutsideLabelBoxes(boxes, {
      chartHeight: 352,
      containmentPadding: 4,
      outsideGap: 12,
    });

    const rightBox = boxes[0];
    const leftBox = boxes[1];
    expect(rightBox.boxX).toBe(CHART_CENTER + OUTER_RADIUS + 12);
    expect(leftBox.boxX + leftBox.boxWidth).toBe(CHART_CENTER - OUTER_RADIUS - 12);
  });

  it('keeps clustered labels ordered with at least eight pixels between boxes', () => {
    const boxes = [
      createLabelBox({ angle: -1.45, baseY: 74 }),
      createLabelBox({ angle: -1.2, baseY: 78 }),
      createLabelBox({ angle: -0.95, baseY: 83 }),
    ];

    layoutOutsideLabelBoxes(boxes, {
      chartHeight: 352,
      containmentPadding: 4,
      minimumSpacing: 8,
    });

    const sortedBoxes = [...boxes].sort((box1, box2) => box1.baseY - box2.baseY);
    sortedBoxes.forEach((box, index) => {
      if (index === 0) {
        return;
      }

      const previousBox = sortedBoxes[index - 1];
      expect(box.boxY).toBeGreaterThanOrEqual(previousBox.boxY + previousBox.boxHeight + 8);
      expect(box.connectorY).toBeGreaterThan(previousBox.connectorY);
    });
  });

  it('uses separate ordered columns for labels on opposite sides', () => {
    const boxes = [
      createLabelBox({ angle: -1.4, baseY: 72 }),
      createLabelBox({ angle: -0.9, baseY: 88 }),
      createLabelBox({ angle: 0.45, baseY: 214 }),
      createLabelBox({ angle: 2.3, baseY: 224 }),
      createLabelBox({ angle: 2.8, baseY: 202 }),
    ];

    layoutOutsideLabelBoxes(boxes, {
      chartHeight: 352,
      containmentPadding: 4,
      minimumSpacing: 8,
    });

    const rightBoxes = boxes
      .filter(box => box.effectiveDirection > 0)
      .sort((box1, box2) => box1.baseY - box2.baseY);
    const leftBoxes = boxes
      .filter(box => box.effectiveDirection < 0)
      .sort((box1, box2) => box1.baseY - box2.baseY);

    expect(rightBoxes).toHaveLength(3);
    expect(leftBoxes).toHaveLength(2);
    expect(rightBoxes.map(box => box.connectorY)).toEqual(
      [...rightBoxes].map(box => box.connectorY).sort((y1, y2) => y1 - y2),
    );
    expect(leftBoxes.map(box => box.connectorY)).toEqual(
      [...leftBoxes].map(box => box.connectorY).sort((y1, y2) => y1 - y2),
    );
  });
});

describe('externalLabelGuidesPlugin', () => {
  it('skips zero-value slices without disturbing the remaining labels', () => {
    const context = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(text => ({ width: text.length * 8 })),
    };
    const values = [12, 0, 96, 100, 42];
    const arcs = values.map((value, index) => {
      const startAngle = -Math.PI / 2 + index * 0.8;
      return {
        startAngle,
        endAngle: startAngle + 0.7,
        x: CHART_CENTER,
        y: CHART_CENTER,
        outerRadius: OUTER_RADIUS,
      };
    });
    const chart = {
      ctx: context,
      width: 352,
      height: 352,
      chartArea: { top: 28, right: 272, bottom: 324, left: 80 },
      data: { datasets: [{ data: values }] },
      options: {
        plugins: {
          externalLabelGuides: {
            placement: 'outside',
            total: 250,
          },
        },
      },
      getDatasetMeta: vi.fn(() => ({ index: 0, data: arcs })),
    };

    externalLabelGuidesPlugin.afterDatasetsDraw(chart);

    expect(context.fillText).toHaveBeenCalledTimes(8);
    expect(context.fillText).not.toHaveBeenCalledWith('0', expect.any(Number), expect.any(Number));
  });

  it('skips labels below the configured minimum percentage', () => {
    const context = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(text => ({ width: text.length * 8 })),
    };
    const values = [90, 10];
    const arcs = values.map((value, index) => {
      const startAngle = -Math.PI / 2 + index * 1.2;
      return {
        startAngle,
        endAngle: startAngle + 1,
        x: CHART_CENTER,
        y: CHART_CENTER,
        outerRadius: OUTER_RADIUS,
      };
    });
    const chart = {
      ctx: context,
      width: 352,
      height: 352,
      chartArea: { top: 28, right: 272, bottom: 324, left: 80 },
      data: { datasets: [{ data: values }] },
      options: {
        plugins: {
          externalLabelGuides: {
            placement: 'outside',
            total: 100,
            minPercentageForLabel: 15,
          },
        },
      },
      getDatasetMeta: vi.fn(() => ({ index: 0, data: arcs })),
    };

    externalLabelGuidesPlugin.afterDatasetsDraw(chart);

    expect(context.fillText).toHaveBeenCalledTimes(2);
    expect(context.fillText).toHaveBeenCalledWith('90', expect.any(Number), expect.any(Number));
    expect(context.fillText).not.toHaveBeenCalledWith('10', expect.any(Number), expect.any(Number));
  });

  it('does not draw labels when display is false', () => {
    const context = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
    };
    const chart = {
      ctx: context,
      width: 352,
      height: 352,
      data: { datasets: [{ data: [12, 21] }] },
      options: {
        plugins: {
          externalLabelGuides: {
            display: false,
          },
        },
      },
      getDatasetMeta: vi.fn(() => ({
        index: 0,
        data: [
          {
            startAngle: 0,
            endAngle: 1,
            x: CHART_CENTER,
            y: CHART_CENTER,
            outerRadius: OUTER_RADIUS,
          },
        ],
      })),
    };

    externalLabelGuidesPlugin.afterDatasetsDraw(chart);

    expect(context.save).not.toHaveBeenCalled();
    expect(context.fillText).not.toHaveBeenCalled();
  });
});

describe('selectFittableLabelBoxes', () => {
  it('drops labels that overflow the canvas', () => {
    const boxes = [
      { index: 0, boxX: 8, boxY: 8, boxWidth: 40, boxHeight: 20 },
      { index: 1, boxX: 340, boxY: 8, boxWidth: 40, boxHeight: 20 },
    ];

    const kept = selectFittableLabelBoxes(boxes, {
      chartWidth: 352,
      chartHeight: 200,
      values: [24, 6],
    });

    expect(kept).toHaveLength(1);
    expect(kept[0].index).toBe(0);
  });

  it('keeps the larger slice when two labels still overlap', () => {
    const boxes = [
      { index: 0, boxX: 10, boxY: 10, boxWidth: 40, boxHeight: 24 },
      { index: 1, boxX: 20, boxY: 18, boxWidth: 40, boxHeight: 24 },
    ];

    const kept = selectFittableLabelBoxes(boxes, {
      chartWidth: 352,
      chartHeight: 200,
      minimumSpacing: 8,
      values: [3, 24],
    });

    expect(kept).toHaveLength(1);
    expect(kept[0].index).toBe(1);
  });
});

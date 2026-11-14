import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { exportProjectSummaries } from '../exportProjectSummaries';

const pdf = {
  internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
  addPage: vi.fn(),
  addImage: vi.fn(),
  save: vi.fn(),
};

function summary(name) {
  const section = document.createElement('section');
  section.setAttribute('aria-label', `${name} Summary`);
  const card = document.createElement('article');
  card.textContent = 'Hours N/A';
  const button = document.createElement('button');
  button.textContent = 'Info';
  card.appendChild(button);
  const alert = document.createElement('span');
  alert.textContent = 'Warning: maintenance required';
  card.appendChild(alert);
  const link = document.createElement('a');
  link.textContent = 'View Details';
  card.appendChild(link);
  section.appendChild(card);
  return section;
}

describe('project summary exports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    jsPDF.mockImplementation(() => pdf);
    html2canvas.mockImplementation(async block => {
      expect(block.querySelector('button')).toBeNull();
      expect(block.querySelector('a')).toBeNull();
      return { width: 800, height: 600, toDataURL: () => 'data:image/png;base64,test' };
    });
  });

  it('creates a multi-project PDF with page breaks between complete cards', async () => {
    const sources = [summary('Alpha'), summary('Beta')];
    await exportProjectSummaries({
      summaries: sources,
      selectionContext: 'Selected project summaries: 2',
      format: 'pdf',
    });
    expect(html2canvas).toHaveBeenCalledTimes(3);
    const captured = html2canvas.mock.calls.map(([block]) => block.textContent);
    expect(captured[0]).toContain('Building Management KPI Summary');
    expect(captured[0]).toContain('Selected project summaries: 2');
    expect(captured[1]).toContain('Alpha Summary');
    expect(captured[1]).toContain('Hours N/A');
    expect(captured[1]).toContain('Warning: maintenance required');
    expect(captured[2]).toContain('Beta Summary');
    expect(pdf.addPage).toHaveBeenCalledTimes(2);
    expect(pdf.addImage).toHaveBeenCalledTimes(3);
    expect(pdf.save).toHaveBeenCalledWith(expect.stringMatching(/building-kpi-summary-.*\.pdf$/));
    expect(sources[0].querySelector('button')).not.toBeNull();
    expect(sources[0].querySelector('a')).not.toBeNull();
    expect(document.querySelector('[id^="kpi-export-"]')).toBeNull();
  });

  it('composes and downloads a single-project PNG', async () => {
    const context = { fillRect: vi.fn(), drawImage: vi.fn() };
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
    const toDataURL = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/png;base64,test');
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await exportProjectSummaries({
      summaries: [summary('Alpha')],
      selectionContext: 'All displayed project summaries: 1',
      format: 'png',
    });
    expect(context.drawImage).toHaveBeenCalledTimes(2);
    expect(click).toHaveBeenCalledOnce();
    expect(document.querySelector('[id^="kpi-export-"]')).toBeNull();
    getContext.mockRestore();
    toDataURL.mockRestore();
    click.mockRestore();
  });

  it('cleans up after capture errors without changing the source', async () => {
    const source = summary('Alpha');
    html2canvas.mockRejectedValue(new Error('capture failed'));
    await expect(
      exportProjectSummaries({ summaries: [source], selectionContext: 'Selected', format: 'pdf' }),
    ).rejects.toThrow('capture failed');
    expect(source.querySelector('button')).not.toBeNull();
    expect(document.querySelector('[id^="kpi-export-"]')).toBeNull();
  });

  it('rejects empty or oversized reports without downloading', async () => {
    await expect(
      exportProjectSummaries({ summaries: [], selectionContext: '', format: 'pdf' }),
    ).rejects.toThrow('No project summaries');
    html2canvas.mockResolvedValue({
      width: 800,
      height: 9000,
      toDataURL: () => 'data:image/png;base64,test',
    });
    await expect(
      exportProjectSummaries({
        summaries: [summary('Alpha')],
        selectionContext: 'Selected',
        format: 'png',
      }),
    ).rejects.toThrow('PNG is too large');
    expect(document.querySelector('[id^="kpi-export-"]')).toBeNull();
  });

  it('rejects an oversized PDF block rather than clipping it', async () => {
    html2canvas.mockResolvedValue({
      width: 800,
      height: 2000,
      toDataURL: () => 'data:image/png;base64,test',
    });
    await expect(
      exportProjectSummaries({
        summaries: [summary('Alpha')],
        selectionContext: 'Selected',
        format: 'pdf',
      }),
    ).rejects.toThrow('too tall for a PDF page');
    expect(pdf.save).not.toHaveBeenCalled();
    expect(document.querySelector('[id^="kpi-export-"]')).toBeNull();
  });
});

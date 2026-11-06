import { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import Select, { components } from 'react-select';
import axios from 'axios';
import { fetchIssues } from '../../../actions/bmdashboard/issueChartActions';
import { getUserProfileBasicInfo } from '../../../actions/userManagement';
import { ENDPOINTS } from '../../../utils/URL';
import 'chart.js/auto';
import styles from './issueChart.module.css';

const NARROW_CARD_CHART_WIDTH = 440; // make card-mode IssueChart X-axis labels rotate at 45° when chart width is below this value, below 1296px
const X_AXIS_MAX_CHARS_PER_LINE = 10;

// Fixed high-contrast palette so each year keeps a distinct, readable color in both themes
const YEAR_COLORS = [
  '#2563EB', // blue
  '#F97316', // orange
  '#16A34A', // green
  '#DC2626', // red
  '#9333EA', // purple
  '#0891B2', // cyan
  '#CA8A04', // amber
  '#DB2777', // pink
];

const getYearColor = idx => YEAR_COLORS[idx % YEAR_COLORS.length];

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const BREAKDOWN_OPTIONS = [
  { value: 'month', label: 'Month' },
  { value: 'project', label: 'Project' },
  { value: 'subCategory', label: 'Sub-category' },
];

// Issue title/text are stored as arrays in the BuildingIssue model
const joinText = value => (Array.isArray(value) ? value.filter(Boolean).join(' ') : value || '');

// Severity levels stored on building issues; older issues without one are "Unspecified"
const SEVERITY_LEVELS = new Set(['Low', 'Medium', 'High', 'Critical']);
const UNSPECIFIED_SEVERITY = 'Unspecified';
const SEVERITY_OPTIONS = [...SEVERITY_LEVELS, UNSPECIFIED_SEVERITY].map(level => ({
  value: level,
  label: level,
}));
const getSeverity = issue =>
  SEVERITY_LEVELS.has(issue?.severity) ? issue.severity : UNSPECIFIED_SEVERITY;
// projectId / createdBy may come back as an id string or a populated object
const toId = value => String(value?._id ?? value ?? '');

// The chart groups years with UTC ($year in the aggregation), so drill-down does the same
const getIssueYear = issue => new Date(issue.issueDate).getUTCFullYear();

const formatIssueDate = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const escapeCsvValue = value => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

// Builds a CSV (opens directly in Excel) and triggers a download
const downloadCsv = (fileName, header, rows) => {
  const lines = [header, ...rows].map(row => row.map(escapeCsvValue).join(','));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const toFileSlug = value =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const formatTrend = (current, previous) => {
  const diff = current - previous;
  if (diff === 0) return { arrow: '▬', text: 'no change', direction: 'Flat' };
  const pct = previous > 0 ? ` (${Math.round((Math.abs(diff) / previous) * 100)}%)` : '';
  // More issues is worse, so an increase is shown as a warning colour
  return diff > 0
    ? { arrow: '▲', text: `+${diff}${pct}`, direction: 'Up' }
    : { arrow: '▼', text: `${diff}${pct}`, direction: 'Down' };
};

const stripNumericSuffix = value => {
  const str = String(value);
  let end = str.length;
  while (end > 0) {
    const code = str.charCodeAt(end - 1);
    if (code < 48 || code > 57) break;
    end -= 1;
  }
  const base = str.slice(0, end).trim();
  return base || str;
};

const isValidIssueType = value => {
  if (value == null) return false;

  const normalized = String(value)
    .trim()
    .toLowerCase();
  return normalized !== '' && normalized !== 'null' && normalized !== 'undefined';
};

const getValidIssueTypes = sourceIssues => Object.keys(sourceIssues || {}).filter(isValidIssueType);

// Wrap long desktop X-axis labels without inserting blank rows above single long words.
const wrapXAxisLabel = (label, maxCharsPerLine) => {
  const words = String(label)
    .split(/\s+/)
    .filter(Boolean);
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length <= maxCharsPerLine) {
      currentLine = nextLine;
      return;
    }

    // Avoid blank first lines for long single-word labels like "Maintenance".
    if (currentLine) lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) lines.push(currentLine);
  return lines;
};

const getXAxisLabel = (labels, value, index, ticks) =>
  labels?.[index] ?? ticks?.[index]?.label ?? String(value);

const createXAxisTickCallback = ({ labels, isMobile, useRotatedTicks = false }) => (
  value,
  index,
  ticks,
) => {
  const label = getXAxisLabel(labels, value, index, ticks);
  if (isMobile || useRotatedTicks || label.length <= X_AXIS_MAX_CHARS_PER_LINE) return label;
  return wrapXAxisLabel(label, X_AXIS_MAX_CHARS_PER_LINE);
};

const getCardTickRotation = (isMobile, useRotatedTicks) => {
  if (isMobile) return 90;
  if (useRotatedTicks) return 45;
  return 0;
};

const shouldRotateCardTicks = (chartWidth, pluginOptions) =>
  !pluginOptions.isMobile && chartWidth > 0 && chartWidth < pluginOptions.narrowChartWidth;

const issueChartCardTickRotationPlugin = {
  id: 'issueChartCardTickRotation',
  beforeUpdate(chart, _args, pluginOptions = {}) {
    if (!pluginOptions.enabled) return;

    const xTicks = chart.options?.scales?.x?.ticks;
    if (!xTicks) return;

    const measuredChartWidth = chart.width || chart.canvas?.clientWidth || 0;
    // Card-mode IssueChart can be narrow while the viewport is still desktop/tablet sized.
    const useRotatedTicks = shouldRotateCardTicks(measuredChartWidth, pluginOptions);

    const labelRotation = getCardTickRotation(pluginOptions.isMobile, useRotatedTicks);

    xTicks.minRotation = labelRotation;
    xTicks.maxRotation = labelRotation;
    xTicks.callback = createXAxisTickCallback({
      labels: chart.data?.labels,
      isMobile: pluginOptions.isMobile,
      useRotatedTicks,
    });
  },
};

// Draws the issue count above each bar (no extra dependency needed)
const barValueLabelsPlugin = {
  id: 'issueChartBarValueLabels',
  afterDatasetsDraw(chart, _args, pluginOptions = {}) {
    if (!pluginOptions.enabled) return;

    const { ctx } = chart;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = pluginOptions.color || '#232323';

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      // Value labels are for bars only (the trend line has its own tooltip)
      if (!chart.isDatasetVisible(datasetIndex) || dataset.type === 'line') return;
      const meta = chart.getDatasetMeta(datasetIndex);

      meta.data.forEach((bar, index) => {
        const value = Number(dataset.data?.[index]) || 0;
        if (value <= 0) return;

        // Scale text to the bar width so labels stay readable without overlapping neighbours
        const fontSize = Math.max(8, Math.min(12, Math.floor((bar.width || 10) * 0.9)));
        ctx.font = `600 ${fontSize}px sans-serif`;
        ctx.fillText(String(value), bar.x, bar.y - 2);
      });
    });

    ctx.restore();
  },
};

const handleLegendClick = (e, legendItem, legend) => {
  const index = legendItem.datasetIndex;
  const chart = legend.chart;
  const visible = chart.isDatasetVisible(index);
  chart.setDatasetVisibility(index, !visible);
  chart.update();
};

const getTooltipLabel = (ctx, chartAnalysis) => {
  const year = ctx.dataset.label;
  const value = Number(ctx.raw) || 0;
  if (ctx.dataset.type === 'line') return `${year}: ${value}`;
  const total = chartAnalysis.totalByYear?.[year] ?? 0;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  return `${year}: ${value} (${pct}%)`;
};

const getBarBackgroundColor = (ctx, chartAnalysis) => {
  const idx = ctx.dataIndex;
  const ds = ctx.dataset;
  const base = ds.backgroundColor;

  if (chartAnalysis.topIssueTypeIndex < 0) return base;

  const isTop = idx === chartAnalysis.topIssueTypeIndex;

  if (typeof base === 'string' && base.startsWith('hsl(')) {
    const alpha = isTop ? 0.9 : 0.55;
    return base.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`);
  }

  return base;
};

const getBarBorderWidth = (ctx, chartAnalysis) =>
  ctx.dataIndex === chartAnalysis.topIssueTypeIndex ? 2 : 1.5;

function IssueChart({ variant = 'standalone', showTitle = true }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const { loading, issues, error } = useSelector(state => state.bmissuechart);
  const userProfiles = useSelector(state => state.allUserProfilesBasicInfo?.userProfilesBasicInfo);

  const [filters, setFilters] = useState({ issueTypes: [], years: [] });
  // 'multi' compares several years side by side; 'single' focuses on one year
  const [viewMode, setViewMode] = useState('multi');
  const [singleYear, setSingleYear] = useState(null);
  // Project and Reported By filters (ids); applied to the individual issue records
  const [projectFilter, setProjectFilter] = useState([]);
  const [reporterFilter, setReporterFilter] = useState([]);
  const [severityFilter, setSeverityFilter] = useState([]);
  // Drill-down: the bar the user clicked ({ base: issue type, year })
  const [drill, setDrill] = useState(null);
  const [breakdownBy, setBreakdownBy] = useState('month');
  // Individual issue records are only loaded the first time a bar is clicked
  const [issueRecords, setIssueRecords] = useState(null);
  const [projectNames, setProjectNames] = useState({});
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  // Ref (not state) so the chart's click handler always sees whether records were requested
  const recordsRequestedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false,
  );

  const isCardVariant = variant === 'card';
  const isSingleYearView = viewMode === 'single';

  useEffect(() => {
    dispatch(fetchIssues());
    // Names for the Reported By filter
    dispatch(getUserProfileBasicInfo({ source: 'IssueChart' }));
  }, [dispatch]);

  useEffect(() => {
    if (issues && Object.keys(issues).length > 0) {
      // Sanitize backend issue-type keys once before they enter filters or chart labels.
      const allIssueTypes = getValidIssueTypes(issues);
      const allYears = [
        ...new Set(
          Object.values(issues)
            .flatMap(issueData => Object.keys(issueData))
            .map(year => parseInt(year, 10)),
        ),
      ].sort((a, b) => a - b);

      setFilters({ issueTypes: allIssueTypes, years: allYears });
    }
  }, [issues]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const extractDropdownOptions = () => {
    const rawIssueTypes = [...new Set(getValidIssueTypes(issues))];
    const issueTypeGroups = rawIssueTypes.reduce((acc, name) => {
      const base = stripNumericSuffix(name);
      if (!acc[base]) acc[base] = [];
      acc[base].push(name);
      return acc;
    }, {});

    const groupedIssueTypes = Object.entries(issueTypeGroups).map(([base, names]) => {
      const options = names
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map(issue => ({ label: issue, value: issue }));

      return names.length > 1
        ? {
            label: `${base} (e.g., ${names.slice(0, 3).join(', ')}${
              names.length > 3 ? ', …' : ''
            })`,
            options,
          }
        : options[0];
    });

    const years = [
      ...new Set(
        Object.values(issues || {})
          .flatMap(issueData => Object.keys(issueData))
          .map(y => parseInt(y, 10)),
      ),
    ]
      .sort((a, b) => a - b)
      .map(year => ({ label: year.toString(), value: year }));

    return {
      issueTypes: groupedIssueTypes,
      years,
    };
  };

  const { issueTypes, years } = extractDropdownOptions();

  const flattenOptions = options =>
    options.flatMap(option => (option.options ? option.options : option));

  const flatIssueTypeOptions = flattenOptions(issueTypes);
  const uniqueYears = years.map(y => y.value);
  const latestYear = uniqueYears.at(-1) ?? null;
  // Single-year view defaults to the most recent year until the user picks one
  const selectedSingleYear = singleYear ?? latestYear;

  const yearColorMap = useMemo(
    () =>
      uniqueYears.reduce((acc, year, idx) => {
        acc[year] = getYearColor(idx);
        return acc;
      }, {}),
    [uniqueYears],
  );

  const handleFilterChange = (selected, field) => {
    const cleaned = (selected || [])
      .filter(option => option?.value != null)
      .map(option => option.value)
      .filter(value => {
        const lower = String(value).toLowerCase();
        return lower !== '__all__' && lower !== 'select all' && lower !== 'all';
      });

    setFilters(prev => ({
      ...prev,
      [field]: cleaned,
    }));
  };

  const handleSelectAll = field => {
    setFilters(prev => ({
      ...prev,
      [field]: field === 'issueTypes' ? getValidIssueTypes(issues) : uniqueYears,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      issueTypes: [],
      years: [],
    });
    setSingleYear(null);
    setProjectFilter([]);
    setReporterFilter([]);
    setSeverityFilter([]);
    setDrill(null);
  };

  const loadIssueRecords = async () => {
    if (recordsRequestedRef.current) return;
    recordsRequestedRef.current = true;
    setRecordsLoading(true);
    setRecordsError('');
    try {
      const [issuesRes, projectsRes] = await Promise.all([
        axios.get(ENDPOINTS.BM_INJURY_ISSUE),
        axios.get(`${ENDPOINTS.BM_INJURY_ISSUE}/projects`).catch(() => ({ data: [] })),
      ]);
      const names = {};
      (Array.isArray(projectsRes.data) ? projectsRes.data : []).forEach(project => {
        const id = project?.projectId || project?._id || project?.id;
        const name = project?.projectName || project?.name;
        if (id && name) names[String(id)] = name;
      });
      setProjectNames(names);
      setIssueRecords(Array.isArray(issuesRes.data) ? issuesRes.data : []);
    } catch {
      // Allow a retry on the next bar click
      recordsRequestedRef.current = false;
      setRecordsError('Could not load issue details. Click the bar again to retry.');
    } finally {
      setRecordsLoading(false);
    }
  };

  // Records are needed for the Project / Reported By filters, so load them up front
  useEffect(() => {
    loadIssueRecords().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const matchesRecordFilters = issue =>
    (!projectFilter.length || projectFilter.includes(toId(issue.projectId))) &&
    (!reporterFilter.length || reporterFilter.includes(toId(issue.createdBy))) &&
    (!severityFilter.length || severityFilter.includes(getSeverity(issue)));

  const hasRecordFilters =
    projectFilter.length > 0 || reporterFilter.length > 0 || severityFilter.length > 0;

  // Issue counts in the same { type: { year: count } } shape as the chart API, built from
  // records so the extra filters apply. Falls back to the API counts until records load.
  const issueCounts = useMemo(() => {
    if (!issueRecords) return issues || {};
    const counts = {};
    issueRecords.forEach(issue => {
      if (!isValidIssueType(issue?.issueType) || !matchesRecordFilters(issue)) return;
      const year = getIssueYear(issue);
      if (Number.isNaN(year)) return;
      if (!counts[issue.issueType]) counts[issue.issueType] = {};
      counts[issue.issueType][year] = (counts[issue.issueType][year] || 0) + 1;
    });
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueRecords, issues, projectFilter, reporterFilter, severityFilter]);

  const projectOptions = useMemo(() => {
    const ids = new Set((issueRecords || []).map(issue => toId(issue.projectId)).filter(Boolean));
    return Array.from(ids)
      .map(id => ({ value: id, label: projectNames[id] || `Project ${id.slice(-6)}` }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [issueRecords, projectNames]);

  const reporterOptions = useMemo(() => {
    const profiles = Array.isArray(userProfiles) ? userProfiles : [];
    const nameById = new Map(
      profiles.map(user => [
        String(user._id),
        `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      ]),
    );
    const ids = new Set((issueRecords || []).map(issue => toId(issue.createdBy)).filter(Boolean));
    return Array.from(ids)
      .map(id => ({ value: id, label: nameById.get(id) || `User ${id.slice(-6)}` }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [issueRecords, userProfiles]);

  const openDrillDown = (base, year) => {
    setDrill({ base, year: String(year) });
    // Errors are handled inside loadIssueRecords (shown in the panel)
    loadIssueRecords().catch(() => {});
  };

  const chartData = useMemo(() => {
    if (!issues || Object.keys(issues).length === 0) return { labels: [], datasets: [] };

    const getBase = name => stripNumericSuffix(name);

    const issueTypeKeys = getValidIssueTypes(issues).sort((a, b) => {
      const aLower = String(a).toLowerCase();
      const bLower = String(b).toLowerCase();
      const aIsNull = aLower === 'null';
      const bIsNull = bLower === 'null';

      if (aIsNull && !bIsNull) return 1;
      if (!aIsNull && bIsNull) return -1;

      return aLower.localeCompare(bLower, undefined, { numeric: true });
    });

    const groupMap = issueTypeKeys.reduce((acc, type) => {
      const base = getBase(type);
      if (!acc[base]) acc[base] = [];
      acc[base].push(type);
      return acc;
    }, {});

    const selectedTypes = filters.issueTypes.length ? filters.issueTypes : issueTypeKeys;
    const selectedTypeSet = new Set(selectedTypes.map(t => String(t).toLowerCase()));

    const selectedBases = [...new Set(selectedTypes.map(getBase))].sort((a, b) => {
      const aLower = String(a).toLowerCase();
      const bLower = String(b).toLowerCase();
      const aIsNull = aLower === 'null';
      const bIsNull = bLower === 'null';

      if (aIsNull && !bIsNull) return 1;
      if (!aIsNull && bIsNull) return -1;

      return aLower.localeCompare(bLower, undefined, { numeric: true });
    });

    let filteredYears = filters.years.length ? filters.years : uniqueYears;
    if (isSingleYearView) {
      filteredYears = selectedSingleYear == null ? [] : [selectedSingleYear];
    }
    const labels = selectedBases;

    const datasets = filteredYears.map(year => ({
      label: year.toString(),
      data: labels.map(base =>
        (groupMap[base] || [])
          .filter(type => selectedTypeSet.has(String(type).toLowerCase()))
          .reduce((sum, type) => sum + (issueCounts[type]?.[year] || 0), 0),
      ),
      backgroundColor: yearColorMap[year],
      borderColor: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
      borderWidth: 1.5,
      borderRadius: 6,
    }));

    return { labels, datasets };
  }, [
    issues,
    issueCounts,
    filters,
    uniqueYears,
    yearColorMap,
    darkMode,
    isSingleYearView,
    selectedSingleYear,
  ]);

  const chartAnalysis = useMemo(() => {
    const labels = chartData?.labels ?? [];
    const datasets = chartData?.datasets ?? [];

    const totalByYear = {};
    datasets.forEach(ds => {
      const year = ds.label;
      const total = (ds.data || []).reduce((sum, v) => sum + (Number(v) || 0), 0);
      totalByYear[year] = total;
    });

    const totalsByIssueType = labels.map((_, idx) =>
      datasets.reduce((sum, ds) => sum + (Number(ds.data?.[idx]) || 0), 0),
    );

    const topIssueTypeIndex =
      totalsByIssueType.length > 0
        ? totalsByIssueType.reduce(
            (bestIdx, val, idx, arr) => (val > arr[bestIdx] ? idx : bestIdx),
            0,
          )
        : -1;

    let peak = { value: -Infinity, year: null, issueType: null };
    datasets.forEach(ds => {
      (ds.data || []).forEach((v, idx) => {
        const value = Number(v) || 0;
        if (value > peak.value) {
          peak = { value, year: ds.label, issueType: labels[idx] ?? null };
        }
      });
    });

    let insightText = '';
    if (peak.value > 0 && peak.year && peak.issueType) {
      insightText = `${peak.issueType} issues peak in ${peak.year} (${peak.value}).`;
    } else {
      insightText = 'No issues found for the selected filters.';
    }

    return { totalByYear, topIssueTypeIndex, insightText };
  }, [chartData]);

  // Summary and year-over-year trend for the current filters
  const summary = useMemo(() => {
    const labels = chartData?.labels ?? [];
    const datasets = chartData?.datasets ?? [];
    if (!labels.length || !datasets.length) return null;

    const totalIssues = datasets.reduce(
      (sum, ds) => sum + (ds.data || []).reduce((s, v) => s + (Number(v) || 0), 0),
      0,
    );
    const typeTotals = labels.map((label, idx) => ({
      label,
      total: datasets.reduce((sum, ds) => sum + (Number(ds.data?.[idx]) || 0), 0),
    }));
    const topType = typeTotals.reduce((best, item) => (item.total > best.total ? item : best));

    // Year totals across all data for the selected issue types (previous year may be filtered out)
    const selectedTypes = filters.issueTypes.length
      ? filters.issueTypes
      : getValidIssueTypes(issues);
    const totalForYear = (year, base) =>
      selectedTypes
        .filter(type => base === undefined || stripNumericSuffix(type) === base)
        .reduce((sum, type) => sum + (Number(issueCounts?.[type]?.[year]) || 0), 0);

    const latestShownYear = Math.max(...datasets.map(ds => Number(ds.label)));
    const previousYear = latestShownYear - 1;
    const hasPreviousYear = uniqueYears.includes(previousYear);

    let yearTrend = null;
    let biggestIncrease = null;
    if (hasPreviousYear) {
      yearTrend = formatTrend(totalForYear(latestShownYear), totalForYear(previousYear));
      labels.forEach(base => {
        const diff = totalForYear(latestShownYear, base) - totalForYear(previousYear, base);
        if (diff > 0 && (!biggestIncrease || diff > biggestIncrease.diff)) {
          biggestIncrease = { base, diff };
        }
      });
    }

    // Share of currently open issues by type, for the shown types and years
    let openShare = null;
    if (issueRecords) {
      const shownYears = new Set(datasets.map(ds => String(ds.label)));
      const shownTypes = new Set(selectedTypes.map(type => String(type).toLowerCase()));
      const openByBase = {};
      let openTotal = 0;
      issueRecords.forEach(issue => {
        if (
          issue?.status !== 'open' ||
          !matchesRecordFilters(issue) ||
          !shownTypes.has(String(issue.issueType).toLowerCase()) ||
          !shownYears.has(String(getIssueYear(issue)))
        ) {
          return;
        }
        const base = stripNumericSuffix(issue.issueType);
        openByBase[base] = (openByBase[base] || 0) + 1;
        openTotal += 1;
      });
      const topOpen = Object.entries(openByBase).sort((a, b) => b[1] - a[1])[0];
      openShare = topOpen
        ? { base: topOpen[0], percent: Math.round((topOpen[1] / openTotal) * 100), openTotal }
        : { base: null, percent: 0, openTotal: 0 };
    }

    return {
      openShare,
      totalIssues,
      topType,
      topShare: totalIssues > 0 ? Math.round((topType.total / totalIssues) * 100) : 0,
      latestShownYear,
      previousYear,
      yearTrend,
      biggestIncrease,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chartData,
    filters.issueTypes,
    issues,
    issueCounts,
    uniqueYears,
    issueRecords,
    projectFilter,
    reporterFilter,
    severityFilter,
  ]);

  // Drill-down stays open only while its bar is still in the chart
  const drillActive =
    Boolean(drill) &&
    (chartData?.labels ?? []).includes(drill.base) &&
    (chartData?.datasets ?? []).some(ds => ds.label === drill.year);

  const drilledIssues = useMemo(() => {
    if (!drillActive || !issueRecords) return [];
    const selectedTypes = new Set(
      (filters.issueTypes.length ? filters.issueTypes : getValidIssueTypes(issues)).map(type =>
        String(type).toLowerCase(),
      ),
    );
    return issueRecords
      .filter(issue => {
        const type = String(issue?.issueType ?? '');
        return (
          matchesRecordFilters(issue) &&
          stripNumericSuffix(type) === drill.base &&
          selectedTypes.has(type.toLowerCase()) &&
          String(getIssueYear(issue)) === drill.year
        );
      })
      .sort((a, b) => new Date(a.issueDate) - new Date(b.issueDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    drillActive,
    issueRecords,
    drill,
    filters.issueTypes,
    issues,
    projectFilter,
    reporterFilter,
    severityFilter,
  ]);

  const getProjectName = projectId =>
    projectNames[String(projectId)] || (projectId ? `Project ${String(projectId).slice(-6)}` : '—');

  const breakdownRows = useMemo(() => {
    const counts = new Map();
    drilledIssues.forEach(issue => {
      let key;
      if (breakdownBy === 'month') {
        key = MONTH_NAMES[new Date(issue.issueDate).getUTCMonth()];
      } else if (breakdownBy === 'project') {
        key = getProjectName(issue.projectId);
      } else {
        key = issue.issueType || 'Unknown';
      }
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const rows = Array.from(counts, ([label, count]) => ({ label, count }));
    if (breakdownBy === 'month') {
      return rows.sort((a, b) => MONTH_NAMES.indexOf(a.label) - MONTH_NAMES.indexOf(b.label));
    }
    return rows.sort((a, b) => b.count - a.count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drilledIssues, breakdownBy, projectNames]);

  // Year-over-year change and resolved/unresolved split for one bar, used by the tooltip
  const statusByBaseYear = useMemo(() => {
    const map = {};
    (issueRecords || []).forEach(issue => {
      if (!isValidIssueType(issue?.issueType) || !matchesRecordFilters(issue)) return;
      const key = `${stripNumericSuffix(issue.issueType)}|${getIssueYear(issue)}`;
      if (!map[key]) map[key] = { open: 0, resolved: 0 };
      // Anything not "open" (closed / close) counts as resolved
      if (issue.status === 'open') map[key].open += 1;
      else map[key].resolved += 1;
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueRecords, projectFilter, reporterFilter, severityFilter]);

  const countForBaseYear = (base, year) => {
    const selectedTypes = filters.issueTypes.length
      ? filters.issueTypes
      : getValidIssueTypes(issues);
    return selectedTypes
      .filter(type => stripNumericSuffix(type) === base)
      .reduce((sum, type) => sum + (Number(issueCounts?.[type]?.[year]) || 0), 0);
  };

  const getTooltipDetails = ctx => {
    if (ctx.dataset.type === 'line') return [];
    const base = ctx.label;
    const year = Number(ctx.dataset.label);
    const value = Number(ctx.raw) || 0;
    const lines = [];
    if (uniqueYears.includes(year - 1)) {
      const previous = countForBaseYear(base, year - 1);
      const trend = formatTrend(value, previous);
      lines.push(`Change vs ${year - 1}: ${trend.arrow} ${trend.text}`);
    } else {
      lines.push(`No data for ${year - 1} to compare`);
    }
    const status = statusByBaseYear[`${base}|${year}`];
    if (status) lines.push(`Unresolved: ${status.open} · Resolved: ${status.resolved}`);
    return lines;
  };

  // Combo chart: bars per year plus a trend line (average across the shown years)
  const displayChartData = useMemo(() => {
    const labels = chartData?.labels ?? [];
    const datasets = chartData?.datasets ?? [];
    if (datasets.length < 2) return chartData;
    const average = labels.map((_, idx) => {
      const sum = datasets.reduce((total, ds) => total + (Number(ds.data?.[idx]) || 0), 0);
      return Math.round((sum / datasets.length) * 10) / 10;
    });
    return {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Average per year',
          data: average,
          borderColor: darkMode ? '#facc15' : '#ca8a04',
          backgroundColor: darkMode ? '#facc15' : '#ca8a04',
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 3,
          tension: 0.3,
          // Smooth curve that never overshoots below the data (no dips under 0)
          cubicInterpolationMode: 'monotone',
          order: 0,
        },
        ...datasets.map(ds => ({ ...ds, type: 'bar', order: 1 })),
      ],
    };
  }, [chartData, darkMode]);

  const chartRef = useRef(null);

  // Copies the chart onto a solid background so the image is readable outside the app
  const getChartImage = () => {
    const chart = chartRef.current;
    if (!chart?.canvas) return null;
    const source = chart.canvas;
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = darkMode ? '#1c2541' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0);
    return canvas.toDataURL('image/png');
  };

  const handleExportPng = () => {
    const image = getChartImage();
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = 'issue-chart.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Opens the browser print dialog with just the chart, where "Save as PDF" can be chosen
  const handleExportPdf = () => {
    const image = getChartImage();
    if (!image) return;
    const frame = document.createElement('iframe');
    frame.style.position = 'fixed';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    frame.onload = () => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setTimeout(() => frame.remove(), 1000);
    };
    // srcdoc instead of the deprecated document.write
    frame.srcdoc =
      `<html><head><title>Issue Chart</title></head><body style="margin:24px;font-family:sans-serif">` +
      `<h2>Issue Chart</h2>` +
      `<img src="${image}" style="max-width:100%" /></body></html>`;
    document.body.appendChild(frame);
  };

  const handleExportChart = () => {
    const labels = chartData?.labels ?? [];
    const datasets = chartData?.datasets ?? [];
    const header = ['Issue Type', ...datasets.map(ds => ds.label)];
    const rows = labels.map((label, idx) => [label, ...datasets.map(ds => ds.data?.[idx] ?? 0)]);
    downloadCsv('issue-chart-summary.csv', header, rows);
  };

  const handleExportDrillDown = () => {
    const header = [
      'Date',
      'Title',
      'Description',
      'Project',
      'Sub-category',
      'Severity',
      'Status',
    ];
    const rows = drilledIssues.map(issue => [
      formatIssueDate(issue.issueDate),
      joinText(issue.issueTitle),
      joinText(issue.issueText),
      getProjectName(issue.projectId),
      issue.issueType,
      getSeverity(issue),
      issue.status,
    ]);
    downloadCsv(`issues-${toFileSlug(drill.base)}-${drill.year}.csv`, header, rows);
  };

  const xAxisBackgroundPlugin = dm => ({
    id: 'xAxisBackground',
    beforeDraw: chart => {
      const { ctx, chartArea, scales } = chart;
      const xScale = scales.x;
      if (!xScale) return;

      ctx.save();
      const ticks = xScale.ticks.length;

      xScale.ticks.forEach((_, index) => {
        if (index % 2 !== 0) return;

        const center = xScale.getPixelForTick(index);
        const left = index === 0 ? xScale.left : (xScale.getPixelForTick(index - 1) + center) / 2;
        const right =
          index === ticks - 1 ? xScale.right : (center + xScale.getPixelForTick(index + 1)) / 2;

        ctx.fillStyle = dm ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
        ctx.fillRect(left, chartArea.top, right - left, chartArea.bottom - chartArea.top);
      });

      ctx.restore();
    },
  });

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      // Clicking a bar opens the drill-down for that issue type and year
      onClick: (_event, elements, chart) => {
        if (!elements?.length) return;
        const { datasetIndex, index } = elements[0];
        const dataset = chart.data.datasets?.[datasetIndex];
        // The trend line is not a single year, so it has no drill-down
        if (dataset?.type === 'line') return;
        const base = chart.data.labels?.[index];
        const year = dataset?.label;
        if (base !== undefined && year !== undefined) openDrillDown(base, year);
      },
      onHover: (event, elements) => {
        const target = event?.native?.target;
        if (target) target.style.cursor = elements?.length ? 'pointer' : 'default';
      },
      layout: {
        padding: {
          // Room above the tallest bar for its value label
          top: 16,
          bottom: isCardVariant ? 8 : 56,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          onClick: handleLegendClick,
          labels: {
            font: { size: 13 },
            usePointStyle: true,
            color: darkMode ? '#cfd7e3' : '#232323',
          },
        },
        title: {
          display: !isCardVariant,
          text: 'Number of Issues Reported by Type',
          font: { size: 17 },
          color: darkMode ? '#cfd7e3' : '#232323',
        },
        tooltip: {
          enabled: true,
          mode: 'nearest',
          intersect: true,
          backgroundColor: darkMode ? '#232323' : '#fff',
          titleColor: darkMode ? '#fff' : '#232323',
          bodyColor: darkMode ? '#fff' : '#232323',
          callbacks: {
            title: items => items?.[0]?.label ?? '',
            label: ctx => getTooltipLabel(ctx, chartAnalysis),
            afterLabel: ctx => getTooltipDetails(ctx),
          },
        },
        datalabels: {
          display: false,
        },
        issueChartBarValueLabels: {
          enabled: true,
          color: darkMode ? '#f3f4f6' : '#1f2937',
        },
        issueChartCardTickRotation: {
          enabled: isCardVariant,
          isMobile,
          narrowChartWidth: NARROW_CARD_CHART_WIDTH,
        },
        xAxisBackground: true,
      },
      datasets: {
        bar: {
          backgroundColor: ctx => getBarBackgroundColor(ctx, chartAnalysis),
          borderWidth: ctx => getBarBorderWidth(ctx, chartAnalysis),
        },
      },
      scales: {
        x: {
          offset: true,
          title: {
            display: true,
            text: 'Issue Type',
            font: { size: 14 },
            color: darkMode ? '#cfd7e3' : '#232323',
          },
          grid: { display: false },
          barPercentage: 0.9,
          categoryPercentage: 0.8,
          ticks: {
            color: darkMode ? '#e8f0fe' : '#1a1a1a',
            stepSize: 1,
            padding: 10,
            align: 'center',
            autoSkip: false,
            maxRotation: isMobile ? 90 : 0,
            minRotation: isMobile ? 90 : 0,
            // Card-mode desktop labels have less width, so only those X-axis ticks use smaller text.
            // Use 8px only for desktop card-mode X-axis ticks so crowded labels fit the narrow card.
            font: { size: isCardVariant && !isMobile ? 8 : 12, weight: '500' },
            callback: createXAxisTickCallback({
              labels: chartData?.labels,
              isMobile,
            }),
          },
          border: {
            color: darkMode ? '#4a5568' : '#e2e8f0',
            width: 1,
          },
        },
        y: {
          title: {
            display: true,
            text: 'No. of Issues',
            font: { size: 14 },
            color: darkMode ? '#cfd7e3' : '#232323',
          },
          beginAtZero: true,
          ticks: { stepSize: 1, color: darkMode ? '#cfd7e3' : '#232323' },
          grid: { color: darkMode ? '#353535' : '#efefef' },
        },
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      darkMode,
      isMobile,
      chartAnalysis,
      chartData,
      isCardVariant,
      statusByBaseYear,
      issueCounts,
      filters.issueTypes,
      uniqueYears,
    ],
  );

  const chartPlugins = useMemo(
    () => [xAxisBackgroundPlugin(darkMode), issueChartCardTickRotationPlugin, barValueLabelsPlugin],
    [darkMode],
  );

  const selectStyles = useMemo(
    () => ({
      control: provided => ({
        ...provided,
        backgroundColor: darkMode ? '#22272e' : '#ffffff',
        borderColor: darkMode ? '#3d444d' : '#ccc',
        color: darkMode ? '#cfd7e3' : '#333',
        // Keep the select itself compact; extra selected chips scroll inside the value area.
        minHeight: 42,
        height: 42,
        maxHeight: 42,
        alignItems: 'center',
        paddingTop: 0,
        paddingBottom: 0,
        boxShadow: 'none',
        '&:hover': {
          borderColor: darkMode ? '#3d444d' : '#bbb',
        },
      }),
      valueContainer: provided => ({
        ...provided,
        display: 'flex',
        // Show roughly one chip row so filters do not push the chart far down the card.
        height: 34,
        maxHeight: 34,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
      }),
      input: provided => ({
        ...provided,
        margin: 0,
        padding: 0,
        lineHeight: 'normal',
        color: darkMode ? '#cfd7e3' : '#333',
      }),
      menu: provided => ({
        ...provided,
        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
        color: darkMode ? '#cfd7e3' : '#333',
      }),
      menuList: provided => ({
        ...provided,
        maxHeight: 220,
        paddingTop: 6,
        paddingBottom: 6,
        overflowY: 'auto',
      }),
      groupHeading: provided => ({
        ...provided,
        fontSize: 12,
        fontWeight: 600,
        color: darkMode ? '#cfd7e3' : '#4a5568',
      }),
      indicatorsContainer: provided => ({
        ...provided,
        alignItems: 'center',
        alignSelf: 'stretch',
        flexShrink: 0,
        paddingRight: 6,
      }),
      singleValue: provided => ({
        ...provided,
        color: darkMode ? '#cfd7e3' : '#333',
      }),
      multiValue: provided => ({
        ...provided,
        margin: '1px 4px 1px 0',
        backgroundColor: darkMode ? '#3d444d' : '#e2e8f0',
        maxWidth: '100%',
      }),
      multiValueLabel: provided => ({
        ...provided,
        color: darkMode ? '#cfd7e3' : '#333',
        fontSize: 13,
        lineHeight: 1.2,
        whiteSpace: 'normal',
      }),
      multiValueRemove: provided => ({
        ...provided,
        alignItems: 'center',
        display: 'flex',
        paddingLeft: 4,
        paddingRight: 4,
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? (darkMode ? '#4caf50' : '#e2e8f0') : 'transparent',
        color: state.isFocused ? (darkMode ? '#fff' : '#1a202c') : darkMode ? '#cfd7e3' : '#333',
        paddingTop: 8,
        paddingBottom: 8,
      }),
      placeholder: provided => ({
        ...provided,
        color: darkMode ? '#aab1bf' : '#6b7280',
        fontWeight: 500,
        lineHeight: 1.4,
        margin: 0,
        alignSelf: 'center',
        paddingTop: 2,
        paddingBottom: 2,
      }),
      indicatorsSeparator: provided => ({
        ...provided,
        backgroundColor: darkMode ? '#3d444d' : '#e5e7eb',
        marginTop: 6,
        marginBottom: 6,
      }),
    }),
    [darkMode],
  );

  const FilterMenuList = props => {
    const field = props.selectProps ? props.selectProps.filterField : undefined;
    const onMenuClose =
      props.selectProps && typeof props.selectProps.onMenuClose === 'function'
        ? props.selectProps.onMenuClose
        : undefined;

    return (
      <components.MenuList {...props}>
        <div className={styles.filterMenuActions}>
          <button
            type="button"
            className={styles.filterMenuButton}
            onClick={() => {
              if (field) handleSelectAll(field);
              if (onMenuClose) onMenuClose();
            }}
          >
            Select All
          </button>
        </div>
        {props.children}
      </components.MenuList>
    );
  };

  FilterMenuList.displayName = 'IssueChartFilterMenuList';

  const activeFilterSummary = useMemo(() => {
    const issueTypeCount = filters.issueTypes.length || getValidIssueTypes(issues).length;

    if (isSingleYearView) {
      return `${issueTypeCount} Issue Types | ${selectedSingleYear ?? 'No year'}`;
    }

    const yearList = filters.years.length ? filters.years : uniqueYears;
    const range =
      yearList.length > 0 ? `${Math.min(...yearList)}–${Math.max(...yearList)}` : 'No years';

    const extra = hasRecordFilters ? ' | Project/Reporter/Severity filtered' : '';
    return `${issueTypeCount} Issue Types | ${range}${extra}`;
  }, [
    hasRecordFilters,
    filters.issueTypes,
    filters.years,
    issues,
    uniqueYears,
    isSingleYearView,
    selectedSingleYear,
  ]);

  const viewToggleButtonClass = isActive =>
    `${styles.issueChartViewToggleButton} ${
      isActive ? styles.issueChartViewToggleButtonActive : ''
    }`;

  const chartContent = (
    <div
      className={`${styles.issueChartEventContainer} ${
        darkMode ? styles.issueChartEventContainerDark : ''
      }`}
      role="region"
      aria-label="Issues bar chart"
      style={
        isCardVariant ? { padding: 0, margin: 0, boxShadow: 'none', background: 'transparent' } : {}
      }
    >
      {showTitle && (
        <h2
          className={`${styles.issueChartEventTitle} ${
            darkMode ? styles.issueChartEventTitleDark : ''
          }`}
          style={isCardVariant ? { marginTop: 0, marginBottom: 8 } : {}}
        >
          Issue Chart
        </h2>
      )}

      {/* Switch between comparing several years and focusing on one year */}
      <fieldset
        className={`${styles.issueChartViewToggle} ${
          darkMode ? styles.issueChartViewToggleDark : ''
        }`}
        aria-label="Chart view"
      >
        <button
          type="button"
          className={viewToggleButtonClass(!isSingleYearView)}
          aria-pressed={!isSingleYearView}
          onClick={() => setViewMode('multi')}
        >
          Compare Years
        </button>
        <button
          type="button"
          className={viewToggleButtonClass(isSingleYearView)}
          aria-pressed={isSingleYearView}
          onClick={() => setViewMode('single')}
        >
          Single Year
        </button>
      </fieldset>

      <div
        className={styles.selectContainer}
        style={{ justifyContent: 'center', gap: '12px', rowGap: '12px', flexWrap: 'wrap' }}
      >
        <div style={{ minWidth: 200 }}>
          <label
            htmlFor={`issue-type-select-${variant}`}
            className={`${styles.issueChartLabel} ${darkMode ? styles.issueChartLabelDark : ''}`}
            title="Issue types with similar names are grouped (e.g., Technical, Technical1, Technical2)"
          >
            Issue Type:
          </label>
          <Select
            inputId={`issue-type-select-${variant}`}
            className={`${styles.issueChartSelect} ${darkMode ? styles.issueChartSelectDark : ''}`}
            isMulti
            options={issueTypes}
            onChange={selected => handleFilterChange(selected, 'issueTypes')}
            value={flatIssueTypeOptions.filter(option => filters.issueTypes.includes(option.value))}
            styles={selectStyles}
            aria-label="Filter issues by type"
            placeholder="Select issue types"
            components={{ MenuList: FilterMenuList }}
            filterField="issueTypes"
          />
        </div>

        <div style={{ minWidth: 200 }}>
          <label
            htmlFor={`year-select-${variant}`}
            className={`${styles.issueChartLabel} ${darkMode ? styles.issueChartLabelDark : ''}`}
          >
            Year:
          </label>
          {isSingleYearView ? (
            <Select
              inputId={`year-select-${variant}`}
              className={`${styles.issueChartSelect} ${
                darkMode ? styles.issueChartSelectDark : ''
              }`}
              options={years}
              onChange={selected => setSingleYear(selected?.value ?? null)}
              value={years.find(option => option.value === selectedSingleYear) || null}
              styles={selectStyles}
              aria-label="Select a year"
              placeholder="Select a year"
            />
          ) : (
            <Select
              inputId={`year-select-${variant}`}
              className={`${styles.issueChartSelect} ${
                darkMode ? styles.issueChartSelectDark : ''
              }`}
              isMulti
              options={years}
              onChange={selected => handleFilterChange(selected, 'years')}
              value={years.filter(option => filters.years.includes(option.value))}
              styles={selectStyles}
              aria-label="Filter issues by year"
              placeholder="Select years"
              components={{ MenuList: FilterMenuList }}
              filterField="years"
            />
          )}
        </div>

        <div style={{ minWidth: 200 }}>
          <label
            htmlFor={`project-select-${variant}`}
            className={`${styles.issueChartLabel} ${darkMode ? styles.issueChartLabelDark : ''}`}
          >
            Project:
          </label>
          <Select
            inputId={`project-select-${variant}`}
            className={`${styles.issueChartSelect} ${darkMode ? styles.issueChartSelectDark : ''}`}
            isMulti
            options={projectOptions}
            value={projectOptions.filter(option => projectFilter.includes(option.value))}
            onChange={selected => setProjectFilter((selected || []).map(option => option.value))}
            styles={selectStyles}
            isLoading={recordsLoading}
            aria-label="Filter issues by project"
            placeholder="All projects"
          />
        </div>

        <div style={{ minWidth: 200 }}>
          <label
            htmlFor={`reporter-select-${variant}`}
            className={`${styles.issueChartLabel} ${darkMode ? styles.issueChartLabelDark : ''}`}
          >
            Reported By:
          </label>
          <Select
            inputId={`reporter-select-${variant}`}
            className={`${styles.issueChartSelect} ${darkMode ? styles.issueChartSelectDark : ''}`}
            isMulti
            options={reporterOptions}
            value={reporterOptions.filter(option => reporterFilter.includes(option.value))}
            onChange={selected => setReporterFilter((selected || []).map(option => option.value))}
            styles={selectStyles}
            isLoading={recordsLoading}
            aria-label="Filter issues by reporter"
            placeholder="Anyone"
          />
        </div>

        <div style={{ minWidth: 200 }}>
          <label
            htmlFor={`severity-select-${variant}`}
            className={`${styles.issueChartLabel} ${darkMode ? styles.issueChartLabelDark : ''}`}
          >
            Severity Level:
          </label>
          <Select
            inputId={`severity-select-${variant}`}
            className={`${styles.issueChartSelect} ${darkMode ? styles.issueChartSelectDark : ''}`}
            isMulti
            options={SEVERITY_OPTIONS}
            value={SEVERITY_OPTIONS.filter(option => severityFilter.includes(option.value))}
            onChange={selected => setSeverityFilter((selected || []).map(option => option.value))}
            styles={selectStyles}
            aria-label="Filter issues by severity level"
            placeholder="All severities"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="button"
            onClick={handleClearFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007FFF',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              height: '38px',
            }}
            aria-label="Clear all issue chart filters"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <div
          className={`${styles.issueChartYearGroup} ${styles.issueTypeGroup} ${
            darkMode ? styles.issueChartYearGroupDark : ''
          }`}
          style={
            isCardVariant
              ? {
                  display: 'flex',
                  flex: '1 1 auto',
                  flexDirection: 'column',
                  marginTop: 10,
                  minHeight: 0,
                }
              : { marginTop: 10 }
          }
        >
          <div className={styles.activeFilterSummary}>{activeFilterSummary}</div>

          {summary && (
            <section
              className={`${styles.issueInsights} ${darkMode ? styles.issueInsightsDark : ''}`}
              aria-label="Issue summary"
            >
              <div className={styles.issueInsightsStats}>
                <div className={styles.issueInsightsStat}>
                  <span className={styles.issueInsightsValue}>{summary.totalIssues}</span>
                  <span className={styles.issueInsightsLabel}>Total issues</span>
                </div>
                <div className={styles.issueInsightsStat}>
                  <span className={styles.issueInsightsValue}>{summary.topType.label}</span>
                  <span className={styles.issueInsightsLabel}>
                    Highest-impact type ({summary.topType.total}, {summary.topShare}%)
                  </span>
                </div>
                <div className={styles.issueInsightsStat}>
                  {summary.yearTrend ? (
                    <span
                      className={`${styles.issueInsightsValue} ${
                        styles[`issueTrend${summary.yearTrend.direction}`]
                      }`}
                    >
                      {summary.yearTrend.arrow} {summary.yearTrend.text}
                    </span>
                  ) : (
                    <span className={styles.issueInsightsValue}>—</span>
                  )}
                  <span className={styles.issueInsightsLabel}>
                    {summary.latestShownYear} vs {summary.previousYear}
                  </span>
                </div>
                {summary.openShare && (
                  <div className={styles.issueInsightsStat}>
                    <span className={styles.issueInsightsValue}>
                      {summary.openShare.base ? `${summary.openShare.percent}%` : '0'}
                    </span>
                    <span className={styles.issueInsightsLabel}>
                      {summary.openShare.base
                        ? `of ${summary.openShare.openTotal} open issues are ${summary.openShare.base}`
                        : 'No open issues'}
                    </span>
                  </div>
                )}
              </div>
              {summary.biggestIncrease && (
                <p className={styles.issueInsightsNote}>
                  Largest increase: <strong>{summary.biggestIncrease.base}</strong> (+
                  {summary.biggestIncrease.diff} vs {summary.previousYear})
                </p>
              )}
              <div className={styles.issueInsightsActions}>
                <span className={styles.issueInsightsHint}>
                  Click a bar to see the issues behind it.
                </span>
                <div className={styles.issueExportGroup}>
                  <button
                    type="button"
                    className={styles.issueExportButton}
                    onClick={handleExportChart}
                  >
                    Export chart data (CSV)
                  </button>
                  <button
                    type="button"
                    className={styles.issueExportButton}
                    onClick={handleExportPng}
                  >
                    Export PNG
                  </button>
                  <button
                    type="button"
                    className={styles.issueExportButton}
                    onClick={handleExportPdf}
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            </section>
          )}

          <div
            className={`${styles.chartWrapper} ${darkMode ? styles.chartWrapperDark : ''}`}
            style={{
              // Card mode has compact filters, so give the Chart.js canvas more vertical room.
              height: isCardVariant ? 'clamp(560px, 58vh, 720px)' : '520px',
              maxHeight: isCardVariant ? 'none' : '520px',
              display: 'flex',
              flex: isCardVariant ? '1 0 auto' : undefined, // don't shrink when the summary is shown
              flexDirection: 'column',
              minHeight: isCardVariant ? 480 : undefined, // keep the chart readable below the summary
              position: 'relative',
              overflow: 'hidden',
              paddingTop: 12,
              paddingBottom: 2,
            }}
          >
            <div style={{ flex: '1 1 auto', minHeight: 0, position: 'relative' }}>
              <Bar
                ref={chartRef}
                data={displayChartData}
                options={chartOptions}
                plugins={chartPlugins}
                aria-labelledby="chart-title"
              />
            </div>
            <p
              style={{
                marginBottom: 0,
                marginTop: 0,
                fontSize: 13,
                opacity: 0.85,
                textAlign: 'center',
              }}
            >
              {chartAnalysis.insightText}
            </p>
          </div>

          {drillActive && (
            <section
              className={`${styles.issueDrillDown} ${darkMode ? styles.issueDrillDownDark : ''}`}
              aria-label={`${drill.base} issues in ${drill.year}`}
            >
              <div className={styles.issueDrillHeader}>
                <h3 className={styles.issueDrillTitle}>
                  {drill.base} · {drill.year}
                  {!recordsLoading && issueRecords && ` — ${drilledIssues.length} issues`}
                </h3>
                <div className={styles.issueDrillActions}>
                  <button
                    type="button"
                    className={styles.issueExportButton}
                    onClick={handleExportDrillDown}
                    disabled={recordsLoading || drilledIssues.length === 0}
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    className={styles.issueDrillClose}
                    onClick={() => setDrill(null)}
                    aria-label="Close issue details"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {recordsLoading && <p className={styles.issueDrillMessage}>Loading issues…</p>}
              {!recordsLoading && recordsError && (
                <p className={styles.issueDrillError} role="alert">
                  {recordsError}
                </p>
              )}

              {!recordsLoading && !recordsError && issueRecords && (
                <>
                  <fieldset className={styles.issueBreakdownToggle} aria-label="Break down by">
                    {BREAKDOWN_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`${styles.issueBreakdownButton} ${
                          breakdownBy === option.value ? styles.issueBreakdownButtonActive : ''
                        }`}
                        aria-pressed={breakdownBy === option.value}
                        onClick={() => setBreakdownBy(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </fieldset>

                  {breakdownRows.length > 0 ? (
                    <ul className={styles.issueBreakdownList}>
                      {breakdownRows.map(row => (
                        <li key={row.label}>
                          <span>{row.label}</span>
                          <strong>{row.count}</strong>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.issueDrillMessage}>No issue records found for this bar.</p>
                  )}

                  {drilledIssues.length > 0 && (
                    <div className={styles.issueDrillTableWrapper}>
                      <table className={styles.issueDrillTable}>
                        <thead>
                          <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Title</th>
                            <th scope="col">Project</th>
                            <th scope="col">Sub-category</th>
                            <th scope="col">Severity</th>
                            <th scope="col">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {drilledIssues.map(issue => (
                            <tr key={issue._id}>
                              <td>{formatIssueDate(issue.issueDate)}</td>
                              <td title={joinText(issue.issueText)}>
                                {joinText(issue.issueTitle) ||
                                  joinText(issue.issueText).slice(0, 60) ||
                                  '—'}
                              </td>
                              <td>{getProjectName(issue.projectId)}</td>
                              <td>{issue.issueType}</td>
                              <td>{getSeverity(issue)}</td>
                              <td>{issue.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );

  if (isCardVariant) {
    return chartContent;
  }

  return (
    <div
      className={darkMode ? 'bg-oxford-blue text-light dark' : ''}
      style={{ minHeight: '100vh' }}
    >
      {chartContent}
    </div>
  );
}

export default IssueChart;

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  Text,
  ReferenceLine,
} from 'recharts';
import { ENDPOINTS } from '../../../../utils/URL';
import {
  analysisSeries,
  comparePeriods,
  defaultRange,
  previousRange,
  categoryStyleOrder,
  injuryProjectParams,
} from './injuryAnalysis';
import styles from './InjuryAnalysisDialog.module.css';
import { severitySignificance } from './injurySignificance';
import InjuryComparisonCards from './InjuryComparisonCards';
import SafetyEventMarkers from './SafetyEventMarkers';
import { timelineMarkers, timelineDomain, timelineLabel } from './safetyEventAnalysis';

const COLORS = [
  '#2563eb',
  '#b45309',
  '#7c3aed',
  '#047857',
  '#be185d',
  '#0e7490',
  '#b91c1c',
  '#4d7c0f',
];
const DARK_COLORS = [
  '#60a5fa',
  '#fbbf24',
  '#c084fc',
  '#34d399',
  '#f472b6',
  '#22d3ee',
  '#fb7185',
  '#a3e635',
];
const LINE_PATTERNS = ['', '9 4', '2 4', '9 3 2 3', '14 5', '4 3', '14 3 3 3', '1 3'];

function DateRange({ label, value, onChange }) {
  return (
    <fieldset className={styles.range}>
      <legend>{label}</legend>
      <label>
        Start date
        <input
          type="date"
          className={styles.dateInput}
          value={value.start}
          onChange={event => onChange({ ...value, start: event.target.value })}
        />
      </label>
      <label>
        End date
        <input
          type="date"
          className={styles.dateInput}
          value={value.end}
          onChange={event => onChange({ ...value, end: event.target.value })}
        />
      </label>
    </fieldset>
  );
}

function InjuryAnalysisDialog({
  onClose,
  darkMode,
  initialRange,
  filters,
  selectStyles,
  initialSettings,
  onSettingsChange,
  projectsLoading = false,
  projectsError = '',
}) {
  const [selectedProjects, setSelectedProjects] = useState(
    () => initialSettings?.analysisFilters?.projects || [...filters[0].value],
  );
  const [selectedSeverities, setSelectedSeverities] = useState(
    () => initialSettings?.analysisFilters?.severities || [...filters[1].value],
  );
  const [selectedTypes, setSelectedTypes] = useState(
    () => initialSettings?.analysisFilters?.types || [...filters[2].value],
  );
  const analysisFilters = useMemo(
    () => ({ projects: selectedProjects, severities: selectedSeverities, types: selectedTypes }),
    [selectedProjects, selectedSeverities, selectedTypes],
  );
  const dialogFilters = filters.map((filter, index) => ({
    ...filter,
    value: [selectedProjects, selectedSeverities, selectedTypes][index],
    onChange: [setSelectedProjects, setSelectedSeverities, setSelectedTypes][index],
  }));
  // Event annotations live only in this mounted dialog, never in saved settings.
  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(true);
  const [dataOpen, setDataOpen] = useState(false);
  const [view, setView] = useState(initialSettings?.view || 'trend');
  const [interval, setInterval] = useState(initialSettings?.interval || 'monthly');
  const [preset, setPreset] = useState(
    initialSettings?.preset || (initialRange?.start || initialRange?.end ? 'custom' : '12'),
  );
  const [rangeB, setRangeB] = useState(
    () => initialSettings?.rangeB || { ...defaultRange(), ...initialRange },
  );
  const [customRangeA, setCustomRangeA] = useState(
    () => initialSettings?.customRangeA || previousRange(rangeB.start, rangeB.end),
  );
  const [baselineMode, setBaselineMode] = useState(initialSettings?.baselineMode || 'previous');
  const rangeA = useMemo(
    () => (baselineMode === 'previous' ? previousRange(rangeB.start, rangeB.end) : customRangeA),
    [baselineMode, rangeB, customRangeA],
  );
  const [selectedCategories, setSelectedCategories] = useState(
    initialSettings?.selectedCategories ?? null,
  );
  const [filtersOpen, setFiltersOpen] = useState(initialSettings?.filtersOpen || false);
  const [categoryOrder, setCategoryOrder] = useState(initialSettings?.categoryOrder || []);
  useEffect(() => {
    onSettingsChange?.({
      view,
      interval,
      preset,
      rangeB,
      customRangeA,
      baselineMode,
      selectedCategories,
      filtersOpen,
      categoryOrder,
      analysisFilters,
    });
  }, [
    view,
    interval,
    preset,
    rangeB,
    customRangeA,
    baselineMode,
    selectedCategories,
    filtersOpen,
    categoryOrder,
    onSettingsChange,
    analysisFilters,
  ]);
  const changeRangeB = range => {
    setPreset('custom');
    setRangeB(range);
  };
  const changeRangeA = range => {
    setBaselineMode('custom');
    setCustomRangeA(range);
  };
  const [response, setResponse] = useState(null);
  const result = response?.view === view ? response.data : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useMemo(
    () => ({
      ...injuryProjectParams(selectedProjects),
      severities: selectedSeverities.map(option => option.value).join(','),
      types: selectedTypes.map(option => option.value).join(','),
    }),
    [selectedProjects, selectedSeverities, selectedTypes],
  );

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setResponse(null);
    setError('');
    const valid = range => range.start && range.end && range.start <= range.end;
    if (!valid(rangeB) || (view === 'compare' && !valid(rangeA))) {
      setError('Choose a start and end date in chronological order.');
      setLoading(false);
      return () => controller.abort();
    }
    if (view === 'compare' && rangeA.start <= rangeB.end && rangeB.start <= rangeA.end) {
      setError('Choose two non-overlapping periods for comparison.');
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    const load = range =>
      axios
        .get(`${ENDPOINTS.APIEndpoint()}/bm/injuries/category-analysis`, {
          params: { ...params, startDate: range.start, endDate: range.end, interval },
          signal: controller.signal,
        })
        .then(response => response.data);
    Promise.all(view === 'compare' ? [load(rangeA), load(rangeB)] : [load(rangeB)])
      .then(data => {
        if (active) setResponse({ view, data });
      })
      .catch(failure => {
        if (active && !controller.signal.aborted)
          setError(failure.response?.data?.error || 'Unable to load analysis. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [params, rangeA, rangeB, interval, view]);

  const trend = useMemo(
    () =>
      analysisSeries(
        view === 'trend' && result ? result[0].buckets : [],
        rangeB.start,
        rangeB.end,
        interval,
      ),
    [result, view, rangeB, interval],
  );
  const comparison = useMemo(
    () => (view === 'compare' && result ? comparePeriods(result[0], result[1]) : []),
    [result, view],
  );
  const statisticalAnalysis = useMemo(
    () => (view === 'compare' && result ? severitySignificance(result[0], result[1]) : null),
    [result, view],
  );
  useEffect(() => {
    if (!trend.series.length) return;
    setCategoryOrder(current => {
      const next = categoryStyleOrder(
        current,
        trend.series.map(series => series.name),
      );
      return next.length === current.length ? current : next;
    });
  }, [trend.series]);
  const styleOrder = categoryStyleOrder(
    categoryOrder,
    trend.series.map(series => series.name),
  );
  const options = trend.series.map(series => ({ value: series.name, label: series.name }));
  const chosen =
    selectedCategories === null
      ? options.slice(0, 5)
      : selectedCategories.filter(option =>
          options.some(current => current.value === option.value),
        );
  const visibleSeries = trend.series.filter(series =>
    chosen.some(option => option.value === series.name),
  );
  const hasData = view === 'trend' ? trend.series.length > 0 : comparison.length > 0;
  const eventMarkers = useMemo(() => timelineMarkers(events, rangeB, selectedProjects), [
    events,
    rangeB,
    selectedProjects,
  ]);
  const tick = { fill: darkMode ? '#e2e8f0' : '#334155', fontSize: 12 };

  return (
    <Modal
      isOpen
      toggle={onClose}
      size="xl"
      labelledBy="injury-analysis-title"
      className={`${styles.dialog} ${darkMode ? styles.dark : ''}`}
    >
      <ModalHeader toggle={onClose} id="injury-analysis-title">
        Injury trends & comparisons
      </ModalHeader>
      <ModalBody>
        <div className={styles.toolbar}>
          <div className={styles.switch} role="group" aria-label="Analysis view">
            <button type="button" aria-pressed={view === 'trend'} onClick={() => setView('trend')}>
              Trend
            </button>
            <button
              type="button"
              aria-pressed={view === 'compare'}
              onClick={() => setView('compare')}
            >
              Compare periods
            </button>
          </div>
          {view === 'trend' && (
            <label>
              Group by
              <select value={interval} onChange={event => setInterval(event.target.value)}>
                <option value="monthly">Month</option>
                <option value="quarterly">Quarter</option>
              </select>
            </label>
          )}
        </div>
        {loading && <p role="status">Loading analysis…</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && !hasData && (
          <p role="status">
            <span className={styles.changeLabel}>
              No recorded injuries for these filters and dates.
            </span>
            Try an earlier date range or clear the project filter.
          </p>
        )}
        <section className={styles.filterSection} aria-label="Analysis filters">
          <button
            type="button"
            className={styles.filterToggle}
            aria-expanded={filtersOpen}
            aria-controls="injury-analysis-filters"
            aria-label="Filters"
            aria-describedby="injury-filter-summary"
            onClick={() => setFiltersOpen(open => !open)}
          >
            <span className={styles.filterHeading}>
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 4h18l-7 8v7l-4 2v-9z" />
              </svg>{' '}
              Filters <span aria-hidden="true">{filtersOpen ? '▴' : '▾'}</span>
            </span>
            <span id="injury-filter-summary" className={styles.filterSummary}>
              {dialogFilters
                .map(
                  filter =>
                    `${filter.label}: ${
                      filter.value.length
                        ? `${filter.value
                            .slice(0, 2)
                            .map(option => option.label)
                            .join(', ')}${
                            filter.value.length > 2 ? ` +${filter.value.length - 2} more` : ''
                          }`
                        : 'All'
                    }`,
                )
                .join(' · ')}
            </span>
          </button>
          <div id="injury-analysis-filters" className={styles.filters} hidden={!filtersOpen}>
            {dialogFilters.map((filter, index) => (
              <div key={filter.id}>
                <label htmlFor={`analysis-${filter.id}`}>{filter.label}</label>
                <Select
                  inputId={`analysis-${filter.id}`}
                  isMulti
                  options={filter.options}
                  value={filter.value}
                  onChange={filter.onChange}
                  styles={selectStyles}
                  isLoading={index === 0 && projectsLoading}
                  placeholder={`All ${filter.label.toLowerCase()}`}
                />
              </div>
            ))}
            {projectsError && <p role="alert">{projectsError}</p>}
          </div>
        </section>
        <div className={styles.dateOptions}>
          <label>
            Date preset
            <select
              value={preset}
              onChange={event => {
                const value = event.target.value;
                setPreset(value);
                if (value !== 'custom') setRangeB(defaultRange(Number(value)));
              }}
            >
              <option value="3">Last 3 months</option>
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          {view === 'compare' && (
            <label>
              Baseline period
              <select
                value={baselineMode}
                onChange={event => {
                  setCustomRangeA(rangeA);
                  setBaselineMode(event.target.value);
                }}
              >
                <option value="previous">Previous equal-length period</option>
                <option value="custom">Custom period</option>
              </select>
            </label>
          )}
        </div>
        <div className={styles.ranges}>
          {view === 'compare' && (
            <DateRange label="Period A · baseline" value={rangeA} onChange={changeRangeA} />
          )}
          <DateRange
            label={view === 'trend' ? 'Time range' : 'Period B · comparison'}
            value={rangeB}
            onChange={changeRangeB}
          />
        </div>
        {view === 'trend' && (
          <SafetyEventMarkers
            events={events}
            onChange={setEvents}
            projects={filters[0].options}
            markers={eventMarkers}
            shown={showEvents}
            onToggle={() => setShowEvents(value => !value)}
          />
        )}
        {!loading &&
          !error &&
          (hasData || (view === 'trend' && showEvents && eventMarkers.length > 0)) && (
            <>
              {view === 'trend' ? (
                <>
                  {trend.series.length > 0 && (
                    <>
                      <label htmlFor="analysis-worker-categories">Worker categories</label>
                      <Select
                        inputId="analysis-worker-categories"
                        isMulti
                        options={options}
                        value={chosen}
                        onChange={setSelectedCategories}
                        styles={selectStyles}
                      />
                      <p className={styles.statMeta}>
                        {visibleSeries.length} of {trend.series.length} categories
                      </p>
                    </>
                  )}
                  <div className={styles.chartActions}>
                    <button
                      type="button"
                      className={styles.toolButton}
                      aria-pressed={dataOpen}
                      aria-controls="injury-trend-content"
                      onClick={() => setDataOpen(value => !value)}
                    >
                      <span aria-hidden="true">▦</span> {dataOpen ? 'View chart' : 'View data'}
                    </button>
                  </div>
                  <div id="injury-trend-content">
                    {!dataOpen &&
                    (visibleSeries.length > 0 || (showEvents && eventMarkers.length > 0)) ? (
                      <div
                        className={styles.chart}
                        role="img"
                        aria-label="Injury counts over time by worker category"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={trend.rows}
                            margin={{ top: 12, right: 24, bottom: 12, left: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke={darkMode ? '#475569' : '#e2e8f0'}
                            />
                            <XAxis
                              dataKey="time"
                              type="number"
                              scale="time"
                              domain={timelineDomain(rangeB)}
                              ticks={trend.rows.map(row => row.time).filter(Number.isFinite)}
                              tickFormatter={time => timelineLabel(time, interval)}
                              tick={tick}
                              minTickGap={25}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={tick}
                              hide={visibleSeries.length === 0}
                            />
                            <Tooltip
                              labelFormatter={(label, payload) =>
                                payload?.[0]?.payload?.dateRange || label
                              }
                              contentStyle={{
                                background: darkMode ? '#1e293b' : '#fff',
                                color: darkMode ? '#fff' : '#111',
                              }}
                            />
                            <Legend />
                            {showEvents &&
                              eventMarkers.map(marker => (
                                <ReferenceLine
                                  key={marker.date}
                                  x={marker.time}
                                  stroke={darkMode ? '#f8fafc' : '#475569'}
                                  strokeDasharray="2 5"
                                  strokeWidth={2}
                                  label={({ viewBox }) => (
                                    <text
                                      x={viewBox.x + 4}
                                      y={viewBox.y + 14}
                                      fill={darkMode ? '#f8fafc' : '#334155'}
                                      fontSize={11}
                                    >
                                      <title>
                                        {marker.date}:{' '}
                                        {marker.events
                                          .map(event => `${event.name} (${event.type})`)
                                          .join(', ')}
                                      </title>
                                      {marker.label}
                                    </text>
                                  )}
                                />
                              ))}
                            {visibleSeries.map(series => (
                              <Line
                                key={series.key}
                                type="linear"
                                dataKey={series.key}
                                name={series.name}
                                stroke={
                                  (darkMode ? DARK_COLORS : COLORS)[
                                    styleOrder.indexOf(series.name) % COLORS.length
                                  ]
                                }
                                strokeWidth={2.5}
                                strokeDasharray={
                                  LINE_PATTERNS[
                                    styleOrder.indexOf(series.name) % LINE_PATTERNS.length
                                  ]
                                }
                                strokeLinecap="round"
                                dot={trend.rows.length <= 24 ? { r: 3 } : false}
                                activeDot={{ r: 5 }}
                                isAnimationActive={false}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : !dataOpen ? (
                      <p>Select at least one worker category.</p>
                    ) : null}
                    {dataOpen && (
                      <div className={styles.tableWrap}>
                        <table>
                          <caption>Recorded injuries by period and worker category</caption>
                          <thead>
                            <tr>
                              <th scope="col">Period</th>
                              {visibleSeries.map(series => (
                                <th scope="col" key={series.key}>
                                  {series.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {trend.rows.map(row => (
                              <tr key={row.label}>
                                <th scope="row">{row.label}</th>
                                {visibleSeries.map(series => (
                                  <td key={series.key}>{row[series.key]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.periodSummary}>
                    {result[0].days === result[1].days
                      ? `A → B · ${result[0].days} days each`
                      : `A: ${result[0].days} days → B: ${result[1].days} days`}
                    {result[0].days !== result[1].days && (
                      <span className={styles.neutralStatus}>
                        Unequal periods · compare counts/day
                      </span>
                    )}
                  </p>
                  <div
                    className={styles.comparisonChart}
                    style={{ height: Math.max(280, comparison.length * 70) }}
                    role="img"
                    aria-label="Injury counts in Period A and Period B by worker category"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparison}
                        layout="vertical"
                        margin={{ top: 12, right: 24, bottom: 12, left: 12 }}
                      >
                        <XAxis type="number" allowDecimals={false} tick={tick} />
                        <YAxis
                          type="category"
                          dataKey="category"
                          width={145}
                          tick={({ x, y, payload }) => (
                            <Text
                              x={x - 8}
                              y={y}
                              width={130}
                              textAnchor="end"
                              verticalAnchor="middle"
                              {...tick}
                            >
                              {payload.value}
                            </Text>
                          )}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            value,
                            `${name}: ${
                              name === 'Period A'
                                ? `${rangeA.start} – ${rangeA.end}`
                                : `${rangeB.start} – ${rangeB.end}`
                            }`,
                          ]}
                          contentStyle={{
                            background: darkMode ? '#1e293b' : '#fff',
                            color: darkMode ? '#fff' : '#111',
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="countA"
                          name="Period A"
                          fill="#60a5fa"
                          isAnimationActive={false}
                        />
                        <Bar
                          dataKey="countB"
                          name="Period B"
                          fill="#fb923c"
                          isAnimationActive={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <InjuryComparisonCards rows={comparison} analysis={statisticalAnalysis} />
                </>
              )}
            </>
          )}
      </ModalBody>
    </Modal>
  );
}

export default InjuryAnalysisDialog;

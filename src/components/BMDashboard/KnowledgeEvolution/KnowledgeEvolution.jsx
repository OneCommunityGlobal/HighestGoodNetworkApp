import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Funnel, Search } from 'lucide-react';
import styles from './KnowledgeEvolution.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchKnowledgeEvolutionData } from '../../../actions/bmdashboard/knowledgeEvolutionActions';

const KnowledgeEvolution = () => {
  const svgRef = useRef();
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.knowledgeEvolution);
  const user = useSelector(state => state.auth.user);
  const darkMode = useSelector(state => state.theme.darkMode);
  const userId = user ? user.userid : null;

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchKnowledgeEvolutionData(userId));
  }, [dispatch, userId]);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubjectFilters, setActiveSubjectFilters] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    if (data?.knowledgeEvolution?.length > 0) {
      setSelectedSubject(data.knowledgeEvolution[0]._id);
      setActiveSubjectFilters(data.knowledgeEvolution.map(s => s._id));
    }
  }, [data]);

  useEffect(() => {
    if (!isFilterOpen) return undefined;
    const handleClickOutside = e => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  const searchTerm = searchQuery.trim().toLowerCase();
  const matchesSearch = subject => {
    if (!searchTerm) return true;
    if (subject.subjectName?.toLowerCase().includes(searchTerm)) return true;
    return (subject.atoms || []).some(a => a.atomName?.toLowerCase().includes(searchTerm));
  };
  const visibleSubjects = (data?.knowledgeEvolution || []).filter(
    s => activeSubjectFilters.includes(s._id) && matchesSearch(s),
  );

  useEffect(() => {
    if (visibleSubjects.length === 0) {
      setSelectedSubject(null);
      return;
    }
    if (!visibleSubjects.some(s => s._id === selectedSubject)) {
      setSelectedSubject(visibleSubjects[0]._id);
    }
  }, [visibleSubjects, selectedSubject]);

  const toggleSubjectFilter = subjectId => {
    setActiveSubjectFilters(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId],
    );
  };

  const allAtoms = data?.knowledgeEvolution?.flatMap(s => s.atoms) || [];
  const totalCompleted = allAtoms.filter(a => a.atomStatus === 'completed').length;
  const totalInProgress = allAtoms.filter(a => a.atomStatus === 'in_progress').length;
  const totalNotStarted = allAtoms.filter(a => a.atomStatus === 'not_started').length;
  const savedInterest = 2;
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Visibility is driven entirely by tooltipData (see the style prop below) rather than
  // an imperative ref mutation, and position is always set in the SAME handler call that
  // reveals the tooltip -- both land in one React commit, so there's never a frame where
  // it's visible with stale/default position (which showed up as a brief empty box flash
  // at a wrong location whenever a node was first entered/focused).
  //
  // Defined before the D3 draw effect so it can attach these as node-level listeners
  // (only actual chart nodes should trigger the tooltip, not clicks/hovers on empty
  // space elsewhere in the chart area).
  const handleChartMouseEnter = e => {
    const subjectData = data?.knowledgeEvolution?.find(s => s._id === selectedSubject);
    if (!subjectData) return;
    const atoms = subjectData.atoms || [];
    const completed = atoms.filter(a => a.atomStatus === 'completed').length;
    const inProgress = atoms.filter(a => a.atomStatus === 'in_progress').length;
    const notStarted = atoms.filter(a => a.atomStatus === 'not_started').length;

    const target = e?.currentTarget;
    if (target?.getBoundingClientRect) {
      const rect = target.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }

    setTooltipData({
      subject: subjectData.subjectName,
      completed,
      inProgress,
      notStarted,
    });
  };

  const handleChartMouseLeave = () => {
    setTooltipData(null);
  };

  const handleChartMouseMove = e => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleChartKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChartMouseEnter(e);
    } else if (e.key === 'Escape') {
      handleChartMouseLeave();
    }
  };

  useEffect(() => {
    if (!data || !selectedSubject) return;

    const subjectData = data.knowledgeEvolution.find(s => s._id === selectedSubject);
    if (!subjectData) return;

    const subjectNameMatches = subjectData.subjectName?.toLowerCase().includes(searchTerm);
    const courses = (subjectData.atoms || []).filter(
      atom =>
        !searchTerm || subjectNameMatches || atom.atomName?.toLowerCase().includes(searchTerm),
    );

    // Redrawing wipes whatever node is currently being hovered without ever firing its
    // mouseleave/blur (D3 removes it directly, the cursor never actually "leaves" it), so
    // any active tooltip would otherwise be stuck showing stale content in a stale position.
    handleChartMouseLeave();

    const width = 700;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.selectAll('*').remove();

    const centerX = width / 2;
    const centerY = height / 2;
    const subjectRadius = 60;
    const courseRadius = 45;
    const orbitRadius = 180;

    const colorMap = {
      completed: '#28a745',
      in_progress: '#ffc107',
      not_started: '#6c757d',
    };

    const darkerMap = {
      completed: '#1e7e34',
      in_progress: '#e0a800',
      not_started: '#5a6268',
    };

    const subjectNode = {
      id: subjectData.subjectName,
      type: 'subject',
      x: centerX,
      y: centerY,
    };

    const courseNodes = courses.map((atom, i) => {
      const angle = (2 * Math.PI * i) / (courses.length || 1);
      return {
        id: atom.atomId,
        name: atom.atomName,
        status: atom.atomStatus,
        type: 'course',
        x: centerX + orbitRadius * Math.cos(angle),
        y: centerY + orbitRadius * Math.sin(angle),
      };
    });

    const allNodes = [subjectNode, ...courseNodes];

    const allLinks = courseNodes.map(atom => {
      const dx = atom.x - subjectNode.x;
      const dy = atom.y - subjectNode.y;
      const angle = Math.atan2(dy, dx);
      return {
        x1: subjectNode.x + subjectRadius * Math.cos(angle),
        y1: subjectNode.y + subjectRadius * Math.sin(angle),
        x2: atom.x - courseRadius * Math.cos(angle),
        y2: atom.y - courseRadius * Math.sin(angle),
        status: atom.status,
      };
    });

    svg
      .append('g')
      .selectAll('line')
      .data(allLinks)
      .enter()
      .append('line')
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
      .attr('stroke', d => colorMap[d.status])
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => (d.status === 'not_started' ? '6,4' : '0'))
      .attr('opacity', 0.95);

    // Circle + label are grouped together with hover/focus listeners on the *group*, not
    // the circle alone -- otherwise moving the cursor from the circle onto its own label
    // text (a separate sibling element) fires a real mouseleave+mouseenter pair and the
    // tooltip flickers/disappears while hovering the node's own text.
    const nodeGroups = svg
      .append('g')
      .selectAll('g.chartNode')
      .data(allNodes)
      .enter()
      .append('g')
      .attr('class', 'chartNode')
      .attr('tabindex', 0)
      .style('cursor', 'pointer')
      .style('outline', 'none')
      .on('mouseenter', handleChartMouseEnter)
      .on('mouseleave', handleChartMouseLeave)
      .on('mousemove', handleChartMouseMove)
      .on('focus', handleChartMouseEnter)
      .on('blur', handleChartMouseLeave)
      .on('keydown', handleChartKeyDown);

    nodeGroups
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => (d.type === 'subject' ? subjectRadius : courseRadius))
      .attr('fill', d => {
        if (d.type === 'subject') return darkMode ? '#2a3b55' : '#ffffff';
        const c = d3.color(colorMap[d.status]);
        c.opacity = 0.3;
        return c;
      })
      .attr('stroke', d => (d.type === 'subject' ? '#8b5a00' : darkerMap[d.status]))
      .attr('stroke-width', d => (d.type === 'subject' ? 4 : 3));

    nodeGroups
      .append('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => (d.type === 'subject' ? 18 : 12))
      .attr('fill', darkMode ? '#ffffff' : '#222')
      .style('pointer-events', 'none')
      .each(function(d) {
        const node = d3.select(this);
        const words = (d.type === 'subject' ? d.id : d.name || '').split(' ');
        let yOffset = -(words.length - 1) * 6;
        words.forEach(word => {
          node
            .append('tspan')
            .attr('x', d.x)
            .attr('dy', yOffset)
            .text(word);
          yOffset = 12;
        });
      });
  }, [data, selectedSubject, darkMode, searchTerm]);

  if (loading) return <div>Loading Knowledge Evolution...</div>;
  if (error) return <div>Failed to load knowledge evolution data. Please try again later.</div>;
  if (!data) return <div>No knowledge evolution data available.</div>;

  return (
    <div className={`${darkMode ? styles.pageContainerDarkMode : ''}`}>
      <div className={`${styles.pageContainer}`}>
        {/* HEADER */}
        <div className={`${styles.headerContainer}`}>
          <h5>Knowledge Evolution</h5>

          {/* SUMMARY */}
          <div className={`${styles.summarySection}`}>
            <h6 className={`${styles.summaryHeading}`}>Overall Progress Across All Subjects</h6>

            <div className={`${styles.summaryStats}`}>
              <div className={`${styles.statBox}`}>
                <h3 className={`${styles.completedText}`}>{totalCompleted}</h3>
                <p>Total Completed</p>
              </div>

              <div className={`${styles.statBox}`}>
                <h3 className={`${styles.inProgressText}`}>{totalInProgress}</h3>
                <p>Total In Progress</p>
              </div>

              <div className={`${styles.statBox}`}>
                <h3 className={`${styles.notStartedText}`}>{totalNotStarted}</h3>
                <p>Total Not Started</p>
              </div>

              <div className={`${styles.statBox}`}>
                <h3 className={`${styles.savedInterestText}`}>{savedInterest}</h3>
                <p>Saved Interest</p>
              </div>
            </div>
          </div>

          {/* SEARCH + FILTER */}
          <div className={`${styles.searchFilterContainer}`}>
            <div className={`${styles.searchWrapper}`}>
              <Search size={18} className={`${styles.searchIcon}`} />
              <input
                type="text"
                placeholder="Search atoms or subjects"
                className={`${styles.searchInput}`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={`${styles.filterWrapper}`} ref={filterRef}>
              <button
                type="button"
                className={`${styles.filterButton}`}
                onClick={() => setIsFilterOpen(open => !open)}
              >
                <Funnel size={18} />
                <span>Filter by Subject</span>
              </button>

              {isFilterOpen && (
                <div className={`${styles.filterDropdown}`}>
                  {data.knowledgeEvolution.map(s => (
                    <label key={s._id} className={`${styles.filterDropdownItem}`}>
                      <input
                        type="checkbox"
                        checked={activeSubjectFilters.includes(s._id)}
                        onChange={() => toggleSubjectFilter(s._id)}
                      />
                      {s.subjectName}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUBJECT TABS */}
        <div className={`${styles.subjectTabs}`}>
          {visibleSubjects.map(s => (
            <button
              key={s._id}
              className={`${styles.tabButton} ${selectedSubject === s._id ? styles.activeTab : ''}`}
              onClick={() => setSelectedSubject(s._id)}
            >
              {s.subjectName}
            </button>
          ))}
        </div>

        {visibleSubjects.length === 0 ? (
          <div className={`${styles.noResultsMessage}`}>
            No atoms or subjects match your search.
          </div>
        ) : (
          <>
            <div
              className={`${styles.subjectTooltipTop}`}
              style={
                tooltipData
                  ? { top: tooltipPos.y - 130, left: tooltipPos.x, visibility: 'visible' }
                  : { visibility: 'hidden' }
              }
              aria-hidden={!tooltipData}
            >
              {tooltipData ? (
                <>
                  <div className={`${styles.tooltipTitle}`}>{tooltipData.subject} Progress</div>
                  <div className={`${styles.tooltipCounts}`}>
                    <div className={`${styles.tooltipCount}`}>
                      <span className={`${styles.completedText}`}>{tooltipData.completed}</span>
                      <div> Completed</div>
                    </div>

                    <div className={`${styles.tooltipCount}`}>
                      <span className={`${styles.inProgressText}`}>{tooltipData.inProgress}</span>
                      <div> In Progress</div>
                    </div>

                    <div className={`${styles.tooltipCount}`}>
                      <span className={`${styles.notStartedText}`}>{tooltipData.notStarted}</span>
                      <div> Not Started</div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* D3 CHART — tooltip is triggered per-node (see the draw effect), not on the
                whole wrapper, so hovering/clicking empty chart space no longer shows it. */}
            <div className={`${styles.chartWrapper}`}>
              <svg ref={svgRef} width={700} height={500} />
            </div>

            {/* Legend placed below chart */}
            <div className={`${styles.subjectTooltipBottomLegend}`}>
              <div className={`${styles.legendItem}`}>
                <span className={`${styles.completedDotSmall}`} /> Completed
              </div>
              <div className={`${styles.legendItem}`}>
                <span className={`${styles.inProgressDotSmall}`} /> In Progress
              </div>
              <div className={`${styles.legendItem}`}>
                <span className={`${styles.notStartedDotSmall}`} /> Not Started
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KnowledgeEvolution;

/* eslint-disable no-console */
/* eslint-disable testing-library/no-node-access */
import * as d3 from 'd3';
import React from 'react';
import { Button } from 'react-bootstrap';
import { boxStyle, boxStyleDark } from '../../styles';
import {
  createAxes,
  createDots,
  createLabels,
  createLegend,
  createLine,
  createSvgRoot,
  createTooltip,
} from './d3GraphUtils';

function TimeEntriesViz({ timeEntries, fromDate, toDate, darkMode }) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    generateGraph();
  }, [show, fromDate, toDate]);

  function displayGraph(logs, maxHoursCount, totalHours) {
    if (!d3 || !d3.selectAll) return;

    const tlplotElement = document.getElementById('tlplot');
    if (!tlplotElement) return;

    try {
      d3.selectAll('#tlplot > *').remove();
    } catch (e) {
      console.error('Error clearing graph:', e);
      while (tlplotElement.firstChild) {
        tlplotElement.removeChild(tlplotElement.firstChild);
      }
    }

    if (!show) return;

    const margin = { top: 30, right: 20, bottom: 30, left: 20 };
    const containerWidth = '1000';
    const width = Math.min(containerWidth - margin.left - margin.right, 1000);
    const height = 400 - margin.top - margin.bottom;

    const textColor = darkMode ? `color: #f9fafb;` : '';
    const legendHtml =
      `<div class="lengendSubContainer" style="${textColor}">` +
      `<div class="totalCount" style="${textColor}">Total Hours: ${totalHours.toFixed(2)}</div>` +
      `<div class="entLabelsOff"><button style="${textColor}">Labels Off</button></div>` +
      `<div class="entCountLabelsOn"><button style="${textColor}">Show Daily Hours</button></div>` +
      `<div class="entDateLabelsOn"><button style="${textColor}">Show Dates</button></div>` +
      `</div>`;

    try {
      const d3Element = d3.select('#tlplot');
      if (!d3Element) { console.error('Could not select #tlplot element'); return; }

      const svgRoot = createSvgRoot('#tlplot', containerWidth, height, margin, darkMode);
      const svg = svgRoot.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleTime().domain(d3.extent(logs, d => d.date)).range([0, width]);
      const y = d3.scaleLinear().domain([0, maxHoursCount + 2]).range([height, 0]);

      createAxes(svg, x, y, height, darkMode);
      createLine(svg, logs, x, y, darkMode);

      const dots = createDots(svg, logs, x, y);
      dots.on('click', function handleEvent(event, d) {
        const prevTooltip = d3.select(`.ent${d.id}`);
        if (prevTooltip.empty()) {
          const Tooltip = createTooltip('#tlplot', { id: `ent${d.id}` }, darkMode);
          Tooltip.attr('class', `tooltip ent${d.id}`)
            .html(
              `<div class="tip__container"><div class="close">` +
              `<button style="color: ${darkMode ? '#f9fafb' : 'black'}; background: transparent; border: none;">&times</button>` +
              `</div><div>Exact date: ${d3.timeFormat('%A, %B %e, %Y')(d.date)}<br>` +
              `Hours logged on this day: ${d.count.toFixed(2)}</div></div>`
            )
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY}px`)
            .style('opacity', 1);

          Tooltip.select('.close').on('click', function closeTooltip() {
            Tooltip.remove();
          });
        }
      });

      createLabels(svg, logs, x, y, 'entCountLabel', darkMode, d => d.count.toFixed(2));
      createLabels(svg, logs, x, y, 'entDateLabel', darkMode, d => d3.timeFormat('%m/%d/%Y')(d.date));

      const legend = createLegend('#tlplot', legendHtml);

      legend.select('.entLabelsOff').on('click', function handleEntLabelsOffClick() {
        d3.selectAll('.entCountLabel').style('display', 'none');
        d3.selectAll('.entDateLabel').style('display', 'none');
      });
      legend.select('.entCountLabelsOn').on('click', function handleEntCountLabelsOnClick() {
        d3.selectAll('.entCountLabel').style('display', 'block');
        d3.selectAll('.entDateLabel').style('display', 'none');
      });
      legend.select('.entDateLabelsOn').on('click', function handleEntDateLabelsOnClick() {
        d3.selectAll('.entDateLabel').style('display', 'block');
        d3.selectAll('.entCountLabel').style('display', 'none');
      });
    } catch (error) {
      console.error('Error rendering D3 graph:', error);
    }
  }

  const generateGraph = () => {
    const timeEntriesDict = {};
    const timeEntryvalues = [];
    let maxHoursCount = 0;
    let totalHours = 0;

    if (timeEntries && timeEntries.period && Array.isArray(timeEntries.period)) {
      for (let i = 0; i < timeEntries.period.length; i += 1) {
        const entry = timeEntries.period[i];
        const hours = parseInt(entry.hours, 10) || 0;
        const minutes = entry.minutes === '0' ? 0 : parseInt(entry.minutes, 10) || 0;
        const convertedHours = hours + minutes / 60;
        totalHours += convertedHours;

        if (entry.dateOfWork in timeEntriesDict) {
          timeEntriesDict[entry.dateOfWork].time += convertedHours;
          timeEntriesDict[entry.dateOfWork].des.push(entry.notes || '');
        } else {
          timeEntriesDict[entry.dateOfWork] = {
            time: convertedHours,
            isTangible: [[entry.isTangible, convertedHours]],
            des: [entry.notes || ''],
          };
        }
      }
    }

    const parseDate = d3 && d3.timeParse ? d3.timeParse('%Y-%m-%d') : str => new Date(str);

    if (!fromDate || !toDate || fromDate === '' || toDate === '') {
      Object.keys(timeEntriesDict).forEach((key, index) => {
        timeEntryvalues.push({
          id: index,
          date: parseDate(key),
          count: timeEntriesDict[key].time,
          des: timeEntriesDict[key].des,
          isTangible: timeEntriesDict[key].isTangible,
          type: 'Entry',
        });
        if (timeEntriesDict[key].time > maxHoursCount) maxHoursCount = timeEntriesDict[key].time;
      });
    } else {
      let counter = 0;
      Object.keys(timeEntriesDict).forEach(currentKey => {
        const keyDate = new Date(currentKey);
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);
        if (!isNaN(keyDate) && !isNaN(fromDateObj) && !isNaN(toDateObj) && fromDateObj <= keyDate && keyDate <= toDateObj) {
          timeEntryvalues.push({
            id: counter,
            date: parseDate(currentKey),
            count: timeEntriesDict[currentKey].time,
            des: timeEntriesDict[currentKey].des,
            isTangible: timeEntriesDict[currentKey].isTangible,
            type: 'Entry',
          });
          if (timeEntriesDict[currentKey].time > maxHoursCount) maxHoursCount = timeEntriesDict[currentKey].time;
          counter += 1;
        }
      });
    }

    if (timeEntryvalues.length > 0) {
      timeEntryvalues.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    displayGraph(timeEntryvalues, maxHoursCount, totalHours);
  };

  return (
    <div>
      <Button onClick={() => setShow(!show)} aria-expanded={show} style={darkMode ? boxStyleDark : boxStyle}>
        {show ? 'Hide Time Entries Graph' : 'Show Time Entries Graph'}
      </Button>
      <div id="tlplot" className={`${darkMode ? 'mt-2' : ''}`} />
    </div>
  );
}

TimeEntriesViz.defaultProps = {
  timeEntries: { period: [] },
  fromDate: '',
  toDate: '',
  darkMode: false,
};

export default TimeEntriesViz;
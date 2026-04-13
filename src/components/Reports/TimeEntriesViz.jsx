/* eslint-disable no-console */
/* eslint-disable testing-library/no-node-access */
import * as d3 from 'd3';
import React from 'react';
import { Button } from 'react-bootstrap';
import { boxStyle, boxStyleDark } from '../../styles';

function TimeEntriesViz({ timeEntries, fromDate, toDate, darkMode }) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    generateGraph();
  }, [show, fromDate, toDate]);

  function displayGraph(logs, maxHoursCount, totalHours) {
    if (!d3 || !d3.selectAll) {
      return;
    }

    const tlplotElement = document.getElementById('tlplot');

    if (tlplotElement) {
      if (!show) {
        try {
          d3.selectAll('#tlplot > *').remove();
        } catch (e) {
          console.error('Error clearing graph:', e);
          while (tlplotElement.firstChild) {
            tlplotElement.removeChild(tlplotElement.firstChild);
          }
        }
      } else {
        try {
          d3.selectAll('#tlplot > *').remove();
        } catch (e) {
          console.error('Error clearing graph:', e);
          while (tlplotElement.firstChild) {
            tlplotElement.removeChild(tlplotElement.firstChild);
          }
        }

        const margin = { top: 30, right: 20, bottom: 30, left: 20 };
        const containerWidth = '1000';
        const width = Math.min(containerWidth - margin.left - margin.right, 1000);
        const height = 400 - margin.top - margin.bottom;

        const tooltipEl = function generateTooltipElement(d) {
          return (
            `${'<div class="tip__container">' +
              '<div class="close">' +
              `<button style="color: ${darkMode ? '#f9fafb' : 'black'}; background: transparent; border: none;">&times</button>` +
              '</div>' +
              '<div>' +
              'Exact date: '}${d3.timeFormat('%A, %B %e, %Y')(d.date)}<br>` +
            `Hours logged on this day: ${d.count.toFixed(2)}</div>` +
            `</div>`
          );
        };

        const textColor = darkMode ? 'color: #f9fafb;' : '';
        const legendEl = function generateLegendElement(innerTotalHours) {
          return (
            `<div class="lengendSubContainer" style="${textColor}">` +
            `<div class="totalCount" style="${textColor}">Total Hours: ${innerTotalHours.toFixed(2)}</div>` +
            `<div class="entLabelsOff"><button style="${textColor}">Labels Off</button></div>` +
            `<div class="entCountLabelsOn"><button style="${textColor}">Show Daily Hours</button></div>` +
            `<div class="entDateLabelsOn"><button style="${textColor}">Show Dates</button></div>` +
            `</div>`
          );
        };

        try {
          const d3Element = d3.select('#tlplot');
          if (!d3Element) {
            console.error('Could not select #tlplot element');
            return;
          }

          const svgRoot = d3Element
            .append('svg')
            .attr('width', '100%')
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`)
            .style('background-color', darkMode ? '#1b2a41' : '#ffffff');

          const svg = svgRoot
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

          const x = d3.scaleTime().domain(d3.extent(logs, d => d.date)).range([0, width]);
          svg
            .append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('fill', darkMode ? '#f9fafb' : 'black');

          const y = d3.scaleLinear().domain([0, maxHoursCount + 2]).range([height, 0]);
          svg
            .append('g')
            .call(d3.axisLeft(y))
            .selectAll('text')
            .attr('fill', darkMode ? '#f9fafb' : 'black');

          svg
            .append('path')
            .datum(logs)
            .attr('fill', 'none')
            .attr('stroke', darkMode ? '#f9fafb' : 'black')
            .attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => x(d.date)).y(d => y(d.count)));

          svg
            .append('g')
            .selectAll('dot')
            .data(logs)
            .join('circle')
            .attr('class', 'myCircle')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.count))
            .attr('r', 3)
            .attr('stroke', '#69b3a2')
            .attr('stroke-width', 3)
            .attr('fill', 'white')
            .on('click', function handleEvent(event, d) {
              const prevTooltip = d3.select(`.ent${d.id}`);
              if (prevTooltip.empty()) {
                const Tooltip = d3
                  .select('#tlplot')
                  .append('div')
                  .style('opacity', 0)
                  .attr('class', `tooltip ent${d.id}`)
                  .style('background-color', darkMode ? '#1b2a41' : 'white')
                  .style('color', darkMode ? '#f9fafb' : 'black')
                  .style('border', 'solid')
                  .style('border-width', '2px')
                  .style('border-radius', '5px')
                  .style('padding', '5px')
                  .style('z-index', 1000);

                Tooltip.html(tooltipEl(d))
                  .style('left', `${event.pageX + 10}px`)
                  .style('top', `${event.pageY}px`)
                  .style('opacity', 1);

                Tooltip.select('.close').on('click', function closeTooltip() {
                  Tooltip.remove();
                });
              }
            });

          svg
            .append('g')
            .selectAll('text')
            .data(logs)
            .join('text')
            .attr('class', 'entCountLabel')
            .attr('x', d => x(d.date) + 10)
            .attr('y', d => y(d.count) - 5)
            .attr('fill', darkMode ? '#f9fafb' : 'black')
            .style('z-index', 999)
            .style('font-weight', 700)
            .style('display', 'none')
            .text(d => d.count.toFixed(2));

          svg
            .append('g')
            .selectAll('text')
            .data(logs)
            .join('text')
            .attr('class', 'entDateLabel')
            .attr('x', d => x(d.date) + 10)
            .attr('y', d => y(d.count) - 5)
            .attr('fill', darkMode ? '#f9fafb' : 'black')
            .style('z-index', 999)
            .style('font-weight', 700)
            .style('display', 'none')
            .text(d => d3.timeFormat('%m/%d/%Y')(d.date));

          const legend = d3.select('#tlplot').append('div').attr('class', 'legendContainer');
          legend.html(legendEl(totalHours));

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
        if (timeEntriesDict[key].time > maxHoursCount) {
          maxHoursCount = timeEntriesDict[key].time;
        }
      });
    } else {
      let counter = 0;
      Object.keys(timeEntriesDict).forEach(currentKey => {
        const keyDate = new Date(currentKey);
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);

        if (
          !isNaN(keyDate) &&
          !isNaN(fromDateObj) &&
          !isNaN(toDateObj) &&
          fromDateObj <= keyDate &&
          keyDate <= toDateObj
        ) {
          timeEntryvalues.push({
            id: counter,
            date: parseDate(currentKey),
            count: timeEntriesDict[currentKey].time,
            des: timeEntriesDict[currentKey].des,
            isTangible: timeEntriesDict[currentKey].isTangible,
            type: 'Entry',
          });
          if (timeEntriesDict[currentKey].time > maxHoursCount) {
            maxHoursCount = timeEntriesDict[currentKey].time;
          }
          counter += 1;
        }
      });
    }

    if (timeEntryvalues.length > 0) {
      timeEntryvalues.sort(function sortDates(a, b) {
        return new Date(b.date) - new Date(a.date);
      });
    }

    displayGraph(timeEntryvalues, maxHoursCount, totalHours);
  };

  return (
    <div>
      <Button
        onClick={() => setShow(!show)}
        aria-expanded={show}
        style={darkMode ? boxStyleDark : boxStyle}
      >
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
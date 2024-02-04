import React from 'react';
import * as d3 from 'd3/dist/d3.min';
import { Button } from 'react-bootstrap';
import { boxStyle } from '../../styles';

function TimeEntriesViz({ timeEntries, fromDate, toDate }) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line no-use-before-define
    generateGraph();
  }, [show, fromDate, toDate]);

  function displayGraph(logs, maxHoursCount, totalHours) {
    if (!show) {
      d3.selectAll('#tlplot > *').remove();
    } else {
      d3.selectAll('#tlplot > *').remove();
      const margin = { top: 30, right: 20, bottom: 30, left: 20 };
      const containerWidth = '1000';
      // Adjusted width based on the available space
      const width = Math.min(containerWidth - margin.left - margin.right, 1000);

      const height = 400 - margin.top - margin.bottom;

      const tooltipEl = function generateTooltipElement(d) {
        return (
          `${'<div class="tip__container">' +
            '<div class="close">' +
            '<button>&times</button>' +
            '</div>' +
            '<div>' +
            'Exact date: '}${d3.timeFormat('%A, %B %e, %Y')(d.date)}<br>` +
          `Hours logged on this day: ${d.count.toFixed(2)}</div>` +
          `</div>`
        );
      };

      const legendEl = function generateLegendElement(innerTotalHours) {
        return (
          `${'<div class="lengendSubContainer">' +
            '<div class="totalCount">' +
            'Total Hours: '}${innerTotalHours.toFixed(2)}</div>` +
          `<div class="entLabelsOff">` +
          `<button>Labels Off</button>` +
          `</div>` +
          `<div class="entCountLabelsOn">` +
          `<button>Show Daily Hours</button>` +
          `</div>` +
          `<div class="entDateLabelsOn">` +
          `<button>Show Dates</button>` +
          `</div>` +
          `</div>`
        );
      };

      const svg = d3
        .select('#tlplot')
        .append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3
        .scaleTime()
        .domain(d3.extent(logs, d => d.date))
        .range([0, width]);
      svg
        .append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      const y = d3
        .scaleLinear()
        .domain([0, maxHoursCount + 2])
        .range([height, 0]);
      svg.append('g').call(d3.axisLeft(y));

      svg
        .append('path')
        .datum(logs)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5)
        .attr(
          'd',
          d3
            .line()
            .x(d => x(d.date))
            .y(d => y(d.count)),
        );

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
              .style('background-color', 'white')
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
        .attr('fill', 'black')
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
        .attr('fill', 'black')
        .style('z-index', 999)
        .style('font-weight', 700)
        .style('display', 'none')
        .text(d => d3.timeFormat('%m/%d/%Y')(d.date));

      const legend = d3
        .select('#tlplot')
        .append('div')
        .attr('class', 'legendContainer');
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
    }
  }

  const generateGraph = () => {
    const timeEntriesDict = {};
    const timeEntryvalues = [];
    let maxHoursCount = 0;
    let totalHours = 0;

    // aggregate entries
    if (timeEntries.period) {
      for (let i = 0; i < timeEntries.period.length; i += 1) {
        const convertedHours =
          parseInt(timeEntries.period[i].hours, 10) +
          (timeEntries.period[i].minutes === '0'
            ? 0
            : parseInt(timeEntries.period[i].minutes, 10) / 60);
        totalHours += convertedHours;
        if (timeEntries.period[i].dateOfWork in timeEntriesDict) {
          timeEntriesDict[timeEntries.period[i].dateOfWork].time += convertedHours;
          timeEntriesDict[timeEntries.period[i].dateOfWork].des.push(timeEntries.period[i].notes);
        } else {
          timeEntriesDict[timeEntries.period[i].dateOfWork] = {
            time: convertedHours,
            isTangible: [[timeEntries.period[i].isTangible, convertedHours]],
            des: [timeEntries.period[i].notes],
          };
        }
      }
    }

    // filter time entries by date
    if (fromDate === '' || toDate === '') {
      // if cond not needed
      Object.keys(timeEntriesDict).forEach(key => {
        timeEntryvalues.push({
          date: d3.timeParse('%Y-%m-%d')(key),
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
        if (
          Date.parse(fromDate) <= Date.parse(currentKey.toString()) &&
          Date.parse(currentKey.toString()) <= Date.parse(toDate)
        ) {
          timeEntryvalues.push({
            id: counter,
            date: d3.timeParse('%Y-%m-%d')(currentKey.toString()),
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

    timeEntryvalues.sort(function sortDates(a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    displayGraph(timeEntryvalues, maxHoursCount, totalHours);
  };

  return (
    <div>
      <Button onClick={() => setShow(!show)} aria-expanded={show} style={boxStyle}>
        {show ? 'Hide Time Entries Graph' : 'Show Time Entries Graph'}
      </Button>
      <div id="tlplot" />
    </div>
  );
}

export default TimeEntriesViz;

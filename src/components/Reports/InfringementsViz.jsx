/* eslint-disable testing-library/no-node-access */
import * as d3 from 'd3';
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { boxStyle, boxStyleDark } from '../../styles';
import styles from './PeopleReport/PeopleReport.module.css';
import {
  createAxes,
  createDots,
  createLabels,
  createLegend,
  createLine,
  createSvgRoot,
  createTooltip,
} from './d3GraphUtils';

function InfringementsViz({ infringements, fromDate, toDate, darkMode }) {
  const [graphVisible, setGraphVisible] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [focusedInf, setFocusedInf] = React.useState({});

  const handleModalClose = () => {
    setModalVisible(false);
    setFocusedInf({});
  };

  const handleModalShow = d => {
    setFocusedInf(d);
    if (graphVisible === false) setModalVisible(!modalVisible);
    setGraphVisible(!graphVisible);
  };

  function displayGraph(bsCount, maxSquareCount) {
    if (!graphVisible) {
      d3.selectAll('#infplot > *').remove();
    } else {
      d3.selectAll('#infplot > *').remove();

      const margin = { top: 30, right: 20, bottom: 30, left: 20 };
      const containerWidth = '1000';
      const width = Math.min(containerWidth - margin.left - margin.right, 1000);
      const height = 400 - margin.top - margin.bottom;

      const textColor = darkMode ? `color: #f9fafb;` : '';
      const legendHtml =
        `<div class="lengendSubContainer" style="${textColor}">` +
        `<div class="infLabelsOff"><button style="${textColor}">Labels Off</button></div>` +
        `<div class="infCountLabelsOn"><button style="${textColor}">Show Squares</button></div>` +
        `<div class="infDateLabelsOn"><button style="${textColor}">Show Dates</button></div>` +
        `</div>`;

      const svgRoot = createSvgRoot('#infplot', containerWidth, height, margin, darkMode);
      const svg = svgRoot.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleTime().domain(d3.extent(bsCount, d => d.date)).range([0, width]);
      const y = d3.scaleLinear().domain([0, maxSquareCount + 2]).range([height, 0]);

      createAxes(svg, x, y, height, darkMode);

      svg
        .append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')))
        .selectAll('text')
        .attr('fill', darkMode ? '#f9fafb' : 'black');

      createLine(svg, bsCount, x, y, darkMode);

      const dots = createDots(svg, bsCount, x, y);
      dots.on('click', function handleCircleClick(event, d) {
        const prevTooltip = d3.select(`.inf${d.id}`);
        if (prevTooltip.empty()) {
          const Tooltip = createTooltip('#infplot', d, darkMode);
          Tooltip.attr('class', `tooltip inf${d.id}`)
            .style('max-width', '500px')
            .html(
              `<div class="tip__container"><div class="close">` +
              `<button style="color: ${darkMode ? '#f9fafb' : 'black'}; background: transparent; border: none;">&times</button>` +
              `</div><div>Exact date: ${d3.timeFormat('%A, %B %e, %Y')(d.date)}<br>` +
              `Count: ${d.count === 1 ? d.count : `${d.count} <span class="detailsModal"><a>See All</a></span>`}<br>` +
              `Description: ${d.des[0]}</div></div>`
            )
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY}px`)
            .style('opacity', 1);

          Tooltip.select('.close').on('click', function handleCloseClick() {
            Tooltip.remove();
          });
          Tooltip.select('.detailsModal').on('click', function handleDetailsModalClick() {
            handleModalShow(d);
          });
        }
      });

      createLabels(svg, bsCount, x, y, 'infCountLabel', darkMode, d => parseInt(d.count, 10));
      createLabels(svg, bsCount, x, y, 'infDateLabel', darkMode, d => d3.timeFormat('%m/%d/%Y')(d.date));

      const legend = createLegend('#infplot', legendHtml);

      legend.select('.infLabelsOff').on('click', function handleLabelsOffClick() {
        d3.selectAll('.infCountLabel').style('display', 'none');
        d3.selectAll('.infDateLabel').style('display', 'none');
      });
      legend.select('.infCountLabelsOn').on('click', function handleCountLabelsOnClick() {
        d3.selectAll('.infCountLabel').style('display', 'block');
        d3.selectAll('.infDateLabel').style('display', 'none');
      });
      legend.select('.infDateLabelsOn').on('click', function handleDateLabelsOnClick() {
        d3.selectAll('.infDateLabel').style('display', 'block');
        d3.selectAll('.infCountLabel').style('display', 'none');
      });
    }
  }

  const generateGraph = () => {
    const dict = {};
    const value = [];
    let maxSquareCount = 0;

    for (let i = 0; i < infringements.length; i += 1) {
      if (infringements[i].date in dict) {
        dict[infringements[i].date].ids.push(infringements[i]._id);
        dict[infringements[i].date].count += 1;
        dict[infringements[i].date].des.push(infringements[i].description);
      } else {
        dict[infringements[i].date] = {
          ids: [infringements[i]._id],
          count: 1,
          des: [infringements[i].description],
        };
      }
    }

    if (fromDate === '' || toDate === '') {
      Object.keys(dict).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(dict, key)) {
          value.push({
            date: d3.timeParse('%Y-%m-%d')(key),
            des: dict[key].des,
            count: dict[key].count,
            type: 'Infringement',
            ids: dict[key].ids,
          });
          if (dict[key].count > maxSquareCount) maxSquareCount = dict[key].count;
        }
      });
    } else {
      let counter = 0;
      Object.keys(dict).forEach(key => {
        if (Date.parse(fromDate) <= Date.parse(key) && Date.parse(key) <= Date.parse(toDate)) {
          value.push({
            id: counter,
            date: d3.timeParse('%Y-%m-%d')(key),
            des: dict[key].des,
            count: dict[key].count,
            type: 'Infringement',
            ids: dict[key].ids,
          });
          if (dict[key].count > maxSquareCount) maxSquareCount = dict[key].count;
          counter += 1;
        }
      });
    }

    displayGraph(value, maxSquareCount);
  };

  React.useEffect(() => {
    generateGraph();
  }, [graphVisible, fromDate, toDate, focusedInf]);

  return (
    <div>
      <Button onClick={handleModalShow} aria-expanded={graphVisible} style={darkMode ? boxStyleDark : boxStyle}>
        {graphVisible ? 'Hide Infringements Graph' : 'Show Infringements Graph'}
      </Button>
      <div className={`${styles.kaitest} ${darkMode ? 'mt-2' : ''}`} id="infplot" data-testid="infplot" />

      <Modal size="lg" show={modalVisible} onHide={handleModalClose}>
        <Modal.Header closeButton style={darkMode ? { backgroundColor: '#1b2a41', color: '#f9fafb', borderColor: '#374151' } : {}}>
          <Modal.Title>{focusedInf.date ? focusedInf.date.toString() : 'Infringement'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={darkMode ? { backgroundColor: '#1b2a41', color: '#f9fafb' } : {}}>
          <div id="inf">
            <table style={darkMode ? { backgroundColor: '#1b2a41', color: '#f9fafb', width: '100%' } : { width: '100%' }}>
              <thead>
                <tr style={darkMode ? { backgroundColor: '#1b2a41' } : {}}>
                  <th style={darkMode ? { backgroundColor: '#1b2a41', color: '#f9fafb' } : {}}>Descriptions</th>
                </tr>
              </thead>
              <tbody>
                {focusedInf.des
                  ? focusedInf.des.map(desc => (
                    <tr key={desc} style={darkMode ? { backgroundColor: '#1b2a41' } : {}}>
                      <td style={darkMode ? { backgroundColor: '#1b2a41', color: '#f9fafb' } : {}}>{desc}</td>
                    </tr>
                  ))
                  : null}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer style={darkMode ? { backgroundColor: '#1b2a41', borderColor: '#374151' } : {}}>
          <Button variant="secondary" onClick={handleModalClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default InfringementsViz;
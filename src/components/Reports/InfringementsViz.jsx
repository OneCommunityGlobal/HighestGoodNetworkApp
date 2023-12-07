import React from 'react';
import * as d3 from 'd3/dist/d3.min';
import { Button, Modal } from 'react-bootstrap';
import './PeopleReport/PeopleReport.css';
import { boxStyle } from '../../styles';

function InfringementsViz({ infringements, fromDate, toDate }) {
  const [show, setShow] = React.useState(false);
  const [modalShow, setModalShow] = React.useState(false);
  const [focusedInf, setFocusedInf] = React.useState({});

  const handleModalClose = () => {
    setModalShow(false);
    setFocusedInf({});
  };
  const handleModalShow = d => {
    setFocusedInf(d);
    setModalShow(true);
  };
  function displayGraph(bsCount, maxSquareCount) {
    if (!show) {
      d3.selectAll('#infplot > *').remove();
    } else {
      d3.selectAll('#infplot > *').remove();
      const margin = { top: 10, right: 30, bottom: 30, left: 60 };
      const width = 1000 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const tooltipEl = function(d) {
        return (
          `${'<div class="tip__container">' +
            '<div class="close">' +
            '<button>&times</button>' +
            '</div>' +
            '<div>' +
            'Exact date: '}${d3.timeFormat('%A, %B %e, %Y')(d.date)}<br>` +
          `Count: ${
            d.count === 1 ? d.count : `${d.count} <span class="detailsModal"><a>See All</a></span>`
          }<br>` +
          `Description: ${d.des[0]}</div>` +
          `</div>`
        );
      };

      const legendEl = function() {
        return (
          '<div class="lengendSubContainer">' +
          '<div class="infLabelsOff">' +
          '<button>Labels Off</button>' +
          '</div>' +
          '<div class="infCountLabelsOn">' +
          '<button>Show Squares</button>' +
          '</div>' +
          '<div class="infDateLabelsOn">' +
          '<button>Show Dates</button>' +
          '</div>' +
          '</div>'
        );
      };

      const svg = d3
        .select('#infplot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3
        .scaleTime()
        .domain(d3.extent(bsCount, d => d.date))
        .range([0, width]);
      svg
        .append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      const y = d3
        .scaleLinear()
        .domain([0, maxSquareCount + 2])
        .range([height, 0]);
      svg.append('g').call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat(d3.format('d')),
      );

      svg
        .append('path')
        .datum(bsCount)
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
        .data(bsCount)
        .join('circle')
        .attr('class', 'myCircle')
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.count))
        .attr('r', 3)
        .attr('stroke', '#69b3a2')
        .attr('stroke-width', 3)
        .attr('fill', 'white')
        .on('click', function(event, d) {
          const prevTooltip = d3.select(`.inf${d.id}`);

          if (prevTooltip.empty()) {
            const Tooltip = d3
              .select('#infplot')
              .append('div')
              .style('opacity', 0)
              .attr('class', `tooltip inf${d.id}`)
              .style('background-color', 'white')
              .style('border', 'solid')
              .style('border-width', '2px')
              .style('border-radius', '5px')
              .style('padding', '5px')
              .style('max-width', '500px')
              .style('z-index', 1000);

            Tooltip.html(tooltipEl(d))
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY}px`)
              .style('opacity', 1);

            Tooltip.select('.close').on('click', function() {
              Tooltip.remove();
            });

            Tooltip.select('.detailsModal').on('click', function() {
              handleModalShow(d);
            });
          }
        });

      svg
        .append('g')
        .selectAll('text')
        .data(bsCount)
        .join('text')
        .attr('class', 'infCountLabel')
        .attr('x', d => x(d.date) + 10)
        .attr('y', d => y(d.count) - 5)
        .attr('fill', 'black')
        .style('z-index', 999)
        .style('font-weight', 700)
        .style('display', 'none')
        .text(d => parseInt(d.count, 10));

      svg
        .append('g')
        .selectAll('text')
        .data(bsCount)
        .join('text')
        .attr('class', 'infDateLabel')
        .attr('x', d => x(d.date) + 10)
        .attr('y', d => y(d.count) - 5)
        .attr('fill', 'black')
        .style('z-index', 999)
        .style('font-weight', 700)
        .style('display', 'none')
        .text(d => d3.timeFormat('%m/%d/%Y')(d.date));

      const legend = d3
        .select('#infplot')
        .append('div')
        .attr('class', 'legendContainer')
        .style('position', 'relative')
        .style('top', `-450px`)
        .style('left', `980px`);

      legend.html(legendEl());

      legend.select('.infLabelsOff').on('click', function() {
        d3.selectAll('.infCountLabel').style('display', 'none');
        d3.selectAll('.infDateLabel').style('display', 'none');
      });

      legend.select('.infCountLabelsOn').on('click', function() {
        d3.selectAll('.infCountLabel').style('display', 'block');
        d3.selectAll('.infDateLabel').style('display', 'none');
      });

      legend.select('.infDateLabelsOn').on('click', function() {
        d3.selectAll('.infDateLabel').style('display', 'block');
        d3.selectAll('.infCountLabel').style('display', 'none');
      });
    }
  }

  const generateGraph = () => {
    const dict = {};
    const value = [];
    let maxSquareCount = 0;

    // aggregate infringements
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

    // filter infringements by date
    if (fromDate === '' || toDate === '') {
      // condition no longer needed
      Object.keys(dict).forEach(key => {
        // Use if statement to filter unwanted properties from the prototype chain
        if (Object.prototype.hasOwnProperty.call(dict, key)) {
          value.push({
            date: d3.timeParse('%Y-%m-%d')(key),
            des: dict[key].des,
            count: dict[key].count,
            type: 'Infringement',
            ids: dict[key].ids,
          });
          if (dict[key].count > maxSquareCount) {
            maxSquareCount = dict[key].count;
          }
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
          if (dict[key].count > maxSquareCount) {
            maxSquareCount = dict[key].count;
          }
          counter += 1;
        }
      });
    }

    // eslint-disable-next-line no-console
    console.log('INFvalues', value);

    displayGraph(value, maxSquareCount);
  };

  React.useEffect(() => {
    generateGraph();
  }, [show, fromDate, toDate]);

  return (
    <div>
      <Button onClick={() => setShow(!show)} aria-expanded={show} style={boxStyle}>
        Show Infringements Graph
      </Button>
      <div id="infplot" />

      <Modal size="lg" show={show} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{focusedInf.date ? focusedInf.date.toString() : 'Infringement'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table id="inf">
            <thead>
              <tr>
                <th>Descriptions</th>
              </tr>
              <tbody>
                {focusedInf.des
                  ? focusedInf.des.map(desc => (
                      <tr>
                        <td>{desc}</td>
                      </tr>
                    ))
                  : focusedInf.des}
              </tbody>
            </thead>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default InfringementsViz;

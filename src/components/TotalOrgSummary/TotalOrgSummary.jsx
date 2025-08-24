/* eslint-disable testing-library/no-node-access */
import { connect } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Col,
  Container,
  Row,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'moment-timezone';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import hasPermission from '~/utils/permissions';

// actions
import { getTotalOrgSummary } from '~/actions/totalOrgSummary';

import '../Header/DarkMode.css';
import styles from './TotalOrgSummary.module.css';
import { clsx } from 'clsx';
import VolunteerHoursDistribution from './VolunteerHoursDistribution/VolunteerHoursDistribution';
import AccordianWrapper from './AccordianWrapper/AccordianWrapper';
import VolunteerStatus from './VolunteerStatus/VolunteerStatus';
import VolunteerActivities from './VolunteerActivities/VolunteerActivities';
import VolunteerStatusChart from './VolunteerStatus/VolunteerStatusChart';
import BlueSquareStats from './BlueSquareStats/BlueSquareStats';
import TeamStats from './TeamStats/TeamStats';
import HoursCompletedBarChart from './HoursCompleted/HoursCompletedBarChart';
import NumbersVolunteerWorked from './NumbersVolunteerWorked/NumbersVolunteerWorked';
import AnniversaryCelebrated from './AnniversaryCelebrated/AnniversaryCelebrated';
import RoleDistributionPieChart from './VolunteerRolesTeamDynamics/RoleDistributionPieChart';
import WorkDistributionBarChart from './VolunteerRolesTeamDynamics/WorkDistributionBarChart';
import VolunteerTrendsLineChart from './VolunteerTrendsLineChart/VolunteerTrendsLineChart';
import GlobalVolunteerMap from './GlobalVolunteerMap/GlobalVolunteerMap';
import TaskCompletedBarChart from './TaskCompleted/TaskCompletedBarChart';

function calculateStartDate() {
  // returns a string date in YYYY-MM-DD format of the start of the previous week
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const dayOfWeek = currentDate.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  currentDate.setDate(currentDate.getDate() - daysToSubtract - 7);
  return currentDate.toISOString().split('T')[0];
}

function calculateEndDate() {
  // returns a string date in YYYY-MM-DD format of the end of the previous week
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const dayOfWeek = currentDate.getDay();
  const daysToAdd = dayOfWeek === 6 ? 0 : -1 - dayOfWeek;
  currentDate.setDate(currentDate.getDate() + daysToAdd);
  return currentDate.toISOString().split('T')[0];
}

function calculateComparisonDates(comparisonType, fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  switch (comparisonType) {
    case 'Week Over Week':
      return {
        comparisonStartDate: new Date(start.setDate(start.getDate() - diffDays))
          .toISOString()
          .split('T')[0],
        comparisonEndDate: new Date(end.setDate(end.getDate() - diffDays))
          .toISOString()
          .split('T')[0],
      };
    case 'Month Over Month':
      return {
        comparisonStartDate: new Date(start.setMonth(start.getMonth() - 1))
          .toISOString()
          .split('T')[0],
        comparisonEndDate: new Date(end.setMonth(end.getMonth() - 1)).toISOString().split('T')[0],
      };
    case 'Year Over Year':
      return {
        comparisonStartDate: new Date(start.setFullYear(start.getFullYear() - 1))
          .toISOString()
          .split('T')[0],
        comparisonEndDate: new Date(end.setFullYear(end.getFullYear() - 1))
          .toISOString()
          .split('T')[0],
      };
    default:
      return {
        comparisonStartDate: null,
        comparisonEndDate: null,
      };
  }
}

const fromDate = calculateStartDate();
const toDate = calculateEndDate();

function TotalOrgSummary(props) {
  const { darkMode, error } = props;
  const [isVolunteerFetchingError, setIsVolunteerFetchingError] = useState(false);
  const [volunteerStats, setVolunteerStats] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRangeDropdownOpen, setDateRangeDropdownOpen] = useState(false);
  const [comparisonDropdownOpen, setComparisonDropdownOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('Current Week');
  const [selectedComparison, setSelectedComparison] = useState('No Comparison');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentFromDate, setCurrentFromDate] = useState(fromDate);
  const [currentToDate, setCurrentToDate] = useState(toDate);
  const rootRef = useRef(null);

  useEffect(() => {
    const fetchVolunteerStats = async () => {
      try {
        const { comparisonStartDate, comparisonEndDate } = calculateComparisonDates(
          selectedComparison,
          currentFromDate,
          currentToDate,
        );

        const volunteerStatsResponse = await props.getTotalOrgSummary(
          currentFromDate,
          currentToDate,
          comparisonStartDate,
          comparisonEndDate,
        );
        setVolunteerStats(volunteerStatsResponse.data);
        await props.hasPermission('');
        setIsLoading(false);
      } catch (catchFetchError) {
        setIsVolunteerFetchingError(true);
      }
    };

    fetchVolunteerStats();
  }, [currentFromDate, currentToDate, selectedComparison]);

  const handleSaveAsPDF = async () => {
    if (isGeneratingPDF) return;

    setIsGeneratingPDF(true);

    // Save the current state of collapsible sections.
    const triggers = document.querySelectorAll('.Collapsible__trigger');
    const originalStates = Array.from(triggers).map(trigger =>
      trigger.classList.contains('is-open'),
    );

    try {
      // Ensure required libraries are present.
      if (typeof jsPDF === 'undefined' || typeof html2canvas === 'undefined') {
        // eslint-disable-next-line no-alert
        alert('Required PDF libraries not loaded. Please refresh the page.');
        return;
      }

      // Ensure data is ready.
      if (!volunteerStats || isLoading) {
        // eslint-disable-next-line no-alert
        alert('Please wait for data to load before generating PDF.');
        return;
      }

      // 1. Expand all collapsible sections so every part is visible.
      triggers.forEach(trigger => {
        if (!trigger.classList.contains('is-open')) {
          trigger.click();
        }
      });

      // 2. Wait a longer time to ensure charts and content are fully rendered.
      await new Promise(resolve => {
        setTimeout(resolve, 3000);
      });

      // 3. Replace Chart.js canvas elements with images in the live DOM.
      const chartCanvases = document.querySelectorAll('.volunteer-status-chart canvas');
      const originalCanvases = [];
      chartCanvases.forEach(canvasElem => {
        try {
          const img = document.createElement('img');
          img.src = canvasElem.toDataURL('image/png');
          img.width = canvasElem.width;
          img.height = canvasElem.height;
          img.style.cssText = canvasElem.style.cssText;
          originalCanvases.push({
            canvas: canvasElem,
            parent: canvasElem.parentNode,
          });
          canvasElem.parentNode.replaceChild(img, canvasElem);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error converting canvas to image:', err);
        }
      });

      // 4. Create a temporary container for PDF generation
      const pdfContainer = document.createElement('div');
      pdfContainer.id = 'pdf-export-container';
      pdfContainer.style.width = '100%';
      pdfContainer.style.padding = '0';
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.zIndex = '9999';
      pdfContainer.style.boxSizing = 'border-box';
      pdfContainer.style.minHeight = '100%';
      pdfContainer.style.margin = '0';

      // Clone the main content area
      const originalContent = rootRef.current;
      const clonedContent = originalContent.cloneNode(true);

      // Remove interactive or unwanted elements from the clone
      clonedContent
        .querySelectorAll('[data-pdf-hide], .controls, .no-print')
        .forEach(el => el.remove());

      // Adjust title row styling for a clean layout
      const titleRow = clonedContent.querySelector('[data-pdf-title-row]');
      if (titleRow) {
        const titleCol = titleRow.querySelector('[data-pdf-title-col]');
        if (titleCol) {
          titleCol.style.width = '100%';
        }
        const mainTitle = titleRow.querySelector('h3');
        if (mainTitle) {
          mainTitle.style.fontSize = '24pt';
          mainTitle.style.fontWeight = 'bold';
          mainTitle.style.textAlign = 'left';
          mainTitle.style.color = '#000';
          mainTitle.style.margin = '0';
        }
      }

      // Create a style element for the PDF container
      const styleElem = document.createElement('style');
      styleElem.textContent = `
        [data-pdf-root] {
          padding: 20px !important;
          margin: 0 !important;
          box-shadow: none !important;
          border: none !important;
          width: 100% !important;
          min-height: 100% !important;
        }

        [data-pdf-title-row] {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          margin-bottom: 20px !important;
          width: 100% !important;
          padding: 0 !important;
        }

        /* Merges old .component-container + .component-border rules */
        [data-pdf-block] {
          page-break-inside: avoid;
          break-inside: avoid;
          margin: 15px 0 !important;
          padding: 20px !important;
          background-color: #fff !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 10px !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08) !important;
          overflow: hidden !important;
        }

        img, svg {
          max-width: 100% !important;
          height: auto !important;
          page-break-inside: avoid !important;
        }

        .recharts-wrapper {
          width: 100% !important;
          height: auto !important;
        }

        table {
          page-break-inside: avoid !important;
        }

        .Collapsible__trigger {
          background-color: ${darkMode ? '#1C2541' : '#fff'} !important;
          color: ${darkMode ? '#fff' : '#000'} !important;
        }

        .volunteerStatusGrid {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
          gap: 1.5rem !important;
          width: 100% !important;
          margin-top: 15px !important;
        }

        .component-pie-chart-label {
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #000 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        [data-pdf-title] p {
          font-size: 1.5em !important;
          font-weight: bold !important;
          text-align: center !important;
          margin: 10px !important;
          color: #333 !important;
        }
      `;

      // Add content to the PDF container
      pdfContainer.appendChild(styleElem);
      pdfContainer.appendChild(clonedContent);
      document.body.appendChild(pdfContainer);

      // 5. Use html2canvas to capture the rendered container
      const screenshotCanvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        // backgroundColor: '#fff',
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
        logging: false,
      });

      if (!screenshotCanvas) {
        throw new Error('html2canvas failed to capture the content.');
      }

      const imgData = screenshotCanvas.toDataURL('image/png');
      if (!imgData || imgData.length < 100) {
        throw new Error('Invalid image data generated.');
      }

      // 6. Create a single-page PDF
      const pdfWidth = 210; // A4 width in mm
      const imgHeight = (screenshotCanvas.height * pdfWidth) / screenshotCanvas.width;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, imgHeight],
      });
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      const now = new Date();
      const localDate = now.toLocaleDateString('en-CA'); // Using YYYY-MM-DD format
      doc.save(`volunteer-report-${localDate}.pdf`);

      // Cleanup: restore original canvases and remove

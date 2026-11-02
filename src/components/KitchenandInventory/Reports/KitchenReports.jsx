import { useState } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ForecastAccuracyTab from './ForecastAccuracyTab';
import mockReport from './forecastAccuracy.mock.json';
import { prepareForecastReport, forecastReportCSV } from './forecastAccuracy';
import ReportsLayout from './ReportsLayout';

const REPORT_PATH = '/kitchenandinventory/reports';

export default function KitchenReports({ data = mockReport }) {
  const [period, setPeriod] = useState('month');
  const location = useLocation();
  const report = prepareForecastReport(data);

  if (location.pathname === REPORT_PATH || location.pathname === `${REPORT_PATH}/`) {
    return <Redirect to={`${REPORT_PATH}/preservation-efficiency`} />;
  }

  const exportCSV = () => {
    const url = URL.createObjectURL(
      new Blob([forecastReportCSV(report.ingredients)], { type: 'text/csv;charset=utf-8;' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'forecast-accuracy.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Forecast Accuracy Tracker', 14, 20);
    doc.setFontSize(10);
    doc.text(`${period}${report.isDemo ? ' | Sample data' : ''}`, 14, 29);
    autoTable(doc, {
      startY: 36,
      head: [['Ingredient', 'Planned (lbs)', 'Actual (lbs)', 'Accuracy']],
      body: report.ingredients.map(item => [
        item.name,
        item.plannedLbs,
        item.actualLbs,
        `${item.accuracyPercent}%`,
      ]),
      foot: [['Overall Forecast Accuracy', '', '', `${report.averageAccuracyPercent}%`]],
      theme: 'striped',
      headStyles: { fillColor: [51, 73, 163] },
    });
    doc.save('forecast-accuracy.pdf');
  };

  return (
    <ReportsLayout
      period={period}
      onPeriodChange={setPeriod}
      onExportCsv={exportCSV}
      onExportPdf={exportPDF}
      isDemo={report.isDemo}
    >
      <ForecastAccuracyTab report={report} />
    </ReportsLayout>
  );
}

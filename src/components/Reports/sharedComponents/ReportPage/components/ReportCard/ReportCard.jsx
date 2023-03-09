/* eslint-disable import/prefer-default-export */
/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable jsx-a11y/img-redundant-alt */
import { ReportBlock } from '../ReportBlock';
import './ReportCard.css';

export function ReportCard() {
  return (
    <ReportBlock>
      <div className="report-card">
        <h3>100</h3>
        <p>Here is the card name</p>
      </div>
    </ReportBlock>
  );
}

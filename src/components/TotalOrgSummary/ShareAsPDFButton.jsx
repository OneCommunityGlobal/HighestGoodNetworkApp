/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable react/forbid-prop-types */
import { connect } from 'react-redux';
import { useEffect } from 'react';
import { Alert, Button, Col, Container, Row } from 'reactstrap';
import jsPDF from 'jspdf';

import hasPermission from 'utils/permissions';
import { getTotalOrgSummary } from 'actions/totalOrgSummary';

import SkeletonLoading from '../common/SkeletonLoading';
import '../Header/DarkMode.css';
import './TotalOrgSummary.css';

// components
import VolunteerHoursDistribution from './VolunteerHoursDistribution/VolunteerHoursDistribution';

const startDate = '2016-01-01';
const endDate = new Date().toISOString().split('T')[0];

function TotalOrgSummary(props) {
  const { darkMode, loading, error } = props;

  useEffect(() => {
    props.getTotalOrgSummary(startDate, endDate);
    props.hasPermission('');
  }, [startDate, endDate, getTotalOrgSummary, hasPermission]);

  const handleSharePDF = () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();

    // Add content to the PDF
    doc.text('Total Org Summary', 10, 10);
    doc.text('Volunteer Workload and Task Completion Analysis', 10, 20);

    // Save the PDF
    doc.save('TotalOrgSummary.pdf');

    // Share the PDF
    // You can use navigator.share() if on a mobile device or similar sharing mechanism
    if (navigator.share) {
      // eslint-disable-next-line prettier/prettier
      navigator
        .share({
          title: 'Total Org Summary',
          text: 'Check out this PDF!',
          files: [new File([doc.output()], 'TotalOrgSummary.pdf', { type: 'application/pdf' })],
        })
        .then(() => {
          console.log('Successful share');
          // eslint-disable-next-line no-shadow
        })
        // eslint-disable-next-line no-shadow
        .catch(error => {
          console.error('Error sharing', error);
        });
    } else {
      // eslint-disable-next-line no-alert
      alert('Sharing not supported');
    }
  };

  if (error) {
    return (
      <Container className={`container-wsr-wrapper ${darkMode ? 'bg-oxford-blue' : ''}`}>
        <Row
          className="align-self-center pt-2"
          data-testid="error"
          style={{ width: '30%', margin: '0 auto' }}
        >
          <Col>
            <Alert color="danger">Error! {error.message}</Alert>
          </Col>
        </Row>
      </Container>
    );
  }
  if (loading) {
    return (
      <Container fluid style={{ backgroundColor: darkMode ? '#1B2A41' : '#f3f4f6' }}>
        <Row className="text-center" data-testid="loading">
          <SkeletonLoading
            template="WeeklyVolunteerSummaries"
            className={darkMode ? 'bg-yinmn-blue' : ''}
          />
        </Row>
      </Container>
    );
  }
  return (
    <Container
      fluid
      className={`container-total-org-wrapper py-3 mb-5 ${
        darkMode ? 'bg-oxford-blue text-light' : 'cbg--white-smoke'
      }`}
    >
      <Row>
        <Col lg={{ size: 10, offset: 1 }}>
          <h3 className="mt-3 mb-5">Total Org Summary</h3>
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 10, offset: 1 }}>
          <h2 style={{ color: 'black' }}>Volunteer Workload and Task Completion Analysis</h2>
          <Button color="primary" onClick={handleSharePDF}>
            Share PDF
          </Button>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col lg={{ size: 4, offset: 1 }}>
          <VolunteerHoursDistribution />
        </Col>
        <Col lg={{ size: 2, offset: 1 }}>
          <VolunteerHoursDistribution />
        </Col>
        <Col lg={{ size: 2, offset: 1 }}>
          <VolunteerHoursDistribution />
        </Col>
      </Row>
    </Container>
  );
}

const mapStateToProps = state => ({
  error: state.error,
  loading: state.loading,
  volunteerstats: state.volunteerstats,
  role: state.auth.user.role,
  auth: state.auth,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  getTotalOrgSummary: () => dispatch(getTotalOrgSummary(startDate, endDate)),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalOrgSummary);

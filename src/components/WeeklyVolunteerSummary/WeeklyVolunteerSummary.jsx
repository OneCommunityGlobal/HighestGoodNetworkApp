// import { useSelector } from 'react-redux';
// import { Alert, Col, Container, Row } from 'reactstrap';
// import SkeletonLoading from '../common/SkeletonLoading';

// function WeeklyVolunteerSummary() {
//   const darkMode = useSelector(state => state.theme.darkMode);

//   if (error) {
//     return (
//       <Container className={`container-wsr-wrapper ${darkMode ? 'bg-oxford-blue' : ''}`}>
//         <Row
//           className="align-self-center pt-2"
//           data-testid="error"
//           style={{ width: '30%', margin: '0 auto' }}
//         >
//           <Col>
//             <Alert color="danger">Error! {error.message}</Alert>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   if (loading) {
//     return (
//       <Container fluid style={{ backgroundColor: darkMode ? '#1B2A41' : '#f3f4f6' }}>
//         <Row className="text-center" data-testid="loading">
//           <SkeletonLoading
//             template="WeeklySummariesReport"
//             className={darkMode ? 'bg-yinmn-blue' : ''}
//           />
//         </Row>
//       </Container>
//     );
//   }

//   return (
//     <Container>
//       <h1>Weekly Summary Report</h1>
//     </Container>
//   );
// }

// export default WeeklyVolunteerSummary;

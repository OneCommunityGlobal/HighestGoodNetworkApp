// 测试用页面 后续加在weeklysummary页面
import { useState } from 'react';
import { Button, Container } from 'reactstrap';
import WeeklySummaryEmailAssignmentPopUp from './WeeklySummaryEmailAssignmentPopUp';

function WeeklySummaryPage() {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <Container className="mt-5">
      <h2>Weekly Summary Management</h2>
      <Button color="primary" onClick={() => setPopupOpen(true)}>
        Set Weekly Summary BCC
      </Button>

      <WeeklySummaryEmailAssignmentPopUp isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
    </Container>
  );
}

export default WeeklySummaryPage;

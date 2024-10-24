import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AddToolForm from './AddToolForm';
import './AddTool.css';

export default function AddTool() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/bmdashboard/tools/add')) {
      document.title = 'Add Tools';
    }
  }, [location]);

  return (
    <main className="add-tool-container">
      <header className="add-tool-header">
        <h2>ADD TYPE: TOOL</h2>
      </header>
      <AddToolForm />
    </main>
  );
}

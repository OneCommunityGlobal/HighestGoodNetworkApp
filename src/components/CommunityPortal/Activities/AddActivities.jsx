import AddActivityForm from './AddActivityForm';
import './AddActivities.css';

export default function AddActivies() {
  return (
    <main className="add-tool-container">
      <header className="add-tool-header">
        <h2>ADD TYPE: TOOL</h2>
      </header>
      <AddActivityForm />
    </main>
  );
}

import AddToolForm from './AddToolForm';
import './AddTool.css';

export default function AddTool() {
  return (
    <main className="add-tool-container">
      <header className="add-tool-header">
        <h2>Add Tool or Equipment</h2>
      </header>
      <AddToolForm />
    </main>
  );
}

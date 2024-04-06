import AddToolForm from './AddToolForm';
import './AddTool.css';

export default function AddTool() {
  return (
    <main className="add-tool-container">
      <header className="add-tool-header">
        <h2>ADD TYPE: TOOL</h2>
      </header>
      <AddToolForm />
    </main>
  );
}

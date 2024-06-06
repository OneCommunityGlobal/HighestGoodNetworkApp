import { useSelector } from 'react-redux';

export default function EquipmentList() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <main className={`${darkMode ? 'bg-oxford-blue text-light' : ''} p-4 h-100`}>
      <h3>Equipment</h3>
      <p>Displays a list of all Equipment-type inventory items used in your projects.</p>
    </main>
  );
}

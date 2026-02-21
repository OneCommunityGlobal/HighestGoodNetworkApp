// Custom Label component for displaying percentages on bars
import { useSelector } from 'react-redux';

export default function CustomLabel(props) {
  const { x, y, width, value } = props;
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill={darkMode ? '#ffffff' : '#374151'}
      textAnchor="middle"
      fontSize="12"
      fontWeight="500"
    >
      {`${value}%`}
    </text>
  );
}

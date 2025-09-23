// Custom Label component for displaying percentages on bars
export default function CustomLabel(props) {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#374151"
      textAnchor="middle"
      fontSize="12"
      fontWeight="500"
    >
      {`${value}%`}
    </text>
  );
}

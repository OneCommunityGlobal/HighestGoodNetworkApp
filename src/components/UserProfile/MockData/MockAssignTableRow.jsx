function MockAssignTableRow({ badges }) {
  return (
    <table>
      <tbody>
        {badges &&
          badges.map(badge => (
            <tr key={badge.id}>
              <td>{badge.id}</td>
              <td>{badge.name}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

export default MockAssignTableRow;

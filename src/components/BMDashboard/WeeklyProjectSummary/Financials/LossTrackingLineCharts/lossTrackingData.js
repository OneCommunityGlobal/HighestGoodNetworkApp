// Version 1.0.0
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function buildLossSeries(materials) {
  const series = new Map();
  materials.forEach(material => {
    if (!material.itemType?._id) return;
    const addRecord = (record, field, quantity) => {
      const date = new Date(record.date);
      if (
        !record.date ||
        Number.isNaN(date.getTime()) ||
        !Number.isFinite(quantity) ||
        quantity < 0
      )
        return;
      const year = date.getUTCFullYear();
      const key = `${year}-${material.itemType._id}`;
      if (!series.has(key)) {
        series.set(key, {
          year,
          materialId: material.itemType._id,
          material: material.itemType.name,
          data: months.map((month, index) => ({
            date: `${year}-${String(index + 1).padStart(2, '0')}`,
            month,
            bought: 0,
            wasted: 0,
          })),
        });
      }
      series.get(key).data[date.getUTCMonth()][field] += quantity;
    };
    // Pending/rejected requests are not purchases; sum quantities before dividing across projects.
    (material.purchaseRecord || [])
      .filter(record => record.status === 'Approved')
      .forEach(record => addRecord(record, 'bought', record.quantity));
    (material.updateRecord || []).forEach(record =>
      addRecord(record, 'wasted', record.quantityWasted),
    );
  });
  return Array.from(series.values()).map(line => ({
    ...line,
    data: line.data.map(({ bought, wasted, ...point }) => ({
      ...point,
      value: bought > 0 ? Number(((wasted / bought) * 100).toFixed(2)) : null,
    })),
  }));
}

// Version 1.1.0
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
  const cumulativePurchases = new Map();
  // Accumulate all loaded history before display filters, including purchases in prior years.
  return Array.from(series.values())
    .sort((a, b) => a.year - b.year)
    .map(line => {
      let boughtToDate = cumulativePurchases.get(line.materialId) || 0;
      const data = line.data.map(({ bought, wasted, ...point }) => {
        boughtToDate += bought;
        return {
          ...point,
          value: boughtToDate > 0 ? Number(((wasted / boughtToDate) * 100).toFixed(2)) : null,
        };
      });
      cumulativePurchases.set(line.materialId, boughtToDate);
      return { ...line, data };
    });
}

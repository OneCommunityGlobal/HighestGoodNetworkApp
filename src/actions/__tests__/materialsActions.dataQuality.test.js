import axios from 'axios';
import { fetchAllMaterials, setMaterials } from '../bmdashboard/materialsActions';
import { getMaterialDataIssues } from '../../utils/materialDataQuality';

vi.mock('axios');

it('retains the fetched Available for investigation without altering the existing calculated balance', async () => {
  const material = {
    _id: 'material1',
    project: { name: 'Building 1' },
    itemType: { name: 'Sand', unit: 'kg' },
    stockBought: 100,
    stockUsed: 20,
    stockWasted: 10,
    stockAvailable: 0,
  };
  axios.get.mockResolvedValue({ data: [material] });
  const dispatch = vi.fn();
  await fetchAllMaterials()(dispatch);
  const expected = { ...material, storedStockAvailable: 0, stockAvailable: 70 };
  expect(dispatch).toHaveBeenCalledWith(setMaterials([expected]));
  expect(getMaterialDataIssues(expected)).toContain('Stored Available does not match the calculated balance');
  expect(material.stockAvailable).toBe(0);
});

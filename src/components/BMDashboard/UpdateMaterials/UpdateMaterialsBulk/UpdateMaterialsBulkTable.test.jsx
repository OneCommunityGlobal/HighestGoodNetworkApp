import { render, screen, fireEvent } from '@testing-library/react';
import UpdateMaterialsBulkTable from './UpdateMaterialsBulkTable';
import UpdateMaterial from '../UpdateMaterial';

const mocks = vi.hoisted(() => ({ dispatch: vi.fn(), state: {} }));
vi.mock('react-redux', () => ({
  useDispatch: () => mocks.dispatch,
  useSelector: selector => selector(mocks.state),
}));
vi.mock('~/actions/bmdashboard/materialsActions', () => ({
  fetchAllMaterials: () => ({ type: 'FETCH_MATERIALS' }),
  postMaterialUpdateBulk: payload => ({ type: 'POST_MATERIALS', payload }),
  postMaterialUpdate: payload => ({ type: 'POST_MATERIAL', payload }),
}));

const material = (id, available) => ({
  _id: id,
  project: { name: 'Building 1' },
  itemType: { name: id, unit: 'kg' },
  stockBought: available,
  stockUsed: 0,
  stockWasted: 0,
  stockAvailable: available,
});

beforeEach(() => {
  mocks.dispatch.mockClear();
  mocks.state = {
    theme: { darkMode: false },
    materials: {
      materialslist: [material('Sand', 10), material('Iron', 20)],
      updateMaterialsBulk: { loading: false, result: null, error: false },
      updateMaterials: { loading: false, result: null, error: false },
    },
  };
});

const renderBulk = () =>
  render(
    <UpdateMaterialsBulkTable
      date="2026-11-20"
      setDate={vi.fn()}
      project={{ value: '0', label: 'All Projects' }}
      setProject={vi.fn()}
    />,
  );

it('keeps Submit disabled until every edited row is valid', () => {
  renderBulk();
  const [sand, iron] = screen.getAllByPlaceholderText('Used');
  fireEvent.change(sand, { target: { value: '11' } });
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.change(iron, { target: { value: '1' } });
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.change(sand, { target: { value: '2' } });
  expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mocks.dispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'POST_MATERIALS',
      payload: expect.objectContaining({
        upadateMaterials: expect.arrayContaining([
          expect.objectContaining({ quantityUsed: '2' }),
          expect.objectContaining({ quantityUsed: '1' }),
        ]),
      }),
    }),
  );
});

it('clears cancelled records and their validation errors', () => {
  renderBulk();
  const [sand] = screen.getAllByPlaceholderText('Used');
  fireEvent.change(sand, { target: { value: '11' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByText('Quantity Used exceeds the available stock')).not.toBeInTheDocument();
  expect(sand).toHaveValue(0);
  fireEvent.change(screen.getAllByPlaceholderText('Used')[1], { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mocks.dispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'POST_MATERIALS',
      payload: expect.objectContaining({
        upadateMaterials: [
          expect.objectContaining({ material: expect.objectContaining({ _id: 'Iron' }) }),
        ],
      }),
    }),
  );
});

it('formats Available and New Available while preserving raw numeric data', () => {
  mocks.state.materials.materialslist = [material('Sand', 35.700000000000045)];
  renderBulk();
  expect(screen.getByText('35.70')).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText('Used'), { target: { value: '1' } });
  expect(screen.getByText('34.70')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mocks.dispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'POST_MATERIALS',
      payload: expect.objectContaining({
        upadateMaterials: [
          expect.objectContaining({
            material: expect.objectContaining({ stockAvailable: 35.700000000000045 }),
          }),
        ],
      }),
    }),
  );
});

it('shows a missing project and formatted negative Available in the single update form', () => {
  render(
    <UpdateMaterial
      record={{ ...material('Sand', -6.2000000000000455), project: null }}
      setModal={vi.fn()}
    />,
  );
  expect(screen.getByText('Missing project')).toBeInTheDocument();
  expect(screen.getByText('-6.20')).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import HGNFormListPage from '../HGNFormListPage';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('axios');

const mockStore = configureMockStore([]);

const renderFormList = () =>
  render(
    <MemoryRouter>
      <Provider store={mockStore({ theme: { darkMode: false } })}>
        <HGNFormListPage />
      </Provider>
    </MemoryRouter>,
  );

describe('HGNFormListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders generic form metadata and the built-in HGN questionnaire entry', async () => {
    axios.get.mockResolvedValue({
      data: {
        data: [
          {
            _id: 'generic-form',
            formName: 'Mern Stack Developer',
            description: 'Find your best development team fit.',
          },
        ],
      },
    });

    renderFormList();

    expect(await screen.findByText('Mern Stack Developer')).toBeInTheDocument();
    expect(screen.getByText('Find your best development team fit.')).toBeInTheDocument();
    expect(screen.getByText('HGN Development Team Questionnaire')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.HGN_FORMS);
    expect(
      screen.getByRole('link', { name: /HGN Development Team Questionnaire/i }),
    ).toHaveAttribute('href', '/hgnform/page1');
  });

  it('handles forms without descriptions safely', async () => {
    axios.get.mockResolvedValue({ data: { data: [{ _id: 'form-2', formName: 'Existing Form' }] } });

    renderFormList();

    expect(await screen.findByText('Existing Form')).toBeInTheDocument();
    expect(screen.getByText('No description available.')).toBeInTheDocument();
  });

  it('keeps the HGN questionnaire available when the generic form list is empty', async () => {
    axios.get.mockResolvedValue({ data: { data: [] } });

    renderFormList();

    expect(
      await screen.findByText('No additional forms are currently available.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /HGN Development Team Questionnaire/i }),
    ).toHaveAttribute('href', '/hgnform/page1');
  });

  it('handles an API failure without exposing backend errors', async () => {
    axios.get.mockRejectedValue(new Error('Server error'));

    renderFormList();

    expect(
      await screen.findByText('Unable to load additional forms. Please try again later.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /HGN Development Team Questionnaire/i }),
    ).toBeInTheDocument();
  });
});

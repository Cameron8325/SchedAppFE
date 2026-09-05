import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import moment from 'moment';
import ProfilePage from './ProfilePage';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';

jest.mock('../api/client', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn() } }));
const user = { first_name: 'Saved', last_name: 'Guest', username: 'guest', email: 'guest@example.com', profile: { phone_number: '2025550100', tokens: 0 } };
const renderProfile = () => render(<MemoryRouter><AuthContext.Provider value={{ user, refreshUser: jest.fn(), logout: jest.fn() }}><ProfilePage /></AuthContext.Provider></MemoryRouter>);
beforeEach(() => { jest.clearAllMocks(); api.get.mockResolvedValue({ data: [] }); });

it('restores saved values when an edit is cancelled', async () => {
  renderProfile();
  fireEvent.click(screen.getByRole('button', { name: 'Edit account details' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'First Name' }), { target: { value: 'Unsaved' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel editing' }));
  expect(screen.getByRole('textbox', { name: 'First Name' })).toHaveValue('Saved');
  expect(api.put).not.toHaveBeenCalled();
  await waitFor(() => expect(api.get).toHaveBeenCalled());
});

it('excludes past confirmed visits from upcoming appointments', async () => {
  api.get.mockResolvedValue({ data: [
    { id: 1, status: 'confirmed', date: moment().subtract(1, 'day').format('YYYY-MM-DD'), day_type_display: 'Past visit' },
    { id: 2, status: 'pending', date: moment().add(1, 'day').format('YYYY-MM-DD'), day_type_display: 'Future visit' },
  ] });
  renderProfile();
  fireEvent.click(screen.getByRole('tab', { name: 'Appointments' }));
  expect(await screen.findByText(/Future visit/)).toBeInTheDocument();
  expect(screen.queryByText(/Past visit/)).not.toBeInTheDocument();
});

it('does not describe a failed appointment request as an empty calendar', async () => {
  api.get.mockRejectedValue(new Error('offline'));
  renderProfile();
  fireEvent.click(screen.getByRole('tab', { name: 'Appointments' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('could not load');
  expect(screen.queryByText('You have no upcoming appointments.')).not.toBeInTheDocument();
});

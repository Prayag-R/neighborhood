import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main nav and Learn button', () => {
  render(<App />);
  const titles = screen.getAllByText(/StuStocks/i);
  expect(titles.length).toBeGreaterThan(0);
  const learns = screen.getAllByText(/Learn/i);
  expect(learns.length).toBeGreaterThan(0);
});

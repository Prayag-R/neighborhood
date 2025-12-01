import '@testing-library/jest-dom';
try {
	const fetchMock = require('./tests/__mocks__/fetchMock');
	global.fetch = fetchMock;
} catch (e) {
}
try {
	jest.mock('marked', () => ({ marked: (s) => s }));
} catch (e) {
}
if (typeof global.ResizeObserver === 'undefined') {
	global.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

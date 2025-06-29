import '@testing-library/jest-dom';

// Mock sessionStorage
const mockSessionStorage = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => (store[key] = value.toString()),
        removeItem: (key) => delete store[key],
        clear: () => (store = {}),
    };
})();

Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
});

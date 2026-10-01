import { afterEach, beforeEach, vi } from 'vitest';

// La app guarda token, usuario y datos de estudio en localStorage. Sin limpiarlo
// entre tests, el estado de un caso se filtra al siguiente.
beforeEach(() => {
  localStorage.clear();
});

// jsdom no implementa confirm() ni la Object URL API; ambos se usan en descargas
// y en el borrado de documentos de la biblioteca.
beforeEach(() => {
  vi.stubGlobal('confirm', vi.fn(() => true));
  URL.createObjectURL = vi.fn(() => 'blob:studyfinder/mock');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

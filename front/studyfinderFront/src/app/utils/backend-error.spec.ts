import { mensajeDeErrorBackend } from './backend-error';

describe('mensajeDeErrorBackend', () => {
  it('lee el detalle convencional del backend', () => {
    expect(mensajeDeErrorBackend({ error: { detail: 'Correo o contrasena incorrectos' } })).toBe(
      'Correo o contrasena incorrectos',
    );
  });

  it('ignora un detalle vacio', () => {
    expect(mensajeDeErrorBackend({ error: { detail: '' } })).toBeNull();
    expect(mensajeDeErrorBackend({ error: { detail: '   ' } })).toBeNull();
  });

  it('junta los errores de validacion 422', () => {
    const error = {
      error: {
        detail: [
          { msg: 'value is not a valid email address', loc: ['body', 'email'] },
          { msg: 'String should have at least 6 characters', loc: ['body', 'password'] },
        ],
      },
    };
    expect(mensajeDeErrorBackend(error)).toContain('value is not a valid email address');
    expect(mensajeDeErrorBackend(error)).toContain('String should have at least 6 characters');
  });

  it('acepta un cuerpo de error en texto plano', () => {
    expect(mensajeDeErrorBackend({ error: 'Internal Server Error' })).toBe('Internal Server Error');
  });

  it('devuelve null con otros formatos', () => {
    expect(mensajeDeErrorBackend(null)).toBeNull();
    expect(mensajeDeErrorBackend(undefined)).toBeNull();
    expect(mensajeDeErrorBackend('sin error de http')).toBeNull();
    expect(mensajeDeErrorBackend({})).toBeNull();
    expect(mensajeDeErrorBackend({ error: null })).toBeNull();
  });
});
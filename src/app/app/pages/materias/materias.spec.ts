import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriasComponent } from './materias';
import { routes } from '../../../app.routes';
import { StudyDataService } from '../../../services/study-data.service';
import { environment } from '../../../../environments/environment';

const DOCS = `${environment.apiUrl}/documents`;
const SEARCH = `${environment.apiUrl}/search`;

function documento(id: number): import('../../../services/document.service').LibraryDocument {
  return {
    id: `d${id}`,
    filename: `Documento ${id}.pdf`,
    contentType: 'application/pdf',
    size: 2048,
    createdAt: '2026-03-04T10:00:00Z',
  };
}

describe('MateriasComponent', () => {
  let component: MateriasComponent;
  let fixture: ComponentFixture<MateriasComponent>;
  let http: HttpTestingController;
  let studyData: StudyDataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriasComponent],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MateriasComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    studyData = TestBed.inject(StudyDataService);
    // La API solo se dispara con una materia seleccionada o al abrir el selector.
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => http.verify());

  it('arranca con las 6 materias predefinidas', () => {
    expect(component.materias().length).toBe(6);
    expect(component.materias()[0].nombre).toBe('Ingeniería de Software');
  });

  it('carga las materias propias guardadas al arrancar', () => {
    localStorage.setItem(
      'studyfinder_data_guest',
      JSON.stringify({
        searches: 0,
        savedDocuments: [],
        uploadedFiles: [],
        studySessions: 0,
        customMaterias: [{ name: 'Química', description: 'Trabajos' }],
        deletedMateriaIds: [],
      }),
    );
    fixture = TestBed.createComponent(MateriasComponent);
    component = fixture.componentInstance;
    expect(component.materias().some(materia => materia.nombre === 'Química')).toBe(true);
    expect(component.materias().some(materia => materia.id === 1000)).toBe(true);
  });

  it('descarta las materias predefinidas borradas', () => {
    localStorage.setItem(
      'studyfinder_data_guest',
      JSON.stringify({
        searches: 0,
        savedDocuments: [],
        uploadedFiles: [],
        studySessions: 0,
        customMaterias: [],
        deletedMateriaIds: [2],
      }),
    );
    fixture = TestBed.createComponent(MateriasComponent);
    component = fixture.componentInstance;
    expect(component.materias().length).toBe(5);
    expect(component.materias().some(materia => materia.id === 2)).toBe(false);
  });

  describe('seleccionarMateria', () => {
    it('carga los documentos propios de esa materia', () => {
      component.seleccionarMateria(component.materias()[0]);
      expect(component.materiaSeleccionada()?.nombre).toBe('Ingeniería de Software');
      http
        .expectOne(req => req.url === DOCS && req.params.get('materia') === 'Ingeniería de Software')
        .flush([documento(7)]);
      expect(component.documentosDeMateria.length).toBe(1);
    });

    it('avisa si no se pueden cargar los documentos', () => {
      component.seleccionarMateria(component.materias()[0]);
      http
        .expectOne(req => req.url === DOCS && req.params.get('materia') === 'Ingeniería de Software')
        .flush({}, { status: 500, statusText: 'Server Error' });
      expect(component.errorBiblioteca).toMatch(/no se pudieron cargar los documentos/i);
    });
  });

  it('abrirSelectorBiblioteca lista toda la biblioteca y apaga el spinner', () => {
    component.abrirSelectorBiblioteca();
    expect(component.cargandoBiblioteca).toBe(true);
    http.expectOne(DOCS).flush([documento(1), documento(2)]);
    expect(component.documentosBiblioteca.length).toBe(2);
    expect(component.cargandoBiblioteca).toBe(false);
  });

  describe('crearMateria', () => {
    it('rechaza un nombre vacio', () => {
      component.newMateriaName = '   ';
      component.crearMateria();
      expect(component.materiaError).toMatch(/escribe un nombre/i);
    });

    it('rechaza un nombre duplicado', () => {
      component.newMateriaName = 'Física';
      component.crearMateria();
      expect(component.materiaError).toMatch(/ya existe/i);
    });

    it('crea la materia y la persiste', () => {
      const anadir = vi.spyOn(studyData, 'addMateria');
      component.newMateriaName = 'Química';
      component.newMateriaDescription = 'Trabajos de laboratorio';
      component.crearMateria();

      expect(component.materias().length).toBe(7);
      const creada = component.materias()[6];
      expect(creada.nombre).toBe('Química');
      expect(creada.descripcion).toBe('Trabajos de laboratorio');
      expect(creada.id).toBe(1000);
      expect(anadir).toHaveBeenCalledWith('Química', 'Trabajos de laboratorio');
      expect(component.showNewMateria).toBe(false);
      expect(component.materiaError).toBe('');
    });
  });

  describe('buscarDocumentos', () => {
    it('cuenta la busqueda y muestra los resultados', () => {
      const registrar = vi.spyOn(studyData, 'recordSearch');
      component.searchTerm = 'calculo';
      component.buscarDocumentos();
      http.expectOne(`${SEARCH}?q=calculo`)
        .flush([{ title: 'Apuntes de Calculo', url: 'https://ejemplo.test' }]);
      expect(registrar).toHaveBeenCalled();
      expect(component.searchResults.length).toBe(1);
      expect(component.searching).toBe(false);
    });

    it('tolera respuestas anidadas', () => {
      component.searchTerm = 'calculo';
      component.buscarDocumentos();
      http.expectOne(`${SEARCH}?q=calculo`).flush({ results: [{ title: 'Apuntes' }] });
      expect(component.searchResults.length).toBe(1);
    });

    it('avisa y limpia el estado cuando no hay resultados', () => {
      component.searchTerm = 'rareza';
      component.buscarDocumentos();
      http.expectOne(`${SEARCH}?q=rareza`).flush([]);
      expect(component.searchResults).toEqual([]);
      expect(component.searchError).toMatch(/no encontramos documentos/i);
    });

    it('no busca si el termino es solo espacios', () => {
      component.buscarDocumentos();
      http.expectNone(SEARCH);
    });
  });

  describe('eliminarMateria', () => {
    function novaMaterias(ids: number[]): void {
      component.materias.set(ids.map(id => ({ id, nombre: `Materia ${id}`, documentos: [] })));
    }

    // Los ids propios (>= 1000) equivalen a la posicion en el almacen; si no se
    // renumeran tras un borrado intermedio, la siguiente materia creada repite
    // un id vivo y removeMateria borraria la materia equivocada.
    it('renumera los ids de las materias propias tras borrar una del medio', () => {
      novaMaterias([1, 1000, 1001, 1002]);
      const borrar = vi.spyOn(studyData, 'removeMateria');
      component.eliminarMateria({ id: 1001, nombre: 'Materia 1001', documentos: [] }, { stopPropagation: () => {} } as MouseEvent);

      expect(component.materias().map(materia => materia.id)).toEqual([1, 1000, 1001]);
      expect(borrar).toHaveBeenCalledWith(1001);
    });

    it('marca la materia predefinida como borrada en el almacen', () => {
      const borrar = vi.spyOn(studyData, 'removeMateria');
      const materia = component.materias()[1];
      component.eliminarMateria(materia, { stopPropagation: () => {} } as MouseEvent);
      expect(borrar).toHaveBeenCalledWith(2);
      expect(component.materias().some(item => item.id === 2)).toBe(false);
    });
  });

  it('elimina un documento guardado de la materia', () => {
    const quitar = vi.spyOn(studyData, 'removeSavedDocument');
    localStorage.setItem(
      'studyfinder_data_guest',
      JSON.stringify({
        searches: 0,
        savedDocuments: [{ id: 'l0', title: 'Apunte', url: 'https://ejemplo.test', savedAt: '2026-03-01T00:00:00Z' }],
        uploadedFiles: [],
        studySessions: 0,
        customMaterias: [],
        deletedMateriaIds: [],
      }),
    );
    const saved = studyData.getSavedDocuments()[0];
    component.eliminarGuardado(saved, { stopPropagation: () => {} } as MouseEvent);
    expect(quitar).toHaveBeenCalledWith('l0');
  });

  it('tamanoLegible formatea KB y MB', () => {
    expect(component.tamanoLegible(2048)).toBe('2 KB');
    expect(component.tamanoLegible(1024 * 1024 * 2.5)).toBe('2.5 MB');
  });

  describe('descarga de documentos de la materia', () => {
    it('no revoca la URL hasta que el navegador ha leido el blob', async () => {
      const revocar = URL.revokeObjectURL as unknown as ReturnType<typeof vi.fn>;
      component.descargar(documento(1));
      http.expectOne(`${DOCS}/d1/download`).flush(new Blob(['contenido']));
      expect(revocar).not.toHaveBeenCalled();
      await new Promise(resolve => setTimeout(resolve, 5));
      expect(revocar).toHaveBeenCalledTimes(1);
    });
  });
});
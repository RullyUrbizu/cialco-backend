import { Test, TestingModule } from '@nestjs/testing';
import { ColectaService } from './colecta.service';
import { ColectaRepository } from './colecta.repository';
import { InventarioRepository } from 'src/inventario/inventario.repository';
import { CanastilloRepository } from 'src/canastillo/canastillo.repository';
import { ColectaContenedorRepository } from './colecta-contenedor.repository';
import { getConnectionToken } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('ColectaService', () => {
  let service: ColectaService;
  let colectaRepo: ColectaRepository;
  let inventarioRepo: InventarioRepository;

  const mockColectaRepo = {
    create: jest.fn(),
    findById: jest.fn(),
    findAllPaginated: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockInventarioRepo = {
    create: jest.fn(),
    findByColectaId: jest.fn(),
    update: jest.fn(),
  };

  const mockCanastilloRepo = {
    findByTermoAndCodigo: jest.fn(),
    create: jest.fn(),
  };

  const mockColectaContenedorRepo = {
    create: jest.fn(),
    findById: jest.fn(),
    findByColectaId: jest.fn(),
    deleteByColectaId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockSequelize = {
    transaction: jest.fn((cb) => cb('mock-transaction')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColectaService,
        { provide: ColectaRepository, useValue: mockColectaRepo },
        { provide: InventarioRepository, useValue: mockInventarioRepo },
        { provide: CanastilloRepository, useValue: mockCanastilloRepo },
        { provide: ColectaContenedorRepository, useValue: mockColectaContenedorRepo },
        { provide: getConnectionToken(), useValue: mockSequelize },
      ],
    }).compile();

    service = module.get<ColectaService>(ColectaService);
    colectaRepo = module.get<ColectaRepository>(ColectaRepository);
    inventarioRepo = module.get<InventarioRepository>(InventarioRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a colecta with its containers and inventory', async () => {
      const dto = {
        toroId: 'toro-1',
        clienteId: 'cliente-1',
        fecha: '2025-03-12',
        color: 'rojo',
        vigorMot: 'bueno',
        contenedores: [
          { termoId: 'termo-1', canastilloCodigo: 'A1', cantidad: 100 },
          { termoId: 'termo-1', canastilloCodigo: 'A2', cantidad: 50 },
        ],
      };

      const mockColecta = { id: 'mock-uuid', ...dto, cantidad: 150 };
      mockColectaRepo.create.mockResolvedValue(mockColecta);
      mockColectaRepo.findById.mockResolvedValue(mockColecta);
      mockCanastilloRepo.findByTermoAndCodigo.mockResolvedValue({ id: 'can-1' });

      const result = await service.create(dto as any);

      expect(colectaRepo.create).toHaveBeenCalled();
      expect(mockColectaContenedorRepo.create).toHaveBeenCalledTimes(2);
      expect(inventarioRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        cantidadInicial: 150,
        stockActual: 150,
      }));
      expect(result).toEqual(mockColecta);
    });
  });

  describe('findAll', () => {
    it('should return paginated colectas', async () => {
      const mockResult = { rows: [{ id: '1' }], count: 1 };
      mockColectaRepo.findAllPaginated.mockResolvedValue(mockResult);

      const result = await service.findAll(1, 10);

      expect(colectaRepo.findAllPaginated).toHaveBeenCalledWith(1, 10, undefined);
      expect(result.data).toEqual(mockResult.rows);
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a colecta with stock synchronization', async () => {
      const id = 'mock-uuid';
      const updateDto = {
        color: 'azul',
        contenedores: [
          { termoId: 'termo-1', canastilloId: 'can-1', cantidad: 200 }
        ]
      };

      const mockOldContenedor = { termoId: 'termo-1', canastilloId: 'can-1', cantidad: 100, stockActual: 80 };
      const mockOldInventario = { id: 'inv-1' };
      
      mockColectaContenedorRepo.findByColectaId.mockResolvedValue([mockOldContenedor]);
      mockInventarioRepo.findByColectaId.mockResolvedValue(mockOldInventario);
      mockColectaRepo.update.mockResolvedValue({ id, color: 'azul' });

      const result = await service.update(id, updateDto as any);

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockColectaContenedorRepo.deleteByColectaId).toHaveBeenCalledWith(id);
      expect(mockInventarioRepo.update).toHaveBeenCalledWith('inv-1', expect.objectContaining({
        cantidadInicial: 200,
        stockActual: 180, // 200 - (100 - 80) = 180
      }), 'mock-transaction');
      expect(result).toBeDefined();
    });
  });

  describe('transferirStock', () => {
    it('should transfer stock between containers within a transaction', async () => {
      const dto = {
        origenContenedorId: 'cont-1',
        cantidad: 10,
        termoDestinoId: 'termo-2',
        canastilloCodigoDestino: 'B1',
      };

      const mockOrigen = { id: 'cont-1', colectaId: 'col-1', termoId: 'termo-1', canastilloId: 'can-1', cantidad: 50, stockActual: 20 };
      const mockDestinoCanastillo = { id: 'can-2' };
      
      mockColectaContenedorRepo.findById.mockResolvedValue(mockOrigen);
      mockCanastilloRepo.findByTermoAndCodigo.mockResolvedValue(mockDestinoCanastillo);
      mockColectaContenedorRepo.findByColectaId.mockResolvedValue([mockOrigen]);
      mockColectaContenedorRepo.create.mockResolvedValue({ id: 'cont-new' });

      await service.transferirStock(dto as any);

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockColectaContenedorRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        termoId: 'termo-2',
        canastilloId: 'can-2',
        stockActual: 0,
      }), 'mock-transaction');
      expect(mockColectaContenedorRepo.update).toHaveBeenCalledTimes(2); // One for source, one for destination
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { InventarioService } from './inventario.service';
import { InventarioRepository } from './inventario.repository';
import { Inventario } from 'src/modelo/inventario';

describe('InventarioService', () => {
  let service: InventarioService;
  let repository: InventarioRepository;

  const mockInventarioRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByColectaId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventarioService,
        {
          provide: InventarioRepository,
          useValue: mockInventarioRepository,
        },
      ],
    }).compile();

    service = module.get<InventarioService>(InventarioService);
    repository = module.get<InventarioRepository>(InventarioRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call repository.create with generated id', async () => {
      const createDto = { toroId: 'toro-1', termoId: 'termo-1', canastilloId: 'canastillo-1', unidades: 10 };
      const expectedInventario = { id: 'uuid', ...createDto };
      mockInventarioRepository.create.mockResolvedValue(expectedInventario);

      const result = await service.create(createDto as any);

      expect(repository.create).toHaveBeenCalled();
      expect(result).toEqual(expectedInventario);
    });
  });

  describe('findAll', () => {
    it('should return an array of inventarios', async () => {
      const expectedInventarios = [{ id: '1' }, { id: '2' }];
      mockInventarioRepository.findAll.mockResolvedValue(expectedInventarios);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedInventarios);
    });
  });

  describe('findById', () => {
    it('should return a single inventario', async () => {
      const expectedInventario = { id: '1' };
      mockInventarioRepository.findById.mockResolvedValue(expectedInventario);

      const result = await service.findById('1');

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedInventario);
    });
  });
});

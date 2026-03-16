import { Test, TestingModule } from '@nestjs/testing';
import { ToroService } from './toro.service';
import { ToroRepository } from './toro.repository';

describe('ToroService', () => {
  let service: ToroService;
  let repository: ToroRepository;

  const mockToroRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToroService,
        {
          provide: ToroRepository,
          useValue: mockToroRepository,
        },
      ],
    }).compile();

    service = module.get<ToroService>(ToroService);
    repository = module.get<ToroRepository>(ToroRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call repository.create with generated id', async () => {
      const createDto = { nombre: 'Toro 1', raza: 'Angus', hba: '123' };
      const expectedToro = { id: 'uuid', ...createDto };
      mockToroRepository.create.mockResolvedValue(expectedToro);

      const result = await service.create(createDto as any);

      expect(repository.create).toHaveBeenCalled();
      expect(result).toEqual(expectedToro);
    });
  });

  describe('findAll', () => {
    it('should return an array of toros', async () => {
      const expectedToros = [{ id: '1', nombre: 'T1' }];
      mockToroRepository.findAll.mockResolvedValue(expectedToros);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedToros);
    });
  });
});

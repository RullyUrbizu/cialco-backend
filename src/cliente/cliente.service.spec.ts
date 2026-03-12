import { Test, TestingModule } from '@nestjs/testing';
import { ClienteService } from './cliente.service';
import { ClienteRepository } from './cliente.repository';
import { ConflictException } from '@nestjs/common';

describe('ClienteService', () => {
  let service: ClienteService;
  let repository: ClienteRepository;

  const mockClienteRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteService,
        {
          provide: ClienteRepository,
          useValue: mockClienteRepository,
        },
      ],
    }).compile();

    service = module.get<ClienteService>(ClienteService);
    repository = module.get<ClienteRepository>(ClienteRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('should throw ConflictException if CUIT already exists', async () => {
      const error = { parent: { code: '23505' } };
      mockClienteRepository.update.mockRejectedValue(error);

      await expect(service.update('1', {} as any)).rejects.toThrow(ConflictException);
    });
  });
});

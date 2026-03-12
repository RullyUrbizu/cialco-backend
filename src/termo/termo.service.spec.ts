import { Test, TestingModule } from '@nestjs/testing';
import { TermoService } from './termo.service';
import { TermoRepository } from './termo.repository';
import { ConflictException } from '@nestjs/common';

describe('TermoService', () => {
  let service: TermoService;
  let repository: TermoRepository;

  const mockTermoRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getStockSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TermoService,
        {
          provide: TermoRepository,
          useValue: mockTermoRepository,
        },
      ],
    }).compile();

    service = module.get<TermoService>(TermoService);
    repository = module.get<TermoRepository>(TermoRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('delete', () => {
    it('should throw ConflictException on foreign key constraint error', async () => {
      const error = { name: 'SequelizeForeignKeyConstraintError' };
      mockTermoRepository.delete.mockRejectedValue(error);

      await expect(service.delete('1')).rejects.toThrow(ConflictException);
    });
  });
});

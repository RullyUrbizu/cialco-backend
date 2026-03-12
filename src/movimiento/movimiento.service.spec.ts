import { Test, TestingModule } from '@nestjs/testing';
import { MovimientoService } from './movimiento.service';
import { MovimientoRepository } from './movimiento.repository';
import { InventarioRepository } from 'src/inventario/inventario.repository';
import { ColectaContenedorRepository } from 'src/colecta/colecta-contenedor.repository';
import { Sequelize } from 'sequelize-typescript';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';

describe('MovimientoService', () => {
  let service: MovimientoService;
  let movimientoRepo: MovimientoRepository;
  let inventarioRepo: InventarioRepository;
  let contenedorRepo: ColectaContenedorRepository;

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  const mockSequelize = {
    transaction: jest.fn(() => Promise.resolve(mockTransaction)),
  };

  const mockMovimientoRepo = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByInventario: jest.fn(),
    findByRemito: jest.fn(),
  };

  const mockInventarioRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockContenedorRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimientoService,
        { provide: Sequelize, useValue: mockSequelize },
        { provide: MovimientoRepository, useValue: mockMovimientoRepo },
        { provide: InventarioRepository, useValue: mockInventarioRepo },
        { provide: ColectaContenedorRepository, useValue: mockContenedorRepo },
      ],
    }).compile();

    service = module.get<MovimientoService>(MovimientoService);
    movimientoRepo = module.get<MovimientoRepository>(MovimientoRepository);
    inventarioRepo = module.get<InventarioRepository>(InventarioRepository);
    contenedorRepo = module.get<ColectaContenedorRepository>(ColectaContenedorRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      inventarioId: 'inv-1',
      tipo: 'salida' as const,
      cantidad: 10,
      motivo: 'venta',
      remito: 'R-001',
      contenedoresDistribucion: [
        { contenedorId: 'cont-1', cantidad: 10 }
      ]
    };

    it('should create a movement and update stock', async () => {
      const mockInventario = { 
        id: 'inv-1', 
        colectaId: 'col-1', 
        cantidadInicial: 100, 
        ingresosTotal: 0, 
        salidasTotal: 0,
        colecta: { clienteId: 'cli-1' }
      };
      const mockContenedor = { id: 'cont-1', stockActual: 20 };

      mockInventarioRepo.findById.mockResolvedValue(mockInventario);
      mockContenedorRepo.findById.mockResolvedValue(mockContenedor);
      mockMovimientoRepo.findByRemito.mockResolvedValue([]);
      mockMovimientoRepo.create.mockResolvedValue({ id: 'mov-1', ...createDto });

      const result = await service.create(createDto as any);

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(movimientoRepo.create).toHaveBeenCalled();
      expect(contenedorRepo.update).toHaveBeenCalledWith('cont-1', { stockActual: 10 }, mockTransaction);
      expect(inventarioRepo.update).toHaveBeenCalledWith('inv-1', expect.objectContaining({
        salidasTotal: 10,
        stockActual: 90
      }), mockTransaction);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      const mockInventario = { id: 'inv-1', colecta: { clienteId: 'cli-1' } };
      const mockContenedor = { id: 'cont-1', stockActual: 5 };

      mockInventarioRepo.findById.mockResolvedValue(mockInventario);
      mockContenedorRepo.findById.mockResolvedValue(mockContenedor);
      mockMovimientoRepo.findByRemito.mockResolvedValue([]);

      await expect(service.create(createDto as any)).rejects.toThrow(BadRequestException);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw NotFoundException if inventario does not exist', async () => {
      mockInventarioRepo.findById.mockResolvedValue(null);

      await expect(service.create(createDto as any)).rejects.toThrow(NotFoundException);
    });
  });
});

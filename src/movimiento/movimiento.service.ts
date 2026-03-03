import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Sequelize } from 'sequelize-typescript';
import { MovimientoRepository } from './movimiento.repository';
import { Movimiento } from 'src/modelo/movimiento';
import {
  CreateMovimientoDto,
  UpdateMovimientoDto,
} from 'src/dto/movimiento.dto';
import { InventarioRepository } from 'src/inventario/inventario.repository';
import { ColectaContenedorRepository } from 'src/colecta/colecta-contenedor.repository';

@Injectable()
export class MovimientoService {
  private readonly logger = new Logger(MovimientoService.name);

  constructor(
    private readonly sequelize: Sequelize,
    private readonly movimientoRepository: MovimientoRepository,
    private readonly inventarioRepository: InventarioRepository,
    private readonly colectaContenedorRepository: ColectaContenedorRepository,
  ) { }

  async create(createMovimientoDto: CreateMovimientoDto): Promise<Movimiento> {
    const transaction = await this.sequelize.transaction();
    try {
      // 1. Obtener el inventario y su colecta para saber el cliente
      const inventario = await this.inventarioRepository.findById(
        createMovimientoDto.inventarioId,
      );

      if (!inventario) {
        throw new NotFoundException('Inventario no encontrado');
      }

      this.logger.debug(`Inventario cargado: ${inventario.id}, Colecta ID: ${inventario.colectaId}, Colecta cargada: ${!!inventario.colecta}`);

      // El cliente viene de la colecta asociada al inventario
      const clienteId = inventario.colecta?.clienteId;
      this.logger.debug(`Cliente ID detectado para el movimiento: ${clienteId}`);

      // 2. Si hay remito, validar que pertenezca al mismo cliente
      if (createMovimientoDto.remito) {
        this.logger.debug(`Validando remito: ${createMovimientoDto.remito}`);
        const movimientosExistentes = await this.movimientoRepository.findByRemito(createMovimientoDto.remito);

        if (movimientosExistentes.length > 0) {
          // Obtener el cliente del remito existente (del primer movimiento encontrado)
          const primerMov = movimientosExistentes[0];
          const clienteRemito = primerMov.clienteId || primerMov.inventario?.colecta?.clienteId;
          this.logger.debug(`Remito existente encontrado. Cliente asociado: ${clienteRemito}`);

          if (clienteRemito && clienteRemito !== clienteId) {
            throw new BadRequestException(`El remito ${createMovimientoDto.remito} ya está asociado a otro cliente. No se puede mezclar clientes en un mismo remito.`);
          }
        }
      }

      // 3. Crear el movimiento
      const movimiento = await this.movimientoRepository.create(
        {
          id: uuidv4(),
          ...createMovimientoDto,
          clienteId: clienteId || null, // Guardamos explícitamente el cliente
          fecha: createMovimientoDto.fecha ? new Date(createMovimientoDto.fecha) : new Date(),
          remito: createMovimientoDto.remito || null,
        } as Partial<Movimiento> as Movimiento,
        transaction,
      );

      // Si se especificó distribución por contenedores, actualizar stock de cada uno
      if (
        createMovimientoDto.contenedoresDistribucion &&
        createMovimientoDto.contenedoresDistribucion.length > 0
      ) {
        for (const dist of createMovimientoDto.contenedoresDistribucion) {
          const contenedor = await this.colectaContenedorRepository.findById(
            dist.contenedorId,
          );

          if (!contenedor) {
            throw new NotFoundException(`Contenedor ${dist.contenedorId} no encontrado`);
          }

          let nuevoStock = contenedor.stockActual;

          if (createMovimientoDto.tipo === 'ingreso') {
            nuevoStock += dist.cantidad;
          } else if (createMovimientoDto.tipo === 'salida') {
            nuevoStock -= dist.cantidad;

            if (nuevoStock < 0) {
              throw new BadRequestException(
                `Stock insuficiente en contenedor. Disponible: ${contenedor.stockActual}, solicitado: ${dist.cantidad}`,
              );
            }
          }

          await this.colectaContenedorRepository.update(
            dist.contenedorId,
            {
              stockActual: nuevoStock,
            },
            transaction,
          );
        }
      }

      // Actualizar ingresosTotal o salidasTotal según el tipo y sincronizar stockActual
      if (createMovimientoDto.tipo === 'ingreso') {
        const nuevosIngresos =
          inventario.ingresosTotal + createMovimientoDto.cantidad;
        await this.inventarioRepository.update(
          inventario.id,
          {
            ingresosTotal: nuevosIngresos,
            stockActual:
              inventario.cantidadInicial +
              nuevosIngresos -
              inventario.salidasTotal,
          },
          transaction,
        );
      } else if (createMovimientoDto.tipo === 'salida') {
        const nuevasSalidas =
          inventario.salidasTotal + createMovimientoDto.cantidad;
        await this.inventarioRepository.update(
          inventario.id,
          {
            salidasTotal: nuevasSalidas,
            stockActual:
              inventario.cantidadInicial +
              inventario.ingresosTotal -
              nuevasSalidas,
          },
          transaction,
        );
      }

      await transaction.commit();
      this.logger.log(
        `Movimiento ${movimiento.id} creado exitosamente de tipo ${createMovimientoDto.tipo}`,
      );
      return movimiento;
    } catch (error) {
      await transaction.rollback();
      this.logger.error('Error al crear movimiento:', error.stack);
      throw error;
    }
  }

  findAll(): Promise<Movimiento[]> {
    return this.movimientoRepository.findAll();
  }

  findById(id: string): Promise<Movimiento | null> {
    return this.movimientoRepository.findById(id);
  }

  findByInventario(inventarioId: string): Promise<Movimiento[]> {
    return this.movimientoRepository.findByInventario(inventarioId);
  }

  update(
    id: string,
    updateMovimientoDto: UpdateMovimientoDto,
  ): Promise<Movimiento | null> {
    return this.movimientoRepository.update(id, updateMovimientoDto as any);
  }

  delete(id: string): Promise<boolean> {
    return this.movimientoRepository.delete(id);
  }
}

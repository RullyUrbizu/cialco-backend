import { Injectable, Logger } from '@nestjs/common';
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
  ) {}

  async create(createMovimientoDto: CreateMovimientoDto): Promise<Movimiento> {
    const transaction = await this.sequelize.transaction();
    try {
      // Crear el movimiento
      const movimiento = await this.movimientoRepository.create(
        {
          id: uuidv4(),
          ...createMovimientoDto,
          fecha: createMovimientoDto.fecha || new Date().toISOString(),
        } as any,
        transaction,
      );

      // Actualizar el inventario
      const inventario = await this.inventarioRepository.findById(
        createMovimientoDto.inventarioId,
      );

      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }

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
            throw new Error(`Contenedor ${dist.contenedorId} no encontrado`);
          }

          let nuevoStock = contenedor.stockActual;

          if (createMovimientoDto.tipo === 'ingreso') {
            nuevoStock += dist.cantidad;
          } else if (createMovimientoDto.tipo === 'salida') {
            nuevoStock -= dist.cantidad;

            if (nuevoStock < 0) {
              throw new Error(
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

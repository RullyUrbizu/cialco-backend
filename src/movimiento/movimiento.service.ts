import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MovimientoRepository } from './movimiento.repository';
import { Movimiento } from 'src/modelo/movimiento';
import { CreateMovimientoDto, UpdateMovimientoDto } from 'src/dto/movimiento.dto';
import { InventarioRepository } from 'src/inventario/inventario.repository';

@Injectable()
export class MovimientoService {
  constructor(
    private readonly movimientoRepository: MovimientoRepository,
    private readonly inventarioRepository: InventarioRepository
  ) { }

  async create(createMovimientoDto: CreateMovimientoDto): Promise<Movimiento> {
    try {
      // Crear el movimiento
      const movimiento = await this.movimientoRepository.create({
        id: uuidv4(),
        ...createMovimientoDto,
        fecha: createMovimientoDto.fecha || new Date().toISOString()
      } as any);

      // Actualizar el inventario
      const inventario = await this.inventarioRepository.findById(createMovimientoDto.inventarioId);

      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }

      // Actualizar ingresosTotal o salidasTotal según el tipo
      if (createMovimientoDto.tipo === 'ingreso') {
        await this.inventarioRepository.update(inventario.id, {
          ingresosTotal: inventario.ingresosTotal + createMovimientoDto.cantidad
        });
      } else if (createMovimientoDto.tipo === 'salida') {
        await this.inventarioRepository.update(inventario.id, {
          salidasTotal: inventario.salidasTotal + createMovimientoDto.cantidad
        });
      }

      return movimiento;
    } catch (error) {
      console.error('Error al crear movimiento:', error);
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

  update(id: string, updateMovimientoDto: UpdateMovimientoDto): Promise<Movimiento | null> {
    return this.movimientoRepository.update(id, updateMovimientoDto as any);
  }

  delete(id: string): Promise<boolean> {
    return this.movimientoRepository.delete(id);
  }
}

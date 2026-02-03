import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Movimiento } from 'src/modelo/movimiento';

@Injectable()
export class MovimientoRepository {
  constructor(@InjectModel(Movimiento) private readonly movimientoModel: typeof Movimiento) { }

  async create(movimiento: Movimiento): Promise<Movimiento> {
    return this.movimientoModel.create(movimiento);
  }

  async findAll(): Promise<Movimiento[]> {
    return this.movimientoModel.findAll();
  }

  async findById(id: string): Promise<Movimiento | null> {
    return this.movimientoModel.findByPk(id);
  }

  async findByInventario(inventarioId: string): Promise<Movimiento[]> {
    return this.movimientoModel.findAll({
      where: { inventarioId },
      order: [['fecha', 'DESC']]
    });
  }

  async update(id: string, updates: Partial<Movimiento>): Promise<Movimiento | null> {
    const mov = await this.movimientoModel.findByPk(id);
    if (!mov) return null;
    return mov.update(updates);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.movimientoModel.destroy({ where: { id } });
    return deleted > 0;
  }
}

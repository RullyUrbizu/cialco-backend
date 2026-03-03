import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Movimiento } from 'src/modelo/movimiento';
import { Inventario } from 'src/modelo/inventario';
import { Colecta } from 'src/modelo/colecta';
import { Toro } from 'src/modelo/toro';
import { Cliente } from 'src/modelo/cliente';

@Injectable()
export class MovimientoRepository {
  constructor(
    @InjectModel(Movimiento)
    private readonly movimientoModel: typeof Movimiento,
  ) { }

  async create(movimiento: Movimiento, transaction?: any): Promise<Movimiento> {
    return this.movimientoModel.create(movimiento, { transaction });
  }

  async findAll(): Promise<Movimiento[]> {
    return this.movimientoModel.findAll({
      include: [
        { model: Cliente },
        {
          model: Inventario,
          include: [
            {
              model: Colecta,
              include: [{ model: Toro }, { model: Cliente }],
            },
          ],
        },
      ],
      order: [['fecha', 'DESC']],
    });
  }

  async findById(id: string): Promise<Movimiento | null> {
    return this.movimientoModel.findByPk(id);
  }

  async findByInventario(inventarioId: string): Promise<Movimiento[]> {
    return this.movimientoModel.findAll({
      where: { inventarioId },
      include: [{ model: Cliente }],
      order: [['fecha', 'DESC']],
    });
  }

  async findByRemito(remito: string): Promise<Movimiento[]> {
    return this.movimientoModel.findAll({
      where: { remito },
      include: [
        {
          model: Inventario,
          include: [{ model: Colecta }],
        },
      ],
    });
  }

  async update(
    id: string,
    updates: Partial<Movimiento>,
    transaction?: any,
  ): Promise<Movimiento | null> {
    const mov = await this.movimientoModel.findByPk(id, { transaction });
    if (!mov) return null;
    return mov.update(updates, { transaction });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.movimientoModel.destroy({ where: { id } });
    return deleted > 0;
  }
}

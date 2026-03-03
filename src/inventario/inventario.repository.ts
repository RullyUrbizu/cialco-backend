import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Inventario } from 'src/modelo/inventario';
import { Colecta } from 'src/modelo/colecta';

@Injectable()
export class InventarioRepository {
  constructor(
    @InjectModel(Inventario)
    private readonly inventarioModel: typeof Inventario,
  ) { }

  async create(inventario: Inventario, transaction?: any): Promise<Inventario> {
    return this.inventarioModel.create(inventario, { transaction });
  }

  async findAll(): Promise<Inventario[]> {
    return this.inventarioModel.findAll();
  }

  async findById(id: string): Promise<Inventario | null> {
    return this.inventarioModel.findByPk(id, {
      include: [Colecta],
    });
  }

  async findByColectaId(colectaId: string): Promise<Inventario | null> {
    return this.inventarioModel.findOne({
      where: { colectaId },
    });
  }

  async update(
    id: string,
    updates: Partial<Inventario>,
    transaction?: any,
  ): Promise<Inventario | null> {
    const inv = await this.inventarioModel.findByPk(id, { transaction });
    if (!inv) return null;
    return inv.update(updates, { transaction });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.inventarioModel.destroy({ where: { id } });
    return deleted > 0;
  }
}

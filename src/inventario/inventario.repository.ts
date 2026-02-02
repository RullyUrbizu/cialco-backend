import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Inventario } from 'src/modelo/inventario';

@Injectable()
export class InventarioRepository {
  constructor(@InjectModel(Inventario) private readonly inventarioModel: typeof Inventario) { }

  async create(inventario: Inventario): Promise<Inventario> {
    return this.inventarioModel.create(inventario);
  }

  async findAll(): Promise<Inventario[]> {
    return this.inventarioModel.findAll();
  }

  async findById(id: string): Promise<Inventario | null> {
    return this.inventarioModel.findByPk(id);
  }

  async findByColectaId(colectaId: string): Promise<Inventario | null> {
    return this.inventarioModel.findOne({
      where: { colectaId }
    });
  }

  async update(id: string, updates: Partial<Inventario>): Promise<Inventario | null> {
    const inv = await this.inventarioModel.findByPk(id);
    if (!inv) return null;
    return inv.update(updates);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.inventarioModel.destroy({ where: { id } });
    return deleted > 0;
  }
}

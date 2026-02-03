import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Toro } from 'src/modelo/toro';
import { Colecta } from 'src/modelo/colecta';
import { Inventario } from 'src/modelo/inventario';
import { Cliente } from 'src/modelo/cliente';
import { Termo } from 'src/modelo/termo';

@Injectable()
export class ToroRepository {
  constructor(@InjectModel(Toro) private readonly toroModel: typeof Toro) { }

  async create(toro: Toro): Promise<Toro> {
    return this.toroModel.create(toro);
  }

  async findAll(): Promise<Toro[]> {
    return this.toroModel.findAll();
  }

  async findById(id: string): Promise<Toro | null> {
    return this.toroModel.findByPk(id, {
      include: [
        {
          model: Colecta,
          include: [Inventario, Cliente, Termo]
        }
      ]
    });
  }

  async update(id: string, updates: Partial<Toro>): Promise<Toro | null> {
    const toro = await this.toroModel.findByPk(id);
    if (!toro) return null;
    return toro.update(updates);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.toroModel.destroy({ where: { id } });
    return deleted > 0;
  }
}

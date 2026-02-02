import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Canastillo } from 'src/modelo/canastillo';

@Injectable()
export class CanastilloRepository {
  constructor(@InjectModel(Canastillo) private readonly canastilloModel: typeof Canastillo) {}

  async create(canastillo: Canastillo): Promise<Canastillo> {
    return this.canastilloModel.create(canastillo);
  }

  async findAll(): Promise<Canastillo[]> {
    return this.canastilloModel.findAll();
  }

  async findById(id: string): Promise<Canastillo | null> {
    return this.canastilloModel.findByPk(id);
  }

  async update(id: string, updates: Partial<Canastillo>): Promise<Canastillo | null> {
    const canastillo = await this.canastilloModel.findByPk(id);
    if (!canastillo) return null;
    return canastillo.update(updates);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.canastilloModel.destroy({ where: { id } });
    return deleted > 0;
  }
}

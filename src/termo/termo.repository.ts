import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Termo } from 'src/modelo/termo';

@Injectable()
export class TermoRepository {
  constructor(@InjectModel(Termo) private readonly termoModel: typeof Termo) { }

  async create(termo: Termo): Promise<Termo> {
    return this.termoModel.create(termo);
  }

  async findAll(): Promise<Termo[]> {
    return this.termoModel.findAll();
  }

  async findById(id: string): Promise<Termo | null> {
    return this.termoModel.findByPk(id);
  }

  async update(id: string, updates: Partial<Termo>): Promise<Termo | null> {
    const termo = await this.termoModel.findByPk(id);
    if (!termo) return null;
    return termo.update(updates);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.termoModel.destroy({ where: { id } });
    return deleted > 0;
  }

  async getStockSummary(): Promise<any[]> {
    const { QueryTypes } = require('sequelize');
    const sequelize = this.termoModel.sequelize;

    if (!sequelize) {
      throw new Error('Sequelize instance not available');
    }

    const results = await sequelize.query(`
      SELECT 
        t.id,
        t.codigo,
        COALESCE(SUM(c.stock), 0) as total_pajuelas
      FROM termos t
      LEFT JOIN colectas c ON c.termo_id = t.id
      GROUP BY t.id, t.codigo
      ORDER BY t.codigo
    `, {
      type: QueryTypes.SELECT
    });

    return results;
  }
}

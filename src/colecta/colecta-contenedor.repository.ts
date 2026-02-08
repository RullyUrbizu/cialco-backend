import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ColectaContenedor } from 'src/modelo/colecta-contenedor';
import { Termo } from 'src/modelo/termo';
import { Canastillo } from 'src/modelo/canastillo';

@Injectable()
export class ColectaContenedorRepository {
    constructor(
        @InjectModel(ColectaContenedor)
        private readonly colectaContenedorModel: typeof ColectaContenedor,
    ) { }

    async create(contenedor: ColectaContenedor): Promise<ColectaContenedor> {
        return this.colectaContenedorModel.create(contenedor);
    }

    async findByColectaId(colectaId: string): Promise<ColectaContenedor[]> {
        return this.colectaContenedorModel.findAll({
            where: { colectaId },
            include: [
                { model: Termo },
                { model: Canastillo }
            ]
        });
    }

    async findById(id: string): Promise<ColectaContenedor | null> {
        return this.colectaContenedorModel.findByPk(id, {
            include: [
                { model: Termo },
                { model: Canastillo }
            ]
        });
    }

    async deleteByColectaId(colectaId: string): Promise<number> {
        return this.colectaContenedorModel.destroy({
            where: { colectaId }
        });
    }

    async update(id: string, updates: Partial<ColectaContenedor>): Promise<ColectaContenedor | null> {
        const contenedor = await this.colectaContenedorModel.findByPk(id);
        if (!contenedor) return null;
        return contenedor.update(updates);
    }
}

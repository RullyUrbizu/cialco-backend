import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cliente } from 'src/modelo/cliente';
import { Colecta } from 'src/modelo/colecta';
import { Inventario } from 'src/modelo/inventario';
import { Toro } from 'src/modelo/toro';
import { ColectaContenedor } from 'src/modelo/colecta-contenedor';
import { Termo } from 'src/modelo/termo';
import { Canastillo } from 'src/modelo/canastillo';

@Injectable()
export class ClienteRepository {
  constructor(
    @InjectModel(Cliente) private readonly clienteModel: typeof Cliente,
  ) {}

  async create(cliente: Cliente): Promise<Cliente> {
    return this.clienteModel.create(cliente);
  }

  async findAll(): Promise<Cliente[]> {
    return this.clienteModel.findAll({
      raw: true,
    });
  }

  async findById(id: string): Promise<Cliente | null> {
    return this.clienteModel.findByPk(id, {
      include: [
        {
          model: Colecta,
          include: [
            Inventario,
            Toro,
            {
              model: ColectaContenedor,
              as: 'contenedores',
              include: [Termo, Canastillo],
            },
          ],
        },
      ],
    });
  }

  async update(id: string, updates: Partial<Cliente>): Promise<Cliente | null> {
    const cliente = await this.clienteModel.findByPk(id);
    if (!cliente) return null;
    return cliente.update(updates);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.clienteModel.destroy({ where: { id } });
    return deleted > 0;
  }
}

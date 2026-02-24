import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InventarioRepository } from './inventario.repository';
import { Inventario } from 'src/modelo/inventario';
import {
  CreateInventarioDto,
  UpdateInventarioDto,
} from 'src/dto/inventario.dto';

@Injectable()
export class InventarioService {
  constructor(private readonly inventarioRepository: InventarioRepository) {}

  async create(createInventarioDto: CreateInventarioDto): Promise<Inventario> {
    return this.inventarioRepository.create({
      id: uuidv4(),
      ...createInventarioDto,
    } as any);
  }

  findAll(): Promise<Inventario[]> {
    return this.inventarioRepository.findAll();
  }

  findById(id: string): Promise<Inventario | null> {
    return this.inventarioRepository.findById(id);
  }

  findByColectaId(colectaId: string): Promise<Inventario | null> {
    return this.inventarioRepository.findByColectaId(colectaId);
  }

  update(
    id: string,
    updateInventarioDto: UpdateInventarioDto,
  ): Promise<Inventario | null> {
    return this.inventarioRepository.update(id, updateInventarioDto as any);
  }

  delete(id: string): Promise<boolean> {
    return this.inventarioRepository.delete(id);
  }
}

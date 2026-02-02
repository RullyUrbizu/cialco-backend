import { Injectable } from '@nestjs/common';
import { ColectaRepository } from './colecta.repository';
import { Colecta } from 'src/modelo/colecta';
import { v4 as uuidv4 } from 'uuid';
import { CreateColectaDto, UpdateColectaDto } from 'src/dto/colecta.dto';
import { InventarioRepository } from 'src/inventario/inventario.repository';

@Injectable()
export class ColectaService {
  constructor(
    private readonly colectaRepository: ColectaRepository,
    private readonly inventarioRepository: InventarioRepository
  ) { }

  async create(createColectaDto: CreateColectaDto): Promise<Colecta> {
    const colectaId = uuidv4();

    // Crear la colecta
    await this.colectaRepository.create({
      id: colectaId,
      ...createColectaDto,
      fecha: new Date(createColectaDto.fecha)
    } as any);

    // Crear el inventario automáticamente
    await this.inventarioRepository.create({
      id: uuidv4(),
      colectaId: colectaId,
      cantidadInicial: createColectaDto.cantidad || 0,
      ingresosTotal: 0,
      salidasTotal: 0
    } as any);

    // Buscar la colecta recién creada con todas las relaciones
    const colectaCompleta = await this.colectaRepository.findById(colectaId);

    if (!colectaCompleta) {
      throw new Error('Error al crear la colecta');
    }

    return colectaCompleta;
  }

  async findAll(): Promise<Colecta[]> {
    return this.colectaRepository.findAll();
  }

  async findAllWithCliente(razonSocial: string): Promise<Colecta[]> {
    return this.colectaRepository.findAllWithCliente(razonSocial);
  }

  async findAllWithToroNombre(nombre: string): Promise<Colecta[]> {
    return this.colectaRepository.findAllWithToroNombre(nombre);
  }

  async findById(id: string): Promise<Colecta | null> {
    return this.colectaRepository.findById(id);
  }

  async update(id: string, updateColectaDto: UpdateColectaDto): Promise<Colecta | null> {
    const updates: any = { ...updateColectaDto };
    if (updateColectaDto.fecha) {
      updates.fecha = new Date(updateColectaDto.fecha);
    }
    return this.colectaRepository.update(id, updates);
  }

  async delete(id: string): Promise<boolean> {
    return this.colectaRepository.delete(id);
  }
}

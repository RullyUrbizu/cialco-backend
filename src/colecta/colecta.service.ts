import { Injectable } from '@nestjs/common';
import { ColectaRepository } from './colecta.repository';
import { Colecta } from 'src/modelo/colecta';
import { v4 as uuidv4 } from 'uuid';
import { CreateColectaDto, UpdateColectaDto } from 'src/dto/colecta.dto';
import { InventarioRepository } from 'src/inventario/inventario.repository';
import { CanastilloRepository } from 'src/canastillo/canastillo.repository';

@Injectable()
export class ColectaService {
  constructor(
    private readonly colectaRepository: ColectaRepository,
    private readonly inventarioRepository: InventarioRepository,
    private readonly canastilloRepository: CanastilloRepository
  ) { }

  private async resolverCanastillo(termoId: string | undefined, canastilloId: string | undefined, canastilloCodigo: string | undefined): Promise<string | undefined> {
    if (canastilloId) return canastilloId;
    if (!termoId || !canastilloCodigo) return undefined;

    const existente = await this.canastilloRepository.findByTermoAndCodigo(termoId, canastilloCodigo);
    if (existente) return existente.id;

    const nuevo = await this.canastilloRepository.create({
      id: uuidv4(),
      termoId,
      codigo: canastilloCodigo
    } as any);
    return nuevo.id;
  }

  async create(createColectaDto: CreateColectaDto): Promise<Colecta> {
    const { canastilloCodigo, ...data } = createColectaDto;

    // Resolver canastilloId si se pasó código y termo
    const actualCanastilloId = await this.resolverCanastillo(data.termoId, data.canastilloId, canastilloCodigo);

    const colectaId = uuidv4();

    // Crear la colecta
    await this.colectaRepository.create({
      id: colectaId,
      ...data,
      canastilloId: actualCanastilloId,
      fecha: data.fecha
    } as any);

    // Crear el inventario automáticamente
    await this.inventarioRepository.create({
      id: uuidv4(),
      colectaId: colectaId,
      cantidadInicial: data.cantidad || 0,
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
    const { canastilloCodigo, ...data } = updateColectaDto;
    const updates: any = { ...data };

    if (canastilloCodigo) {
      // Necesitamos el termoId para resolver el canastillo. 
      // Si no viene en el DTO, lo buscamos de la colecta actual.
      let termoId = data.termoId;
      if (!termoId) {
        const colectaActual = await this.colectaRepository.findById(id);
        termoId = colectaActual?.termo?.id;
      }

      if (termoId) {
        updates.canastilloId = await this.resolverCanastillo(termoId, undefined, canastilloCodigo);
      }
    }

    if (data.fecha) {
      updates.fecha = data.fecha;
    }
    return this.colectaRepository.update(id, updates);
  }

  async delete(id: string): Promise<boolean> {
    return this.colectaRepository.delete(id);
  }
}

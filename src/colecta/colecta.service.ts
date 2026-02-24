import { Injectable } from '@nestjs/common';
import { ColectaRepository } from './colecta.repository';
import { Colecta } from 'src/modelo/colecta';
import { v4 as uuidv4 } from 'uuid';
import { CreateColectaDto, UpdateColectaDto } from 'src/dto/colecta.dto';
import { InventarioRepository } from 'src/inventario/inventario.repository';
import { CanastilloRepository } from 'src/canastillo/canastillo.repository';
import { ColectaContenedorRepository } from './colecta-contenedor.repository';
import { Canastillo } from 'src/modelo/canastillo';
import { ColectaContenedor } from 'src/modelo/colecta-contenedor';
import { Inventario } from 'src/modelo/inventario';

@Injectable()
export class ColectaService {
  constructor(
    private readonly colectaRepository: ColectaRepository,
    private readonly inventarioRepository: InventarioRepository,
    private readonly canastilloRepository: CanastilloRepository,
    private readonly colectaContenedorRepository: ColectaContenedorRepository,
  ) { }

  private async resolverCanastillo(
    termoId: string | undefined,
    canastilloId: string | undefined,
    canastilloCodigo: string | undefined,
  ): Promise<string | undefined> {
    if (canastilloId) return canastilloId;
    if (!termoId || !canastilloCodigo) return undefined;

    const existente = await this.canastilloRepository.findByTermoAndCodigo(
      termoId,
      canastilloCodigo,
    );
    if (existente) return existente.id;

    const nuevo = await this.canastilloRepository.create({
      id: uuidv4(),
      termoId,
      codigo: canastilloCodigo,
    } as Partial<Canastillo> as Canastillo);
    return nuevo.id;
  }

  async create(createColectaDto: CreateColectaDto): Promise<Colecta> {
    const { contenedores, ...data } = createColectaDto;

    // Calcular cantidad total de todos los contenedores
    const totalCantidad = contenedores.reduce((sum, c) => sum + c.cantidad, 0);

    const colectaId = uuidv4();

    // Crear la colecta
    await this.colectaRepository.create({
      id: colectaId,
      ...data,
      cantidad: totalCantidad,
      fecha: new Date(data.fecha),
    } as Partial<Colecta> as Colecta);

    // Crear entradas de contenedores
    for (const contenedor of contenedores) {
      const canastilloId = await this.resolverCanastillo(
        contenedor.termoId,
        contenedor.canastilloId,
        contenedor.canastilloCodigo,
      );

      await this.colectaContenedorRepository.create({
        id: uuidv4(),
        colectaId,
        termoId: contenedor.termoId,
        canastilloId,
        cantidad: contenedor.cantidad,
        stockActual: contenedor.cantidad, // Inicializar stock con la cantidad
      } as Partial<ColectaContenedor> as ColectaContenedor);
    }

    // Crear el inventario automáticamente
    await this.inventarioRepository.create({
      id: uuidv4(),
      colectaId: colectaId,
      cantidadInicial: totalCantidad,
      ingresosTotal: 0,
      salidasTotal: 0,
      stockActual: totalCantidad,
    } as Partial<Inventario> as Inventario);

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

  async update(
    id: string,
    updateColectaDto: UpdateColectaDto,
  ): Promise<Colecta | null> {
    const { contenedores, ...data } = updateColectaDto;
    const updates: Partial<Colecta> = { ...data } as any; // Temporary cast for base data

    // Si se proporcionan contenedores, actualizar la relación
    if (contenedores && contenedores.length > 0) {
      // Calcular nueva cantidad total
      const totalCantidad = contenedores.reduce(
        (sum, c) => sum + c.cantidad,
        0,
      );
      updates.cantidad = totalCantidad;

      // IMPORTANTE: Obtener contenedores existentes ANTES de eliminarlos para preservar stockActual
      const contenedoresExistentes =
        await this.colectaContenedorRepository.findByColectaId(id);

      // Eliminar contenedores existentes
      await this.colectaContenedorRepository.deleteByColectaId(id);

      // Crear nuevos contenedores preservando el stockActual
      for (let i = 0; i < contenedores.length; i++) {
        const contenedor = contenedores[i];
        const canastilloId = await this.resolverCanastillo(
          contenedor.termoId,
          contenedor.canastilloId,
          contenedor.canastilloCodigo,
        );

        let stockActual: number;

        // Estrategia 1: Buscar coincidencia exacta por termo+canastillo
        const exactMatch = contenedoresExistentes.find(
          (e) =>
            e.termoId === contenedor.termoId && e.canastilloId === canastilloId,
        );

        if (exactMatch) {
          // Coincidencia exacta encontrada, usar su stock
          stockActual = exactMatch.stockActual ?? exactMatch.cantidad;
        } else {
          // Estrategia 2: Si no hay coincidencia exacta, buscar por posición/índice
          // Esto maneja el caso donde se cambia el canastillo pero es el mismo contenedor lógico
          const existenteEnPosicion = contenedoresExistentes[i];

          if (
            existenteEnPosicion &&
            existenteEnPosicion.termoId === contenedor.termoId
          ) {
            // Mismo termo, diferente canastillo -> es un cambio de ubicación, preservar stock
            stockActual =
              existenteEnPosicion.stockActual ?? existenteEnPosicion.cantidad;
          } else {
            // Es un contenedor completamente nuevo, inicializar con cantidad
            stockActual = contenedor.cantidad;
          }
        }

        await this.colectaContenedorRepository.create({
          id: uuidv4(),
          colectaId: id,
          termoId: contenedor.termoId as string,
          canastilloId,
          cantidad: contenedor.cantidad,
          stockActual: stockActual, // Preservar el stock actual
        } as Partial<ColectaContenedor> as ColectaContenedor);
      }
    }

    if (data.fecha) {
      updates.fecha = new Date(data.fecha);
    }

    return this.colectaRepository.update(id, updates);
  }

  async delete(id: string): Promise<boolean> {
    return this.colectaRepository.delete(id);
  }
}

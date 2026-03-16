import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ColectaRepository } from './colecta.repository';
import { Colecta } from 'src/modelo/colecta';
import { v4 as uuidv4 } from 'uuid';
import { CreateColectaDto, UpdateColectaDto } from 'src/dto/colecta.dto';
import { TransferenciaStockDto } from 'src/dto/transferencia-stock.dto';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
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
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) { }

  private async resolverCanastillo(
    termoId: string | undefined,
    canastilloId: string | undefined,
    canastilloCodigo: string | undefined,
    transaction?: any,
  ): Promise<string | undefined> {
    if (canastilloId) return canastilloId;
    if (!termoId || !canastilloCodigo) return undefined;

    const existente = await this.canastilloRepository.findByTermoAndCodigo(
      termoId,
      canastilloCodigo.trim(),
      transaction,
    );
    if (existente) return existente.id;

    const nuevo = await this.canastilloRepository.create({
      id: uuidv4(),
      termoId,
      codigo: canastilloCodigo.trim(),
    } as Partial<Canastillo> as Canastillo, transaction);
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

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
  ): Promise<{ data: Colecta[]; total: number; page: number; lastPage: number }> {
    const { rows, count } = await this.colectaRepository.findAllPaginated(
      page,
      limit,
      search,
    );
    return {
      data: rows,
      total: count,
      page,
      lastPage: Math.ceil(count / limit),
    };
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

    return await this.sequelize.transaction(async (transaction) => {
      const updates: Partial<Colecta> = { ...data } as any;

      if (contenedores && contenedores.length > 0) {
        // 1. Obtener estado previo
        const contenedoresViejos = await this.colectaContenedorRepository.findByColectaId(id, transaction);
        const inventarioPrevio = await this.inventarioRepository.findByColectaId(id, transaction);

        if (!inventarioPrevio) throw new Error('Inventario no encontrado para la colecta');

        let nuevoTotalInicial = 0;
        let nuevoStockActualGlobal = 0;

        // 2. Limpiar contenedores viejos
        await this.colectaContenedorRepository.deleteByColectaId(id);

        // 3. Procesar nuevos contenedores y calcular stocks
        for (const contenedorDto of contenedores) {
          const canastilloId = await this.resolverCanastillo(
            contenedorDto.termoId,
            contenedorDto.canastilloId,
            contenedorDto.canastilloCodigo,
            transaction
          );

          // Buscar si este contenedor (termo+canastillo) ya existía para mantener su "consumo"
          const match = contenedoresViejos.find(
            cv => cv.termoId === contenedorDto.termoId && cv.canastilloId === canastilloId
          );

          let stockActualContenedor: number;
          if (match) {
            // El consumo es lo que se quitó de este contenedor específicamente
            const consumo = match.cantidad - match.stockActual;
            // El nuevo stock es la nueva cantidad menos el consumo previo
            stockActualContenedor = contenedorDto.cantidad - consumo;
          } else {
            // Contenedor nuevo, su stock es su capacidad inicial
            stockActualContenedor = contenedorDto.cantidad;
          }

          nuevoTotalInicial += contenedorDto.cantidad;
          nuevoStockActualGlobal += stockActualContenedor;

          // Crear el contenedor con el stock calculado
          await this.colectaContenedorRepository.create({
            id: uuidv4(),
            colectaId: id,
            termoId: contenedorDto.termoId,
            canastilloId,
            cantidad: contenedorDto.cantidad,
            stockActual: stockActualContenedor,
          } as any, transaction);
        }

        // 4. Validaciones de integridad
        if (nuevoStockActualGlobal < 0) {
          throw new ConflictException(
            `No se puede reducir la cantidad inicial a ${nuevoTotalInicial} porque ya se han entregado dosis. ` +
            `El stock quedaría en ${nuevoStockActualGlobal}.`
          );
        }

        // 5. Sincronizar Inventario y Colecta
        updates.cantidad = nuevoTotalInicial;
        await this.inventarioRepository.update(inventarioPrevio.id, {
          cantidadInicial: nuevoTotalInicial,
          stockActual: nuevoStockActualGlobal,
        }, transaction);
      }

      if (data.fecha) {
        updates.fecha = new Date(data.fecha);
      }

      return await this.colectaRepository.update(id, updates, transaction);
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.colectaRepository.delete(id);
  }

  async transferirStock(dto: TransferenciaStockDto): Promise<void> {
    const { origenContenedorId, cantidad, termoDestinoId, canastilloCodigoDestino } = dto;
    const codigoDestinoNormalizado = canastilloCodigoDestino.trim();

    await this.sequelize.transaction(async (transaction) => {
      // 1. Buscar origen
      const origen = await this.colectaContenedorRepository.findById(origenContenedorId, transaction);
      if (!origen) throw new NotFoundException('Contenedor de origen no encontrado');

      // 2. Validar stock
      if (origen.stockActual < cantidad) {
        throw new ConflictException(`Stock insuficiente en el origen. Disponible: ${origen.stockActual}`);
      }

      // 3. Resolver canastillo destino (buscar o crear)
      const canastilloDestinoId = await this.resolverCanastillo(
        termoDestinoId,
        undefined,
        codigoDestinoNormalizado,
        transaction
      );

      // 4. Validar que no sea el mismo destino
      if (origen.termoId === termoDestinoId && origen.canastilloId === canastilloDestinoId) {
        throw new ConflictException('El destino es igual al origen. No es necesario mover el stock.');
      }

      // 5. Buscar o crear contenedor destino para ESTA colecta
      const contenedoresDestino = await this.colectaContenedorRepository.findByColectaId(origen.colectaId, transaction);
      let destino = contenedoresDestino.find(
        c => c.termoId === termoDestinoId && c.canastilloId === canastilloDestinoId
      );

      if (!destino) {
        // Crear nuevo contenedor para la colecta en esa ubicación
        destino = await this.colectaContenedorRepository.create({
          id: uuidv4(),
          colectaId: origen.colectaId,
          termoId: termoDestinoId,
          canastilloId: canastilloDestinoId,
          cantidad: 0, // Se inicializa en 0 porque es una transferencia de stock actual
          stockActual: 0,
        } as any, transaction);
      }

      // 5. Ejecutar transferencia
      if (origen.stockActual === cantidad) {
        // Si se mueve todo, borramos el contenedor de origen para que no aparezca vacío
        await this.colectaContenedorRepository.delete(origen.id, transaction);
      } else {
        await this.colectaContenedorRepository.update(origen.id, {
          cantidad: (origen.cantidad || 0) - cantidad, // Mover también la proporción de cantidad inicial
          stockActual: origen.stockActual - cantidad
        }, transaction);
      }

      await this.colectaContenedorRepository.update(destino.id, {
        cantidad: (destino.cantidad || 0) + cantidad, // Aumentar cantidad inicial asignada a este contenedor
        stockActual: (destino.stockActual || 0) + cantidad
      }, transaction);
    });
  }
}

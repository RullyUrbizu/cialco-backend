import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { TermoRepository } from './termo.repository';
import { Termo } from 'src/modelo/termo';
import { CreateTermoDto, UpdateTermoDto } from 'src/dto/termo.dto';

@Injectable()
export class TermoService {
  constructor(private readonly termoRepository: TermoRepository) { }

  async create(createTermoDto: CreateTermoDto): Promise<Termo> {
    return this.termoRepository.create({
      id: uuidv4(),
      ...createTermoDto,
    } as any);
  }

  findAll(): Promise<Termo[]> {
    return this.termoRepository.findAll();
  }

  findById(id: string): Promise<Termo | null> {
    return this.termoRepository.findById(id);
  }

  update(id: string, updateTermoDto: UpdateTermoDto): Promise<Termo | null> {
    return this.termoRepository.update(id, updateTermoDto as any);
  }

  async delete(id: string): Promise<boolean> {
    try {
      return await this.termoRepository.delete(id);
    } catch (error: any) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new ConflictException(
          'No se puede eliminar el termo porque tiene colectas registradas en su historial.',
        );
      }
      throw new InternalServerErrorException('Error al intentar eliminar el termo');
    }
  }

  getStockSummary(): Promise<any[]> {
    return this.termoRepository.getStockSummary();
  }
}

import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { TermoRepository } from './termo.repository';
import { Termo } from 'src/modelo/termo';
import { CreateTermoDto, UpdateTermoDto } from 'src/dto/termo.dto';

@Injectable()
export class TermoService {
  constructor(private readonly termoRepository: TermoRepository) {}

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

  delete(id: string): Promise<boolean> {
    return this.termoRepository.delete(id);
  }

  getStockSummary(): Promise<any[]> {
    return this.termoRepository.getStockSummary();
  }
}

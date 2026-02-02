import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ToroRepository } from './toro.repository';
import { Toro } from 'src/modelo/toro';
import { CreateToroDto, UpdateToroDto } from 'src/dto/toro.dto';

@Injectable()
export class ToroService {
  constructor(private readonly toroRepository: ToroRepository) {}

  async create(createToroDto: CreateToroDto): Promise<Toro> {
    return this.toroRepository.create({ 
      id: uuidv4(), 
      ...createToroDto 
    } as any);
  }

  findAll(): Promise<Toro[]> {
    return this.toroRepository.findAll();
  }

  findById(id: string): Promise<Toro | null> {
    return this.toroRepository.findById(id);
  }

  update(id: string, updateToroDto: UpdateToroDto): Promise<Toro | null> {
    return this.toroRepository.update(id, updateToroDto as any);
  }

  delete(id: string): Promise<boolean> {
    return this.toroRepository.delete(id);
  }
}

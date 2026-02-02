import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CanastilloRepository } from './canastillo.repository';
import { Canastillo } from 'src/modelo/canastillo';
import { CreateCanastilloDto, UpdateCanastilloDto } from 'src/dto/canastillo.dto';

@Injectable()
export class CanastilloService {
  constructor(private readonly canastilloRepository: CanastilloRepository) {}

  async create(createCanastilloDto: CreateCanastilloDto): Promise<Canastillo> {
    return this.canastilloRepository.create({ 
      id: uuidv4(), 
      ...createCanastilloDto 
    } as any);
  }

  findAll(): Promise<Canastillo[]> {
    return this.canastilloRepository.findAll();
  }

  findById(id: string): Promise<Canastillo | null> {
    return this.canastilloRepository.findById(id);
  }

  update(id: string, updateCanastilloDto: UpdateCanastilloDto): Promise<Canastillo | null> {
    return this.canastilloRepository.update(id, updateCanastilloDto as any);
  }

  delete(id: string): Promise<boolean> {
    return this.canastilloRepository.delete(id);
  }
}

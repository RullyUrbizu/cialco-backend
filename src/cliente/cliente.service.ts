import { Injectable, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ClienteRepository } from './cliente.repository';
import { Cliente } from 'src/modelo/cliente';
import { CreateClienteDto, UpdateClienteDto } from 'src/dto/cliente.dto';

@Injectable()
export class ClienteService {
  constructor(private readonly clienteRepository: ClienteRepository) { }

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    return this.clienteRepository.create({
      id: uuidv4(),
      ...createClienteDto
    } as any);
  }

  findAll(): Promise<Cliente[]> {
    return this.clienteRepository.findAll();
  }

  findById(id: string): Promise<Cliente | null> {
    return this.clienteRepository.findById(id);
  }

  async update(id: string, updateClienteDto: UpdateClienteDto): Promise<Cliente | null> {
    try {
      return await this.clienteRepository.update(id, updateClienteDto as any);
    } catch (error) {
      if (error.parent && error.parent.code === '23505') {
        throw new ConflictException('El CUIT ya existe en la base de datos');
      }
      throw error;
    }
  }

  delete(id: string): Promise<boolean> {
    return this.clienteRepository.delete(id);
  }
}

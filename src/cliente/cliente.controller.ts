import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { Cliente } from 'src/modelo/cliente';
import { CreateClienteDto, UpdateClienteDto } from 'src/dto/cliente.dto';

@Controller('clientes')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClienteDto: CreateClienteDto): Promise<Cliente> {
    return this.clienteService.create(createClienteDto);
  }

  @Get()
  findAll(): Promise<Cliente[]> {
    return this.clienteService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Cliente> {
    const cliente = await this.clienteService.findById(id);
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.clienteService.update(id, updateClienteDto);
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.clienteService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
  }
}

import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, IsInt, Min } from 'class-validator';

export class CreateColectaDto {
  @IsUUID('all', { message: 'El toroId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El toroId es obligatorio' })
  toroId: string;

  @IsUUID('all', { message: 'El clienteId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El clienteId es obligatorio' })
  clienteId: string;

  @IsDateString({}, { message: 'La fecha debe ser una fecha válida en formato ISO' })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  fecha: string;

  @IsOptional()
  @IsString()
  vigorMot?: string;

  @IsOptional()
  @IsUUID('all', { message: 'El termoId debe ser un UUID válido' })
  termoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'El canastilloId debe ser un UUID válido' })
  canastilloId?: string;

  @IsOptional()
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  cantidad?: number;

  @IsOptional()
  @IsInt({ message: 'El ingreso debe ser un número entero' })
  @Min(0, { message: 'El ingreso no puede ser negativo' })
  ingreso?: number;

  @IsOptional()
  @IsInt({ message: 'La salida debe ser un número entero' })
  @Min(0, { message: 'La salida no puede ser negativa' })
  sale?: number;

  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;
}

export class UpdateColectaDto {
  @IsOptional()
  @IsUUID('all', { message: 'El toroId debe ser un UUID válido' })
  toroId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'El clienteId debe ser un UUID válido' })
  clienteId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida en formato ISO' })
  fecha?: string;

  @IsOptional()
  @IsString()
  vigorMot?: string;

  @IsOptional()
  @IsUUID('all', { message: 'El termoId debe ser un UUID válido' })
  termoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'El canastilloId debe ser un UUID válido' })
  canastilloId?: string;

  @IsOptional()
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  cantidad?: number;

  @IsOptional()
  @IsInt({ message: 'El ingreso debe ser un número entero' })
  @Min(0, { message: 'El ingreso no puede ser negativo' })
  ingreso?: number;

  @IsOptional()
  @IsInt({ message: 'La salida debe ser un número entero' })
  @Min(0, { message: 'La salida no puede ser negativa' })
  sale?: number;

  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;
}

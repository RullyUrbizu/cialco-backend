import { IsUUID, IsNotEmpty, IsInt, Min, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum TipoMovimiento {
  INGRESO = 'ingreso',
  SALIDA = 'salida',
}

export class CreateMovimientoDto {
  @IsUUID('all', { message: 'El inventarioId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El inventarioId es obligatorio' })
  inventarioId: string;

  @IsEnum(TipoMovimiento, { message: 'El tipo debe ser "ingreso" o "salida"' })
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  tipo: TipoMovimiento;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  cantidad: number;

  @IsOptional()
  @IsUUID('all', { message: 'El clienteId debe ser un UUID válido' })
  clienteId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Las notas no pueden exceder 1000 caracteres' })
  notas?: string;

  @IsOptional()
  @IsString()
  fecha?: string;
}

export class UpdateMovimientoDto {
  @IsOptional()
  @IsEnum(TipoMovimiento, { message: 'El tipo debe ser "ingreso" o "salida"' })
  tipo?: TipoMovimiento;

  @IsOptional()
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad?: number;

  @IsOptional()
  @IsUUID('all', { message: 'El clienteId debe ser un UUID válido' })
  clienteId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Las notas no pueden exceder 1000 caracteres' })
  notas?: string;
}

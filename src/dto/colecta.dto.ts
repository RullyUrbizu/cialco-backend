import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContenedorDto {
  @IsOptional()
  @IsUUID('all', { message: 'El termoId debe ser un UUID válido' })
  termoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'El canastilloId debe ser un UUID válido' })
  canastilloId?: string;

  @IsOptional()
  @IsString({ message: 'El canastilloCodigo debe ser un texto' })
  canastilloCodigo?: string;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  cantidad: number;
}

export class CreateColectaDto {
  @IsUUID('all', { message: 'El toroId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El toroId es obligatorio' })
  toroId: string;

  @IsUUID('all', { message: 'El clienteId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El clienteId es obligatorio' })
  clienteId: string;

  @IsDateString(
    {},
    { message: 'La fecha debe ser una fecha válida en formato ISO' },
  )
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  fecha: string;

  @IsOptional()
  @IsString()
  vigorMot?: string;

  @IsArray({ message: 'Los contenedores deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ContenedorDto)
  @ArrayMinSize(1, { message: 'Debe haber al menos un contenedor' })
  contenedores: ContenedorDto[];

  @IsOptional()
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  cantidad?: number;

  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateColectaDto {
  @IsOptional()
  @IsUUID('all', { message: 'El toroId debe ser un UUID válido' })
  toroId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'El clienteId debe ser un UUID válido' })
  clienteId?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha debe ser una fecha válida en formato ISO' },
  )
  fecha?: string;

  @IsOptional()
  @IsString()
  vigorMot?: string;

  @IsOptional()
  @IsArray({ message: 'Los contenedores deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ContenedorDto)
  @Type(() => ContenedorDto)
  contenedores?: ContenedorDto[];

  @IsOptional()
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  cantidad?: number;

  @IsOptional()
  @IsString()
  color?: string;
}

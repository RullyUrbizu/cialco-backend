import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTermoDto {
  @IsString()
  @IsNotEmpty({ message: 'El código del termo es obligatorio' })
  codigo: string;
}

export class UpdateTermoDto {
  @IsString()
  @IsOptional()
  codigo?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

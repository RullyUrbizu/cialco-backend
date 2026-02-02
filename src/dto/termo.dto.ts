import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTermoDto {
  @IsString()
  @IsNotEmpty({ message: 'El código del termo es obligatorio' })
  codigo: string;
}

export class UpdateTermoDto {
  @IsString()
  codigo?: string;
}

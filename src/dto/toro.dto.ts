import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { RazaEnum } from 'src/modelo/toro';

export class CreateToroDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del toro es obligatorio' })
  nombre: string;

  @IsEnum(RazaEnum, {
    message:
      'La raza debe ser una de las siguientes: AA, AAC, AAN, PH, SH, LMAn',
  })
  @IsNotEmpty({ message: 'La raza es obligatoria' })
  raza: RazaEnum;
}

export class UpdateToroDto {
  @IsString()
  nombre?: string;

  @IsEnum(RazaEnum, {
    message:
      'La raza debe ser una de las siguientes: AA, AAC, AAN, PH, SH, LMAn',
  })
  raza?: RazaEnum;
}

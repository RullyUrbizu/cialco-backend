import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCanastilloDto {
  @IsString()
  @IsNotEmpty({ message: 'El código del canastillo es obligatorio' })
  codigo: string;

  @IsUUID('4', { message: 'El termo_id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El termo_id es obligatorio' })
  termo_id: string;
}

export class UpdateCanastilloDto {
  @IsString()
  codigo?: string;

  @IsUUID('4', { message: 'El termo_id debe ser un UUID válido' })
  termo_id?: string;
}

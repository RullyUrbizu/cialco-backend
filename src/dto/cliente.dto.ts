import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  razonSocial: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{8}-\d{1}$/, {
    message: 'El CUIT debe tener el formato XX-XXXXXXXX-X',
  })
  cuit?: string;
}

export class UpdateClienteDto {
  @IsString()
  @IsOptional()
  razonSocial?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{8}-\d{1}$/, {
    message: 'El CUIT debe tener el formato XX-XXXXXXXX-X',
  })
  cuit?: string;
}

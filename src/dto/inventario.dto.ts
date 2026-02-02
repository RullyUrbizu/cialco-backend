import { IsUUID, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class CreateInventarioDto {
  @IsUUID('4', { message: 'El colecta_id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El colecta_id es obligatorio' })
  colecta_id: string;

  @IsInt({ message: 'La cantidad inicial debe ser un número entero' })
  @Min(0, { message: 'La cantidad inicial no puede ser negativa' })
  @IsNotEmpty({ message: 'La cantidad inicial es obligatoria' })
  cantidad_inicial: number;

  @IsOptional()
  @IsInt({ message: 'Los ingresos totales deben ser un número entero' })
  @Min(0, { message: 'Los ingresos totales no pueden ser negativos' })
  ingresos_total?: number;

  @IsOptional()
  @IsInt({ message: 'Las salidas totales deben ser un número entero' })
  @Min(0, { message: 'Las salidas totales no pueden ser negativas' })
  salidas_total?: number;
}

export class UpdateInventarioDto {
  @IsOptional()
  @IsInt({ message: 'La cantidad inicial debe ser un número entero' })
  @Min(0, { message: 'La cantidad inicial no puede ser negativa' })
  cantidad_inicial?: number;

  @IsOptional()
  @IsInt({ message: 'Los ingresos totales deben ser un número entero' })
  @Min(0, { message: 'Los ingresos totales no pueden ser negativos' })
  ingresos_total?: number;

  @IsOptional()
  @IsInt({ message: 'Las salidas totales deben ser un número entero' })
  @Min(0, { message: 'Las salidas totales no pueden ser negativas' })
  salidas_total?: number;
}

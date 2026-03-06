import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class TransferenciaStockDto {
    @IsString()
    @IsNotEmpty()
    origenContenedorId: string;

    @IsInt()
    @Min(1, { message: 'La cantidad a transferir debe ser al menos 1' })
    cantidad: number;

    @IsString()
    @IsNotEmpty()
    termoDestinoId: string;

    @IsString()
    @IsNotEmpty()
    canastilloCodigoDestino: string;
}

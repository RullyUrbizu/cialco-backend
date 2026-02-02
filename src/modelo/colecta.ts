import { Column, Model, Table, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { Toro } from './toro';
import { Cliente } from './cliente';
import { Canastillo } from './canastillo';
import { Termo } from './termo';
import { Inventario } from './inventario';

@Table({ tableName: 'colectas' })
export class Colecta extends Model<Colecta> {
    @Column({ primaryKey: true, type: DataType.STRING })
    declare id: string;

    @ForeignKey(() => Toro)
    @Column({ type: DataType.STRING, field: 'toro_id' })
    declare toroId: string;

    @ForeignKey(() => Cliente)
    @Column({ type: DataType.STRING, field: 'cliente_id' })
    declare clienteId: string;

    @ForeignKey(() => Termo)
    @Column({ type: DataType.STRING, field: 'termo_id' })
    declare termoId: string;

    @ForeignKey(() => Canastillo)
    @Column({ type: DataType.STRING, field: 'canastillo_id' })
    declare canastilloId: string;

    @Column(DataType.DATE)
    declare fecha: Date;

    @Column(DataType.STRING)
    declare vigorMot: string;

    @Column(DataType.INTEGER)
    declare cantidad: number;

    @Column(DataType.INTEGER)
    declare ingreso: number;

    @Column(DataType.INTEGER)
    declare sale: number;

    @Column(DataType.INTEGER)
    declare stock: number;

    @BelongsTo(() => Toro)
    declare toro: Toro;

    @BelongsTo(() => Cliente)
    declare cliente: Cliente;

    @BelongsTo(() => Termo)
    declare termo: Termo;

    @BelongsTo(() => Canastillo)
    declare canastillo: Canastillo;

    @HasOne(() => Inventario)
    declare inventario: Inventario;
}

import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Colecta } from './colecta';
import { Termo } from './termo';
import { Canastillo } from './canastillo';

@Table({
    tableName: 'colecta_contenedores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})
export class ColectaContenedor extends Model<ColectaContenedor> {
    @Column({ primaryKey: true, type: DataType.STRING })
    declare id: string;

    @ForeignKey(() => Colecta)
    @Column({ type: DataType.STRING, field: 'colecta_id' })
    declare colectaId: string;

    @ForeignKey(() => Termo)
    @Column({ type: DataType.STRING, field: 'termo_id' })
    declare termoId: string;

    @ForeignKey(() => Canastillo)
    @Column({ type: DataType.STRING, field: 'canastillo_id' })
    declare canastilloId: string;

    @Column(DataType.INTEGER)
    declare cantidad: number;

    @Column({ type: DataType.INTEGER, defaultValue: 0, field: 'stock_actual' })
    declare stockActual: number;

    @BelongsTo(() => Colecta)
    declare colecta: Colecta;

    @BelongsTo(() => Termo)
    declare termo: Termo;

    @BelongsTo(() => Canastillo)
    declare canastillo: Canastillo;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm'
import { IsNotEmpty } from 'class-validator'
import { Film } from "./Film"

@Entity()
@Unique(['name'])
export class Genre {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty()
    name: string

    @ManyToMany(() => Film, (film) => film.genres)
    films: Film[]

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date
}

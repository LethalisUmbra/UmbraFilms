import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, Unique, UpdateDateColumn, CreateDateColumn, OneToMany } from "typeorm"
import { IsNotEmpty } from 'class-validator'
import { Genre } from "./Genre"
import { FilmRating } from "./FilmRating"

@Entity()
@Unique(['name'])
export class Film {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty()
    name: string

    @Column()
    releaseDate: Date

    @Column()
    duration: number

    @Column()
    director: string

    @Column({default: 0})
    rating: number

    // Genre - Many to Many
    @ManyToMany(() => Genre, (genre) => genre.films)
    @JoinTable()
    genres: Genre[]

    // User - Many to Many
    @OneToMany(() => FilmRating, (filmRating) => filmRating.film)
    filmRatings: FilmRating[];

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date

    calcRating():number {
        let totalRating = 0
        const divider = this.filmRatings.length
        if (divider > 0) this.filmRatings.forEach((ratings) => { totalRating += ratings.rating })
        this.rating = (totalRating == 0 || divider == 0) ? 0 : totalRating / divider
        return this.rating
    }
}

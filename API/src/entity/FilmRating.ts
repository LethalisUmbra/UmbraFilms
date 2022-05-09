import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Film } from "./Film"
import { User } from "./User"

@Entity()
export class FilmRating {

    @PrimaryGeneratedColumn()
    id: number

    @Column({default: 0})
    rating: number

    @ManyToOne(() => User, (user) => user.filmsRating)
    user: User

    @ManyToOne(() => Film, (film) => film.filmRatings)
    film: Film
}

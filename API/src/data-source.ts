import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Film } from "./entity/Film"
import { Genre } from "./entity/Genre"
import { FilmRating } from "./entity/FilmRating"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "filmsdb",
    synchronize: true,
    logging: false,
    entities: [
        User, Film, Genre, FilmRating
    ],
    migrations: [],
    subscribers: [],
})

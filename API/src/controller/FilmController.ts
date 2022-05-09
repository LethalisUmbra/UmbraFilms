import { AppDataSource } from "../data-source"
import { Request, Response } from "express"
import { Film } from "../entity/Film"
import { validate } from 'class-validator'
import { Genre } from "../entity/Genre"
import { User } from "../entity/User"
import { FilmRating } from "../entity/FilmRating"

export class FilmController {
    static getAll = async (req:Request, res:Response) => {
        const filmRepository = AppDataSource.getRepository(Film)
        const films = await filmRepository.find({
            relations: ['genres', 'filmRatings']
        })

        if (films.length > 0) res.send(films)
        else res.status(404).json({ message: 'Films not found' })
    }

    static getById = async (req:Request, res:Response) => {
        const filmRepository = AppDataSource.getRepository(Film)
        const { id } = req.params
        try {
            const film = await filmRepository.findOneOrFail({
                relations: ['genres', 'filmRatings'],
                where: { id: +id }
            })
            res.send(film)
        } catch {
            res.status(404).json({ message: 'Film not found' })
        }
    }

    static create = async (req:Request, res:Response) => {
        const filmRepository = AppDataSource.getRepository(Film)
        const { name, releaseDate, duration, director, genres } = req.body
        const film = new Film()

        // Store existing genres and discard the rest
        if (genres) {
            const genreRepository = AppDataSource.getRepository(Genre)
            const foundGenres:Genre[] = []
            for (const genre of genres) {
                let searchedGenre = await genreRepository.findOneBy(genre)
                if (searchedGenre) foundGenres.push(searchedGenre)
            }
            film.genres = foundGenres
        }

        film.name = name
        film.releaseDate = releaseDate
        film.duration = duration
        film.director = director

        // Validations
        const errors = await validate(film)
        if (errors.length > 0) res.status(400).json(errors)

        film.calcRating()

        try { await filmRepository.save(film) }
        catch (e) { return res.status(409).json({message: e}) }


        res.send('Film created successfully')
    }

    static update = async (req:Request, res:Response) => {
        const filmRepository = AppDataSource.getRepository(Film)
        let film
        const { id } = req.params
        const { name, releaseDate, duration, director, genres } = req.body

        // Check if film exists
        try { film = await filmRepository.findOneByOrFail({id: +id}) }
        catch { return res.status(404).json({message: 'Film not found'}) }

        // Store existing genres and discard the rest
        if (genres) {
            let foundGenres:Genre[] = []
            const genreRepository = AppDataSource.getRepository(Genre)
            for (const genre of genres) {
                let searchedGenre = await genreRepository.findOneBy(genre)
                if (searchedGenre) foundGenres.push(searchedGenre)
            }
            film.genres = foundGenres
        }

        film.name = name
        film.releaseDate = releaseDate
        film.duration = duration
        film.director = director

        const errors = await validate(film)
        if (errors.length > 0) return res.status(400).json(errors)

        film.calcRating()

        try { await filmRepository.save(film) }
        catch { return res.status(409).json({message: 'Film name already in use'}) }


        res.status(201).json({message: 'Film updated successfully'})
    }

    static delete = async (req:Request, res:Response) => {
        const filmRepository = AppDataSource.getRepository(Film)
        const { id } = req.params
        let film:Film

        try { film = await filmRepository.findOneByOrFail({id: +id}) }
        catch { return res.status(404).json({message: 'Film not found'}) }

        filmRepository.delete(id)
        res.status(201).json({message: `film '${film.name}' deleted successfully`})
    }

    static rate = async (req:Request, res:Response) => {
        // Check if film exists
        const filmRepository = AppDataSource.getRepository(Film)
        const { filmId } = req.params
        let film:Film

        try { film = await filmRepository.findOneOrFail({ where: { id: +filmId }, relations: ['filmRatings'] }) }
        catch { return res.status(404).json({message: 'Film not found'}) }
        
        // Check if user status is correct
        const userRepository = AppDataSource.getRepository(User)
        const { userId } = res.locals.jwtPayload
        let user:User

        try { user = await userRepository.findOneOrFail({ where: {id: +userId}, relations: ['filmsRating'] }) }
        catch { return res.status(404).json({message: 'Something went wrong, try logging in again'}) }

        // Declarations for FilmRating
        const rateRepository = AppDataSource.getRepository(FilmRating)
        let filmRated:FilmRating
        const { rating } = req.body
        
        // Check if already exists a rating
        film.filmRatings.forEach((f_rating) => {
            user.filmsRating.forEach((u_rating) => {
                if (f_rating.id == u_rating.id) filmRated = u_rating
            })
        })
        
        // Save FilmRating and refresh Film
        if (!filmRated) filmRated = new FilmRating()
        filmRated.user = user
        filmRated.film = film
        filmRated.rating = rating

        try {
            await rateRepository.save(filmRated)
            film = await filmRepository.findOneOrFail({ where: { id: +filmId }, relations: ['filmRatings'] })
        }
        catch (e) { return res.status(400).json({message: 'Something went wrong', e})}

        // Recalculate film rating
        const postFunction = film.calcRating()
        
        // Save film with new rating
        try { await filmRepository.save(film) }
        catch (e) { return res.status(400).json({message: 'Something went wrong', e})}

        res.json({message: `Film '${film.name}' rated successfully with '${rating}', its average rating is now: ${film.rating}`})
    }

}
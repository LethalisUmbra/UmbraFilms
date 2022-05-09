import { AppDataSource } from "../data-source"
import { Request, Response } from "express"
import { Genre } from "../entity/Genre"
import { validate } from 'class-validator'
import { Film } from "../entity/Film"

export class GenreController {
    static getAll = async (req:Request, res:Response) => {
        const genreRepository = AppDataSource.getRepository(Genre)
        const genres = await genreRepository.find({
            relations: ['films']
        })
        if (genres.length > 0) res.send(genres)
        else res.status(404).json({ message: 'Genres not found' })
    }

    static getById = async (req:Request, res:Response) => {
        const genreRepository = AppDataSource.getRepository(Genre)
        const { id } = req.params
        try {
            const genre = await genreRepository.findOneByOrFail({ id: +id })
            res.send(genre)
        } catch {
            res.status(404).json({ message: 'Genre not found' })
        }
    }

    static create = async (req:Request, res:Response) => {
        const genreRepository = AppDataSource.getRepository(Genre)
        const { name } = req.body
        const genre = new Genre()

        genre.name = name

        // Validations
        const errors = await validate(genre)
        if (errors.length > 0) res.status(400).json(errors)

        try { await genreRepository.save(genre) }
        catch { return res.status(409).json({message: `Genre ${genre.name} already exists`}) }

        res.send(`Genre ${genre.name} created successfully`)
    }

    static update = async (req:Request, res:Response) => {
        const genreRepository = AppDataSource.getRepository(Genre)
        let genre
        const { id } = req.params
        const { name } = req.body

        try { genre = await genreRepository.findOneByOrFail({id: +id}) }
        catch { return res.status(404).json({message: `Genre with ID ${id} not found`}) }

        genre.name = name

        const errors = await validate(genre)
        if (errors.length > 0) return res.status(400).json(errors)

        try { await genreRepository.save(genre) }
        catch { return res.status(409).json({message: `Genre ${genre.name} already in use`}) }

        res.status(201).json({message: 'Genre updated successfully'})
    }

    static delete = async (req:Request, res:Response) => {
        const genreRepository = AppDataSource.getRepository(Genre)
        const { id } = req.params
        let genre:Genre

        // Find Genre by ID
        try { genre = await genreRepository.findOneByOrFail({id: +id}) }
        catch { return res.status(404).json({message: `Genre with ID ${id} not found`}) }

        // Delete many-to-many relations
        const filmRepository = AppDataSource.getRepository(Film)
        let films:Film[] = await filmRepository.find({relations: ['genres']})

        if (films.length > 0) {
            for (let film of films) {
                film.genres = film.genres.filter( data => { return data.id !== genre.id })
                await filmRepository.save(film)
            }
        }

        // Delete Genre
        genreRepository.delete(id)
        res.send(`Genre '${genre.name}' deleted successfully`)
    }

}
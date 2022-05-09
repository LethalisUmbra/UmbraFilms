import { AppDataSource } from "../data-source"
import { Request, Response } from "express"
import { User } from "../entity/User"
import { validate } from 'class-validator'

export class UserController {
    static getAll = async (req:Request, res:Response) => {
        const userRepository = AppDataSource.getRepository(User)
        let users

        try { users = await userRepository.find({ relations: ['filmsRating']}) }
        catch { res.status(404).json({ message: 'Something went wrong' }) }

        for (let user of users) {
            delete user['password']
        }

        if (users.length > 0) res.send(users)
        else res.status(404).json({ message: 'Users not found' })
    }

    static getById = async (req:Request, res:Response) => {
        const userRepository = AppDataSource.getRepository(User)
        const { id } = req.params
        try {
            const user = await userRepository.findOneOrFail({
                where: {id: +id},
                relations: ['filmsRating']
            })
            delete user.password
            res.send(user)
        } catch {
            res.status(404).json({ message: 'User not found' })
        }
    }

    static create = async (req:Request, res:Response) => {
        const userRepository = AppDataSource.getRepository(User)
        const { username, email, password, role } = req.body
        const user = new User()

        user.username = username
        user.email = email
        user.password = password
        user.role = role

        // Validations
        const validateOptions = { validationError: { target: false, value: false} }
        const errors = await validate(user, validateOptions)
        if (errors.length > 0) res.status(400).json(errors)

        // HASH PASSWORD
        user.hashPassword()

        try { await userRepository.save(user) }
        catch { return res.status(409).json({message: 'Username already exists'}) }

        res.send('User created successfully')
    }

    static update = async (req:Request, res:Response) => {
        const userRepository = AppDataSource.getRepository(User)
        let user
        const { id } = req.params
        const { username, email, role } = req.body

        try { user = await userRepository.findOneByOrFail({id: +id}) }
        catch { return res.status(404).json({message: 'User not found'}) }

        user.username = username
        user.email = email
        user.role = role

        // Validate fields
        const validateOptions = { validationError: { target: false, value: false} }
        const errors = await validate(user, validateOptions)
        if (errors.length > 0) return res.status(400).json(errors)

        try { await userRepository.save(user) }
        catch { return res.status(409).json({message: 'Username already in use'}) }

        res.status(201).json({message: 'User updated successfully'})
    }

    static delete = async (req:Request, res:Response) => {
        const userRepository = AppDataSource.getRepository(User)
        const { id } = req.params
        let user:User

        try { user = await userRepository.findOneByOrFail({id: +id}) }
        catch { return res.status(404).json({message: 'User not found'}) }

        userRepository.delete(id)
        res.status(201).json({message: `User ${id} deleted successfully`})
    }

}
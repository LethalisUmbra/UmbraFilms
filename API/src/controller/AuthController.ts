import { AppDataSource } from '../data-source';
import { Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { User } from '../entity/User'
import config from '../config/config';
import { validate } from 'class-validator';

class AuthController {
    static login = async (req: Request, res: Response) => {
        const { username, password: pw } = req.body

        if(!(username && pw)) return res.status(400).json({message: 'Username & Password are required'})
        
        // Check if username exists
        const userRepository = AppDataSource.getRepository(User)
        let user:User
        try { user = await userRepository.findOneOrFail({ where: { username }}) }
        catch { return res.status(400).json({message: 'Username or Password are incorrect'}) }

        // Check password
        if (!user.checkPassword(pw)) return res.status(400).json({message: 'Username or Password are incorrect'})

        const token = jwt.sign({userId: user.id, username: user.username}, config.jwtSecret, {expiresIn: '1d'})

        res.json({ message: 'Login success', token })
    }

    static changePassword = async (req: Request, res: Response) => {
        const { userId } = res.locals.jwtPayload
        const { oldPassword, newPassword } = req.body

        // Validate fields exists
        if (!(oldPassword && newPassword)) res.status(400).json({message: 'Old & New Passwords are required'})

        const userRepository = AppDataSource.getRepository(User)
        let user:User

        // Find user by ID
        try { user = await userRepository.findOneByOrFail({id: userId})}
        catch (e) { return res.status(400).json({message: 'Something went wrong'}) }

        // Validate Old Password
        if (!user.checkPassword(oldPassword)) return res.status(400).json({message: 'Old password is incorrect'})
        if (oldPassword==newPassword) return res.status(400).json({message: 'Both passwords are identical'})

        // Validate fields errors
        user.password = newPassword
        const validateOptions = { validationError: { target: false, value: false} }
        const errors = await validate(user, validateOptions)
        if (errors.length > 0) return res.status(400).json(errors)

        // Hash new password
        user.hashPassword()
        userRepository.save(user)

        res.json({message: 'Password changed successfully'})
    }
}

export default AuthController
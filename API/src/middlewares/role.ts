import { Request, Response, NextFunction } from "express"
import { AppDataSource } from "../data-source"
import { User } from "../entity/User"

export const checkRole = (roles:Array<string>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = res.locals.jwtPayload
        const userRepository = AppDataSource.getRepository(User)
        let user:User

        // Find User
        try { user = await userRepository.findOneByOrFail({ id: userId }) }
        catch (e) { return res.status(401).json({message: 'Unauthorized'}) }

        // Check Role
        const { role } = user
        if (roles.includes(role)) next()
        else res.status(401).json({message: 'Unauthorized'})
    } 
}
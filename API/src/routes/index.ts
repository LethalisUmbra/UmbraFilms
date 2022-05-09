import { Router } from 'express'
import auth from './auth'
import user from './user'
import film from './film'
import genre from './genre'

const routes = Router()

routes.use('/auth', auth)
routes.use('/users', user)
routes.use('/films', film)
routes.use('/genres', genre)

export default routes
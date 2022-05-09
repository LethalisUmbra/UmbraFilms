import { Router } from 'express'
import { FilmController } from '../controller/FilmController'
import { checkJwt } from '../middlewares/jwt'

const router = Router()

// Get all users
router.get('/', FilmController.getAll)
// Get one by ID
router.get('/:id', FilmController.getById)
// Create
router.post('/', FilmController.create)
// Update
router.patch('/:id', FilmController.update)
// Delete
router.delete('/:id', FilmController.delete)
// Rate
router.post('/rate/:filmId', [checkJwt], FilmController.rate)

export default router
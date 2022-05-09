import { Router } from 'express'
import { GenreController } from '../controller/GenreController'

const router = Router()

// Get all users
router.get('/', GenreController.getAll)
// Get one by ID
router.get('/:id', GenreController.getById)
// Create
router.post('/', GenreController.create)
// Update
router.patch('/:id', GenreController.update)
// Delete
router.delete('/:id', GenreController.delete)

export default router
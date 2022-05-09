import { Router } from 'express'
import { UserController } from '../controller/UserController'
import { checkJwt } from '../middlewares/jwt'
import { checkRole } from '../middlewares/role'

const router = Router()

// Get all users
router.get('/', [checkJwt, checkRole(['admin', 'editor', 'superadmin'])], UserController.getAll)
// Get one by ID
router.get('/:id', [checkJwt, checkRole(['admin', 'editor', 'superadmin'])], UserController.getById)
// Create
router.post('/', UserController.create)
// Update
router.patch('/:id', [checkJwt, checkRole(['admin', 'editor', 'superadmin'])], UserController.update)
// Delete
router.delete('/:id', [checkJwt, checkRole(['admin', 'superadmin'])], UserController.delete)

export default router
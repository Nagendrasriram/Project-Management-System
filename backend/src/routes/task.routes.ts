import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskQuerySchema,
  IdParamSchema,
} from '@project-mgmt/shared';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(TaskQuerySchema), TaskController.list);
router.post('/', validateBody(CreateTaskSchema), TaskController.create);
router.get('/:id', validateParams(IdParamSchema), TaskController.getById);
router.put(
  '/:id',
  validateParams(IdParamSchema),
  validateBody(UpdateTaskSchema),
  TaskController.update
);
router.delete('/:id', validateParams(IdParamSchema), TaskController.delete);

export default router;

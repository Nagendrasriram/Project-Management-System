import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectQuerySchema,
  IdParamSchema,
} from '@project-mgmt/shared';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(ProjectQuerySchema), ProjectController.list);
router.post('/', validateBody(CreateProjectSchema), ProjectController.create);
router.get('/:id', validateParams(IdParamSchema), ProjectController.getById);
router.put(
  '/:id',
  validateParams(IdParamSchema),
  validateBody(UpdateProjectSchema),
  ProjectController.update
);
router.delete('/:id', validateParams(IdParamSchema), ProjectController.delete);

export default router;

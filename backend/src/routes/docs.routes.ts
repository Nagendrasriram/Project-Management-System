import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '../docs/swagger';

const router = Router();

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openApiSpec));
router.get('/json', (_req: any, res: any) => {
  res.json(openApiSpec);
});

export default router;

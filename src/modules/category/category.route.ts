import { Router } from 'express';
import { CategoryController } from './category.controller';

const router = Router();
const categoryController = new CategoryController();

router.get('/', categoryController.findAll.bind(categoryController));

export default router;
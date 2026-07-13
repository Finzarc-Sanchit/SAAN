import { MongoCategoryRepository } from '../../infrastructure/database/mongodb/repositories/category.repository';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

const categoryRepository = new MongoCategoryRepository();
const categoryService = new CategoryService(categoryRepository);
export const categoryController = new CategoryController(categoryService);

export { categoryService, categoryRepository };

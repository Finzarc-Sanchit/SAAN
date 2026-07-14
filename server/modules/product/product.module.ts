import { MongoProductRepository } from '../../infrastructure/database/mongodb/repositories/product.repository';
import { categoryRepository } from '../category/category.module';
import { discountRepository } from '../discount/discount.module';
import { sizeRepository } from '../size/size.module';
import { ProductController } from './product.controller';
import { createAdminProductRoutes } from './product.admin.routes';
import { createProductRoutes } from './product.routes';
import { ProductService } from './product.service';

const productRepository = new MongoProductRepository();
const productService = new ProductService(
  productRepository,
  categoryRepository,
  discountRepository,
  sizeRepository,
);
const productController = new ProductController(productService);

export const productRoutes = createProductRoutes(productController);
export const adminProductRoutes = createAdminProductRoutes(productController);

export { productService, productRepository, productController };

import { MongoDiscountRepository } from '../../infrastructure/database/mongodb/repositories/discount.repository';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';

const discountRepository = new MongoDiscountRepository();
const discountService = new DiscountService(discountRepository);
export const discountController = new DiscountController(discountService);

export { discountService, discountRepository };

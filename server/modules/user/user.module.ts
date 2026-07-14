import { MongoUserRepository } from '../../infrastructure/database/mongodb/repositories/user.repository';
import { CustomerAdminController } from './customer.admin.controller';
import { createAdminCustomerRoutes } from './customer.admin.routes';
import { CustomerAdminService } from './customer.admin.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);
export const userController = new UserController(userService);

const customerAdminService = new CustomerAdminService(userRepository);
const customerAdminController = new CustomerAdminController(customerAdminService);
export const adminCustomerRoutes = createAdminCustomerRoutes(customerAdminController);

export { userService, userRepository };

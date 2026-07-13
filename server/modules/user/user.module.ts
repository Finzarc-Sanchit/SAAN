import { MongoUserRepository } from '../../infrastructure/database/mongodb/repositories/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);
export const userController = new UserController(userService);

export { userService, userRepository };

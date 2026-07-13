import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { addressIdParamDto, createAddressDto, updateAddressDto } from './address.dto';
import { userController } from './user.module';

const router = Router();

router.use(authMiddleware);

router.get('/me/addresses', userController.listAddresses);
router.post('/me/addresses', validate(createAddressDto), userController.addAddress);
router.patch(
  '/me/addresses/:addressId',
  validate(addressIdParamDto, 'params'),
  validate(updateAddressDto),
  userController.updateAddress,
);
router.delete(
  '/me/addresses/:addressId',
  validate(addressIdParamDto, 'params'),
  userController.removeAddress,
);
router.patch(
  '/me/addresses/:addressId/default',
  validate(addressIdParamDto, 'params'),
  userController.setDefaultAddress,
);

export const userRoutes = router;

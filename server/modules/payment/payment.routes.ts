import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { initiatePaymentDto, orderIdParamsDto, verifyPaymentDto } from './payment.dto';
import type { PaymentController } from './payment.controller';

export function createOrderPaymentRoutes(paymentController: PaymentController): Router {
  const router = Router({ mergeParams: true });

  router.use(authMiddleware);

  router.post(
    '/:orderId/payments/initiate',
    validate(orderIdParamsDto, 'params'),
    validate(initiatePaymentDto),
    paymentController.initiatePayment,
  );

  router.post(
    '/:orderId/payments/verify',
    validate(orderIdParamsDto, 'params'),
    validate(verifyPaymentDto),
    paymentController.verifyPayment,
  );

  router.get(
    '/:orderId/payments',
    validate(orderIdParamsDto, 'params'),
    paymentController.listPayments,
  );

  return router;
}

export function createPaymentWebhookRoutes(paymentController: PaymentController): Router {
  const router = Router();

  router.post('/webhook', paymentController.handleWebhook);

  return router;
}

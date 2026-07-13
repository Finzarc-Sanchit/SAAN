import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { InitiatePaymentDto, OrderIdParamsDto } from './payment.dto';
import type { PaymentService } from './payment.service';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  initiatePayment = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params as OrderIdParamsDto;
    const { paymentMethod } = req.body as InitiatePaymentDto;
    const result = await this.paymentService.initiatePayment(
      orderId,
      req.user!.id,
      req.user!.role,
      paymentMethod,
    );

    res.status(201).json(successResponse(result));
  };

  listPayments = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params as OrderIdParamsDto;
    const payments = await this.paymentService.listPaymentsForOrder(
      orderId,
      req.user!.id,
      req.user!.role,
    );

    res.status(200).json(successResponse(payments));
  };

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const signatureHeader = req.headers['x-razorpay-signature'];
    const signature = typeof signatureHeader === 'string' ? signatureHeader : '';
    const rawBody = req.body as Buffer;

    await this.paymentService.handleWebhook(rawBody, signature);
    res.status(200).json(successResponse({ received: true }));
  };
}

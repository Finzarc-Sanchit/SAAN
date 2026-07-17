import { Schema, model, type Types } from 'mongoose';
import { CONTACT_STATUSES, type ContactStatus } from '../../../../modules/contact/contact.types';

const contactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },
    phone: { type: String, required: true, trim: true, minlength: 10, maxlength: 20 },
    subject: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5_000 },
    status: {
      type: String,
      enum: CONTACT_STATUSES,
      required: true,
      default: 'new',
      index: true,
    },
  },
  { timestamps: true },
);

contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1, createdAt: -1 });

export const ContactModel = model('Contact', contactSchema);

export type ContactDocument = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
};

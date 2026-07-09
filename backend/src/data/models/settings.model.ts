import { Schema, model, Document } from 'mongoose';

export interface INotifications {
  email: boolean;
  priceAlerts: boolean;
  weeklyReport: boolean;
}

export interface ISettings {
  userId: Schema.Types.ObjectId;
  theme: 'light' | 'dark' | 'system';
  notifications: INotifications;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon: 'short' | 'medium' | 'long';
  createdAt: Date;
  updatedAt: Date;
}

export interface ISettingsDocument extends ISettings, Document {}

const settingsSchema = new Schema<ISettingsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true, // 1-to-1 relationship with User
      index: true,
    },
    theme: {
      type: String,
      enum: {
        values: ['light', 'dark', 'system'],
        message: 'Invalid theme selection',
      },
      default: 'dark',
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      priceAlerts: {
        type: Boolean,
        default: true,
      },
      weeklyReport: {
        type: Boolean,
        default: true,
      },
    },
    riskTolerance: {
      type: String,
      enum: {
        values: ['conservative', 'moderate', 'aggressive'],
        message: 'Invalid risk tolerance level',
      },
      default: 'moderate',
    },
    investmentHorizon: {
      type: String,
      enum: {
        values: ['short', 'medium', 'long'],
        message: 'Invalid investment horizon range',
      },
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = model<ISettingsDocument>('Settings', settingsSchema);

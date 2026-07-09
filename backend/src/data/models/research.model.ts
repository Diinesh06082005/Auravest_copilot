import { Schema, model, Document, Model } from 'mongoose';

export interface IResearch {
  userId: Schema.Types.ObjectId;
  ticker: string;
  title: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  analysis: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResearchDocument extends IResearch, Document {}

const researchSchema = new Schema<IResearchDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    ticker: {
      type: String,
      required: [true, 'Stock ticker is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Research report title is required'],
      trim: true,
    },
    summary: {
      type: String,
      default: '',
    },
    sentiment: {
      type: String,
      enum: {
        values: ['bullish', 'bearish', 'neutral'],
        message: 'Invalid sentiment type',
      },
      default: 'neutral',
    },
    analysis: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for optimizing user ticker queries
researchSchema.index({ userId: 1, ticker: 1 });
// Compound index for query ordering by date
researchSchema.index({ userId: 1, createdAt: -1 });

export const Research = model<IResearchDocument>('Research', researchSchema);

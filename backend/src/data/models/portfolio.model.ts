import { Schema, model, Document } from 'mongoose';

export interface IAsset {
  ticker: string;
  shares: number;
  averageBuyPrice: number;
}

export interface ITransaction {
  type: 'buy' | 'sell';
  ticker: string;
  shares: number;
  price: number;
  date: Date;
}

export interface IPortfolio {
  userId: Schema.Types.ObjectId;
  name: string;
  assets: IAsset[];
  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPortfolioDocument extends IPortfolio, Document {}

const assetSchema = new Schema<IAsset>(
  {
    ticker: {
      type: String,
      required: [true, 'Asset ticker is required'],
      trim: true,
      uppercase: true,
    },
    shares: {
      type: Number,
      required: [true, 'Asset share count is required'],
      min: [0, 'Shares count cannot be negative'],
    },
    averageBuyPrice: {
      type: Number,
      required: [true, 'Average buy price is required'],
      min: [0, 'Average buy price cannot be negative'],
    },
  },
  { _id: false }
);

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: {
        values: ['buy', 'sell'],
        message: 'Transaction type must be buy or sell',
      },
      required: [true, 'Transaction type is required'],
    },
    ticker: {
      type: String,
      required: [true, 'Transaction ticker is required'],
      trim: true,
      uppercase: true,
    },
    shares: {
      type: Number,
      required: [true, 'Transaction share count is required'],
      min: [0.000001, 'Shares count must be greater than zero'],
    },
    price: {
      type: Number,
      required: [true, 'Transaction execution price is required'],
      min: [0.01, 'Transaction price must be greater than zero'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const portfolioSchema = new Schema<IPortfolioDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Portfolio name is required'],
      trim: true,
      default: 'My Portfolio',
    },
    assets: [assetSchema],
    transactions: [transactionSchema],
  },
  {
    timestamps: true,
  }
);

// Enforce unique portfolio names per user
portfolioSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Portfolio = model<IPortfolioDocument>('Portfolio', portfolioSchema);

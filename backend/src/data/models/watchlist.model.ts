import { Schema, model, Document } from 'mongoose';

export interface IWatchlist {
  userId: Schema.Types.ObjectId;
  name: string;
  tickers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWatchlistDocument extends IWatchlist, Document {}

const watchlistSchema = new Schema<IWatchlistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Watchlist name is required'],
      trim: true,
      default: 'Default',
    },
    tickers: [
      {
        type: String,
        trim: true,
        uppercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Enforce unique watchlist names per user
watchlistSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Watchlist = model<IWatchlistDocument>('Watchlist', watchlistSchema);

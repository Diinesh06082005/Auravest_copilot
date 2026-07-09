import { Schema, model, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IChat {
  userId: Schema.Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatDocument extends IChat, Document {}

const messageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: {
        values: ['user', 'assistant', 'system'],
        message: 'Invalid message role',
      },
      required: [true, 'Role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // Subdocuments do not need separate objectIds
);

const chatSchema = new Schema<IChatDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Chat title is required'],
      trim: true,
      default: 'New Chat Session',
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

// Optimize retrieval by user and sort by modification date
chatSchema.index({ userId: 1, updatedAt: -1 });

export const Chat = model<IChatDocument>('Chat', chatSchema);

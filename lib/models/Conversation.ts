import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  tokensUsed?: number;
}

export interface IConversation extends Document {
  sessionId: string;
  userId: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
  };
}

const messageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  model: String,
  tokensUsed: Number,
});

const conversationSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [messageSchema],
    metadata: {
      userAgent: String,
      ipAddress: String,
    },
  },
  { timestamps: true }
);

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', conversationSchema);

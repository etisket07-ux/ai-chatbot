import mongoose, { Schema, Document } from 'mongoose';

export interface IManual extends Document {
  title: string;
  category: string;
  content: string;
  keywordTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    source?: string;
    version?: string;
    author?: string;
  };
}

const manualSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    keywordTokens: [String],
    metadata: {
      source: String,
      version: String,
      author: String,
    },
  },
  { timestamps: true }
);

// Add text index for full-text search
manualSchema.index({ content: 'text', title: 'text', category: 'text' });

export const Manual =
  mongoose.models.Manual ||
  mongoose.model<IManual>('Manual', manualSchema);

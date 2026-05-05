import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  dsl: {
    version: string;
    screen: {
      width: number;
      height: number;
      backgroundColor: string;
      backgroundImage?: string;
    };
    componentMap: Record<string, any>;
    rootComponentIds: string[];
  };
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    dsl: {
      type: Schema.Types.Mixed,
      required: true,
    },
    thumbnail: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);

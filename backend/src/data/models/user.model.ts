import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../shared/config';

// User attributes interface
export interface IUser {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  role: 'user' | 'analyst' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// User Document interface extending Mongoose Document
export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

// User Model static interface
export interface IUserModel extends Model<IUserDocument> {}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
      validate: {
        validator: function (this: IUserDocument, value: string) {
          // Password is required only if googleId is not present
          return this.googleId ? true : !!value;
        },
        message: 'Password is required for email login',
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values but enforces uniqueness on values
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'analyst', 'admin'],
        message: 'Invalid role selection',
      },
      default: 'user',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this as IUserDocument;

  // Only hash the password if it has been modified or is new
  if (!user.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password!, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT Access Token method
userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiresIn as any,
    }
  );
};

// Generate JWT Refresh Token method
userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn as any,
    }
  );
};

export const User = model<IUserDocument, IUserModel>('User', userSchema);

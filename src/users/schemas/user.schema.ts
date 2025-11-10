import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

/* @Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    index: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
    minlength: [6, 'Password must be at least 6 characters'],
  })
  password: string;

  @Prop({
    required: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  })
  name: string;

  @Prop({
    default: false,
    index: true,
  })
  isAdmin: boolean;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: 'Movie',
        index: true,
      },
    ],
    default: [],
  })
  favorites: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Виртуальное поле id
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Индексы для оптимизации запросов
UserSchema.index({ createdAt: -1 });
UserSchema.index({ isAdmin: 1, createdAt: -1 }); */

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
})
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Movie' }], default: [] })
  favorites: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Создаем виртуальное поле id
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

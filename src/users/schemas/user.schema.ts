import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

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
  username: string;

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

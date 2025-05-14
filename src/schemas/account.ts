import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true, unique: true })
  username: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

export type AccountDocument = Account & Document;

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  userId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  img?: string;
  imageUrl?: string;
  description?: string;
  category: string;
}

const ProductSchema: Schema<IProduct> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  img: { type: String },
  imageUrl: { type: String },
  description: { type: String },
  category: { type: String, required: true },
});

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product
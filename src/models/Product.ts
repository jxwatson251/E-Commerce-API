import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  UserId: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
  imageUrl?: string;
  description?: string;
  category?: string;
}

const ProductSchema: Schema<IProduct> = new Schema({
  UserId: {type: String, required: true},
  name: {type: String, required: true},
  price: {type: Number, required: true},
  quantity: {type: Number, required: true},
  img: {type: String},
  imageUrl: {type: String},
  description: {type: String},
  category: {type: String, required: true},
});

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
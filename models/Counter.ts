import { Schema, model, models, Document } from "mongoose";

// Interface for the counter document
export interface ICounter extends Document {
  _id: string;
  seq: number;
}

// Schema for the Counter model
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 211549 }, // Starts at 211549 so the first ticket is 211550
});

// Create singleton model
const Counter = models.Counter || model<ICounter>("Counter", CounterSchema);

export default Counter;

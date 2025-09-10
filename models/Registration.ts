import mongoose, { Schema, model, models, Document, Model } from "mongoose";
import Counter from "./Counter";

export interface IRegistration extends Document {
  fullName: string;
  email: string;
  ticketNo?: number;
  phoneNumber?: string;
  dob?: Date;
  experience?: string;
  institution?: string;
  callDateTime?: string;
  hearAboutUs?: string;
  currentProfession?: string;
  specialization?: string;
  learningGoals?: string;
  trainingPrograms?: string[];
  additionalPrograms?: string[];
  uploadId?: mongoose.Types.ObjectId | null;
  uploadName?: string | null;
  termsAgree?: boolean;
  status?: "upcoming" | "pending" | "completed";
  isExpired?: boolean; // Added isExpired to the interface
}

export interface RegistrationModel extends Model<IRegistration> {
  getNextTicketNo(): Promise<number>;
}

const RegistrationSchema = new Schema<IRegistration, RegistrationModel>(
  {
    ticketNo: { type: Number, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: String,
    dob: Date,
    experience: String,
    institution: String,
    callDateTime: String,
    hearAboutUs: String,
    currentProfession: String,
    specialization: String,
    learningGoals: String,
    trainingPrograms: [String],
    additionalPrograms: [String],
    uploadId: { type: Schema.Types.ObjectId, ref: "uploads" },
    uploadName: String,
    termsAgree: Boolean,
    status: { type: String, enum: ["upcoming", "pending", "completed"], default: "pending" },
    isExpired: { type: Boolean, default: false }, // Added isExpired to the schema
  },
  { timestamps: true }
);

// ✅ Static method to get next ticket number
RegistrationSchema.statics.getNextTicketNo = async function (): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    "ticketNo",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true } // creates counter if doesn't exist
  );

  if (!counter) throw new Error("Counter not initialized");

  // Ensure first ticket starts from 211550
  if (counter.seq < 211550) {
    counter.seq = 211550;
    await counter.save();
  }

  return counter.seq;
};

// ✅ Create singleton model
const Registration: RegistrationModel =
  (models.Registration as RegistrationModel) ||
  model<IRegistration, RegistrationModel>("Registration", RegistrationSchema);

export default Registration;

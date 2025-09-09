import mongoose, { Schema, model, models } from "mongoose";

const RegistrationSchema = new Schema({
  fullName: String,
  email: String,
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
  uploadId: String, // You can later store file URL here
}, { timestamps: true });

export default models.Registration || model("Registration", RegistrationSchema);

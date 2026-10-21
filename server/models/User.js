import mongoose from 'mongoose'

const educationSchema = new mongoose.Schema(
  {
    universityName: String,
    degree: String,
    major: String,
    startDate: String,
    endDate: String,
    description: String,
  },
  { _id: false }
)

const experienceSchema = new mongoose.Schema(
  {
    title: String,
    companyName: String,
    city: String,
    state: String,
    startDate: String,
    endDate: String,
    currentlyWorking: Boolean,
    workSummery: String,
  },
  { _id: false }
)

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    rating: { type: Number, default: 0 },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    personalInfo: {
      firstName: String,
      lastName: String,
      phone: String,
      address: String,
      jobTitle: String,
    },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    skills: { type: [skillSchema], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)

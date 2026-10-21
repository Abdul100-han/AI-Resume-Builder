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

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled Resume', trim: true },
    resumeId: { type: String, required: true },
    themeColor: String,
    firstName: String,
    lastName: String,
    jobTitle: String,
    address: String,
    phone: String,
    email: String,
    summery: String,
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    skills: { type: [skillSchema], default: [] },
  },
  { timestamps: true }
)

resumeSchema.index({ user: 1, resumeId: 1 }, { unique: true })

export default mongoose.model('Resume', resumeSchema)

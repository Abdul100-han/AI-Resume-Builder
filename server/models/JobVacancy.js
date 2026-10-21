import mongoose from 'mongoose'

const jobVacancySchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requiredSkills: { type: [String], default: [] },
    postedDate: { type: Date, default: Date.now },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export default mongoose.model('JobVacancy', jobVacancySchema)

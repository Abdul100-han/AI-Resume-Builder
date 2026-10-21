import mongoose from 'mongoose'

const connectDB = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error('MONGO_URI is not set. Copy server/.env.example to server/.env.')
  }

  await mongoose.connect(uri)
  console.log('MongoDB connected')
}

export default connectDB

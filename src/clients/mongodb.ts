import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      autoCreate: true,
      user: '',
      pass: '',
      dbName: 'visa',
    });

    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Could not connect to MongoDB', err);
    process.exit(1); // Exit with failure code
  }
};

export default connectDB;

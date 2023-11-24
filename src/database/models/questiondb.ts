import mongoose, { Schema } from 'mongoose';

export interface QuestionDb {
  id: string;
  value: string;
  type: 'project' | 'general';
}

const questionSchema: Schema = new Schema({
  value: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});
questionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});
const Questions = mongoose.model<QuestionDb>('Questions', questionSchema);
export default Questions;

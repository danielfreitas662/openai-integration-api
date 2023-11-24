import mongoose, { Schema } from 'mongoose';

export type ApplicantType = 'BP' | 'PP';
export type QuestionType = 'general' | 'project';

export interface Context {
  question: string;
  answer: string;
  questionType: QuestionType;
  questionId: string;
  projectIndex: number | null;
}
export type ContentType = 'section' | 'topic' | 'subtopic';

export interface Content {
  index: number;
  text: string;
  type: ContentType;
}

export interface Summary {
  index: number;
  title: string;
  topics: string[];
  developed: boolean;
}

export interface Applicant {
  id?: string;
  name: string;
  type: ApplicantType;
  fileId: string[];
  context: Context[];
  businessOptions: string[];
  choosenOption: string;
  summary: Summary[];
  content: Content[];
}

const applicantSchema: Schema = new Schema({
  name: String,
  type: String,
  fileId: [String],
  context: [{ question: String, answer: String, questionType: String, questionId: String, projectIndex: Number }],
  businessOptions: [String],
  choosenOption: String,
  summary: [{ index: Number, title: String, topics: [String], developed: Boolean }],
  content: [{ index: Number, text: String, type: String }],
});
applicantSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});
const Applicants = mongoose.model<Applicant>('Applicants', applicantSchema);
export default Applicants;

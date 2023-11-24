import Questions from '../database/models/questiondb';
import Applicants, { Applicant, Summary } from '../database/models/applicant';

export default class RepositoryService {
  /* async CreateThread(title: string, threadId: string) {
    const thread = await Threads.create({
      title: title,
      threadId: threadId,
      dateCreated: new Date(),
      lastModified: new Date(),
    });
    return thread;
  }

  async StoreAnswers(answers: AnswerCreate[], threadId: string) {
    const thread = await Threads.findById(threadId);
    const questions = await Questions.find();
    answers.forEach(async (element) => {
      const question = questions.find((c) => c.id === element.id);
      if (question) await Answers.create({ question: question, value: element.value, thread: thread });
    });
  }
*/
  async getQuestions() {
    const questions = await Questions.find();
    return questions;
  }
  /*
  async GetThread(threadId: string) {
    const thread = await Threads.findOne({ threadId: threadId });
    return thread;
  }

  async GetThreads() {
    const threads = await Threads.find();
    return threads.sort((a, b) => a.dateCreated.getDate() - b.dateCreated.getDate());
  }

  async DeleteThread(threadId: string) {
    const query = await Threads.deleteMany({ threadId: threadId });
    console.log(query);
  }

  async StoreContent(threadId: string, topicId: string, content: Content) {
    const topic = await Topics.findById(topicId);
    if (topic) {
      await Contents.create({ text: content.text, threadId: threadId, topic: topic });
    }
  }

  async GetTopics(type: TopicType) {
    const topics = await Topics.find({ type: type }).sort({ index: 'asc' });
    return topics;
  }

  async GetTopicContent(topicId: string) {
    const topic = await Topics.findById(topicId);
    if (topic) {
      const content = await Contents.findOne({ topic });
      return content;
    }
    return null;
  }

  async GetAnswers(threadId: string) {
    const thread = await Threads.findById(threadId);
    if (thread) {
      const answers = await Answers.find({ thread: thread }).populate('question');
      return answers;
    }
    return null;
  } */
  async getApplicants() {
    const applicants = await Applicants.find();
    return applicants;
  }
  async createApplicant(applicant: Applicant) {
    const newApplicant = await Applicants.create(applicant);
    newApplicant.save();
    return newApplicant;
  }
  async updateApplicantForm(applicant: Applicant) {
    const updatedApplicant = await Applicants.findById(applicant.id);
    if (updatedApplicant) {
      updatedApplicant.name = applicant.name;
      updatedApplicant.type = applicant.type;
      updatedApplicant.context = applicant.context;
      await updatedApplicant.save();
      return updatedApplicant;
    }
  }
  async updateApplicantOptions(id: string, options: string[]) {
    const applicant = await Applicants.findById(id);
    if (applicant) {
      applicant.businessOptions = options;
      await applicant.save();
    }
  }
  async updateApplicantSummary(id: string, summary: Summary[]) {
    const applicant = await Applicants.findById(id);
    if (applicant) {
      applicant.summary = summary;
      await applicant.save();
    }
  }
  async getApplicant(applicantId: string) {
    const applicant = await Applicants.findOne({ _id: applicantId });
    return applicant;
  }
  async storeOptions(applicantId: string, options: string[]) {
    const applicant = await Applicants.findById(applicantId);
    if (applicant) {
      applicant.businessOptions = options;
      applicant.save();
    }
  }
  async setBusinessOption(applicantId: string, option: string) {
    const applicant = await Applicants.findById(applicantId);
    if (applicant) {
      applicant.choosenOption = option;
      await applicant.save();
      return applicant;
    }
  }
}

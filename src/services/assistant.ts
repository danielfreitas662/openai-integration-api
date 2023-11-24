import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import Applicants, { Applicant, Summary } from '../database/models/applicant';
dotenv.config();

export const RunStatus = {
  QUEUED: 'queued',
  IN_PROGRESS: 'in_progress',
  REQUIRES_ACTION: 'requires_action',
  CANCELLING: 'cancelling',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
};

export const EndStatus = [
  RunStatus.CANCELLED,
  RunStatus.REQUIRES_ACTION,
  RunStatus.FAILED,
  RunStatus.COMPLETED,
  RunStatus.EXPIRED,
];

export const PendingStatus = [RunStatus.IN_PROGRESS, RunStatus.QUEUED, RunStatus.CANCELLING];

const DEFAULT_ERROR_MESSAGE = 'Something went wrong';

const ASSISTANT_INSTRUCTIONS = `You are an expert US immigration professional. You help Brazilian clients to build a business plan to their EB-2-NIW visa application so they can permanently live in US with a green card. Every business plan is different and must be done with the information provided by the client and research made by you to base the proposal, followed by the sources of this research.
  Initially, the I will inform you the name of the applicant and pass a list of questions and answers, you'll understand the applicant background and when I say start you'll answer with the list of topics and subtopics of the business plan.
  Finally I will say the topic name and you'll develop the content for that topic. After developing every topic I'll say pass you another topic name and so on until we cover all the propposed topics.
  Make sure each topic is very detailed, infromative, technical and, if possible, more than a page length. Use statitics, data tables and whatever you think it's necessary to explain each topic.
  Make also sure that you cover the subtopics when I ask you for a topic.`;

const PROMPT_BUSINESS_IDEAS = `You are a business consultant with 20 years experience. You help companies to develop a very complete business plan from executive ideas. Your job is to receive the professional background of a person and from that information you give 3 ideias of business for that person to start.`;
const PROMPT_BUSINEES_IDEAS_REQUEST = `Give me 3 business ideias for <name> to start. The response should come in a json format like: {"ideas": ["idea1","idea2", "idea3"]}. The user will send some questions answered by <name> for you to understand the whole professional background`;
const PROMPT_BUSINEES_SUMMARY = `You are a business consultant with 20 years experience. You help companies to develop a very complete business plan from executive ideas. Your job is to receive the professional background of a person and the idea of the business to start. From the received information you'll build a business plan list of topics and subtopics to be developed later on.`;
const PROMPT_BUSINEES_SUMMARY_REQUEST = `Give the list of business plan document topics for the following business: <business>. The response should come in a json format like: {"sections": [{"index": 0, "title": "Topic one title", "topics": ["subtopic 1", "subtopic 2"]}]}. The user will send some questions answered by <name> for you to understand the whole professional background of the applicant`;
const PROMPT_BUSINESS_CONTENT = `You are a business consultant with 20 years experience. You help companies to develop a very complete business plan from executive ideas. Your job is to receive the professional background of a person from the user to understand all you need about the applicant. When requested to develop a topic from a business plan document structure (summary), you always develop a very rich text with tables, don't repeat content and never being redundant.`;
const PROMPT_BUSINESS_CONTENT_REQUEST = `Develop the section and its subtopics: <section>, from <name> business plan of name <business>. It should fill from 1 to 2 pages if you think it's necessary and the response should be in json format like this example: {"content":[{"text": "all developed content goes here", "contentType": "section, topic or subtopic"}]}. Use your browsing tool to look for interesting statistics and data to fill this section`;
interface SummaryResult {
  sections: Summary[];
}

export default class Assistant {
  private openai: OpenAI;
  private assistantId: string;
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      defaultHeaders: {
        'OpenAI-Beta': 'assistants=v1',
      },
    });
    this.assistantId = 'asst_DDACCJc7BR6MKpBC26OWLHRZ';
  }

  async generateSectionContent(applicant: Applicant, sectionName: string) {
    const section = applicant.summary.find((c) => c.title === sectionName);
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: PROMPT_BUSINESS_CONTENT },
      { role: 'user', content: `Applicant background information in a json format: ${JSON.stringify(applicant)}` },
      {
        role: 'user',
        content: PROMPT_BUSINESS_CONTENT_REQUEST.replace(/<section>/g, JSON.stringify(section))
          .replace(/<name>/g, applicant.name)
          .replace(/<business>/g, applicant.choosenOption),
      },
    ];
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: messages,
      response_format: { type: 'json_object' },
    });
    console.log(completion);
    console.log(completion.choices[0].message);

    return JSON.parse(completion.choices[0].message.content!);
  }

  async getBusinessOptions(applicant: Applicant) {
    const { name, context } = applicant;
    const prompt: ChatCompletionMessageParam[] = [];
    prompt.push({ content: PROMPT_BUSINESS_IDEAS, role: 'system' });
    prompt.push({ content: PROMPT_BUSINEES_IDEAS_REQUEST.replace(/<name>/g, name), role: 'user' });
    context.forEach((c, index) => {
      prompt.push({ content: `Question ${index + 1}: ${c.question}`, role: 'user' });
      prompt.push({ content: `Answer for question ${index + 1}: ${c.answer}`, role: 'user' });
    });
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: prompt,
      response_format: { type: 'json_object' },
    });
    return (JSON.parse(completion.choices[0].message.content!) as { ideas: string[] }).ideas;
  }

  async generateSummary(applicant: Applicant) {
    const { name, context } = applicant;
    const prompt: ChatCompletionMessageParam[] = [];
    prompt.push({ content: PROMPT_BUSINEES_SUMMARY, role: 'system' });
    prompt.push({
      content: PROMPT_BUSINEES_SUMMARY_REQUEST.replace(/<name>/g, name).replace(/<business>/g, applicant.choosenOption),
      role: 'user',
    });
    context.forEach((c, index) => {
      prompt.push({ content: `Question ${index + 1}: ${c.question}`, role: 'user' });
      prompt.push({ content: `Answer for question ${index + 1}: ${c.answer}`, role: 'user' });
    });
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: prompt,
      response_format: { type: 'json_object' },
    });
    console.log(completion.choices[0].message.content!);
    return (JSON.parse(completion.choices[0].message.content!) as SummaryResult).sections;
  }
}

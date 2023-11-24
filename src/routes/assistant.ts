import express from 'express';
import Assistant from '../services/assistant';
import RepositoryService from '../services/repositoryService';
import { Applicant } from '../database/models/applicant';

const router = express.Router();

const assistant = new Assistant();
const repo = new RepositoryService();

router.get('/businessoptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const applicant = await repo.getApplicant(id);
    if (applicant) {
      const ideas = await assistant.getBusinessOptions(applicant);
      await repo.updateApplicantOptions(id, ideas);
      res.json(ideas);
    } else {
      res.status(400).send('Something went wrong');
    }
  } catch (err) {
    res.status(400).send();
  }
});

router.post('/businessoptions/choose/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const option = req.body.option;
    const applicant = await repo.setBusinessOption(id, option);
    res.json(applicant);
  } catch (err) {
    res.status(400).send();
  }
});

router.get('/applicants', async (req, res) => {
  try {
    const applicants = await repo.getApplicants();
    res.json(applicants);
  } catch (err) {
    res.status(400).send();
  }
});

router.post('/applicant', async (req, res) => {
  try {
    const applicant = req.body as Applicant;
    const newApplicant = await repo.createApplicant(applicant);
    res.json(newApplicant);
  } catch (err) {
    res.status(400).send();
  }
});

router.post('/applicant/form', async (req, res) => {
  try {
    const applicant = req.body as Applicant;
    const updateApplicant = await repo.updateApplicantForm(applicant);
    res.json(updateApplicant);
  } catch (err) {
    res.status(400).send();
  }
});

router.get('/applicant/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const applicant = await repo.getApplicant(id);
    res.json(applicant);
  } catch (err) {
    res.status(400).send();
  }
});

router.get('/questions', async (req, res) => {
  try {
    const questions = await repo.getQuestions();
    res.json(questions);
  } catch (err) {
    res.status(400).send();
  }
});

router.get('/summary/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const applicant = await repo.getApplicant(id);

    if (applicant) {
      const summary = await assistant.generateSummary(applicant);
      await repo.updateApplicantSummary(id, summary);
      res.json({ ...applicant, summary: summary });
    } else {
      res.status(404).send('Applicant not found');
    }
  } catch (err) {
    res.status(400).send();
  }
});

router.get('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { section } = req.query;
    const applicant = await repo.getApplicant(id);
    if (applicant) {
      const content = await assistant.generateSectionContent(applicant, section as string);
      res.json(content);
    } else {
      res.status(404).send('Applicant not found');
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

export default router;

import { Test, Question } from '@/types/models';
import * as db from '@/lib/db';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { hasTestTypeColumns } from '@/lib/ensure-test-schema';

export const testSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  courseId: z.string(),
  durationMinutes: z.number().min(5),
  totalMarks: z.number().min(1),
  passingMarks: z.number().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  // App grouping: mock / pyq / practice (Tests.type, self-healed column).
  type: z.enum(['mock', 'pyq', 'practice']).optional(),
  category: z.string().trim().max(60).optional(),
});

export async function createTest(input: any): Promise<Test> {
  const v = testSchema.parse(input);
  const data: any = { ...v };
  // Only write type/category when the self-healed columns actually exist.
  if (!(await hasTestTypeColumns())) {
    delete data.type;
    delete data.category;
  }
  return db.createTestDb({
    id: `test-${randomUUID()}`,
    ...data,
  });
}

export async function updateTest(id: string, updates: any): Promise<Test> {
  const existing = await db.findTestByIdDb(id);
  if (!existing) throw new Error(`NOT_FOUND: Test with ID '${id}' does not exist.`);
  const v = testSchema.partial().parse(updates);
  const data: any = { ...v };
  if (data.type !== undefined || data.category !== undefined) {
    if (!(await hasTestTypeColumns())) {
      delete data.type;
      delete data.category;
    }
  }
  return db.updateTestDb(id, data);
}

export async function deleteTest(id: string): Promise<boolean> {
  const existing = await db.findTestByIdDb(id);
  if (!existing) throw new Error(`NOT_FOUND: Test with ID '${id}' does not exist.`);
  return db.deleteTestDb(id);
}

export async function getTestById(id: string): Promise<Test> {
  const test = await db.findTestByIdDb(id);
  if (!test) throw new Error(`NOT_FOUND: Test with ID '${id}' does not exist.`);
  return test;
}

export async function listAllTests(): Promise<Test[]> {
  // Touch the self-heal so list rows carry type/category once available.
  await hasTestTypeColumns();
  return db.listTestsDb();
}

export async function listTestByCourse(courseId: string): Promise<Test[]> {
  const all = await db.listTestsDb();
  return all.filter((t: any) => t.courseId === courseId);
}

export const questionSchema = z.object({
  title: z.string().min(3),
  type: z.enum(['MCQ', 'MULTIPLE_CORRECT', 'SUBJECTIVE', 'NUMERICAL']),
  chapterId: z.string().optional(),
  subjectId: z.string().optional(),
  options: z.any().optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  marks: z.number().min(1),
  negativeMarks: z.number().min(0),
});

export async function createQuestion(input: any): Promise<Question> {
  const v = questionSchema.parse(input);
  return db.createQuestionDb({
    id: `q-${randomUUID()}`,
    ...v,
  });
}

export async function listQuestions(): Promise<Question[]> {
  return db.listQuestionsDb();
}

export async function updateQuestion(id: string, updates: any): Promise<Question> {
  const existing = await db.findQuestionByIdDb(id);
  if (!existing) throw new Error(`NOT_FOUND: Question with ID '${id}' does not exist.`);
  const v = questionSchema.partial().parse(updates);
  return db.updateQuestionDb(id, v);
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const existing = await db.findQuestionByIdDb(id);
  if (!existing) throw new Error(`NOT_FOUND: Question with ID '${id}' does not exist.`);
  return db.deleteQuestionDb(id);
}

export async function getQuestionById(id: string): Promise<Question> {
  const q = await db.findQuestionByIdDb(id);
  if (!q) throw new Error(`NOT_FOUND: Question with ID '${id}' does not exist.`);
  return q;
}

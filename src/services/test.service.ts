import { Test, Question } from '@/types/models';
import * as db from '@/lib/db';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const testSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  courseId: z.string(),
  durationMinutes: z.number().min(5),
  totalMarks: z.number().min(1),
  passingMarks: z.number().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export async function createTest(input: any): Promise<Test> {
  const v = testSchema.parse(input);
  return db.createTestDb({
    id: `test-${randomUUID()}`,
    ...v,
  });
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

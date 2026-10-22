import {
  Assessment,
  AssessmentAttempt,
  AssessmentResponse,
  Question,
} from '@/types/models';
import * as db from '@/lib/db';

export async function evaluateAttempt(attemptId: string): Promise<AssessmentAttempt> {
  const attempt = await db.findAssessmentAttemptDb(attemptId);
  if (!attempt) throw new Error('Attempt not found');
  if (attempt.status === 'EVALUATED') return attempt;

  const responses = await db.listAssessmentResponsesByAttemptDb(attemptId);
  const assessment = await db.findAssessmentByIdDb(attempt.assessmentId);
  if (!assessment) throw new Error('Assessment not found');

  let totalScore = 0;

  for (const response of responses) {
    const question = await db.findQuestionByIdDb(response.questionId);
    if (!question) continue;

    const evaluation = evaluateQuestion(question, response);
    totalScore += evaluation.marks;
    await db.updateAssessmentResponseDb(response.id, {
      isCorrect: evaluation.isCorrect,
      marksObtained: evaluation.marks,
    });
  }

  const updatedAttempt = await db.updateAssessmentAttemptDb(attemptId, {
    score: totalScore,
    status: 'EVALUATED',
  });

  return updatedAttempt!;
}

function evaluateQuestion(
  question: Question,
  response: AssessmentResponse
): { isCorrect: boolean; marks: number } {
  if (question.type === 'SUBJECTIVE') {
    return { isCorrect: false, marks: 0 }; // PENDING_EVALUATION logic needed
  }

  let isCorrect = false;
  if (question.type === 'MCQ' || question.type === 'MULTIPLE_CORRECT') {
    isCorrect = response.selectedOptionId === question.correctAnswer;
  } else if (question.type === 'NUMERICAL') {
    isCorrect = response.answerText === question.correctAnswer;
  }

  if (isCorrect) {
    return { isCorrect: true, marks: question.marks };
  } else {
    const marks = question.negativeMarks > 0 ? -question.negativeMarks : 0;
    return { isCorrect: false, marks: marks };
  }
}

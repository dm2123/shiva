import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: { message: 'Answers required' } }, { status: 400 });
    }

    // Check if already attempted
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM AssessmentAttempts WHERE testId = ? AND studentId = ?',
      [params.id, session.userId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: { message: 'Already attempted' } }, { status: 400 });
    }

    // Get test details
    const [tests]: any = await mysqlPool.query(
      'SELECT * FROM Tests WHERE id = ? AND isScholarshipTest = 1',
      [params.id]
    );

    if (tests.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Test not found' } }, { status: 404 });
    }

    const test = tests[0];

    // Get questions and calculate score
    const [questions]: any = await mysqlPool.query(
      'SELECT id, options, correctAnswer, marks FROM Questions WHERE testId = ?',
      [params.id]
    );

    let totalScore = 0;
    let maxScore = 0;
    const answerDetails: any[] = [];

    for (const q of questions) {
      const maxMarks = q.marks || 4;
      maxScore += maxMarks;
      const studentAnswer = answers.find((a: any) => a.questionId === q.id);

      if (studentAnswer) {
        // Parse correctAnswer - it's the option id string
        const isCorrect = String(studentAnswer.selectedOptionId) === String(q.correctAnswer);
        const marks = isCorrect ? maxMarks : 0;
        totalScore += marks;

        answerDetails.push({
          questionId: q.id,
          selectedOptionId: studentAnswer.selectedOptionId,
          isCorrect,
          marks
        });
      }
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Determine scholarship amount based on score
    let scholarshipAmount = 0;
    if (percentage >= 90) scholarshipAmount = test.scholarshipPercentage || 100;
    else if (percentage >= 75) scholarshipAmount = Math.round((test.scholarshipPercentage || 100) * 0.75);
    else if (percentage >= 60) scholarshipAmount = Math.round((test.scholarshipPercentage || 100) * 0.5);

    // Save attempt
    const attemptId = uuid();
    await mysqlPool.query(
      `INSERT INTO AssessmentAttempts (id, testId, studentId, score, totalMarks, percentage, answers, completedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [attemptId, params.id, session.userId, totalScore, maxScore, percentage, JSON.stringify(answerDetails)]
    );

    // Award XP based on performance
    const xpEarned = Math.round(totalScore * 2);
    if (xpEarned > 0) {
      await mysqlPool.query(
        'INSERT INTO StudentXP (id, studentId, points, source, description) VALUES (?, ?, ?, ?, ?)',
        [uuid(), session.userId, xpEarned, 'SCHOLARSHIP', `Scholarship test: ${percentage}%`]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        attemptId,
        score: totalScore,
        maxScore,
        percentage,
        scholarshipAmount,
        xpEarned,
        isTop: percentage >= 90
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

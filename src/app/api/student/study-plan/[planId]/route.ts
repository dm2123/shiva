import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const planId = params.planId;

    const [plans] = await mysqlPool.execute(
      'SELECT * FROM AiStudyPlans WHERE id = ? AND studentId = ?',
      [planId, session.userId]
    );

    if ((plans as any[]).length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const [tasks] = await mysqlPool.execute(
      'SELECT * FROM AiStudyPlanTasks WHERE planId = ? ORDER BY dayNumber ASC',
      [planId]
    );

    return NextResponse.json({
      plan: (plans as any[])[0],
      tasks
    });
  } catch (error) {
    if ((error as any).name === 'AuthError') return NextResponse.json({ error: (error as any).message }, { status: (error as any).statusCode || 401 });
    console.error('Study Plan Detail GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { taskId, isCompleted } = await request.json();
    const planId = params.planId;

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    await mysqlPool.execute(
      'UPDATE AiStudyPlanTasks SET completed = ? WHERE id = ? AND planId = ?',
      [isCompleted, taskId, planId]
    );

    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    if ((error as any).name === 'AuthError') return NextResponse.json({ error: (error as any).message }, { status: (error as any).statusCode || 401 });
    console.error('Study Plan PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
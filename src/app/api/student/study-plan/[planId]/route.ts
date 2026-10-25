import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { ensureStudyPlanSchema } from '@/lib/ensure-study-plan-schema';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    await ensureStudyPlanSchema();
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

    // Web ka StudyPlanGenerator task.isCompleted + task.description
    // padhta hai, jabki table me completed (TINYINT) + topic hain —
    // alias na ho to checkbox kabhi completed nahi dikhta aur
    // description khaali rehta. Asal fields bhi saath rehte hain.
    const mappedTasks = (tasks as any[]).map((t) => ({
      ...t,
      isCompleted: t.completed === 1 || t.completed === true,
      description: t.topic ?? null,
    }));

    return NextResponse.json({
      plan: (plans as any[])[0],
      tasks: mappedTasks
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
    await ensureStudyPlanSchema();
    const { taskId, isCompleted } = await request.json();
    const planId = params.planId;

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // GET wali ownership check yahan bhi: koi student doosre ke plan
    // ka task toggle na kar sake (pehle sirf taskId+planId kaafi tha).
    const [plans] = await mysqlPool.execute(
      'SELECT id FROM AiStudyPlans WHERE id = ? AND studentId = ?',
      [planId, session.userId]
    );
    if ((plans as any[]).length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
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
import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export const dynamic = 'force-dynamic';

function predictRank(percentile: number): { min: number; max: number } {
  const totalCandidates = 1500000;

  if (percentile >= 99.5) return { min: 100, max: 500 };
  if (percentile >= 99) return { min: 1000, max: 5000 };
  if (percentile >= 98) return { min: 5000, max: 15000 };
  if (percentile >= 97) return { min: 15000, max: 30000 };
  if (percentile >= 95) return { min: 30000, max: 75000 };
  if (percentile >= 93) return { min: 75000, max: 150000 };
  if (percentile >= 90) return { min: 150000, max: 250000 };
  if (percentile >= 85) return { min: 250000, max: 400000 };
  if (percentile >= 80) return { min: 400000, max: 550000 };
  if (percentile >= 70) return { min: 550000, max: 700000 };
  if (percentile >= 60) return { min: 700000, max: 900000 };
  return { min: 900000, max: totalCandidates };
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, UserRole.STUDENT);

  try {
    const [rows] = await mysqlPool.query(
      'SELECT * FROM RankPredictions WHERE studentId = ? ORDER BY createdAt DESC',
      [auth.userId]
    );
    return NextResponse.json({ predictions: rows });
  } catch (error) {
    if ((error as any).name === 'AuthError') return NextResponse.json({ error: (error as any).message }, { status: (error as any).statusCode || 401 });
    console.error('Error fetching rank predictions:', error);
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, UserRole.STUDENT);

  try {
    const { exam, score, percentile } = await request.json();

    if (!exam || !score || !percentile) {
      return NextResponse.json({ error: 'exam, score, and percentile are required' }, { status: 400 });
    }

    const predicted = predictRank(percentile);

    await mysqlPool.query(
      'INSERT INTO RankPredictions (studentId, exam, score, percentile, predictedRankMin, predictedRankMax) VALUES (?, ?, ?, ?, ?, ?)',
      [auth.userId, exam, score, percentile, predicted.min, predicted.max]
    );

    return NextResponse.json({
      prediction: {
        exam,
        score,
        percentile,
        predictedRankMin: predicted.min,
        predictedRankMax: predicted.max,
      },
    });
  } catch (error) {
    if ((error as any).name === 'AuthError') return NextResponse.json({ error: (error as any).message }, { status: (error as any).statusCode || 401 });
    console.error('Error predicting rank:', error);
    return NextResponse.json({ error: 'Failed to predict rank' }, { status: 500 });
  }
}

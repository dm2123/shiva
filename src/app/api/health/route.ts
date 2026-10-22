import { NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';

const startedAt = Date.now();

export async function GET() {
  try {
    const started = Date.now();
    const [rows]: any = await mysqlPool.query(`
      SELECT
        (SELECT COUNT(*) FROM Courses) AS courses,
        (SELECT COUNT(*) FROM Users) AS users,
        (SELECT COUNT(*) FROM Batches) AS batches,
        (SELECT COUNT(*) FROM StudentEnrollments) AS enrollments,
        (SELECT COUNT(*) FROM Orders) AS orders
    `);
    const dbLatencyMs = Date.now() - started;

    return NextResponse.json({
      status: 'ok',
      database: { connected: true, latencyMs: dbLatencyMs },
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      counts: rows[0],
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'degraded',
      database: { connected: false, error: error?.message || 'DB unreachable' },
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
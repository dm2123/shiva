const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

export async function sendTelegramNotification(message: string, chatId?: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    return { success: false, error: 'Bot token not configured' };
  }

  const targetChatId = chatId || TELEGRAM_CHAT_ID;
  if (!targetChatId) {
    return { success: false, error: 'Chat ID not configured' };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    const data = await response.json();
    return { success: data.ok, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function formatEnrollmentNotification(studentName: string, courseName: string): string {
  return `📚 <b>New Enrollment!</b>\n\nStudent: ${studentName}\nCourse: ${courseName}\nTime: ${new Date().toLocaleString('en-IN')}`;
}

export function formatDoubtNotification(studentName: string, doubtTitle: string, priority: string): string {
  const emoji = priority === 'URGENT' ? '🔴' : priority === 'HIGH' ? '🟠' : '🟡';
  return `${emoji} <b>New Doubt</b>\n\nStudent: ${studentName}\nTitle: ${doubtTitle}\nPriority: ${priority}`;
}

export function formatPaymentNotification(studentName: string, amount: number, courseName: string): string {
  return `💰 <b>Payment Received!</b>\n\nStudent: ${studentName}\nAmount: ₹${amount}\nCourse: ${courseName}`;
}

export function formatLiveClassNotification(teacherName: string, className: string): string {
  return `🔴 <b>Live Class Started!</b>\n\nTeacher: ${teacherName}\nClass: ${className}\nJoin now!`;
}

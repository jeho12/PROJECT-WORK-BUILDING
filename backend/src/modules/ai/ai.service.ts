import { prisma } from '../../config/database';
import { AppError } from '../../shared/AppError';
import { getAIProvider } from '../../shared/ai-provider';

interface AIReviewOutput {
  summary: string;
  evaluation: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string;
  rating: number;
}

export class AIService {
  async generateReview(
    supervisorId: string,
    studentId: string,
    month: number,
    year: number
  ) {
    // 1. Verify student assignment
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: studentId }
    });

    if (!studentProfile || studentProfile.supervisor_id !== supervisorId) {
      throw new AppError('Unauthorized: This student is not assigned to you', 403);
    }

    // 2. Fetch all locked logbook entries for the period
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const days = await prisma.logbookDay.findMany({
      where: {
        locked: true,
        date: { gte: startDate, lte: endDate },
        logbook_week: { user_id: studentId }
      },
      orderBy: { date: 'asc' },
      select: { date: true, activity: true, time_in: true, time_out: true }
    });

    if (days.length === 0) {
      throw new AppError('No submitted logbook entries found for this period', 404);
    }

    // 3. Build text dump of logbook days
    let logbookText = days
      .map(d => `[${d.date.toDateString()}] (${d.time_in || 'N/A'}–${d.time_out || 'N/A'}): ${d.activity || ''}`)
      .join('\n');

    // Truncate to max 8000 characters to optimize cost
    if (logbookText.length > 8000) {
      logbookText = logbookText.substring(0, 8000) + '\n... [truncated]';
    }

    const systemPrompt = `You are an expert academic supervisor evaluating a Nigerian university student's industrial training (SIWES) performance. Analyze the provided logbook entries and generate a structured evaluation report. Be objective, professional, and constructive. Focus on technical skills demonstrated, consistency, and professional development.`;

    const userPrompt = `
Analyze the following SIWES logbook entries for ${month}/${year} and generate a structured review:

LOGBOOK ENTRIES:
${logbookText}

Return ONLY a valid JSON object with this exact structure:
{
  "summary": "2-3 paragraph narrative summary of the student's activities and engagement",
  "evaluation": "1-2 paragraph overall performance evaluation",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": "Actionable recommendations for improvement",
  "rating": 7.5
}

The rating should be out of 10, based on: technical depth (30%), consistency (25%), variety of tasks (25%), and professionalism evident in writing (20%).
`;

    // 4. Call AI Provider
    let result: { content: string; tokensUsed: number };
    try {
      const provider = getAIProvider();
      result = await provider.generateReview(systemPrompt, userPrompt);
    } catch (err) {
      console.error('AI Provider Error:', err);
      throw new AppError('AI service temporarily unavailable. Please try again shortly.', 502);
    }

    // 5. Parse and Validate Response
    let parsed: AIReviewOutput;
    try {
      parsed = JSON.parse(result.content);
    } catch (error) {
      throw new AppError('AI service returned invalid response format. Please try again.', 502);
    }

    // 6. Save/Upsert review in Database
    const existingReview = await prisma.aIReview.findFirst({
      where: {
        student_id: studentId,
        month,
        year,
      }
    });

    if (existingReview) {
      // Update existing
      return prisma.aIReview.update({
        where: { id: existingReview.id },
        data: {
          generated_by: supervisorId,
          summary: parsed.summary,
          evaluation: parsed.evaluation,
          strengths: parsed.strengths,
          weaknesses: parsed.weaknesses,
          recommendations: parsed.recommendations,
          rating: parsed.rating,
          tokens_used: result.tokensUsed,
        }
      });
    }

    return prisma.aIReview.create({
      data: {
        student_id: studentId,
        generated_by: supervisorId,
        month,
        year,
        summary: parsed.summary,
        evaluation: parsed.evaluation,
        strengths: parsed.strengths,
        weaknesses: parsed.weaknesses,
        recommendations: parsed.recommendations,
        rating: parsed.rating,
        tokens_used: result.tokensUsed,
      }
    });
  }

  async getStudentReviews(supervisorId: string, studentId: string) {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: studentId }
    });

    if (!studentProfile || studentProfile.supervisor_id !== supervisorId) {
      throw new AppError('Unauthorized: This student is not assigned to you', 403);
    }

    return prisma.aIReview.findMany({
      where: { student_id: studentId },
      orderBy: { created_at: 'desc' }
    });
  }

  async getReview(userId: string, role: string, reviewId: string) {
    const review = await prisma.aIReview.findUnique({
      where: { id: reviewId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            student_profile: true,
          }
        },
        generated_by_user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!review) {
      throw new AppError('AI review not found', 404);
    }

    if (role === 'student' && review.student_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (role === 'supervisor') {
      const isAssigned = review.student.student_profile?.supervisor_id === userId;
      if (!isAssigned) {
        throw new AppError('Unauthorized: Student is not assigned to you', 403);
      }
    }

    return review;
  }

  async generateWeeklySummary(supervisorId: string, weekId: string) {
    // 1. Fetch the week and verify student's supervisor
    const week = await prisma.logbookWeek.findUnique({
      where: { id: weekId },
      include: {
        logbook_days: {
          orderBy: { date: 'asc' },
          select: { date: true, activity: true, time_in: true, time_out: true }
        },
        user: {
          include: { student_profile: true }
        }
      }
    });

    if (!week) {
      throw new AppError('Logbook week not found', 404);
    }

    if (week.user.student_profile?.supervisor_id !== supervisorId) {
      throw new AppError('Unauthorized: This student is not assigned to you', 403);
    }

    // 2. Build text dump of logbook days
    const activeDays = week.logbook_days.filter(d => d.activity);
    let logbookText = activeDays
      .map(d => `[${d.date.toDateString()}]: ${d.activity}`)
      .join('\n');

    if (!logbookText) {
      logbookText = 'No tasks or log entries filled by student for this week.';
    }

    const systemPrompt = `You are an expert academic supervisor evaluating a Nigerian university student's industrial training (SIWES) performance. Analyze the provided weekly logbook entries and generate a structured evaluation report. Be objective, professional, and constructive.`;

    const userPrompt = `
Analyze the following SIWES logbook entries for Week ${week.week_number} (from ${week.week_start_date.toDateString()} to ${week.week_end_date.toDateString()}):

LOGBOOK ENTRIES:
${logbookText}

Return ONLY a valid JSON object with this exact structure:
{
  "summary": "1-2 paragraph narrative summary of the student's activities and performance this week",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": "Actionable recommendations for next week",
  "rating": 7.5
}

The rating should be out of 10.
`;

    // 3. Call AI Provider
    let result;
    try {
      const provider = getAIProvider();
      result = await provider.generateReview(systemPrompt, userPrompt);
    } catch (err) {
      console.error('AI Provider Error:', err);
      throw new AppError('AI service temporarily unavailable. Please try again shortly.', 502);
    }

    // 4. Parse and Validate Response
    let parsed;
    try {
      parsed = JSON.parse(result.content);
    } catch (error) {
      throw new AppError('AI service returned invalid response format. Please try again.', 502);
    }

    // 5. Structure for frontend
    return {
      id: `air-w-${week.id}-${Date.now()}`,
      studentId: week.user_id,
      studentName: week.user.name,
      period: `Week ${week.week_number} (${week.week_start_date.toISOString().split('T')[0]} to ${week.week_end_date.toISOString().split('T')[0]})`,
      summary: parsed.summary,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      recommendations: parsed.recommendations,
      rating: parsed.rating || 0.0,
      generatedAt: new Date().toISOString()
    };
  }
}

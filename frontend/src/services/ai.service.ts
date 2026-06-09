import { AIReview } from '@/types/review.types';
import api from '@/lib/axios';

const mapBackendReviewToFrontend = (r: any): AIReview => {
  let strengthsList: string[] = [];
  if (Array.isArray(r.strengths)) {
    strengthsList = r.strengths;
  } else if (typeof r.strengths === 'string') {
    try {
      strengthsList = JSON.parse(r.strengths);
    } catch {
      strengthsList = [];
    }
  }

  let weaknessesList: string[] = [];
  if (Array.isArray(r.weaknesses)) {
    weaknessesList = r.weaknesses;
  } else if (typeof r.weaknesses === 'string') {
    try {
      weaknessesList = JSON.parse(r.weaknesses);
    } catch {
      weaknessesList = [];
    }
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = r.month ? months[r.month - 1] : undefined;
  const periodStr = monthName && r.year ? `${monthName} ${r.year}` : (r.period || 'Weekly Review');

  return {
    id: r.id,
    studentId: r.student_id,
    studentName: r.student?.name || 'Student',
    period: periodStr,
    summary: r.summary,
    strengths: strengthsList,
    weaknesses: weaknessesList,
    recommendations: r.recommendations,
    rating: r.rating,
    generatedAt: r.created_at || new Date().toISOString()
  };
};

export const aiService = {
  getReviews: async (studentId: string): Promise<AIReview[]> => {
    const response = await api.get(`/ai/reviews/${studentId}`);
    const list = response.data.data || [];
    return list.map(mapBackendReviewToFrontend);
  },

  generateSummary: async (weekId: string): Promise<AIReview> => {
    const response = await api.post(`/ai/weeks/${weekId}/summary`);
    return mapBackendReviewToFrontend(response.data.data);
  },

  generateMonthlyReview: async (studentId: string, month: number, year: number): Promise<AIReview> => {
    const response = await api.post('/ai/generate-review', {
      student_id: studentId,
      month,
      year
    });
    return mapBackendReviewToFrontend(response.data.data);
  }
};

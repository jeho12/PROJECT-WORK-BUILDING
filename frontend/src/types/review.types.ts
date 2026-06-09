export interface AIReview {
  id: string;
  studentId: string;
  studentName: string;
  period: string; // e.g. "June 2026"
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string;
  rating: number; // e.g. 8.2
  generatedAt: string;
}

import OpenAI from 'openai';
import { env } from '../config/env';

export interface AIProvider {
  generateReview(systemPrompt: string, userPrompt: string): Promise<{
    content: string;
    tokensUsed: number;
  }>;
}

export class OpenAIProvider implements AIProvider {
  private openai: OpenAI | null = null;

  constructor() {
    if (env.OPENAI_API_KEY && !env.OPENAI_API_KEY.startsWith('sk-placeholder')) {
      this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
  }

  async generateReview(systemPrompt: string, userPrompt: string) {
    if (!this.openai) {
      throw new Error('OpenAI key is placeholder');
    }

    const response = await this.openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      max_tokens: Number(env.OPENAI_MAX_TOKENS),
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    return {
      content: response.choices[0].message.content || '',
      tokensUsed: response.usage?.total_tokens || 0,
    };
  }
}

export class MockAIProvider implements AIProvider {
  async generateReview(systemPrompt: string, userPrompt: string) {
    // Wait briefly to simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockContent = JSON.stringify({
      summary: "During this monthly SIWES period, the student demonstrated consistent engagement in software engineering activities, including frontend components styling and backend REST APIs prototyping. They effectively applied knowledge of react state management and database migrations.",
      evaluation: "The student exhibits strong technical aptitude and is eager to take on new programming assignments. They consistently documented daily log hours and communicated changes clearly.",
      strengths: [
        "Strong understanding of component-based state design",
        "Clear and structured documentation of daily logs",
        "Proactive technical learning"
      ],
      weaknesses: [
        "Could improve on query optimizations",
        "Punctuality in locking logs could be improved"
      ],
      recommendations: "We recommend that the student continues to work on backend integration tasks and explores advanced caching concepts to optimize data fetching times.",
      rating: 8.5
    });

    return {
      content: mockContent,
      tokensUsed: 120,
    };
  }
}

export function getAIProvider(): AIProvider {
  if (env.OPENAI_API_KEY && !env.OPENAI_API_KEY.startsWith('sk-placeholder')) {
    return new OpenAIProvider();
  }
  return new MockAIProvider();
}

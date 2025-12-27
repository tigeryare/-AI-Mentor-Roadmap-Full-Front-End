
export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface Project {
  title: string;
  desc: string;
  learningOutcomes: string[];
  techFocus: string[];
  challenges: string[];
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: Difficulty;
  topics: string[];
  projects: Project[];
  category: 'foundations' | 'frontend' | 'ai' | 'integration' | 'career';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface User {
  username: string;
  email: string;
  joinedDate: string;
  claimedChests: string[]; // Module IDs where the reward was claimed
  password?: string; // Stored for mock verification
}

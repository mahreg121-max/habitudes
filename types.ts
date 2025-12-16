export type AreaOfLife = 'Health' | 'Career' | 'Spirituality' | 'Relationships' | 'Finances' | 'Creativity';

export interface Habit {
  id: string;
  title: string;
  description: string;
  area: AreaOfLife;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedDates: string[]; // ISO date strings YYYY-MM-DD
  createdAt: string;
  emoji: string;
}

export interface UserStats {
  level: number;
  xp: number; // total XP
  areaXP: Record<AreaOfLife, number>;
}

export const AREA_COLORS: Record<AreaOfLife, string> = {
  Health: 'text-sage bg-sage/10 border-sage',
  Career: 'text-dustyblue bg-dustyblue/10 border-dustyblue',
  Spirituality: 'text-lavender bg-lavender/10 border-lavender',
  Relationships: 'text-terracotta bg-terracotta/10 border-terracotta',
  Finances: 'text-mustard bg-mustard/10 border-mustard',
  Creativity: 'text-pink-500 bg-pink-100 border-pink-300',
};

export const AREA_EMOJIS: Record<AreaOfLife, string> = {
  Health: '🌿',
  Career: '📘',
  Spirituality: '✨',
  Relationships: '💞',
  Finances: '🪙',
  Creativity: '🎨',
};
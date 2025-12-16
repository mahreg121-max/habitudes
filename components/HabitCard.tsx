import React from 'react';
import { Habit, AREA_COLORS } from '../types';
import { Check, Flame } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  isCompletedToday: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, isCompletedToday }) => {
  const areaStyle = AREA_COLORS[habit.area] || 'text-gray-600 bg-gray-100 border-gray-300';

  return (
    <div 
      className={`
        relative group overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg
        ${isCompletedToday ? 'border-green-400 bg-green-50/50' : 'border-stone-200 bg-white'}
      `}
    >
      <div className="p-5 flex items-start justify-between gap-4">
        
        {/* Left: Content */}
        <div className="flex-1">
          <div className={`
            inline-block px-2 py-0.5 rounded-full text-xs font-bold tracking-wide mb-2 border
            ${areaStyle}
          `}>
            {habit.area.toUpperCase()}
          </div>
          <h3 className={`font-serif text-xl font-medium leading-tight ${isCompletedToday ? 'text-green-800 line-through decoration-green-400/50' : 'text-stone-800'}`}>
            {habit.title}
          </h3>
          <p className="text-stone-500 text-sm mt-1 font-sans">{habit.description}</p>
          
          <div className="flex items-center gap-2 mt-3 text-stone-400 text-xs font-semibold">
            <span className="flex items-center gap-1">
              <Flame size={14} className={habit.streak > 0 ? 'text-orange-400 fill-orange-400' : ''} />
              {habit.streak} Day Streak
            </span>
          </div>
        </div>

        {/* Right: Action Button */}
        <button
          onClick={() => onToggle(habit.id)}
          className={`
            flex-shrink-0 w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300
            ${isCompletedToday 
              ? 'bg-green-500 border-green-500 text-white rotate-0' 
              : 'bg-stone-50 border-stone-200 text-stone-300 hover:border-green-300 hover:text-green-300 hover:bg-green-50'
            }
          `}
        >
          {isCompletedToday ? <Check size={28} strokeWidth={3} /> : <span className="text-2xl filter grayscale opacity-60">{habit.emoji}</span>}
        </button>
      </div>
      
      {/* Decorative background element for completed cards */}
      {isCompletedToday && (
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-100 rounded-full opacity-50 blur-xl pointer-events-none"></div>
      )}
    </div>
  );
};

export default HabitCard;
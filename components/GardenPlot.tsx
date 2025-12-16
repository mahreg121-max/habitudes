import React from 'react';
import { Habit } from '../types';
import { Flower, TreeDeciduous, Sprout, Clover } from 'lucide-react';

interface GardenPlotProps {
  habits: Habit[];
}

const GardenPlot: React.FC<GardenPlotProps> = ({ habits }) => {
  // Determine plant stage based on streak
  const getPlantIcon = (habit: Habit) => {
    const streak = habit.streak;
    const colorClass = `text-${habit.area === 'Health' ? 'green' : habit.area === 'Career' ? 'blue' : 'orange'}-500`; // simplified mapping for demo

    if (streak === 0) return <div className="w-2 h-2 rounded-full bg-stone-300" />;
    if (streak < 3) return <Sprout className="text-green-400 w-6 h-6 animate-pulse" />;
    if (streak < 7) return <Clover className="text-emerald-500 w-8 h-8" />;
    if (streak < 21) return <Flower className="text-pink-400 w-10 h-10" />;
    return <TreeDeciduous className="text-green-700 w-12 h-12" />;
  };

  return (
    <div className="bg-white border-2 border-stone-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-stone-100"></div> {/* decorative top bar */}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl text-stone-800">My Life Garden</h2>
        <span className="text-xs font-sans bg-stone-100 text-stone-500 px-2 py-1 rounded-md">
          {habits.filter(h => h.streak > 0).length} Active Plants
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 min-h-[160px] content-center justify-items-center bg-stone-50 rounded-xl p-4 border border-dashed border-stone-300 relative">
         {/* Soil texture overlay */}
         <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        {habits.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-stone-400 py-8">
            <Sprout size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Plant your first seed...</p>
          </div>
        ) : (
          habits.map((habit) => (
            <div key={habit.id} className="flex flex-col items-center group relative cursor-help">
              <div className="transition-transform duration-500 transform hover:scale-110">
                 {getPlantIcon(habit)}
              </div>
              {habit.streak > 0 && (
                <div className="w-8 h-1 bg-stone-200 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${Math.min(100, (habit.streak / 30) * 100)}%` }}
                  />
                </div>
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-max px-2 py-1 bg-stone-800 text-stone-50 text-xs rounded shadow-lg pointer-events-none">
                {habit.title} ({habit.streak} days)
              </div>
            </div>
          ))
        )}
      </div>
      <p className="text-center text-stone-400 text-xs italic mt-4 font-serif">
        "Consistenty is the water that helps us grow."
      </p>
    </div>
  );
};

export default GardenPlot;
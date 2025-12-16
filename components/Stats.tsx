import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, Tooltip
} from 'recharts';
import { AreaOfLife, Habit, UserStats, AREA_COLORS } from '../types';

interface StatsProps {
  stats: UserStats;
  habits: Habit[];
}

const Stats: React.FC<StatsProps> = ({ stats, habits }) => {
  
  const radarData = Object.keys(stats.areaXP).map(area => ({
    subject: area,
    A: stats.areaXP[area as AreaOfLife] || 0,
    fullMark: 100, // Normalized for chart
  }));

  const streakData = habits
    .filter(h => h.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5) // Top 5
    .map(h => ({
      name: h.title.length > 10 ? h.title.substring(0, 8) + '..' : h.title,
      streak: h.streak,
      fill: '#84a98c' // sage
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Balance Chart */}
      <div className="bg-white p-6 rounded-2xl border-2 border-stone-200 shadow-sm flex flex-col items-center">
        <h3 className="font-serif text-xl text-stone-700 mb-2">Life Balance</h3>
        <p className="text-xs text-stone-400 mb-4">Are you nurturing all areas?</p>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e5e5e5" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#78716c', fontSize: 10, fontFamily: 'sans-serif' }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar
                name="Growth"
                dataKey="A"
                stroke="#e76f51"
                fill="#e76f51"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Streaks */}
      <div className="bg-white p-6 rounded-2xl border-2 border-stone-200 shadow-sm flex flex-col items-center">
        <h3 className="font-serif text-xl text-stone-700 mb-2">Strongest Roots</h3>
        <p className="text-xs text-stone-400 mb-4">Your most consistent habits</p>
        
        {streakData.length > 0 ? (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streakData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" hide />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="streak" radius={[0, 4, 4, 0]} barSize={20} fill="#84a98c" background={{ fill: '#f5f5f4' }} />
                {/* Custom Y Axis could be added here if we want labels on the left */}
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-[-200px] pointer-events-none pl-2">
                {streakData.map((d, i) => (
                    <div key={i} className="text-xs text-stone-600 font-bold h-[45px] flex items-center">
                        {d.name} <span className="text-stone-400 ml-1 font-normal">({d.streak}d)</span>
                    </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-stone-400 text-sm italic">
            Start a streak to see it here!
          </div>
        )}
      </div>

      {/* Level Card */}
      <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-stone-100 to-stone-50 p-6 rounded-2xl border border-stone-200 flex items-center justify-between">
         <div>
            <h3 className="font-serif text-2xl text-stone-800">Gardener Level {stats.level}</h3>
            <p className="text-stone-500 text-sm">Total Growth: {stats.xp} XP</p>
         </div>
         <div className="text-4xl">🌻</div>
      </div>
    </div>
  );
};

export default Stats;
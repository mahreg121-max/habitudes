import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Settings, BookOpen, BarChart2, Home, MessageCircleHeart, X, Sparkles, Loader2 
} from 'lucide-react';
import HabitCard from './components/HabitCard';
import GardenPlot from './components/GardenPlot';
import Stats from './components/Stats';
import { Habit, AreaOfLife, UserStats, AREA_EMOJIS } from './types';
import { suggestHabits, getDailyWisdom, chatWithCoach } from './services/geminiService';

// Initial Data
const INITIAL_HABITS: Habit[] = [
  {
    id: '1',
    title: 'Morning Gratitude',
    description: 'Write down 3 things I am thankful for.',
    area: 'Spirituality',
    frequency: 'daily',
    streak: 3,
    completedDates: [],
    createdAt: new Date().toISOString(),
    emoji: '🙏'
  },
  {
    id: '2',
    title: 'Deep Work Block',
    description: '90 minutes of focused work without phone.',
    area: 'Career',
    frequency: 'daily',
    streak: 1,
    completedDates: [],
    createdAt: new Date().toISOString(),
    emoji: '💼'
  }
];

const INITIAL_STATS: UserStats = {
  level: 1,
  xp: 0,
  areaXP: {
    Health: 0,
    Career: 0,
    Spirituality: 0,
    Relationships: 0,
    Finances: 0,
    Creativity: 0
  }
};

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<'home' | 'stats' | 'coach'>('home');
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('lg_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('lg_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });
  const [dailyWisdom, setDailyWisdom] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  
  // Creation Form State
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitArea, setNewHabitArea] = useState<AreaOfLife>('Health');
  
  // Suggestion State
  const [suggestionGoal, setSuggestionGoal] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Chat State
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: "Hello dear. I'm Sage. How can I help you tend to your life garden today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('lg_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('lg_stats', JSON.stringify(stats));
  }, [stats]);

  // Fetch daily wisdom on mount if not fetched today
  useEffect(() => {
    const lastWisdomDate = localStorage.getItem('lg_last_wisdom_date');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastWisdomDate !== today) {
        const completedTodayCount = habits.filter(h => h.completedDates.includes(today)).length;
        const areasWorkedOn = Array.from(new Set(habits.filter(h => h.completedDates.includes(today)).map(h => h.area))) as AreaOfLife[];
        
        getDailyWisdom(completedTodayCount, areasWorkedOn).then(wisdom => {
            setDailyWisdom(wisdom);
            localStorage.setItem('lg_daily_wisdom', wisdom);
            localStorage.setItem('lg_last_wisdom_date', today);
        });
    } else {
        setDailyWisdom(localStorage.getItem('lg_daily_wisdom') || "Welcome back to your garden.");
    }
  }, [habits]);


  // --- Logic ---
  const today = new Date().toISOString().split('T')[0];

  const handleToggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;

      const isCompleted = h.completedDates.includes(today);
      let newStreak = h.streak;
      let newDates = h.completedDates;

      if (isCompleted) {
        // Undo complete
        newDates = h.completedDates.filter(d => d !== today);
        newStreak = Math.max(0, h.streak - 1);
        updateXP(h.area, -10);
      } else {
        // Complete
        newDates = [...h.completedDates, today];
        newStreak = h.streak + 1;
        updateXP(h.area, 10);
      }

      return { ...h, completedDates: newDates, streak: newStreak };
    }));
  };

  const updateXP = (area: AreaOfLife, amount: number) => {
    setStats(prev => {
      const newAreaXP = (prev.areaXP[area] || 0) + amount;
      const totalXP = prev.xp + amount;
      const newLevel = Math.floor(totalXP / 100) + 1;
      return {
        ...prev,
        xp: totalXP,
        level: newLevel,
        areaXP: { ...prev.areaXP, [area]: newAreaXP }
      };
    });
  };

  const addHabit = (title: string, area: AreaOfLife, description: string = '', emoji: string = '🌱') => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title,
      description,
      area,
      frequency: 'daily',
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
      emoji
    };
    setHabits([...habits, newHabit]);
    setShowAddModal(false);
    setShowSuggestModal(false);
    setNewHabitTitle('');
    setSuggestionGoal('');
    setSuggestions([]);
  };

  const handleGetSuggestions = async () => {
    if (!suggestionGoal.trim()) return;
    setIsSuggesting(true);
    const results = await suggestHabits(suggestionGoal, habits.map(h => h.title));
    setSuggestions(results);
    setIsSuggesting(false);
  };

  const handleChat = async () => {
      if(!chatInput.trim()) return;
      const userMsg = chatInput;
      setChatInput('');
      setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setIsChatting(true);

      const response = await chatWithCoach(chatHistory, userMsg);
      
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
      setIsChatting(false);
  };

  // --- Render ---
  return (
    <div className="min-h-screen pb-24 text-stone-800 font-sans selection:bg-sage/30">
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-paper/95 backdrop-blur-sm border-b border-stone-200 px-4 py-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage text-white rounded-lg flex items-center justify-center font-serif text-2xl shadow-inner">L</div>
            <div>
                <h1 className="font-serif text-2xl leading-none text-stone-800">LifeGarden</h1>
                <p className="text-xs text-stone-500 font-medium tracking-wider uppercase">{today}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
             {/* XP Pill */}
             <div className="hidden md:flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full border border-stone-200 text-xs font-bold text-stone-600">
                <span>⭐ Lvl {stats.level}</span>
                <span className="w-px h-3 bg-stone-300"></span>
                <span>{stats.xp} XP</span>
             </div>
             <button className="p-2 text-stone-400 hover:text-stone-600">
                 <Settings size={20} />
             </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* Daily Wisdom Banner */}
        {view === 'home' && dailyWisdom && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                <Sparkles className="text-amber-400 flex-shrink-0 mt-1" size={20} />
                <p className="font-serif italic text-stone-700">{dailyWisdom}</p>
            </div>
        )}

        {/* View Switcher Logic */}
        {view === 'home' && (
          <div className="space-y-8">
            <GardenPlot habits={habits} />

            <div>
              <div className="flex items-center justify-between mb-4">
                 <h2 className="font-serif text-2xl text-stone-800">Today's Tending</h2>
                 <button 
                   onClick={() => setShowAddModal(true)}
                   className="flex items-center gap-2 text-sm font-bold text-sage hover:text-green-700 transition-colors bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm hover:shadow"
                 >
                    <Plus size={16} />
                    New Seed
                 </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {habits.map(habit => (
                  <HabitCard 
                    key={habit.id} 
                    habit={habit} 
                    onToggle={handleToggleHabit} 
                    isCompletedToday={habit.completedDates.includes(today)} 
                  />
                ))}
                {habits.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl">
                        <p className="text-stone-400 mb-4">Your garden is empty.</p>
                        <button onClick={() => setShowAddModal(true)} className="bg-sage text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition-all">
                            Plant Your First Habit
                        </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'stats' && <Stats stats={stats} habits={habits} />}

        {view === 'coach' && (
          <div className="bg-white border-2 border-stone-200 rounded-2xl overflow-hidden shadow-sm h-[600px] flex flex-col">
              <div className="bg-sage/10 p-4 border-b border-stone-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-white text-xl">🧙‍♀️</div>
                  <div>
                      <h3 className="font-serif text-lg text-stone-800">Sage</h3>
                      <p className="text-xs text-stone-500">Your garden companion</p>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
                  {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                              msg.role === 'user' 
                                ? 'bg-stone-800 text-stone-50 rounded-br-none' 
                                : 'bg-white border border-stone-200 text-stone-700 rounded-bl-none shadow-sm'
                          }`}>
                              {msg.text}
                          </div>
                      </div>
                  ))}
                  {isChatting && (
                      <div className="flex justify-start">
                          <div className="bg-white border border-stone-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                              <Loader2 className="animate-spin text-sage" size={16} />
                          </div>
                      </div>
                  )}
              </div>
              <div className="p-4 bg-white border-t border-stone-100 flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Ask for advice on habits..."
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sage/50"
                  />
                  <button 
                    onClick={handleChat}
                    disabled={!chatInput.trim() || isChatting}
                    className="bg-sage text-white p-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                      <Sparkles size={20} />
                  </button>
              </div>
          </div>
        )}
      </main>

      {/* Navigation Bar (Mobile Sticky / Desktop Fixed) */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-stone-800 text-stone-300 px-6 py-3 rounded-full shadow-2xl flex items-center gap-8 border border-stone-700">
        <button 
            onClick={() => setView('home')} 
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'home' ? 'text-white' : 'hover:text-stone-100'}`}
        >
            <Home size={24} strokeWidth={view === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Garden</span>
        </button>
        <button 
            onClick={() => setView('stats')} 
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'stats' ? 'text-white' : 'hover:text-stone-100'}`}
        >
            <BarChart2 size={24} strokeWidth={view === 'stats' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Growth</span>
        </button>
        <button 
            onClick={() => setView('coach')} 
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'coach' ? 'text-white' : 'hover:text-stone-100'}`}
        >
            <MessageCircleHeart size={24} strokeWidth={view === 'coach' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Sage</span>
        </button>
      </nav>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
                <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h3 className="font-serif text-xl text-stone-800">Plant a New Seed</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    {!showSuggestModal ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-stone-600 mb-1">Habit Name</label>
                                <input 
                                    autoFocus
                                    className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-sage/50 focus:border-sage outline-none" 
                                    placeholder="e.g. Morning Walk"
                                    value={newHabitTitle}
                                    onChange={(e) => setNewHabitTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-stone-600 mb-1">Area of Life</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(AREA_EMOJIS).map((area) => (
                                        <button 
                                            key={area}
                                            onClick={() => setNewHabitArea(area as AreaOfLife)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                                                newHabitArea === area 
                                                ? 'bg-stone-800 text-white border-stone-800' 
                                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                                            }`}
                                        >
                                            {AREA_EMOJIS[area as AreaOfLife]} {area}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => addHabit(newHabitTitle, newHabitArea)}
                                    disabled={!newHabitTitle}
                                    className="flex-1 bg-sage text-white font-bold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    Plant it
                                </button>
                            </div>
                            
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-stone-200"></div>
                                <span className="flex-shrink-0 mx-4 text-stone-400 text-xs">OR</span>
                                <div className="flex-grow border-t border-stone-200"></div>
                            </div>

                            <button 
                                onClick={() => setShowSuggestModal(true)}
                                className="w-full bg-stone-100 text-stone-600 font-bold py-2 rounded-lg hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Sparkles size={16} />
                                Ask Sage for Ideas
                            </button>
                        </>
                    ) : (
                        <div className="space-y-4">
                             <p className="text-sm text-stone-500">
                                Tell me what you want to achieve (e.g. "I want to be more mindful" or "I want to save money").
                             </p>
                             <div className="flex gap-2">
                                <input 
                                    className="flex-1 border border-stone-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sage/50 outline-none" 
                                    placeholder="Your goal..."
                                    value={suggestionGoal}
                                    onChange={(e) => setSuggestionGoal(e.target.value)}
                                />
                                <button 
                                    onClick={handleGetSuggestions}
                                    disabled={!suggestionGoal || isSuggesting}
                                    className="bg-dustyblue text-white px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSuggesting ? <Loader2 className="animate-spin" size={20} /> : 'Go'}
                                </button>
                             </div>

                             <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                 {suggestions.map((s, i) => (
                                     <div key={i} className="border border-stone-200 rounded-lg p-3 hover:bg-stone-50 cursor-pointer group transition-colors" onClick={() => addHabit(s.title, s.area as AreaOfLife, s.description, s.emoji)}>
                                         <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-stone-800">{s.emoji} {s.title}</h4>
                                            <Plus size={16} className="text-stone-300 group-hover:text-sage" />
                                         </div>
                                         <p className="text-xs text-stone-500 mt-1">{s.description}</p>
                                         <span className="text-[10px] uppercase font-bold text-stone-400 mt-2 block">{s.area}</span>
                                     </div>
                                 ))}
                             </div>
                             
                             <button onClick={() => setShowSuggestModal(false)} className="text-sm text-stone-500 hover:text-stone-800 w-full text-center">
                                 Back
                             </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default App;
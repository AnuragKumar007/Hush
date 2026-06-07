import React, { useRef, useState } from 'react';
import { Search, Menu, Heart, Clock, ChefHat, HelpCircle, Lock } from 'lucide-react';

const recipes = [
  { id: 1, title: 'Avocado Toast with Poached Egg', time: '15 min', category: 'Breakfast', img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80' },
  { id: 2, title: 'Berry Smoothie Bowl', time: '10 min', category: 'Breakfast', img: 'https://images.unsplash.com/photo-1496412705862-e0088f16f791?auto=format&fit=crop&w=400&q=80' },
  { id: 3, title: 'Classic Margherita Pizza', time: '45 min', category: 'Dinner', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80' },
  { id: 4, title: 'Grilled Lemon Herb Salmon', time: '25 min', category: 'Dinner', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80' },
  { id: 5, title: 'Creamy Pasta Carbonara', time: '20 min', category: 'Dinner', img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=400&q=80' },
  { id: 6, title: 'Chicken Tikka Masala', time: '50 min', category: 'Dinner', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80' },
  { id: 7, title: 'Vegan Buddha Bowl', time: '20 min', category: 'Lunch', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
  { id: 8, title: 'Fluffy Buttermilk Pancakes', time: '25 min', category: 'Breakfast', img: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=400&q=80' },
  { id: 9, title: 'Spicy Beef Tacos', time: '30 min', category: 'Lunch', img: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=400&q=80' },
  { id: 10, title: 'Grilled Chicken Caesar Salad', time: '15 min', category: 'Lunch', img: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=400&q=80' },
  { id: 11, title: 'Chocolate Lava Cake', time: '35 min', category: 'Dessert', img: 'https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?auto=format&fit=crop&w=400&q=80' },
  { id: 12, title: 'Sushi Roll Platter', time: '60 min', category: 'Dinner', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80' },
  { id: 13, title: 'Classic Eggs Benedict', time: '30 min', category: 'Breakfast', img: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=400&q=80' },
  { id: 14, title: 'Tom Yum Soup', time: '40 min', category: 'Dinner', img: 'https://images.unsplash.com/photo-1548943487-a2e4f43b4850?auto=format&fit=crop&w=400&q=80' },
  { id: 15, title: 'Garlic Butter Shrimp Scampi', time: '15 min', category: 'Dinner', img: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?auto=format&fit=crop&w=400&q=80' }
];

export default function Camouflage({ onUnlock }) {
  const [showInfo, setShowInfo] = useState(() => !localStorage.getItem('craveable_instructions_seen'));
  const clickCountRef = useRef(0);
  const timerRef = useRef(null);

  const handleRecipeClick = () => {
    clickCountRef.current += 1;
    
    if (clickCountRef.current === 3) {
      clickCountRef.current = 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      onUnlock();
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000); // Must click 3 times within 1 second
  };

  const handleDismissInfo = () => {
    localStorage.setItem('craveable_instructions_seen', 'true');
    setShowInfo(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 text-slate-900 fixed inset-0 z-[100] overflow-hidden font-sans">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 bg-white flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <ChefHat size={28} className="text-orange-500" />
          <h1 className="text-xl font-black tracking-tight text-slate-800">Craveable</h1>
        </div>
        <button className="text-slate-600 p-2 hover:bg-slate-100 rounded-full transition">
          <Menu size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {/* Search */}
        <div className="px-5 py-6 bg-white border-b border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">What would you like to cook today?</h2>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search recipes..." 
              className="w-full bg-slate-100 text-slate-900 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium placeholder-slate-400"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-5 py-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert'].map((cat, i) => (
              <button 
                key={cat} 
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${i === 0 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <div 
              key={recipe.id} 
              onClick={handleRecipeClick}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-100 select-none active:scale-[0.98]"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img src={recipe.img} alt={recipe.title} className="w-full h-full object-cover" />
                <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                  <Heart size={18} />
                </button>
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Clock size={12} className="text-orange-500" />
                  {recipe.time}
                </div>
              </div>
              <div className="p-5">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-500 mb-1 block">
                  {recipe.category}
                </span>
                <h3 className="font-bold text-lg text-slate-900 leading-snug">
                  {recipe.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Informational Popup / Instruction Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-6">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-slate-100/50 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-4 ring-8 ring-orange-50">
              <Lock size={28} />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">Stealth Mode Active</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Welcome to <strong>Craveable</strong>! This is your camouflage screen. To access your secret chat room, <strong>tap any recipe card 3 times</strong> in quick succession.
            </p>

            <button 
              onClick={handleDismissInfo}
              className="w-full bg-orange-500 text-white rounded-2xl py-3.5 font-bold hover:bg-orange-600 transition active:scale-[0.98]"
            >
              Got it, let's go!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

interface Food {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
}

interface Meal {
  _id: string;
  mealType: string;
  foods: any[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  date: string;
}

export default function NutritionTracker() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('meals');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState<any[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterLogs, setWaterLogs] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [groceryItems, setGroceryItems] = useState<any[]>([]);
  const [supplements, setSupplements] = useState<any[]>([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAddSupplement, setShowAddSupplement] = useState(false);
  const [newGroceryItem, setNewGroceryItem] = useState('');
  const [newSupplement, setNewSupplement] = useState({ name: '', dosage: '', timeOfDay: 'morning', time: '09:00' });

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchData();
      fetchGroceryList();
      fetchSupplements();
    }
    fetchFoods();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const [mealsRes, waterRes] = await Promise.all([
        api.get(`/meals?date=${selectedDate}`),
        api.get(`/water?date=${selectedDate}`)
      ]);
      setMeals(mealsRes.data.meals || []);
      setTotals(mealsRes.data.totals || { calories: 0, protein: 0, carbs: 0, fats: 0 });
      setWaterIntake(waterRes.data.total || 0);
      setWaterLogs(waterRes.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch nutrition data:', error);
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await api.get('/foods');
      setFoods(response.data.foods || []);
    } catch (error) {
      console.error('Failed to fetch foods:', error);
    }
  };

  const fetchGroceryList = async () => {
    try {
      const response = await api.get('/grocery-list');
      setGroceryItems(response.data.list?.items || []);
    } catch (error) {
      console.error('Failed to fetch grocery list:', error);
    }
  };

  const fetchSupplements = async () => {
    try {
      const response = await api.get('/supplements');
      setSupplements(response.data.supplements || []);
    } catch (error) {
      console.error('Failed to fetch supplements:', error);
    }
  };

  const addWater = async () => {
    requireAuth(async () => {
      try {
        const response = await api.post('/water', { amount: 250 });
        setWaterIntake(response.data.todayTotal);
        toast.success('Added 250ml water! 💧');
        fetchData();
      } catch (error) {
        toast.error('Failed to add water');
      }
    }, {
      title: 'Water Tracking Requires Account',
      description: 'Sign in to record your daily hydration goals.',
      nextUrl: '/nutrition'
    });
  };

  const addToGrocery = async () => {
    if (!newGroceryItem.trim()) return;
    requireAuth(async () => {
      try {
        await api.post('/grocery-list', { items: [{ name: newGroceryItem, quantity: '1', category: 'other' }] });
        setNewGroceryItem('');
        fetchGroceryList();
        toast.success('Added to grocery list!');
      } catch (error) {
        toast.error('Failed to add item');
      }
    }, {
      title: 'Grocery List Requires Account',
      description: 'Sign in to save items to your grocery list.',
      nextUrl: '/nutrition'
    });
  };

  const addSupplement = async () => {
    requireAuth(async () => {
      try {
        await api.post('/supplements', newSupplement);
        setShowAddSupplement(false);
        setNewSupplement({ name: '', dosage: '', timeOfDay: 'morning', time: '09:00' });
        fetchSupplements();
        toast.success('Supplement reminder added!');
      } catch (error) {
        toast.error('Failed to add supplement');
      }
    }, {
      title: 'Supplement Reminders Require Account',
      description: 'Sign in to save your supplement reminders.',
      nextUrl: '/nutrition'
    });
  };

  const targetCalories = 2500;
  const targetProtein = 180;
  const targetWater = 3000;

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F9FAFB] p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => router.push('/')}
              className="text-[#FF5500] hover:text-[#E04B00] text-xs font-bold font-heading uppercase tracking-wider transition mb-2 block focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
              🥗 NUTRITION & HYDRATION
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Track caloric intake, macronutrient distribution, hydration, and supplements
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2.5 bg-[#0D1117] text-white font-bold text-xs rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            />
          </div>
        </div>

        {/* Macro & Hydration Bento Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <span className="text-[#FF5500] text-[10px] font-black uppercase tracking-wider font-heading">Energy Intake</span>
            <p className="text-2xl font-black text-white font-heading mt-2">{totals.calories} / {targetCalories} <span className="text-xs text-gray-400">KCAL</span></p>
            <div className="w-full bg-[#0D1117] rounded-full h-2 mt-3 overflow-hidden neu-inset">
              <div className="bg-[#FF5500] h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totals.calories / targetCalories) * 100)}%` }} />
            </div>
          </div>

          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <span className="text-[#FF5500] text-[10px] font-black uppercase tracking-wider font-heading">Protein Target</span>
            <p className="text-2xl font-black text-white font-heading mt-2">{totals.protein} / {targetProtein} <span className="text-xs text-gray-400">G</span></p>
            <div className="w-full bg-[#0D1117] rounded-full h-2 mt-3 overflow-hidden neu-inset">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totals.protein / targetProtein) * 100)}%` }} />
            </div>
          </div>

          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider font-heading">Hydration</span>
            <p className="text-2xl font-black text-white font-heading mt-2">{waterIntake} / {targetWater} <span className="text-xs text-gray-400">ML</span></p>
            <button 
              onClick={addWater} 
              className="mt-2 text-xs font-extrabold text-[#FF5500] hover:underline focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              + Add 250ml Glass 💧
            </button>
          </div>

          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-wider font-heading">Macronutrient Ratio</span>
            <div className="text-xs font-bold text-gray-300 space-y-1 mt-2">
              <p>🥩 Protein: <span className="text-white">{totals.protein}g</span></p>
              <p>🍚 Carbs: <span className="text-white">{totals.carbs}g</span></p>
              <p>🥑 Fats: <span className="text-white">{totals.fats}g</span></p>
            </div>
          </div>

        </div>

        {/* Tab Navigation Controls */}
        <div className="flex gap-2 border-b border-[#202938] pb-1 overflow-x-auto">
          {[
            { id: 'meals', name: '🍽️ Meals & Logs' },
            { id: 'grocery', name: '🛒 Grocery List' },
            { id: 'supplements', name: '💊 Supplements' },
            { id: 'recipes', name: '📖 Recipe Database' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-t-2xl font-bold font-heading text-xs uppercase tracking-wider transition ${
                activeTab === tab.id
                  ? 'bg-[#11161F] text-white border-t border-x border-[#202938] border-b-transparent shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-[#11161F]/50'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Meals View */}
        {activeTab === 'meals' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                const meal = meals.find(m => m.mealType === mealType);
                return (
                  <div key={mealType} className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
                    <h3 className="text-lg font-black text-white font-heading capitalize mb-2">{mealType}</h3>
                    {meal ? (
                      <div>
                        <p className="text-gray-300 text-sm font-semibold">{meal.totalCalories} kcal | {meal.totalProtein}g protein</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs italic">No entries recorded for this meal.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grocery View */}
        {activeTab === 'grocery' && (
          <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised space-y-4">
            <h2 className="text-xl font-black text-white font-heading">ATHLETIC GROCERY LIST</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newGroceryItem}
                onChange={(e) => setNewGroceryItem(e.target.value)}
                placeholder="Add item (e.g. Chicken Breast, Oats, Greek Yogurt)..."
                className="flex-1 px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset text-sm"
                onKeyPress={(e) => e.key === 'Enter' && addToGrocery()}
              />
              <button 
                onClick={addToGrocery} 
                className="px-6 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-extrabold font-heading uppercase rounded-xl transition"
              >
                Add Item
              </button>
            </div>
            <div className="space-y-2 pt-2">
              {groceryItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-xl border border-[#202938]">
                  <input type="checkbox" className="w-4 h-4 accent-[#FF5500]" />
                  <span className="text-white font-semibold text-sm flex-1">{item.name}</span>
                  <span className="text-gray-500 text-xs">{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recipes View */}
        {activeTab === 'recipes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised text-center space-y-2">
              <div className="text-4xl mb-2">🍳</div>
              <h3 className="text-white font-black font-heading text-lg">High-Protein Anabolic Bowl</h3>
              <p className="text-gray-400 text-xs">450 kcal • 42g Protein • 35g Carbs</p>
            </div>
            <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised text-center space-y-2">
              <div className="text-4xl mb-2">🥗</div>
              <h3 className="text-white font-black font-heading text-lg">Grilled Chicken Quinoa Power Salad</h3>
              <p className="text-gray-400 text-xs">520 kcal • 48g Protein • 40g Carbs</p>
            </div>
          </div>
        )}

      </div>

      <AuthModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={authConfig.title}
        description={authConfig.description}
        nextUrl={authConfig.nextUrl}
      />
    </div>
  );
}
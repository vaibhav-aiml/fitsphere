'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    fetchData();
    fetchFoods();
    fetchGroceryList();
    fetchSupplements();
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
    try {
      const response = await api.post('/water', { amount: 250 });
      setWaterIntake(response.data.todayTotal);
      toast.success('Added 250ml water! 💧');
      fetchData();
    } catch (error) {
      toast.error('Failed to add water');
    }
  };

  const addToGrocery = async () => {
    if (!newGroceryItem.trim()) return;
    try {
      await api.post('/grocery-list', { items: [{ name: newGroceryItem, quantity: '1', category: 'other' }] });
      setNewGroceryItem('');
      fetchGroceryList();
      toast.success('Added to grocery list!');
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const addSupplement = async () => {
    try {
      await api.post('/supplements', newSupplement);
      setShowAddSupplement(false);
      setNewSupplement({ name: '', dosage: '', timeOfDay: 'morning', time: '09:00' });
      fetchSupplements();
      toast.success('Supplement reminder added!');
    } catch (error) {
      toast.error('Failed to add supplement');
    }
  };

  const targetCalories = 2500;
  const targetProtein = 180;
  const targetWater = 3000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button onClick={() => router.back()} className="text-blue-500 hover:text-blue-400 transition mb-2 block">
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">🥗 Nutrition Tracker</h1>
            <p className="text-gray-400 mt-1">Track meals, water, and supplements</p>
          </div>
          <div className="flex gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
        </div>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 p-4 rounded-xl border border-orange-700">
            <p className="text-gray-400 text-sm">Calories</p>
            <p className="text-white text-2xl font-bold">{totals.calories} / {targetCalories}</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min(100, (totals.calories / targetCalories) * 100)}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-4 rounded-xl border border-blue-700">
            <p className="text-gray-400 text-sm">Protein (g)</p>
            <p className="text-white text-2xl font-bold">{totals.protein} / {targetProtein}</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (totals.protein / targetProtein) * 100)}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-4 rounded-xl border border-green-700">
            <p className="text-gray-400 text-sm">Water (ml)</p>
            <p className="text-white text-2xl font-bold">{waterIntake} / {targetWater}</p>
            <button onClick={addWater} className="text-xs text-green-400 mt-1 hover:text-green-300">
              + Add 250ml
            </button>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-4 rounded-xl border border-purple-700">
            <p className="text-gray-400 text-sm">Macros</p>
            <p className="text-white text-sm mt-1">🥩 {totals.protein}g | 🍚 {totals.carbs}g | 🥑 {totals.fats}g</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          {['meals', 'grocery', 'supplements', 'recipes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg transition ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'meals' && '🍽️ Meals'}
              {tab === 'grocery' && '🛒 Grocery List'}
              {tab === 'supplements' && '💊 Supplements'}
              {tab === 'recipes' && '📖 Recipes'}
            </button>
          ))}
        </div>

        {/* Meals Tab */}
        {activeTab === 'meals' && (
          <div>
            <button
              onClick={() => setShowAddMeal(true)}
              className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + Log Meal
            </button>
            
            <div className="space-y-4">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                const meal = meals.find(m => m.mealType === mealType);
                return (
                  <div key={mealType} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white capitalize mb-2">{mealType}</h3>
                    {meal ? (
                      <div>
                        <p className="text-gray-300">{meal.totalCalories} calories | {meal.totalProtein}g protein</p>
                        <button className="text-blue-400 text-sm mt-2">View Details →</button>
                      </div>
                    ) : (
                      <p className="text-gray-500">No meal logged</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grocery List Tab */}
        {activeTab === 'grocery' && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newGroceryItem}
                onChange={(e) => setNewGroceryItem(e.target.value)}
                placeholder="Add item..."
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                onKeyPress={(e) => e.key === 'Enter' && addToGrocery()}
              />
              <button onClick={addToGrocery} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Add</button>
            </div>
            <div className="space-y-2">
              {groceryItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-white flex-1">{item.name}</span>
                  <span className="text-gray-400 text-sm">{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supplements Tab */}
        {activeTab === 'supplements' && (
          <div>
            <button
              onClick={() => setShowAddSupplement(true)}
              className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + Add Supplement Reminder
            </button>
            <div className="space-y-3">
              {supplements.map(sup => (
                <div key={sup._id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-bold">{sup.name}</h3>
                      <p className="text-gray-400 text-sm">{sup.dosage} • {sup.timeOfDay} at {sup.time}</p>
                    </div>
                    <button className="text-green-500">✓ Take</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-center">
              <div className="text-3xl mb-2">🍳</div>
              <p className="text-gray-400">High Protein Breakfast Bowl</p>
              <p className="text-gray-500 text-sm">450 cal • 35g protein</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-center">
              <div className="text-3xl mb-2">🥗</div>
              <p className="text-gray-400">Chicken Quinoa Salad</p>
              <p className="text-gray-500 text-sm">550 cal • 45g protein</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
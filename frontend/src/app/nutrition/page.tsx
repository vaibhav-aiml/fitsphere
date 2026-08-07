'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

interface FoodItem {
  name: string;
  quantity: string | number;
  unit?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MealPlanMeal {
  mealType: string;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  foods: FoodItem[];
  instructions?: string;
}

interface AiDietPlan {
  tdee: number;
  bmr: number;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  rationale: string;
  meals: MealPlanMeal[];
}

export default function NutritionTracker() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ai_generator' | 'ai_logger' | 'meals' | 'grocery' | 'supplements'>('ai_generator');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Daily Totals & Logs State
  const [meals, setMeals] = useState<any[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [waterIntake, setWaterIntake] = useState(0);
  const [foods, setFoods] = useState<any[]>([]);
  const [groceryItems, setGroceryItems] = useState<any[]>([]);
  const [supplements, setSupplements] = useState<any[]>([]);

  // AI Diet Generator Form State
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('male');
  const [weightKg, setWeightKg] = useState(75);
  const [heightCm, setHeightCm] = useState(175);
  const [goal, setGoal] = useState('hypertrophy');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [dietaryPreference, setDietaryPreference] = useState('high_protein');
  const [allergies, setAllergies] = useState('');
  const [generatingDiet, setGeneratingDiet] = useState(false);
  const [aiPlan, setAiPlan] = useState<AiDietPlan | null>(null);

  // AI Food Text Logger State
  const [mealText, setMealText] = useState('');
  const [targetMealType, setTargetMealType] = useState('lunch');
  const [analyzingMeal, setAnalyzingMeal] = useState(false);
  const [aiAnalyzedMeal, setAiAnalyzedMeal] = useState<any | null>(null);

  // Manual Food Logger Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualMealType, setManualMealType] = useState('breakfast');
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [foodQuantity, setFoodQuantity] = useState(100);

  // Grocery & Supplement State
  const [newGroceryItem, setNewGroceryItem] = useState('');
  const [newSupplement, setNewSupplement] = useState({ name: '', dosage: '', timeOfDay: 'morning', time: '09:00' });
  const [showAddSupplement, setShowAddSupplement] = useState(false);

  // AI Nutritionist Modal
  const [nutritionistModalOpen, setNutritionistModalOpen] = useState(false);
  const [nutritionQuestion, setNutritionQuestion] = useState('');
  const [nutritionAnswer, setNutritionAnswer] = useState('');
  const [askingNutritionist, setAskingNutritionist] = useState(false);

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

  // Water Hydration Logger
  const addWater = async (amount: number = 250) => {
    requireAuth(async () => {
      try {
        const response = await api.post('/water', { amount });
        setWaterIntake(response.data.todayTotal);
        toast.success(`Logged ${amount}ml water! 💧`);
        fetchData();
      } catch (error) {
        toast.error('Failed to log water intake');
      }
    }, {
      title: 'Water Tracking Requires Account',
      description: 'Sign in to record your daily hydration goals.',
      nextUrl: '/nutrition'
    });
  };

  // Generate AI Diet Plan Handler
  const handleGenerateAiDiet = async () => {
    requireAuth(async () => {
      setGeneratingDiet(true);
      try {
        const response = await api.post('/ai-diet-plan', {
          age,
          gender,
          weightKg,
          heightCm,
          goal,
          activityLevel,
          dietaryPreference,
          allergies: allergies || 'None'
        });
        if (response.data.success && response.data.plan) {
          setAiPlan(response.data.plan);
          toast.success('Personalized AI Meal Plan & Macros Generated! 🥗');
        }
      } catch (error) {
        toast.error('Failed to generate AI diet plan');
      } finally {
        setGeneratingDiet(false);
      }
    }, {
      title: 'AI Diet Planner Requires Account',
      description: 'Sign in to create, customize, and save AI-powered meal plans.',
      nextUrl: '/nutrition'
    });
  };

  // Analyze Natural Language Meal with AI
  const handleAnalyzeMeal = async () => {
    if (!mealText.trim()) return;
    requireAuth(async () => {
      setAnalyzingMeal(true);
      try {
        const response = await api.post('/ai-analyze-meal', {
          mealText,
          mealType: targetMealType
        });
        if (response.data.success && response.data.analysis) {
          setAiAnalyzedMeal(response.data.analysis);
          toast.success('Meal analyzed by Groq AI! Review details below.');
        }
      } catch (error) {
        toast.error('Failed to analyze meal text');
      } finally {
        setAnalyzingMeal(false);
      }
    }, {
      title: 'AI Meal Analyzer Requires Account',
      description: 'Sign in to analyze food text and log macros instantly.',
      nextUrl: '/nutrition'
    });
  };

  // Save Analyzed AI Meal to Daily Log
  const handleLogAnalyzedMeal = async () => {
    if (!aiAnalyzedMeal) return;
    try {
      await api.post('/meals', {
        mealType: targetMealType,
        foods: aiAnalyzedMeal.foods,
        notes: `AI Analyzed: ${aiAnalyzedMeal.mealTitle}`
      });
      toast.success(`Logged ${aiAnalyzedMeal.mealTitle} to ${targetMealType.toUpperCase()}! 🎉`);
      setAiAnalyzedMeal(null);
      setMealText('');
      fetchData();
      setActiveTab('meals');
    } catch (error) {
      toast.error('Failed to save meal to log');
    }
  };

  // Manual Food Logging
  const handleLogManualFood = async () => {
    if (!selectedFoodId) return;
    try {
      await api.post('/meals', {
        mealType: manualMealType,
        foods: [{ foodId: selectedFoodId, quantity: Number(foodQuantity) }]
      });
      toast.success('Food item logged successfully! 🍗');
      setShowManualModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to log food item');
    }
  };

  // Grocery Item Addition
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

  // Supplement Addition
  const addSupplement = async () => {
    if (!newSupplement.name.trim()) return;
    requireAuth(async () => {
      try {
        await api.post('/supplements', newSupplement);
        setShowAddSupplement(false);
        setNewSupplement({ name: '', dosage: '', timeOfDay: 'morning', time: '09:00' });
        fetchSupplements();
        toast.success('Supplement reminder saved!');
      } catch (error) {
        toast.error('Failed to add supplement');
      }
    }, {
      title: 'Supplement Reminders Require Account',
      description: 'Sign in to save supplement reminders.',
      nextUrl: '/nutrition'
    });
  };

  // Ask AI Nutritionist Q&A
  const handleAskNutritionist = async () => {
    if (!nutritionQuestion.trim()) return;
    setAskingNutritionist(true);
    try {
      const response = await api.post('/ai-ask-coach', { question: nutritionQuestion });
      setNutritionAnswer(response.data.answer);
    } catch (error) {
      toast.error('Failed to get response from AI Nutritionist');
    } finally {
      setAskingNutritionist(false);
    }
  };

  const targetCalories = aiPlan?.targets?.calories || 2500;
  const targetProtein = aiPlan?.targets?.protein || 180;
  const targetCarbs = aiPlan?.targets?.carbs || 260;
  const targetFats = aiPlan?.targets?.fats || 70;
  const targetWater = 3000;

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F9FAFB] p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#202938] pb-6">
          <div>
            <button
              onClick={() => router.push('/')}
              className="text-[#FF5500] hover:text-[#E04B00] text-xs font-bold font-heading uppercase tracking-wider transition mb-2 block focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
              🥗 AI NUTRITION & MACRONUTRIENT HUB
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Groq AI Meal Planning, Smart Macro Calculator, Natural Language Food Logger & Hydration Engine
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setNutritionistModalOpen(true)}
              className="px-4 py-2.5 bg-[#18202C] hover:bg-[#202938] text-white text-xs font-bold font-heading rounded-xl border border-[#202938] transition flex items-center gap-2"
            >
              🤖 Ask AI Nutritionist
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2.5 bg-[#0D1117] text-white font-bold text-xs rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            />
          </div>
        </div>

        {/* Top Bento Macro & Hydration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Energy Intake */}
          <div className="bg-[#11161F] p-5 rounded-3xl border border-[#202938] neu-raised flex flex-col justify-between">
            <span className="text-[#FF5500] text-[10px] font-black uppercase tracking-wider font-heading">Energy Intake</span>
            <div className="mt-2">
              <p className="text-2xl font-black text-white font-heading">{totals.calories} <span className="text-xs text-gray-400 font-normal">/ {targetCalories} KCAL</span></p>
              <div className="w-full bg-[#0D1117] rounded-full h-2 mt-2 overflow-hidden neu-inset">
                <div className="bg-[#FF5500] h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totals.calories / targetCalories) * 100)}%` }} />
              </div>
            </div>
            {aiPlan?.tdee && <span className="text-[10px] text-gray-400 mt-2 block font-mono">TDEE: {aiPlan.tdee} kcal</span>}
          </div>

          {/* Protein Target */}
          <div className="bg-[#11161F] p-5 rounded-3xl border border-[#202938] neu-raised flex flex-col justify-between">
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-wider font-heading">Protein Target</span>
            <div className="mt-2">
              <p className="text-2xl font-black text-white font-heading">{totals.protein}g <span className="text-xs text-gray-400 font-normal">/ {targetProtein}g</span></p>
              <div className="w-full bg-[#0D1117] rounded-full h-2 mt-2 overflow-hidden neu-inset">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totals.protein / targetProtein) * 100)}%` }} />
              </div>
            </div>
            <span className="text-[10px] text-gray-400 mt-2 block font-mono">2.2g / kg target</span>
          </div>

          {/* Carbs Target */}
          <div className="bg-[#11161F] p-5 rounded-3xl border border-[#202938] neu-raised flex flex-col justify-between">
            <span className="text-amber-400 text-[10px] font-black uppercase tracking-wider font-heading">Carbohydrates</span>
            <div className="mt-2">
              <p className="text-2xl font-black text-white font-heading">{totals.carbs}g <span className="text-xs text-gray-400 font-normal">/ {targetCarbs}g</span></p>
              <div className="w-full bg-[#0D1117] rounded-full h-2 mt-2 overflow-hidden neu-inset">
                <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totals.carbs / targetCarbs) * 100)}%` }} />
              </div>
            </div>
            <span className="text-[10px] text-gray-400 mt-2 block font-mono">Glycogen fuel</span>
          </div>

          {/* Fats Target */}
          <div className="bg-[#11161F] p-5 rounded-3xl border border-[#202938] neu-raised flex flex-col justify-between">
            <span className="text-purple-400 text-[10px] font-black uppercase tracking-wider font-heading">Healthy Fats</span>
            <div className="mt-2">
              <p className="text-2xl font-black text-white font-heading">{totals.fats}g <span className="text-xs text-gray-400 font-normal">/ {targetFats}g</span></p>
              <div className="w-full bg-[#0D1117] rounded-full h-2 mt-2 overflow-hidden neu-inset">
                <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totals.fats / targetFats) * 100)}%` }} />
              </div>
            </div>
            <span className="text-[10px] text-gray-400 mt-2 block font-mono">Hormone balance</span>
          </div>

          {/* Hydration Tracker */}
          <div className="bg-[#11161F] p-5 rounded-3xl border border-[#202938] neu-raised flex flex-col justify-between">
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider font-heading">Hydration 💧</span>
            <div className="mt-2">
              <p className="text-2xl font-black text-white font-heading">{waterIntake} <span className="text-xs text-gray-400 font-normal">/ {targetWater} ML</span></p>
              <div className="w-full bg-[#0D1117] rounded-full h-2 mt-2 overflow-hidden neu-inset">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (waterIntake / targetWater) * 100)}%` }} />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => addWater(250)} 
                className="px-2 py-1 bg-[#0D1117] hover:bg-[#202938] text-[10px] font-extrabold text-[#FF5500] rounded-lg border border-[#202938] transition"
              >
                +250ml
              </button>
              <button 
                onClick={() => addWater(500)} 
                className="px-2 py-1 bg-[#0D1117] hover:bg-[#202938] text-[10px] font-extrabold text-emerald-400 rounded-lg border border-[#202938] transition"
              >
                +500ml
              </button>
            </div>
          </div>

        </div>

        {/* Main Tab Navigation Controls */}
        <div className="flex bg-[#11161F] p-1.5 rounded-2xl border border-[#202938] overflow-x-auto">
          {[
            { id: 'ai_generator', name: '⚡ AI Diet Generator' },
            { id: 'ai_logger', name: '🤖 AI Natural Food Logger' },
            { id: 'meals', name: '🍽️ Daily Meal Logs' },
            { id: 'grocery', name: '🛒 Smart Grocery List' },
            { id: 'supplements', name: '💊 Supplement Tracker' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-heading uppercase transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#FF5500] text-white shadow-lg shadow-[#FF5500]/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* TAB 1: AI DIET PLAN GENERATOR */}
        {activeTab === 'ai_generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* AI Generator Form */}
            <div className="lg:col-span-2 bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised space-y-5">
              <div>
                <h2 className="text-xl font-black text-white font-heading uppercase">🧠 Calculate & Generate AI Diet Plan</h2>
                <p className="text-xs text-gray-400 mt-1">Groq AI calculates TDEE & builds tailored anabolic meal plans.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Primary Fitness Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="hypertrophy">Muscle Hypertrophy (Lean Bulk)</option>
                  <option value="fatloss">Fat Loss & Definition (Aggressive Cut)</option>
                  <option value="strength">Raw Power & Strength Surge</option>
                  <option value="recomp">Body Recomposition</option>
                  <option value="maintenance">Maintenance & Performance</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Dietary Style</label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="high_protein">High Protein Balanced (Standard Athlete)</option>
                  <option value="keto">Ketogenic (Low Carb / High Fat)</option>
                  <option value="vegetarian">High-Protein Vegetarian</option>
                  <option value="vegan">Plant-Based Vegan</option>
                  <option value="paleo">Clean Whole Foods / Paleo</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Food Allergies / Exclusions</label>
                <input
                  type="text"
                  placeholder="e.g. Dairy, Shellfish, Peanuts"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <button
                onClick={handleGenerateAiDiet}
                disabled={generatingDiet}
                className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white font-extrabold font-heading uppercase text-xs py-3 rounded-xl transition shadow-[0_0_20px_rgba(255,85,0,0.3)] disabled:opacity-50"
              >
                {generatingDiet ? '⚡ Calculating & Generating...' : '⚡ Generate AI Meal Plan & Targets'}
              </button>
            </div>

            {/* AI Generated Output Display */}
            <div className="lg:col-span-3 bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised space-y-5">
              {generatingDiet ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-10 h-10 border-2 border-[#FF5500] border-t-transparent animate-spin rounded-full mx-auto" />
                  <p className="text-xs font-bold text-white font-heading uppercase tracking-wider">Groq AI is analyzing metabolism & crafting custom meal plan...</p>
                </div>
              ) : aiPlan ? (
                <div className="space-y-5">
                  <div className="flex justify-between items-start border-b border-[#202938] pb-4">
                    <div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/30">
                        ⚡ AI Metabolic Rationale
                      </span>
                      <h3 className="text-lg font-black text-white font-heading mt-1">Calculated Daily Targets</h3>
                      <p className="text-xs text-gray-300 mt-1">{aiPlan.rationale}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0D1117] p-4 rounded-2xl border border-[#202938] text-center font-mono">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase">Calories</span>
                      <p className="text-sm font-bold text-[#FF5500]">{aiPlan.targets.calories} kcal</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase">Protein</span>
                      <p className="text-sm font-bold text-blue-400">{aiPlan.targets.protein}g</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase">Carbs</span>
                      <p className="text-sm font-bold text-amber-400">{aiPlan.targets.carbs}g</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase">Fats</span>
                      <p className="text-sm font-bold text-purple-400">{aiPlan.targets.fats}g</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-white font-heading uppercase tracking-wider">🍽️ Daily Meal Blueprint</h4>
                    {aiPlan.meals.map((m, idx) => (
                      <div key={idx} className="bg-[#0D1117] p-4 rounded-2xl border border-[#202938] space-y-2">
                        <div className="flex justify-between items-center border-b border-[#202938] pb-2">
                          <span className="text-xs font-bold text-white uppercase font-heading">{m.mealType}: {m.title}</span>
                          <span className="text-[11px] font-mono text-gray-400">{m.calories} kcal | {m.protein}g P | {m.carbs}g C | {m.fats}g F</span>
                        </div>
                        <ul className="text-xs text-gray-300 space-y-1 pt-1 font-mono">
                          {m.foods.map((f, fIdx) => (
                            <li key={fIdx} className="flex justify-between">
                              <span>• {f.name} ({f.quantity})</span>
                              <span className="text-gray-500">{f.calories} kcal</span>
                            </li>
                          ))}
                        </ul>
                        {m.instructions && (
                          <p className="text-[11px] text-gray-400 italic pt-1 border-t border-[#202938]/40">💡 {m.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-4">
                  <div className="text-5xl">🥗</div>
                  <h3 className="text-base font-bold text-white font-heading">Ready to Generate Your AI Meal Plan</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Fill in your physical stats on the left and click **Generate AI Meal Plan** to receive a complete daily breakdown.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: AI NATURAL LANGUAGE FOOD LOGGER */}
        {activeTab === 'ai_logger' && (
          <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised space-y-6 max-w-3xl mx-auto">
            <div>
              <h2 className="text-xl font-black text-white font-heading uppercase">🤖 AI Natural Language Meal Scanner</h2>
              <p className="text-xs text-gray-400 mt-1">Describe what you ate in plain English. Groq AI extracts ingredients and calculates macros automatically.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Select Meal Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                    <button
                      key={type}
                      onClick={() => setTargetMealType(type)}
                      className={`py-2.5 rounded-xl text-xs font-bold uppercase transition border ${
                        targetMealType === type
                          ? 'bg-[#FF5500] text-white border-[#FF5500]'
                          : 'bg-[#0D1117] text-gray-400 border-[#202938] hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Describe Your Meal</label>
                <textarea
                  rows={4}
                  placeholder="e.g. I ate 200g grilled chicken breast with 1 cup cooked brown rice, 1 tbsp olive oil, and 150g steamed broccoli..."
                  value={mealText}
                  onChange={(e) => setMealText(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-2xl p-4 text-xs font-mono focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                />
              </div>

              <button
                onClick={handleAnalyzeMeal}
                disabled={analyzingMeal || !mealText.trim()}
                className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white font-extrabold font-heading uppercase text-xs py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(255,85,0,0.3)] disabled:opacity-50"
              >
                {analyzingMeal ? '🔍 Analyzing Meal with AI...' : '🔍 Analyze Meal & Calculate Macros'}
              </button>
            </div>

            {aiAnalyzedMeal && (
              <div className="bg-[#0D1117] p-5 rounded-2xl border border-[#202938] space-y-4">
                <div className="flex justify-between items-center border-b border-[#202938] pb-3">
                  <div>
                    <h3 className="text-sm font-black text-white font-heading">{aiAnalyzedMeal.mealTitle}</h3>
                    <p className="text-xs text-[#FF5500] font-mono font-bold mt-0.5">Total: {aiAnalyzedMeal.totalCalories} kcal</p>
                  </div>
                  <button
                    onClick={handleLogAnalyzedMeal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    Confirm & Save to Log ✓
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-[#11161F] p-2 rounded-xl border border-[#202938]">
                    <span className="text-gray-400 text-[10px]">Protein</span>
                    <p className="text-blue-400 font-bold">{aiAnalyzedMeal.totalProtein}g</p>
                  </div>
                  <div className="bg-[#11161F] p-2 rounded-xl border border-[#202938]">
                    <span className="text-gray-400 text-[10px]">Carbs</span>
                    <p className="text-amber-400 font-bold">{aiAnalyzedMeal.totalCarbs}g</p>
                  </div>
                  <div className="bg-[#11161F] p-2 rounded-xl border border-[#202938]">
                    <span className="text-gray-400 text-[10px]">Fats</span>
                    <p className="text-purple-400 font-bold">{aiAnalyzedMeal.totalFats}g</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-300 font-mono">
                  <span className="text-[10px] text-gray-400 uppercase font-heading font-bold">Extracted Ingredients</span>
                  {aiAnalyzedMeal.foods?.map((f: any, i: number) => (
                    <div key={i} className="flex justify-between bg-[#11161F] p-2 rounded-lg border border-[#202938]">
                      <span>{f.name} ({f.quantity})</span>
                      <span>{f.calories} kcal | {f.protein}g P</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DAILY MEAL LOGS */}
        {activeTab === 'meals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-white font-heading uppercase">🍽️ Logged Meals for {selectedDate}</h2>
              <button
                onClick={() => setShowManualModal(true)}
                className="px-4 py-2 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold rounded-xl transition"
              >
                + Log Food Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                const loggedMeals = meals.filter(m => m.mealType === mealType);
                return (
                  <div key={mealType} className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised space-y-3">
                    <div className="flex justify-between items-center border-b border-[#202938] pb-3">
                      <h3 className="text-base font-black text-white font-heading capitalize">{mealType}</h3>
                      <span className="text-xs font-mono text-[#FF5500] font-bold">
                        {loggedMeals.reduce((sum, m) => sum + m.totalCalories, 0)} kcal
                      </span>
                    </div>

                    {loggedMeals.length > 0 ? (
                      <div className="space-y-2">
                        {loggedMeals.map((meal, mIdx) => (
                          <div key={mIdx} className="bg-[#0D1117] p-3.5 rounded-xl border border-[#202938] space-y-1">
                            {meal.notes && <p className="text-xs font-bold text-white">{meal.notes}</p>}
                            {(meal.foods || []).map((f: any, fIdx: number) => (
                              <div key={fIdx} className="flex justify-between text-xs text-gray-300 font-mono">
                                <span>• {f.name} ({f.quantity} {f.unit || 'g'})</span>
                                <span className="text-gray-400">{f.calories} kcal | {f.protein}g P</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs italic py-4 text-center">No foods logged for {mealType} yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: SMART GROCERY LIST */}
        {activeTab === 'grocery' && (
          <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised space-y-6 max-w-3xl mx-auto">
            <div>
              <h2 className="text-xl font-black text-white font-heading">🛒 ATHLETIC GROCERY LIST</h2>
              <p className="text-xs text-gray-400 mt-1">Keep track of your protein sources, carb staples, and meal prep essentials.</p>
            </div>

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
              {groceryItems.length > 0 ? groceryItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 bg-[#0D1117] rounded-xl border border-[#202938]">
                  <input type="checkbox" defaultChecked={item.purchased} className="w-4 h-4 accent-[#FF5500]" />
                  <span className="text-white font-semibold text-sm flex-1">{item.name}</span>
                  <span className="text-gray-500 text-xs font-mono">{item.quantity}</span>
                </div>
              )) : (
                <p className="text-gray-500 text-xs italic text-center py-6">Your grocery list is currently empty.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SUPPLEMENT TRACKER */}
        {activeTab === 'supplements' && (
          <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-center border-b border-[#202938] pb-4">
              <div>
                <h2 className="text-xl font-black text-white font-heading">💊 SUPPLEMENT REMINDER TRACKER</h2>
                <p className="text-xs text-gray-400 mt-1">Track Creatine, Whey, Multivitamins, Fish Oil & Pre-workout timing.</p>
              </div>
              <button
                onClick={() => setShowAddSupplement(true)}
                className="px-4 py-2 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold rounded-xl transition"
              >
                + Add Supplement
              </button>
            </div>

            {showAddSupplement && (
              <div className="bg-[#0D1117] p-5 rounded-2xl border border-[#202938] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase font-heading">Add Supplement Reminder</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Supplement Name (e.g. Creatine Monohydrate)"
                    value={newSupplement.name}
                    onChange={(e) => setNewSupplement({ ...newSupplement, name: e.target.value })}
                    className="bg-[#11161F] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 5g)"
                    value={newSupplement.dosage}
                    onChange={(e) => setNewSupplement({ ...newSupplement, dosage: e.target.value })}
                    className="bg-[#11161F] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <button
                  onClick={addSupplement}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition"
                >
                  Save Supplement
                </button>
              </div>
            )}

            <div className="space-y-3">
              {supplements.length > 0 ? supplements.map((sup, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-[#0D1117] rounded-2xl border border-[#202938]">
                  <div>
                    <h3 className="text-sm font-bold text-white">{sup.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">Dosage: {sup.dosage || 'Standard'} • Time: {sup.timeOfDay || 'Morning'}</p>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
                    Active ✓
                  </span>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500 text-xs italic">
                  No active supplements logged. Click **Add Supplement** above to create reminders.
                </div>
              )}
            </div>
          </div>
        )}

        {/* MANUAL FOOD LOGGER MODAL */}
        {showManualModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#11161F] max-w-md w-full p-6 rounded-3xl border border-[#202938] space-y-4">
              <div className="flex justify-between items-center border-b border-[#202938] pb-3">
                <h3 className="text-base font-black text-white font-heading">🍗 Log Food Item</h3>
                <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Meal Category</label>
                  <select
                    value={manualMealType}
                    onChange={(e) => setManualMealType(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Food from Database</label>
                  <select
                    value={selectedFoodId}
                    onChange={(e) => setSelectedFoodId(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="">-- Select Food Item --</option>
                    {foods.map(f => (
                      <option key={f._id} value={f._id}>{f.name} ({f.calories} kcal / {f.servingSize})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Quantity (g)</label>
                  <input
                    type="number"
                    value={foodQuantity}
                    onChange={(e) => setFoodQuantity(Number(e.target.value))}
                    className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <button
                onClick={handleLogManualFood}
                disabled={!selectedFoodId}
                className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50"
              >
                Log Food to Meal
              </button>
            </div>
          </div>
        )}

        {/* AI NUTRITIONIST Q&A MODAL */}
        {nutritionistModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#11161F] max-w-lg w-full p-6 rounded-3xl border border-[#202938] space-y-4">
              <div className="flex justify-between items-center border-b border-[#202938] pb-3">
                <h3 className="text-base font-black text-white font-heading">🤖 Ask AI Nutritionist & Diet Coach</h3>
                <button onClick={() => setNutritionistModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="e.g. What should I eat pre-workout for maximum pumps?"
                  value={nutritionQuestion}
                  onChange={(e) => setNutritionQuestion(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-4 py-3 text-xs"
                />
              </div>

              <button
                onClick={handleAskNutritionist}
                disabled={askingNutritionist || !nutritionQuestion.trim()}
                className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold py-2.5 rounded-xl transition"
              >
                {askingNutritionist ? 'Analyzing Nutrition Science...' : 'Ask AI Nutritionist'}
              </button>

              {nutritionAnswer && (
                <div className="bg-[#0D1117] p-4 rounded-xl border border-[#202938] text-xs text-gray-300 leading-relaxed max-h-60 overflow-y-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                    {nutritionAnswer}
                  </ReactMarkdown>
                </div>
              )}
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
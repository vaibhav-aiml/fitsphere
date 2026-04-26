'use client';

import { useState } from 'react';

export default function OneRMCalculator() {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [oneRM, setOneRM] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    
    if (w && r && r > 0) {
      // Epley formula
      const rm = w * (1 + r / 30);
      setOneRM(Math.round(rm));
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">1RM Calculator</h3>
      <div className="space-y-4">
        <input
          type="number"
          placeholder="Weight (kg)"
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          type="number"
          placeholder="Reps performed"
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <button
          onClick={calculate}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Calculate 1RM
        </button>
        {oneRM && (
          <div className="bg-green-900/30 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Your Estimated 1 Rep Max</p>
            <p className="text-3xl font-bold text-white">{oneRM} kg</p>
          </div>
        )}
      </div>
    </div>
  );
}
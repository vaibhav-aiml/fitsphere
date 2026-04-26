'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  videoUrl: string;
  tips: string[];
  instructions: string[];
}

export default function ExerciseLibrary() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const exercises: Exercise[] = [
    // Chest Exercises (7)
    {
      id: '1',
      name: 'Bench Press',
      muscleGroup: 'Chest',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
      tips: ['Keep feet flat on ground', 'Arch your back slightly', 'Lower bar to mid-chest', 'Keep elbows at 45 degrees'],
      instructions: ['Lie on bench with eyes under bar', 'Grip bar slightly wider than shoulders', 'Unrack and hold above chest', 'Lower to chest controlled', 'Press back up explosively']
    },
    {
      id: '2',
      name: 'Incline Bench Press',
      muscleGroup: 'Chest',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/SrqOu55lrYU',
      tips: ['Targets upper chest', 'Keep controlled motion', 'Don\'t bounce the bar'],
      instructions: ['Set bench to 30-45 degrees', 'Grip slightly wider than shoulders', 'Lower to upper chest', 'Press up with power']
    },
    {
      id: '3',
      name: 'Decline Bench Press',
      muscleGroup: 'Chest',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/LfyHNUK9kYc',
      tips: ['Targets lower chest', 'Keep feet secured', 'Use full range of motion'],
      instructions: ['Secure feet under pads', 'Grip bar normally', 'Lower to lower chest', 'Press up explosively']
    },
    {
      id: '4',
      name: 'Dumbbell Press',
      muscleGroup: 'Chest',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/VmB1G1K7v94',
      tips: ['Better range of motion', 'Keep wrists straight', 'Squeeze at the top'],
      instructions: ['Lie on bench with dumbbells', 'Press up together', 'Lower with control', 'Feel the stretch']
    },
    {
      id: '5',
      name: 'Push Up',
      muscleGroup: 'Chest',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/IOxg0RqE2H4',
      tips: ['Keep body straight line', 'Don\'t let hips sag', 'Full range of motion'],
      instructions: ['Start in high plank position', 'Hands shoulder-width', 'Lower chest to ground', 'Push back up strongly']
    },
    {
      id: '6',
      name: 'Chest Fly',
      muscleGroup: 'Chest',
      equipment: 'Dumbbells',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/eozdVDA78K0',
      tips: ['Slight bend in elbows', 'Feel the stretch', 'Control the weight'],
      instructions: ['Lie on bench with dumbbells', 'Open arms like hugging a tree', 'Squeeze chest to return']
    },
    {
      id: '7',
      name: 'Dips',
      muscleGroup: 'Chest',
      equipment: 'Dip Bars',
      difficulty: 'Advanced',
      videoUrl: 'https://www.youtube.com/embed/0326dy_-CzM',
      tips: ['Lean forward for chest', 'Keep shoulders down', 'Use full range'],
      instructions: ['Grip dip bars firmly', 'Lower body until stretch', 'Push up powerfully']
    },

    // Back Exercises (7)
    {
      id: '8',
      name: 'Deadlift',
      muscleGroup: 'Back',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      videoUrl: 'https://www.youtube.com/embed/op9kVnSso6Q',
      tips: ['Keep back straight', 'Pull slack out of bar', 'Drive through legs'],
      instructions: ['Stand over bar with shins touching', 'Grip bar outside knees', 'Pull bar up legs', 'Lock out hips at top']
    },
    {
      id: '9',
      name: 'Pull Up',
      muscleGroup: 'Back',
      equipment: 'Pull-up Bar',
      difficulty: 'Advanced',
      videoUrl: 'https://www.youtube.com/embed/eAs4BqYgKv4',
      tips: ['Use full range of motion', 'Avoid swinging', 'Squeeze at the top'],
      instructions: ['Hang from bar with wide grip', 'Pull chin above bar', 'Lower slowly with control']
    },
    {
      id: '10',
      name: 'Lat Pulldown',
      muscleGroup: 'Back',
      equipment: 'Cable Machine',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/CAwf7n6Luuc',
      tips: ['Lean back slightly', 'Pull to upper chest', 'Squeeze lats at bottom'],
      instructions: ['Sit at lat pulldown machine', 'Grip bar wide', 'Pull bar to chest', 'Slow return']
    },
    {
      id: '11',
      name: 'Barbell Row',
      muscleGroup: 'Back',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/vT2GjY_Umpw',
      tips: ['Keep back flat', 'Pull bar to stomach', 'Squeeze shoulder blades'],
      instructions: ['Bend at hips with flat back', 'Grip barbell', 'Row to lower chest', 'Lower with control']
    },
    {
      id: '12',
      name: 'Seated Cable Row',
      muscleGroup: 'Back',
      equipment: 'Cable Machine',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/6TpDfpM93Q4',
      tips: ['Keep chest up', 'Pull to stomach', 'Hold contraction'],
      instructions: ['Sit at cable row machine', 'Grip V-bar attachment', 'Pull to torso', 'Squeeze and return']
    },
    {
      id: '13',
      name: 'T-Bar Row',
      muscleGroup: 'Back',
      equipment: 'T-Bar Machine',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/j3Igk5nyAC4',
      tips: ['Use V-grip handle', 'Keep back flat', 'Use full range'],
      instructions: ['Straddle T-bar machine', 'Grip handles', 'Row weight to chest', 'Squeeze back']
    },
    {
      id: '14',
      name: 'Face Pull',
      muscleGroup: 'Back',
      equipment: 'Cable Machine',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/HSoHeSjvqlY',
      tips: ['External rotation', 'Pull to face', 'Focus on rear delts'],
      instructions: ['Set rope at high pulley', 'Pull rope to temples', 'Squeeze shoulder blades']
    },

    // Leg Exercises (9)
    {
      id: '15',
      name: 'Squat',
      muscleGroup: 'Legs',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/bEv6CCg2BC8',
      tips: ['Keep chest up', 'Knees track over toes', 'Go as deep as mobile'],
      instructions: ['Position bar on upper back', 'Sit back like sitting in chair', 'Drive through heels']
    },
    {
      id: '16',
      name: 'Front Squat',
      muscleGroup: 'Legs',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      videoUrl: 'https://www.youtube.com/embed/8Qc8I8bKcV4',
      tips: ['Keep upright torso', 'Elbows high', 'Use clean grip'],
      instructions: ['Bar on front delts', 'Keep elbows up', 'Squat straight down']
    },
    {
      id: '17',
      name: 'Leg Press',
      muscleGroup: 'Legs',
      equipment: 'Leg Press Machine',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
      tips: ['Feet shoulder width', 'Don\'t lock knees', 'Use full range'],
      instructions: ['Sit in leg press machine', 'Place feet on platform', 'Lower weight controlled', 'Press through heels']
    },
    {
      id: '18',
      name: 'Romanian Deadlift',
      muscleGroup: 'Legs',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/JCxUY8xR8eI',
      tips: ['Slight knee bend', 'Hinge at hips', 'Feel hamstring stretch'],
      instructions: ['Hold barbell with straight arms', 'Push hips back', 'Lower bar to shins', 'Drive hips forward']
    },
    {
      id: '19',
      name: 'Lunges',
      muscleGroup: 'Legs',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U',
      tips: ['Keep chest upright', 'Front knee at 90 degrees', 'Don\'t let knee pass toes'],
      instructions: ['Hold dumbbells at sides', 'Step forward into lunge', 'Lower back knee', 'Push back to start']
    },
    {
      id: '20',
      name: 'Leg Extension',
      muscleGroup: 'Legs',
      equipment: 'Leg Extension Machine',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/YyvSfVjQeL0',
      tips: ['Control the movement', 'Squeeze quads at top', 'Don\'t swing weight'],
      instructions: ['Sit with shins behind pad', 'Extend legs fully', 'Squeeze quads', 'Slow return']
    },
    {
      id: '21',
      name: 'Leg Curl',
      muscleGroup: 'Legs',
      equipment: 'Leg Curl Machine',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/1Tq3QdYUuaeU',
      tips: ['Keep hips down', 'Full contraction', 'Control negative'],
      instructions: ['Lie face down on machine', 'Curl weight to glutes', 'Lower slowly']
    },
    {
      id: '22',
      name: 'Calf Raises',
      muscleGroup: 'Legs',
      equipment: 'Calf Raise Machine',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/-M4-G8p8fmc',
      tips: ['Get full stretch', 'Pause at top', 'Use higher reps'],
      instructions: ['Stand on platform', 'Lower heels down', 'Push up onto toes']
    },
    {
      id: '23',
      name: 'Bulgarian Split Squat',
      muscleGroup: 'Legs',
      equipment: 'Dumbbells',
      difficulty: 'Advanced',
      videoUrl: 'https://www.youtube.com/embed/2C-uNgKwPLE',
      tips: ['Keep back foot elevated', 'Front knee tracks over toes', 'Maintain balance'],
      instructions: ['Back foot on bench', 'Hold dumbbells', 'Squat down', 'Drive through front heel']
    },

    // Shoulder Exercises (6)
    {
      id: '24',
      name: 'Overhead Press',
      muscleGroup: 'Shoulders',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDD4',
      tips: ['Squeeze glutes for stability', 'Keep bar close to face', 'Lock out at top'],
      instructions: ['Rack bar at shoulder height', 'Press overhead', 'Lower to collarbone']
    },
    {
      id: '25',
      name: 'Lateral Raises',
      muscleGroup: 'Shoulders',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/3VcKaXpzqRo',
      tips: ['Slight bend in elbows', 'Don\'t swing weight', 'Pause at shoulder height'],
      instructions: ['Hold dumbbells at sides', 'Raise arms to sides', 'Control the descent']
    },
    {
      id: '26',
      name: 'Front Raises',
      muscleGroup: 'Shoulders',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/OkS1wd_5x8U',
      tips: ['Lift to shoulder height', 'No momentum', 'Slow and controlled'],
      instructions: ['Hold dumbbells', 'Raise directly in front', 'Lower with control']
    },
    {
      id: '27',
      name: 'Rear Delt Fly',
      muscleGroup: 'Shoulders',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/LQRAJJ_lm8w',
      tips: ['Bend at hips 45 degrees', 'Squeeze rear delts', 'Don\'t use back'],
      instructions: ['Bend forward', 'Raise arms out to sides', 'Squeeze shoulder blades']
    },
    {
      id: '28',
      name: 'Arnold Press',
      muscleGroup: 'Shoulders',
      equipment: 'Dumbbells',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/3ml7BH7mNwQ',
      tips: ['Rotate palms during press', 'Full range of motion', 'Smooth movement'],
      instructions: ['Start with palms facing you', 'Press and rotate palms out', 'Reverse on way down']
    },
    {
      id: '29',
      name: 'Shrugs',
      muscleGroup: 'Shoulders',
      equipment: 'Barbell',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/cJRVVxmytaM',
      tips: ['Roll shoulders back', 'Hold at top', 'Don\'t roll neck'],
      instructions: ['Hold heavy weight', 'Shrug shoulders up', 'Squeeze and lower']
    },

    // Arm Exercises - Biceps (5)
    {
      id: '30',
      name: 'Barbell Curl',
      muscleGroup: 'Arms',
      equipment: 'Barbell',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/KyR5m2T9j2E',
      tips: ['Keep elbows still', 'Full contraction', 'Don\'t swing body'],
      instructions: ['Hold barbell', 'Curl to shoulders', 'Squeeze biceps', 'Slow lowering']
    },
    {
      id: '31',
      name: 'Dumbbell Curl',
      muscleGroup: 'Arms',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/sAq_ocpRh_I',
      tips: ['Supinate wrists at top', 'Control the negative', 'Squeeze at top'],
      instructions: ['Hold dumbbells', 'Curl to shoulders', 'Rotate pinky up', 'Lower slowly']
    },
    {
      id: '32',
      name: 'Hammer Curl',
      muscleGroup: 'Arms',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/zC3nLlEvin4',
      tips: ['Palms facing in', 'Targets brachialis', 'Full range'],
      instructions: ['Hold dumbbells like hammers', 'Curl to shoulders', 'Squeeze forearm', 'Return slowly']
    },
    {
      id: '33',
      name: 'Concentration Curl',
      muscleGroup: 'Arms',
      equipment: 'Dumbbell',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/0AUGfy1VXs4',
      tips: ['Arm against inner thigh', 'Peak contraction', 'Squeeze hard'],
      instructions: ['Sit with arm on thigh', 'Curl weight up', 'Squeeze bicep', 'Slow descent']
    },
    {
      id: '34',
      name: 'Preacher Curl',
      muscleGroup: 'Arms',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/J_EnH93d_vc',
      tips: ['Back against pad', 'Elbows on pad', 'Isolates biceps'],
      instructions: ['Arms on preacher pad', 'Curl weight up', 'Full contraction', 'Slow return']
    },

    // Arm Exercises - Triceps (5)
    {
      id: '35',
      name: 'Triceps Pushdown',
      muscleGroup: 'Arms',
      equipment: 'Cable Machine',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/2-LAMcpzODU',
      tips: ['Elbows pinned to sides', 'Full extension', 'Squeeze triceps'],
      instructions: ['Attach rope to high pulley', 'Push down', 'Lock elbows', 'Slow return']
    },
    {
      id: '36',
      name: 'Skull Crusher',
      muscleGroup: 'Arms',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/d_KZxkY_0cM',
      tips: ['Keep elbows in', 'Lower to forehead', 'Extension only'],
      instructions: ['Lie on bench', 'Lower bar to head', 'Extend arms', 'Don\'t flare elbows']
    },
    {
      id: '37',
      name: 'Overhead Triceps Extension',
      muscleGroup: 'Arms',
      equipment: 'Dumbbell',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/EpStJ86cC7s',
      tips: ['Keep elbows in', 'Get full stretch', 'Control the weight'],
      instructions: ['Hold dumbbell overhead', 'Lower behind head', 'Extend arms up']
    },
    {
      id: '38',
      name: 'Triceps Dips',
      muscleGroup: 'Arms',
      equipment: 'Dip Bars',
      difficulty: 'Advanced',
      videoUrl: 'https://www.youtube.com/embed/0326dy_-CzM',
      tips: ['Keep upright body', 'Elbows point back', 'Focus on triceps'],
      instructions: ['Hold dip bars', 'Lower body', 'Keep upright', 'Push up']
    },
    {
      id: '39',
      name: 'Close Grip Bench Press',
      muscleGroup: 'Arms',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/nEFjIq7lGec',
      tips: ['Hands shoulder-width', 'Elbows tucked', 'Triceps focus'],
      instructions: ['Narrow grip on bar', 'Lower to chest', 'Press up with triceps']
    },

    // Core Exercises (6)
    {
      id: '40',
      name: 'Plank',
      muscleGroup: 'Core',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw',
      tips: ['Keep body straight', 'Squeeze glutes', 'Don\'t let hips sag'],
      instructions: ['Forearms on ground', 'Body in straight line', 'Hold position', 'Keep core tight']
    },
    {
      id: '41',
      name: 'Crunches',
      muscleGroup: 'Core',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/Xyd_fa5zoEU',
      tips: ['Neck relaxed', 'Contract abs', 'Slow movement'],
      instructions: ['Lie on back knees bent', 'Lift shoulders off ground', 'Squeeze abs']
    },
    {
      id: '42',
      name: 'Leg Raises',
      muscleGroup: 'Core',
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/JB2oyawG9KI',
      tips: ['Keep lower back down', 'Legs straight', 'Control descent'],
      instructions: ['Lie on back', 'Raise legs up', 'Lower without touching ground']
    },
    {
      id: '43',
      name: 'Russian Twist',
      muscleGroup: 'Core',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/wkD8rjkrip8',
      tips: ['Twist from torso', 'Keep feet up', 'Squeeze obliques'],
      instructions: ['Sit with lean back', 'Rotate side to side', 'Touch ground each side']
    },
    {
      id: '44',
      name: 'Hanging Leg Raise',
      muscleGroup: 'Core',
      equipment: 'Pull-up Bar',
      difficulty: 'Advanced',
      videoUrl: 'https://www.youtube.com/embed/EPOhqUdm-9M',
      tips: ['No swinging', 'Raise to parallel', 'Engage core'],
      instructions: ['Hang from bar', 'Raise legs up', 'Controlled lower']
    },
    {
      id: '45',
      name: 'Cable Crunch',
      muscleGroup: 'Core',
      equipment: 'Cable Machine',
      difficulty: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/Ut_TGt20kh0',
      tips: ['Round back', 'Crunch down', 'Hold contraction'],
      instructions: ['Kneel at cable station', 'Pull down with abs', 'Crunch weight down']
    }
  ];

  const muscleGroups = ['all', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'all' || exercise.muscleGroup === selectedMuscle;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    return matchesSearch && matchesMuscle && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-500 hover:text-blue-400 transition mb-2 block"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">🏋️ Exercise Library</h1>
            <p className="text-gray-400 mt-1">{exercises.length} exercises with video demonstrations</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="🔍 Search exercises..."
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
            >
              {muscleGroups.map(muscle => (
                <option key={muscle} value={muscle}>
                  {muscle === 'all' ? '📋 All Muscle Groups' : `💪 ${muscle}`}
                </option>
              ))}
            </select>
            <select
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>
                  {diff === 'all' ? '⭐ All Difficulties' : diff === 'Beginner' ? '🌱 Beginner' : diff === 'Intermediate' ? '📈 Intermediate' : '🚀 Advanced'}
                </option>
              ))}
            </select>
          </div>
          <p className="text-gray-400 text-sm">📊 Found {filteredExercises.length} exercises</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Exercise List */}
          <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <h2 className="text-xl font-bold text-white mb-4 sticky top-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 py-2">📋 Exercise List</h2>
            {filteredExercises.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  selectedExercise?.id === exercise.id
                    ? 'bg-blue-600 border-blue-500 shadow-lg scale-[1.02]'
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700 hover:scale-[1.01]'
                } border`}
              >
                <p className="text-white font-semibold">{exercise.name}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs text-gray-400">{exercise.muscleGroup}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-400">{exercise.equipment}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className={`text-xs ${
                    exercise.difficulty === 'Beginner' ? 'text-green-400' :
                    exercise.difficulty === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{exercise.difficulty}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Exercise Details */}
          <div className="lg:col-span-2">
            {selectedExercise ? (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-white">{selectedExercise.name}</h2>
                
                {/* Video Demo */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-xl">
                  <iframe
                    width="100%"
                    height="100%"
                    src={selectedExercise.videoUrl}
                    title={`${selectedExercise.name} tutorial`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Form Tips */}
                <div className="bg-yellow-900/30 p-6 rounded-xl border border-yellow-700">
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">💡 Form Tips</h3>
                  <ul className="space-y-2">
                    {selectedExercise.tips.map((tip, idx) => (
                      <li key={idx} className="text-gray-300 flex items-start gap-2">
                        <span className="text-yellow-400">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-700">
                  <h3 className="text-xl font-bold text-blue-400 mb-3">📝 Step-by-Step Instructions</h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    {selectedExercise.instructions.map((instruction, idx) => (
                      <li key={idx} className="text-gray-300">{instruction}</li>
                    ))}
                  </ol>
                </div>

                {/* Quick Action */}
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/workout')}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    💪 Log This Exercise Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 p-12 rounded-xl text-center border border-gray-700">
                <div className="text-6xl mb-4">🏋️</div>
                <p className="text-gray-400 text-lg">Select an exercise from the list</p>
                <p className="text-gray-500 text-sm mt-2">View video demonstrations, form tips, and instructions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
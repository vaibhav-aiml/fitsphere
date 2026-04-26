import { saveAs } from '"'"'file-saver'"'"';
import { jsPDF } from '"'"'jspdf'"'"';
import html2canvas from '"'"'html2canvas'"'"';

export interface WorkoutData {
  date: string;
  exerciseName: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
  oneRM: number;
}

export interface UserStats {
  name: string;
  goal: string;
  experience: string;
  memberSince: string;
  totalWorkouts: number;
  totalVolume: number;
}

export const exportToCSV = (data: WorkoutData[], filename: string) => {
  const headers = ['"'"'Date'"'"', '"'"'Exercise'"'"', '"'"'Weight (kg)'"'"', '"'"'Reps'"'"', '"'"'Sets'"'"', '"'"'Volume (kg)'"'"', '"'"'1RM (kg)'"'"'];
  const csvRows = [headers.join('"'"','"'"')];
  
  for (const row of data) {
    const values = [
      row.date,
      `"'"'${row.exerciseName}"'"'`,
      row.weight,
      row.reps,
      row.sets,
      row.volume,
      row.oneRM
    ];
    csvRows.push(values.join('"'"','"'"'));
  }
  
  const blob = new Blob([csvRows.join('"'"'\n'"'"')], { type: '"'"'text/csv;charset=utf-8;'"'"' });
  saveAs(blob, `${filename}.csv`);
};

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: '"'"'#ffffff'"'"' });
  const imgData = canvas.toDataURL('"'"'image/png'"'"');
  const pdf = new jsPDF({ orientation: '"'"'portrait'"'"', unit: '"'"'mm'"'"', format: '"'"'a4'"'"' });
  
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, '"'"'PNG'"'"', 0, 0, imgWidth, imgHeight);
  pdf.save(`${filename}.pdf`);
};

export const shareAsImage = async (elementId: string, title: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: '"'"'#1f2937'"'"' });
  
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], `${title}.png`, { type: '"'"'image/png'"'"' });
    
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title, text: '"'"'Check my workout progress! 💪'"'"', files: [file] });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('"'"'a'"'"');
      a.href = url;
      a.download = `${title}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, '"'"'image/png'"'"');
};

export const generateProgressReport = (workouts: WorkoutData[], stats: UserStats) => {
  const totalVolume = workouts.reduce((sum, w) => sum + w.volume, 0);
  const uniqueExercises = [...new Set(workouts.map(w => w.exerciseName))].length;
  
  const bestLifts: any = {};
  workouts.forEach(w => {
    const oneRM = Math.round(w.weight * (1 + w.reps / 30));
    if (!bestLifts[w.exerciseName] || oneRM > bestLifts[w.exerciseName].oneRM) {
      bestLifts[w.exerciseName] = { weight: w.weight, reps: w.reps, oneRM };
    }
  });
  
  return {
    stats: { ...stats, totalVolume, uniqueExercises },
    bestLifts,
    recentWorkouts: workouts.slice(0, 10)
  };
};

export const createShareText = (workout: WorkoutData) => {
  return `💪 Just crushed my workout on FitSphere!\n\n🏋️ ${workout.exerciseName}: ${workout.weight}kg × ${workout.reps} reps × ${workout.sets} sets\n📊 Volume: ${workout.volume}kg\n🎯 1RM: ${workout.oneRM}kg\n\n#FitSphere #Fitness #Workout`;
};

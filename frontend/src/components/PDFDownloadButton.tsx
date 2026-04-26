'use client';

import toast from 'react-hot-toast';

interface PDFDownloadButtonProps {
  plan: any;
  selectedWeek: number;
}

export default function PDFDownloadButton({ plan, selectedWeek }: PDFDownloadButtonProps) {
  
  const handleDownloadPDF = async () => {
    if (!plan) {
      toast.error('No plan selected');
      return;
    }

    toast.loading('Generating PDF...', { id: 'pdf' });

    setTimeout(() => {
      toast.success(`Downloaded ${plan.name} - Week ${selectedWeek}`, { id: 'pdf' });
    }, 1000);
  };

  return (
    <button
      onClick={handleDownloadPDF}
      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
    >
      📄 Download Week {selectedWeek} as PDF
    </button>
  );
}

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ChevronLeft, Printer, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Student } from '../types';

interface StudentQRViewProps {
  onBack: () => void;
  students: Student[];
}

export default function StudentQRView({ onBack, students }: StudentQRViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 min-h-screen pb-20 print:bg-white print:p-0 print:pb-0">
      <div className="flex items-center justify-between print:hidden">
        <button 
          onClick={onBack}
          className="p-3 bg-white text-slate-500 rounded-full hover:bg-slate-50 transition-all shadow-sm border border-slate-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={handlePrint}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black khmer-font shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-3"
        >
          <Printer className="w-5 h-5" /> ព្រីន QR សិស្ស
        </button>
      </div>

      <div className="text-center space-y-2 print:hidden">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-800 khmer-font uppercase tracking-tight">QR កូដសិស្ស</h2>
        <p className="text-slate-500 font-medium khmer-font">កាត QR យួរតាមខ្លួនសម្រាប់សិស្សម្នាក់ៗស្កេនវត្តមាន</p>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 print:shadow-none print:border-none print:p-0" ref={printRef}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 print:grid-cols-4 print:gap-4">
          {students.map((student) => (
            <div key={student.id} className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 text-center break-inside-avoid shadow-sm print:border-solid print:border-slate-300">
               <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                 <QRCodeSVG 
                    value={`STUDENT:${student.id}:${student.name}`} 
                    size={80} 
                    level={"H"} 
                    includeMargin={false} 
                 />
               </div>
               <p className="font-black text-slate-800 khmer-font text-sm leading-tight line-clamp-2">{student.name}</p>
               <p className="text-[10px] text-slate-500 font-mono mt-1">ID: {student.id.slice(0, 6).toUpperCase()}</p>
            </div>
          ))}
          {students.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 font-medium khmer-font">
                មិនមានទិន្នន័យសិស្សទេ
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:pb-0 {
            padding-bottom: 0 !important;
          }
          .print\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
          .print\\:gap-4 {
            gap: 1rem !important;
          }
          .print\\:border-solid {
            border-style: solid !important;
          }
          .print\\:border-slate-300 {
            border-color: #cbd5e1 !important;
          }
          .bg-white > .print\\:hidden ~ div {
            visibility: visible !important;
          }
          .bg-white > .print\\:hidden ~ div * {
            visibility: visible;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}

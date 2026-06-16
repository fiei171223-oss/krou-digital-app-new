import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'motion/react';
import { ChevronLeft, QrCode, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { Student } from '../types';

interface QRScannerViewProps {
  onBack: () => void;
}

export default function QRScannerView({ onBack }: QRScannerViewProps) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error' | 'duplicate'>('idle');
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanFailure(error: any) {
      // Quietly fail for most errors as it scans frames rapidly
    }

    async function onScanSuccess(decodedText: string) {
      if (status === 'success' || status === 'duplicate') return;
      
      setScanResult(decodedText);
      setStatus('scanning');
      
      try {
        // Find student by ID or Latin Name (encoded in QR)
        const q = query(collection(db, 'students'), where('id', '==', decodedText), limit(1));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const studentData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Student;
          setScannedStudent(studentData);
          
          // Log Attendance
          const today = new Date().toISOString().split('T')[0];
          const checkQ = query(
            collection(db, 'attendance'), 
            where('studentId', '==', studentData.id),
            where('date', '==', today),
            limit(1)
          );
          const checkSnap = await getDocs(checkQ);
          
          if (!checkSnap.empty) {
            setStatus('duplicate');
          } else {
            await addDoc(collection(db, 'attendance'), {
              studentId: studentData.id,
              date: today,
              status: 'present',
              time: new Date().toLocaleTimeString(),
              method: 'qr_scan'
            });
            setStatus('success');
            
            // Auto reset after 3 seconds
            setTimeout(() => {
              setStatus('idle');
              setScannedStudent(null);
              setScanResult(null);
            }, 3000);
          }
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    }

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, []);

  return (
    <div className="space-y-8 min-h-screen pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium border border-slate-200 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-indigo-600" />
          ត្រឡប់ក្រោយ
        </button>
        <div className="flex flex-col items-end">
           <h2 className="text-2xl font-black text-slate-800 khmer-font">ស្កេន QR វត្តមាន</h2>
           <p className="text-xs text-slate-500 font-bold">Scanning Digital Attendance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden relative">
          <div id="reader" className="w-full h-full rounded-2xl overflow-hidden border-4 border-slate-100"></div>
          
          {status === 'scanning' && (
            <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 min-h-[300px] flex flex-col items-center justify-center text-center">
            {status === 'idle' && (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <QrCode className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-400 khmer-font font-bold">កំពុងរង់ចាំស្កេន...</p>
              </div>
            )}

            {status === 'success' && scannedStudent && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 khmer-font mb-1">{scannedStudent.name}</h3>
                  <p className="text-emerald-600 font-black khmer-font">វត្តមាន៖ បានកត់ត្រាជោគជ័យ!</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-bold">
                  <Clock className="w-4 h-4" />
                  {new Date().toLocaleTimeString()}
                </div>
              </motion.div>
            )}

            {status === 'duplicate' && scannedStudent && (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-800 khmer-font mb-1">{scannedStudent.name}</h3>
                   <p className="text-amber-600 font-bold khmer-font">បានចុះវត្តមានរួចហើយសម្រាប់ថ្ងៃនេះ</p>
                </div>
                <button onClick={() => setStatus('idle')} className="text-indigo-600 font-bold khmer-font text-sm hover:underline">ស្កេនបន្ត</button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <p className="text-rose-600 font-bold khmer-font">មិនស្គាល់អត្តសញ្ញាណសិស្ស!</p>
                <button onClick={() => setStatus('idle')} className="text-indigo-600 font-bold khmer-font text-sm hover:underline">ព្យាយាមម្ដងទៀត</button>
              </div>
            )}
          </div>

          <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-100">
             <h4 className="text-lg font-black khmer-font mb-4 flex items-center gap-2">
               <QrCode className="w-5 h-5" /> ណែនាំការប្រើប្រាស់
             </h4>
             <ul className="space-y-3 text-sm font-medium opacity-90 khmer-font leading-relaxed">
               <li>• សូមដាក់ QR Code របស់សិស្សឱ្យចំកណ្ដាលកាមេរ៉ា</li>
               <li>• ប្រព័ន្ធនឹងកត់ត្រាឈ្មោះសិស្ស ថ្ងៃខែ និងម៉ោងដោយស្វ័យប្រវត្តិ</li>
               <li>• ក្នុងករណីមានបញ្ហា សូមពិនិត្យមើលពន្លឺ ឬប្ដូរកាមេរ៉ា</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

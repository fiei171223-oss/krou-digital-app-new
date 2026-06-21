import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Trash2,
  Search,
  Plus,
  CheckCircle2,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Printer,
  Save,
  Download,
  Camera,
  X,
  PlusCircle,
  FileText,
  Users,
  GraduationCap,
} from "lucide-react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { Student, Grade, ClassInfo } from "../types";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import StudentReportMoEYS from "./StudentReportMoEYS";

enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface StudentManagementViewProps {
  onBack: () => void;
}

export default function StudentManagementView({
  onBack,
}: StudentManagementViewProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo>({
    schoolName: "សាលាបឋមសិក្សាវិមានឯករាជ្យ",
    grade: "ថ្នាក់ទី ៦អា (6A)",
    academicYear: "២០២៤-២០២៥",
    teacherName: "លោកគ្រូ អ៊ុំ សុភក្ត្រា",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showMoEYSReport, setShowMoEYSReport] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Firestore Listeners
  useEffect(() => {
    const studentsPath = "students";
    const unsubStudents = onSnapshot(
      query(collection(db, studentsPath), orderBy("name", "asc")),
      (snap) => {
        setStudents(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Student[],
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, studentsPath);
      },
    );

    const infoPath = "class_info";
    const infoDocRef = doc(db, infoPath, "current");
    const unsubInfo = onSnapshot(infoDocRef, (snap) => {
      if (snap.exists()) {
        setClassInfo(snap.data() as ClassInfo);
      }
    });

    return () => {
      unsubStudents();
      unsubInfo();
    };
  }, []);

  const handleUpdateInfo = async (field: keyof ClassInfo, value: string) => {
    const newInfo = { ...classInfo, [field]: value };
    setClassInfo(newInfo);
    try {
      await setDoc(doc(db, "class_info", "current"), newInfo);
    } catch (error) {
      console.error("Failed to update class info", error);
    }
  };

  const handleAddStudent = async () => {
    // Generate next roll number (e.g. 001, 002...)
    const nextRollNum = String(students.length + 1).padStart(3, "0");

    const newStudent: any = {
      name: "សិស្សថ្មី",
      rollNumber: nextRollNum,
      gender: "ប្រុស",
      grade: 6,
      dob: "",
      fatherName: "",
      motherName: "",
      village: "",
      district: "",
      province: "",
      status: "active",
      photoUrl: "",
      stars: {
        cleanliness: 0,
        friendliness: 0,
        helpingOthers: 0,
        learningActivity: 0,
        groupWork: 0,
        homework: 0,
      },
      badges: [],
      academicYear: classInfo.academicYear,
      updatedAt: new Date().toISOString(),
    };

    const path = "students";
    try {
      await addDoc(collection(db, path), newStudent);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleUpdateStudent = async (id: string, updates: Partial<Student>) => {
    const path = "students";
    try {
      await updateDoc(doc(db, path, id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្សនេះមែនទេ?")) {
      const path = "students";
      try {
        await deleteDoc(doc(db, path, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  const handlePhotoUpload = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await handleUpdateStudent(id, { photoUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const exportToExcel = () => {
    const data = students.map((s, index) => ({
      "ល.រ": s.rollNumber || String(index + 1).padStart(3, "0"),
      "គោត្តនាម - នាម": s.name,
      "ភេទ": s.gender,
      "ថ្ងៃខែឆ្នាំកំណើត": s.dob || "",
      "ឈ្មោះឪពុក": s.fatherName || "",
      "ឈ្មោះម្តាយ": s.motherName || "",
      "ភូមិ/ឃុំ/សង្កាត់": s.village || "",
      "ក្រុង/ស្រុក/ខេត្ត": s.province || "",
      "ស្ថានភាព": s.status === 'inactive' ? 'ឈប់រៀន' : 'កំពុងសិក្សា',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Auto adjust column widths
    const wscols = [
      {wch: 8},
      {wch: 25},
      {wch: 10},
      {wch: 15},
      {wch: 20},
      {wch: 20},
      {wch: 20},
      {wch: 20},
      {wch: 15},
    ];
    ws['!cols'] = wscols;

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Student_List_${classInfo.grade}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.includes(searchTerm) ||
      (s.rollNumber && s.rollNumber.includes(searchTerm)) ||
      (s.id && s.id.includes(searchTerm)),
  );

  const stats = {
    total: students.length,
    male: students.filter((s) => s.gender === "ប្រុស" || s.gender === "male")
      .length,
    female: students.filter((s) => s.gender === "ស្រី" || s.gender === "female")
      .length,
    active: students.filter((s) => s.status === "active" || !s.status).length,
  };

  if (showMoEYSReport) {
    return (
      <StudentReportMoEYS
        students={students}
        classInfo={classInfo}
        onBack={() => setShowMoEYSReport(false)}
      />
    );
  }

  return (
    <div className="space-y-8 min-h-screen pb-20 print:p-0 print:bg-white print:space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-slate-600 hover:text-indigo-600 transition-all font-medium border border-slate-200 shadow-sm self-start"
        >
          <ChevronLeft className="w-5 h-5 text-indigo-600" />
          ត្រឡប់ក្រោយ
        </button>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAddStudent}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold khmer-font flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <PlusCircle className="w-5 h-5" /> បញ្ចូលឈ្មោះសិស្ស
          </button>
          <button
            onClick={exportToExcel}
            className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-6 py-2.5 rounded-xl font-bold khmer-font flex items-center gap-2 hover:bg-emerald-100 transition-all"
          >
            <FileSpreadsheet className="w-5 h-5" /> ទាញយក EXCEL
          </button>
          <button
            onClick={() => setShowMoEYSReport(true)}
            className="bg-orange-50 text-orange-700 border border-orange-100 px-6 py-2.5 rounded-xl font-bold khmer-font flex items-center gap-2 hover:bg-orange-100 transition-all"
          >
            <FileText className="w-5 h-5" /> ទម្រង់ក្រសួង
          </button>
          <button
            onClick={handlePrint}
            className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold khmer-font flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-slate-100"
          >
            <Printer className="w-5 h-5" /> បោះពុម្ពបញ្ជី
          </button>
        </div>
      </div>

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <StatCard
          label="សិស្សសរុបទូទាំងថ្នាក់"
          value={stats.total}
          color="border-indigo-200 bg-indigo-50"
          textColor="text-indigo-700"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="សិស្សប្រុស"
          value={stats.male}
          color="border-blue-200 bg-blue-50"
          textColor="text-blue-700"
          icon={<div className="text-xl">👦</div>}
        />
        <StatCard
          label="សិស្សស្រី"
          value={stats.female}
          color="border-pink-200 bg-pink-50"
          textColor="text-pink-700"
          icon={<div className="text-xl">👧</div>}
        />
        <StatCard
          label="ស្ថានភាព៖ កំពុងសិក្សា"
          value={stats.active}
          color="border-emerald-200 bg-emerald-50"
          textColor="text-emerald-700"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* Document Wrapper */}
      <div
        ref={printRef}
        className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden print:shadow-none print:border-none print:rounded-none"
      >
        {/* Editable MoEYS Header */}
        <div className="p-12 border-b border-dashed border-slate-100 bg-slate-50/30 print:p-0 print:bg-transparent">
          <div className="text-center space-y-6">
            <div className="inline-block px-10 py-2 border-2 border-slate-200 rounded-full print:border-none print:p-0 bg-white">
              <input
                type="text"
                value={classInfo.schoolName}
                onChange={(e) => handleUpdateInfo("schoolName", e.target.value)}
                className="text-2xl font-black text-slate-800 khmer-font text-center bg-transparent outline-none w-full border-none focus:ring-0"
                placeholder="ឈ្មោះសាលារៀន"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <HeaderField
                label="ឆ្នាំសិក្សា"
                value={classInfo.academicYear}
                onChange={(val) => handleUpdateInfo("academicYear", val)}
                align="left"
              />
              <HeaderField
                label="ថ្នាក់/កម្រិត"
                value={classInfo.grade}
                onChange={(val) => handleUpdateInfo("grade", val)}
                align="center"
              />
              <HeaderField
                label="គ្រូបន្ទុកថ្នាក់"
                value={classInfo.teacherName}
                onChange={(val) => handleUpdateInfo("teacherName", val)}
                align="right"
              />
            </div>
          </div>
        </div>

        {/* Search Bar - Hidden In Print */}
        <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center gap-6 print:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះសិស្ស ឬ លេខរៀង ID..."
              className="w-full pl-14 pr-4 py-4 bg-slate-800 text-white rounded-2xl border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none khmer-font transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Official Table Layout */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-sm border-collapse print:text-[8px]">
            <thead className="bg-slate-50 print:bg-white">
              <tr>
                <th className="cell-header w-12">ល.រ</th>
                <th className="cell-header w-20">រូបភាព</th>
                <th className="cell-header min-w-[150px]">គោត្តនាម - នាម</th>
                <th className="cell-header w-16">ភេទ</th>
                <th className="cell-header w-32">ថ្ងៃខែឆ្នាំកំណើត</th>
                <th className="cell-header min-w-[120px]">ឈ្មោះឪពុក</th>
                <th className="cell-header min-w-[120px]">ឈ្មោះម្តាយ</th>
                <th className="cell-header min-w-[120px]">ភូមិ/ឃុំ/សង្កាត់</th>
                <th className="cell-header min-w-[120px]">ក្រុង/ស្រុក/ខេត្ត</th>
                <th className="cell-header w-24">ស្ថានភាព</th>
                <th className="cell-header w-12 print:hidden">-</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-200">
              {filteredStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className="group hover:bg-indigo-50/30 transition-colors print:hover:bg-white"
                >
                  <td className="cell-content text-center font-black text-slate-300">
                    <input
                      type="text"
                      value={
                        student.rollNumber || String(index + 1).padStart(3, "0")
                      }
                      onChange={(e) =>
                        handleUpdateStudent(student.id!, {
                          rollNumber: e.target.value,
                        })
                      }
                      className="input-inline text-center !w-12"
                    />
                  </td>
                  <td className="cell-content text-center">
                    <div className="relative inline-block">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer hover:ring-4 hover:ring-indigo-50 transition-all print:w-10 print:h-10 print:border"
                        onClick={() =>
                          document
                            .getElementById(`photo-${student.id}`)
                            ?.click()
                        }
                      >
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <input
                        id={`photo-${student.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(student.id!, e)}
                      />
                    </div>
                  </td>
                  <td className="cell-content text-center">
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) =>
                        handleUpdateStudent(student.id!, {
                          name: e.target.value,
                        })
                      }
                      className="input-inline font-black text-slate-800 text-center"
                    />
                  </td>
                  <td className="cell-content text-center">
                    <select
                      value={student.gender}
                      onChange={(e) =>
                        handleUpdateStudent(student.id!, {
                          gender: e.target.value as any,
                        })
                      }
                      className={`w-full bg-transparent outline-none font-bold khmer-font text-center cursor-pointer py-1.5 rounded-xl border border-transparent hover:border-slate-100 ${student.gender === "ស្រី" || student.gender === "female" ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600"}`}
                    >
                      <option value="ប្រុស">ប្រុស</option>
                      <option value="ស្រី">ស្រី</option>
                    </select>
                  </td>
                  <td className="cell-content text-center">
                    <input
                      type="text"
                      placeholder="DD-MM-YYYY"
                      value={student.dob}
                      onChange={(e) =>
                        handleUpdateStudent(student.id!, {
                          dob: e.target.value,
                        })
                      }
                      className="input-inline text-slate-600 font-bold text-center"
                    />
                  </td>
                  <td className="cell-content text-center">
                    <input
                      type="text"
                      placeholder="..."
                      value={student.fatherName}
                      onChange={(e) =>
                        handleUpdateStudent(student.id!, {
                          fatherName: e.target.value,
                        })
                      }
                      className="input-inline text-slate-500 text-center"
                    />
                  </td>
                  <td className="cell-content text-center">
                    <input
                      type="text"
                      placeholder="..."
                      value={student.motherName}
                      onChange={(e) =>
                        handleUpdateStudent(student.id!, {
                          motherName: e.target.value,
                        })
                      }
                      className="input-inline text-slate-500 text-center"
                    />
                  </td>
                  <td className="cell-content text-center">
                    <input
                      type="text"
                      placeholder="..."
                      value={student.village || ""}
                      onChange={(e) =>
                        handleUpdateStudent(student.id!, {
                          village: e.target.value,
                        })
                      }
                      className="input-inline text-slate-500 text-center"
                    />
                  </td>
                  <td className="cell-content text-center">
                    <input
                      type="text"
                      placeholder="..."
                      value={student.province || ""}
                      onChange={(e) =>
                        handleUpdateStudent(student.id!, {
                          province: e.target.value,
                        })
                      }
                      className="input-inline text-slate-500 text-center"
                    />
                  </td>
                  <td className="cell-content text-center">
                    <select
                      value={student.status || "active"}
                      onChange={(e) =>
                        handleUpdateStudent(student.id!, {
                          status: e.target.value as any,
                        })
                      }
                      className={`w-full bg-transparent outline-none font-bold khmer-font text-[10px] text-center cursor-pointer py-1 rounded-xl border border-transparent hover:border-slate-100 ${student.status === "inactive" ? "bg-slate-100 text-slate-400" : "bg-emerald-50 text-emerald-600 font-black"}`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="cell-content text-center print:hidden">
                    <button
                      onClick={() => handleDeleteStudent(student.id!)}
                      className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature & Summary Section */}
        <div className="p-8 pb-12 border-t border-slate-100 font-kantumruy text-[13px] leading-relaxed bg-white print:p-4 print:text-[11px] print:break-inside-avoid">
          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 w-full">
            {/* Left Summary Box */}
            <div className="flex-1">
              <div className="grid grid-cols-[auto_minmax(40px,auto)_auto_minmax(60px,auto)_auto_minmax(60px,auto)] gap-x-3 gap-y-3 items-center w-fit">
                {/* Row 1 */}
                <div className="text-right text-green-700">
                  បញ្ចប់បញ្ជីត្រឹមលេខរៀងទី
                </div>
                <input
                  className="w-10 text-center bg-transparent border-b border-transparent outline-none print:border-none focus:border-blue-200 text-blue-700 font-bold"
                  defaultValue={stats.total}
                />

                <div className="text-right text-green-700">សិស្សសរុប</div>
                <div className="flex items-center text-blue-700">
                  <input
                    className="w-8 text-center bg-transparent border-b border-transparent outline-none print:border-none focus:border-blue-200 font-bold"
                    defaultValue={stats.total}
                  />
                  <span>នាក់</span>
                </div>

                <div className="text-right text-green-700">ស្រី</div>
                <div className="flex items-center text-blue-700">
                  <input
                    className="w-8 text-center bg-transparent border-b border-transparent outline-none print:border-none focus:border-blue-200 font-bold"
                    defaultValue={stats.female}
                  />
                  <span>នាក់</span>
                </div>

                {/* Row 2 */}
                <div className="col-span-3 text-right text-green-700">
                  សិស្សឡើងថ្មីសរុបមានចំនួន
                </div>

                <div className="flex items-center text-blue-700">
                  <input
                    className="w-8 text-center bg-transparent border-b border-transparent outline-none print:border-none focus:border-blue-200 font-bold"
                    defaultValue=""
                    placeholder="..."
                  />
                  <span>នាក់</span>
                </div>

                <div className="text-right text-green-700">ស្រី</div>
                <div className="flex items-center text-blue-700">
                  <input
                    className="w-8 text-center bg-transparent border-b border-transparent outline-none print:border-none focus:border-blue-200 font-bold"
                    defaultValue=""
                    placeholder="..."
                  />
                  <span>នាក់</span>
                </div>

                {/* Row 3 */}
                <div className="col-span-3 text-right text-green-700">
                  សិស្សចាស់សរុបមានចំនួន
                </div>

                <div className="flex items-center text-blue-700">
                  <input
                    className="w-8 text-center bg-transparent border-b border-transparent outline-none print:border-none focus:border-blue-200 font-bold"
                    defaultValue=""
                    placeholder="..."
                  />
                  <span>នាក់</span>
                </div>

                <div className="text-right text-green-700">ស្រី</div>
                <div className="flex items-center text-blue-700">
                  <input
                    className="w-8 text-center bg-transparent border-b border-transparent outline-none print:border-none focus:border-blue-200 font-bold"
                    defaultValue=""
                    placeholder="..."
                  />
                  <span>នាក់</span>
                </div>
              </div>
            </div>

            {/* Right Signature Box */}
            <div className="flex-1 flex justify-end">
              <div className="flex flex-col items-center w-full max-w-sm">
                <input
                  type="text"
                  defaultValue="ថ្ងៃពុធ ១៤រោច ខែកត្ដិក ឆ្នាំថោះ បញ្ចស័ក ព.ស. ២៥៦៧"
                  className="w-full min-w-[320px] text-center bg-transparent border-b border-transparent outline-none mb-1 focus:bg-slate-50 rounded text-blue-800"
                />
                <div className="flex justify-center items-center w-full mb-10 text-blue-800">
                  <span>ធ្វើនៅ</span>
                  <input
                    type="text"
                    className="w-24 text-center bg-transparent border-b border-transparent outline-none focus:bg-slate-50 font-bold px-1 rounded"
                    defaultValue="ពោធិ៍ជ្រៃ"
                  />
                  <span>ថ្ងៃទី</span>
                  <input
                    type="text"
                    className="w-8 text-center bg-transparent border-b border-transparent outline-none focus:bg-slate-50 font-bold rounded"
                    defaultValue="១១"
                  />
                  <span>ខែ</span>
                  <input
                    type="text"
                    className="w-12 text-center bg-transparent border-b border-transparent outline-none focus:bg-slate-50 font-bold rounded"
                    defaultValue="ធ្នូ"
                  />
                  <span>ឆ្នាំ២០២៣</span>
                </div>

                <div className="w-full flex justify-between gap-4">
                  {/* Principal Signature */}
                  <div className="flex-1 text-center font-bold">
                    <div className="mb-2 text-green-700">បានឃើញ និង ឯកភាព</div>
                    <div className="text-green-700">នាយកសាលា</div>
                    <div className="h-24"></div> {/* Space for signature */}
                  </div>

                  {/* Teacher Signature */}
                  <div className="flex-1 text-center font-bold">
                    <div className="mb-2">&nbsp;</div>{" "}
                    {/* Alignment vertically */}
                    <div className="text-green-700 mb-2">គ្រូប្រចាំថ្នាក់</div>
                    <div className="h-24"></div> {/* Space for signature */}
                    <input
                      type="text"
                      defaultValue={classInfo.teacherName}
                      className="text-red-600 font-bold text-center bg-transparent border-b border-transparent outline-none w-full max-w-[160px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: landscape; margin: 1cm; }
          body { background: white !important; }
          .min-h-screen { min-height: auto !important; }
          .print\\:hidden { display: none !important; }
          .cell-header, .cell-content { border: 1px solid #e2e8f0 !important; padding: 4px !important; }
          .input-inline { border: none !important; padding: 0 !important; font-size: 8px !important; }
          select { appearance: none; -webkit-appearance: none; border: none !important; background: transparent !important; padding: 0 !important; font-size: 8px !important; }
        }
        .cell-header { padding: 1.25rem 0.5rem; text-align: center; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #f1f5f9; white-space: nowrap; font-family: 'Kantumruy Pro', sans-serif; }
        .cell-content { padding: 0.75rem 0.5rem; }
        .input-inline { width: 100%; background: transparent; outline: none; border-bottom: 1px solid transparent; transition: all 0.2s; font-family: 'Kantumruy Pro', sans-serif; padding: 4px; }
        .input-inline:focus { border-bottom-color: #6366f1; background-color: #f8fafc; border-radius: 4px; }
      `}</style>
    </div>
  );
}

function HeaderField({
  label,
  value,
  onChange,
  align,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  align: string;
}) {
  return (
    <div
      className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm print:border-none print:p-0 text-${align}`}
    >
      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full font-black khmer-font text-slate-700 bg-transparent outline-none border-none focus:ring-0 p-0 text-${align}`}
      />
    </div>
  );
}

function StatCard({ label, value, color, textColor, icon }: any) {
  return (
    <div
      className={`p-6 rounded-[2rem] border-2 shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-all cursor-default ${color}`}
    >
      <div className="space-y-1">
        <p className="text-[10px] font-black opacity-50 uppercase tracking-widest khmer-font">
          {label}
        </p>
        <p className={`text-4xl font-black ${textColor}`}>{value}</p>
      </div>
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity ${textColor} bg-white/50 backdrop-blur-sm`}
      >
        {icon}
      </div>
    </div>
  );
}

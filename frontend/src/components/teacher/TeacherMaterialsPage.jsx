import React, { useState } from 'react';
import TeacherHomeworkManager from '../../components/teacher/TeacherHomeworkManager';
import MaterialsTab from '../../components/academics/MaterialsTab';
import TeacherQuestionPaperManager from '../../components/teacher/TeacherQuestionPaperManager';
import { FileText, BookOpen, Lock } from 'lucide-react';

const TeacherMaterialsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState('homework'); // homework | syllabus | questions

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-brand-navy">শিক্ষা উপকরণ ও প্রশ্নপত্র হাব</h2>
          <p className="text-xs text-slate-500">হোমওয়ার্ক প্রদান, সিলেবাস আপলোড ও পরীক্ষার প্রশ্নপত্র জমা দিন।</p>
        </div>

        <div className="flex flex-wrap gap-2 pt-4">
          <button
            onClick={() => setActiveSubTab('homework')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'homework' ? 'bg-[#0F2C59] text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>হোমওয়ার্ক প্রদান</span>
          </button>

          <button
            onClick={() => setActiveSubTab('syllabus')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'syllabus' ? 'bg-[#0F2C59] text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>সিলেবাস ম্যানেজমেন্ট</span>
          </button>

          <button
            onClick={() => setActiveSubTab('questions')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'questions' ? 'bg-[#0F2C59] text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="h-4 w-4 text-orange-400" />
            <span>পরীক্ষার প্রশ্নপত্র জমা</span>
          </button>
        </div>
      </div>

      <div>
        {activeSubTab === 'homework' && <TeacherHomeworkManager />}
        {activeSubTab === 'syllabus' && <MaterialsTab />}
        {activeSubTab === 'questions' && <TeacherQuestionPaperManager />}
      </div>
    </div>
  );
};

export default TeacherMaterialsPage;
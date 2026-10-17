import React, { useState, useEffect } from 'react';
import { getExamsListApi, getMyAdmitCardApi } from '../../api/student';
import { Lock, Printer, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentAdmitCard = () => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [admitData, setAdmitData] = useState(null);
  const [lockError, setLockError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await getExamsListApi();
        const list = res.results || res;
        if (Array.isArray(list) && list.length > 0) {
          setExams(list);
          setSelectedExamId(list[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;

    const fetchAdmitCard = async () => {
      setLoading(true);
      setLockError(null);
      setAdmitData(null);
      try {
        const res = await getMyAdmitCardApi(selectedExamId);
        if (res.success) {
          setAdmitData(res.admit_card);
        }
      } catch (err) {
        if (err.response?.status === 403 && err.response?.data?.is_locked) {
          setLockError(err.response.data);
        } else {
          setLockError({ message: "অ্যাডমিট কার্ড লোড করা সম্ভব হয়নি।" });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdmitCard();
  }, [selectedExamId]);

  return (
    <div className="space-y-6">
      
      {/* অ্যাকশন ও সিলেক্টর বার */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-slate-100 shadow-soft">
        <div>
          <h2 className="text-lg font-bold text-brand-navy">পরীক্ষার প্রবেশপত্র (Admit Card)</h2>
          <p className="text-xs text-slate-500">আপনার বকেয়া পরিশোধ থাকলে প্রবেশপত্র ডাউনলোড ও প্রিন্ট করতে পারবেন।</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:border-brand-orange focus:outline-none"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>

          {admitData && (
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover"
            >
              <Printer className="h-4 w-4" />
              <span>প্রিন্ট</span>
            </button>
          )}
        </div>
      </div>

      {/* কনটেন্ট এলাকা */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : lockError ? (
        /* বকেয়া লকের ফ্রস্টেড গ্লাস কার্ড */
        <div className="mx-auto max-w-xl rounded-3xl bg-gradient-to-br from-red-50 to-orange-50/60 p-8 border border-red-200 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-500/30">
            <Lock className="h-8 w-8" />
          </div>
          <span className="mt-4 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-red-700">
            অ্যাডমিট কার্ড সাময়িকভাবে লক করা আছে
          </span>
          <h3 className="mt-3 text-lg font-bold text-slate-800">
            {lockError.message}
          </h3>
          {lockError.total_due_amount && (
            <p className="mt-2 text-sm font-black text-red-600">
              আপনার মোট বকেয়া: ৳ {lockError.total_due_amount.toFixed(2)}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto">
            {lockError.warning || "কলেজের নিয়ম অনুযায়ী সকল ফি পরিশোধ না করা পর্যন্ত পরীক্ষায় বসার প্রবেশপত্র প্রিন্ট করা যাবে না।"}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/student/invoices"
              className="rounded-xl bg-[#0F2C59] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition"
            >
              বকেয়া ফি বিবরণী দেখুন
            </Link>
          </div>
        </div>
      ) : admitData ? (
        /* প্রিন্ট-রেডি প্রবেশপত্র কার্ড */
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-premium border-2 border-slate-300 print:shadow-none print:border-none print:p-0">
          
          <div className="flex items-center justify-between pb-6 border-b-2 border-slate-800">
            <div>
              <h1 className="text-2xl font-black text-[#0F2C59]">STARLIGHT COLLEGE, SYLHET</h1>
              <p className="text-xs text-slate-600">Sunargown R/A, Dokshin Surma, Sylhet | EIIN: 135342</p>
              <h2 className="text-sm font-extrabold text-brand-orange mt-2 tracking-wide uppercase">
                ADMIT CARD: {admitData.exam_name} ({admitData.session})
              </h2>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs font-bold">
              PHOTO
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 my-6 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div><span className="text-slate-400">Student Name:</span> <span className="font-bold text-slate-900 block">{admitData.student_name}</span></div>
            <div><span className="text-slate-400">Student ID:</span> <span className="font-bold text-brand-navy block">{admitData.student_id}</span></div>
            <div><span className="text-slate-400">Class Roll:</span> <span className="font-bold text-slate-900 block">{admitData.roll_number}</span></div>
            <div><span className="text-slate-400">Class & Group:</span> <span className="font-bold text-slate-900 block">{admitData.class_level} ({admitData.group})</span></div>
            <div><span className="text-slate-400">Exam Hall Room:</span> <span className="font-bold text-brand-orange text-sm block">{admitData.seat_info?.room_number}</span></div>
            <div><span className="text-slate-400">Seat Number:</span> <span className="font-bold text-brand-orange text-sm block">{admitData.seat_info?.seat_number}</span></div>
          </div>

          <div className="my-6">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">অনুমোদিত বিষয়ের তালিকা</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {admitData.subjects?.map((sub, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 bg-slate-50/50">
                  <span className="text-brand-orange font-bold mr-1">[{sub.subject_code}]</span> {sub.subject_name}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-100/70 p-4 text-[11px] text-slate-600 space-y-1">
            <h5 className="font-bold text-slate-800">পরীক্ষার্থীদের জন্য সাধারণ নির্দেশাবলি:</h5>
            {admitData.instructions?.map((ins, i) => (
              <p key={i}>• {ins}</p>
            ))}
          </div>

          <div className="mt-14 pt-6 flex justify-between text-xs font-bold text-slate-700 border-t border-slate-300">
            <div className="text-center">
              <div className="h-0.5 w-36 bg-slate-400 mb-1"></div>
              <span>ইনচার্জের স্বাক্ষর</span>
            </div>
            <div className="text-center">
              <div className="h-0.5 w-36 bg-slate-400 mb-1"></div>
              <span>অধ্যক্ষের স্বাক্ষর</span>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};

export default StudentAdmitCard;
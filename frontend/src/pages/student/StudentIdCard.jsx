import React, { useState, useEffect } from 'react';
import { getMyIdCardApi } from '../../api/student';
import { Printer, GraduationCap, ShieldCheck, QrCode } from 'lucide-react';
import { toast } from 'sonner';

const StudentIdCard = () => {
  const [idCard, setIdCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIdCard = async () => {
      try {
        const res = await getMyIdCardApi();
        if (res.success) {
          setIdCard(res);
        }
      } catch (err) {
        toast.error('আইডি কার্ড লোড করা যায়নি');
      } finally {
        setLoading(false);
      }
    };
    fetchIdCard();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* হেডার ও প্রিন্ট কন্ট্রোল বার */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-slate-100 shadow-soft">
        <div>
          <h2 className="text-lg font-bold text-brand-navy">ডিজিটাল স্টুডেন্ট আইডি কার্ড</h2>
          <p className="text-xs text-slate-500">অফিশিয়াল পরিচয়পত্র প্রিন্ট বা ডাউনলোড করে সাথে রাখুন।</p>
        </div>

        {idCard && (
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition"
          >
            <Printer className="h-4 w-4" />
            <span>আইডি কার্ড প্রিন্ট করুন</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : idCard ? (
        <div className="mx-auto flex flex-col md:flex-row items-center justify-center gap-8 py-6">
          
          {/* ১. আইডি কার্ডের ফ্রন্ট সাইড (Front View) */}
          <div className="relative h-[430px] w-[270px] overflow-hidden rounded-3xl bg-white shadow-premium border-2 border-slate-200 flex flex-col justify-between print:shadow-none print:border-slate-800">
            {/* টপ ব্যানার */}
            <div className="bg-[#0F2C59] p-4 text-center text-white relative">
              <div className="flex justify-center mb-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange text-white shadow-md">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-xs font-black tracking-tight leading-tight uppercase">STARLIGHT COLLEGE</h3>
              <p className="text-[8px] text-orange-200 tracking-wider">SYLHET, BANGLADESH</p>
              <div className="absolute -bottom-3 left-0 right-0 h-3 bg-brand-orange"></div>
            </div>

            {/* ছবি ও পরিচিতি এলাকা */}
            <div className="flex flex-col items-center px-4 pt-3 text-center">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border-2 border-brand-orange bg-slate-100 shadow-md flex items-center justify-center text-slate-400 font-bold text-xs">
                {idCard.photo_url ? (
                  <img src={idCard.photo_url} alt="Student" className="h-full w-full object-cover" />
                ) : (
                  <span>PHOTO</span>
                )}
              </div>

              <h4 className="mt-3 text-sm font-black text-brand-navy leading-tight">{idCard.name}</h4>
              <span className="mt-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[9px] font-bold text-blue-700 border border-blue-200">
                {idCard.class_level} ({idCard.group})
              </span>

              <div className="mt-3 w-full space-y-1 text-left text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Student ID:</span>
                  <span className="font-bold text-brand-navy">{idCard.student_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Class Roll:</span>
                  <span className="font-bold text-slate-800">{idCard.roll}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Section:</span>
                  <span className="font-bold text-slate-800">{idCard.section}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blood Group:</span>
                  <span className="font-extrabold text-red-600">{idCard.blood_group}</span>
                </div>
              </div>
            </div>

            {/* ফ্রন্ট কার্ডের ফুটার */}
            <div className="bg-[#0F2C59] py-2 text-center text-[9px] font-bold text-white tracking-widest">
              STUDENT IDENTITY CARD
            </div>
          </div>

          {/* ২. আইডি কার্ডের ব্যাক সাইড (Back View) */}
          <div className="relative h-[430px] w-[270px] overflow-hidden rounded-3xl bg-white shadow-premium border-2 border-slate-200 flex flex-col justify-between p-4 text-center print:shadow-none print:border-slate-800">
            <div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 mb-3 text-left text-[10px] space-y-1.5">
                <div><span className="text-slate-400 block text-[9px]">Emergency Contact:</span> <span className="font-bold text-slate-800">{idCard.guardian_phone}</span></div>
                <div><span className="text-slate-400 block text-[9px]">Session:</span> <span className="font-bold text-slate-800">{idCard.session}</span></div>
                <div><span className="text-slate-400 block text-[9px]">Campus Address:</span> <span className="font-medium text-slate-600 text-[8px]">Sunargown R/A, Dokshin Surma, Sylhet</span></div>
              </div>

              {/* ভেরিফিকেশন কিউআর কোড */}
              <div className="my-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <QrCode className="h-20 w-20 text-[#0F2C59]" />
                <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Scan to Verify Identity</span>
              </div>

              <p className="text-[8px] text-slate-500 leading-tight">
                এই কার্ডটি কলেজ প্রাঙ্গণে সবসময় ধারণ করা আবশ্যক। কার্ডটি হারিয়ে গেলে অবিলম্বে কলেজ অফিসে যোগাযোগ করুন।
              </p>
            </div>

            {/* অধ্যক্ষের স্বাক্ষর এরিয়া */}
            <div className="pt-2 border-t border-slate-200 text-center">
              <div className="h-0.5 w-24 bg-slate-400 mx-auto mb-1"></div>
              <span className="text-[9px] font-bold text-slate-700">Principal Signature</span>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};

export default StudentIdCard;
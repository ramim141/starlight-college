import React, { useState } from 'react';
import { submitComplaintApi } from '../../api/certificate';
import { ShieldCheck, Send, Lock } from 'lucide-react';
import { toast } from 'sonner';

const StudentComplaintPage = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('CLASSROOM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('শিরোনাম ও বিবরণ পূরণ করুন');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitComplaintApi({
        title,
        category,
        description
      });
      if (res.id) {
        toast.success('আপনার অভিযোগ/পরামর্শ সফলভাবে অধ্যক্ষের কাছে পৌঁছানো হয়েছে।');
        setTitle('');
        setDescription('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'অভিযোগ পাঠানো সম্ভব হয়নি');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* প্রটেকশন নিশ্চয়তা ব্যানার */}
      <div className="rounded-3xl bg-[#0F2C59] p-6 text-white shadow-soft flex items-center space-x-4">
        <div className="h-12 w-12 rounded-2xl bg-brand-orange flex items-center justify-center text-white shrink-0">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold">গোপন অভিযোগ ও পরামর্শ বক্স</h2>
          <p className="text-xs text-slate-300">আপনার পরিচয় কোনো সহপাঠী বা শিক্ষকের কাছে কখনোই প্রকাশ করা হবে না। সরাসরি অধ্যক্ষ এটি পর্যালোচনা করবেন।</p>
        </div>
      </div>

      {/* সাবমিশন ফর্ম */}
      <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">অভিযোগের বিভাগ / ক্যাটাগরি</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:border-brand-orange focus:outline-none"
            >
              <option value="CLASSROOM">শ্রেণিকক্ষ ও পরিবেশগত সমস্যা (Classroom Facility)</option>
              <option value="BULLYING">র‌্যাগিং বা বুলিং (Bullying/Harassment)</option>
              <option value="TEACHER">শিক্ষক সংক্রান্ত মতামত (Teacher Feedback)</option>
              <option value="CAMPUS">ক্যান্টিন ও ক্যাম্পাস পরিচ্ছন্নতা (Campus & Canteen)</option>
              <option value="ACADEMIC">পড়ালেখা ও পরীক্ষা সংক্রান্ত (Academic)</option>
              <option value="OTHER">অন্যান্য সাধারণ পরামর্শ (Other)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">সংক্ষিপ্ত শিরোনাম</label>
            <input
              type="text"
              placeholder="যেমন: রুম ৩০২-এর ফ্যান ঘুরছে না অথবা লাইব্রেরির সময় বৃদ্ধি"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">বিস্তারিত বিবরণ</label>
            <textarea
              rows="4"
              placeholder="সমস্যা বা পরামর্শের বিস্তারিত এখানে লিখুন..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 focus:border-brand-orange focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 rounded-xl bg-brand-orange px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition disabled:opacity-70"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'পাঠানো হচ্ছে...' : 'গোপনে প্রেরণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default StudentComplaintPage;
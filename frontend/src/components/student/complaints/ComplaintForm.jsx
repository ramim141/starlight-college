import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  Send, 
  Lock, 
  Paperclip, 
  X, 
  FileText, 
  AlertCircle, 
  School, 
  UserCheck, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'CLASSROOM', label: 'শ্রেণিকক্ষ ও সুবিধা', icon: School, desc: 'রুম, ফ্যান, লাইট বা বেঞ্চ' },
  { id: 'BULLYING', label: 'র‌্যাগিং বা বুলিং', icon: ShieldAlert, desc: 'উত্ত্যক্ত বা অসদাচরণ' },
  { id: 'TEACHER', label: 'শিক্ষক সংক্রান্ত', icon: UserCheck, desc: 'ক্লাস বা শিক্ষণ মতামত' },
  { id: 'CAMPUS', label: 'ক্যাম্পাস ও পরিচ্ছন্নতা', icon: Sparkles, desc: 'ক্যান্টিন, ওয়াশরুম' },
  { id: 'ACADEMIC', label: 'পড়ালেখা ও পরীক্ষা', icon: BookOpen, desc: 'সিলেবাস ও পরীক্ষা' },
  { id: 'OTHER', label: 'অন্যান্য পরামর্শ', icon: HelpCircle, desc: 'সাধারণ যে কোনো বিষয়' },
];

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];

const ComplaintForm = ({ onSubmit, submitting }) => {
  const [category, setCategory] = useState('CLASSROOM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError('কেবল JPG, PNG, PDF অথবা DOC/DOCX ফাইল আপলোড করা যাবে');
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      setFileError('ফাইলের আকার সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে');
      return;
    }

    setAttachment(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (trimmedTitle.length < 5) {
      toast.error('শিরোনাম কমপক্ষে ৫ অক্ষরের হতে হবে');
      return;
    }

    if (trimmedDesc.length < 20) {
      toast.error('বিবরণ কমপক্ষে ২০ অক্ষরের হতে হবে');
      return;
    }

    const formData = new FormData();
    formData.append('category', category);
    formData.append('title', trimmedTitle);
    formData.append('description', trimmedDesc);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    onSubmit(formData, () => {
      setTitle('');
      setDescription('');
      removeAttachment();
    });
  };

  const isFormValid = title.trim().length >= 5 && description.trim().length >= 20;

  return (
    <div className="space-y-6">
      {/* গোপনীয়তার নিশ্চয়তা ব্যানার */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0F2C59] to-slate-900 p-5 text-white shadow-soft flex items-start sm:items-center space-x-4 border border-blue-900/40">
        <div className="h-12 w-12 rounded-2xl bg-brand-orange/90 flex items-center justify-center text-white shrink-0 shadow-md shadow-brand-orange/20">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white">১০০% সুরক্ষিত ও গোপন চ্যানেল</h2>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
              অধ্যক্ষ সরাসরি পর্যবেক্ষক
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            আপনার কোনো সহপাঠী বা শিক্ষক কখনোই এই বার্তা দেখতে পাবেন না। ভুয়া অভিযোগ রোধে কেবল অধ্যক্ষ মহোদয় প্রেরকের তথ্য দেখতে পান এবং প্রয়োজনীয় প্রশাসনিক পদক্ষেপ নেন।
          </p>
        </div>
      </div>

      {/* ফর্ম কার্ড */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ক্যাটাগরি চিপস */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              অভিযোগ বা পরামর্শের বিষয় নির্বাচন করুন <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition min-h-[58px] ${
                      isSelected
                        ? 'border-brand-navy bg-brand-navy text-white shadow-md shadow-brand-navy/20'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 w-full">
                      <IconComponent className={`h-4 w-4 shrink-0 ${isSelected ? 'text-brand-orange' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold leading-tight truncate">{cat.label}</span>
                    </div>
                    <span className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {cat.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* সংক্ষিপ্ত শিরোনাম */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                সংক্ষিপ্ত শিরোনাম <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[11px] font-semibold ${title.length > 200 ? 'text-rose-600' : 'text-slate-400'}`}>
                {title.length} / ২০০
              </span>
            </div>
            <input
              type="text"
              maxLength={200}
              placeholder="যেমন: রুম ৩০২-এর ফ্যান সমস্যা অথবা লাইব্রেরির বই সংখ্যা বৃদ্ধি..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none transition min-h-[44px]"
              required
            />
          </div>

          {/* বিস্তারিত বিবরণ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                ঘটনা বা পরামর্শের বিস্তারিত বিবরণ <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[11px] font-semibold ${description.length < 20 ? 'text-amber-600' : 'text-slate-400'}`}>
                {description.length < 20 ? `কমপক্ষে ২০ অক্ষর (বর্তমান: ${description.length})` : `${description.length} / ২০০০`}
              </span>
            </div>
            <textarea
              rows={5}
              maxLength={2000}
              placeholder="কোথায়, কখন বা কার সাথে কী ঘটেছে অথবা কী পরিবর্তন প্রয়োজন — পরিষ্কারভাবে উল্লেখ করুন..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none transition leading-relaxed"
              required
            />
          </div>

          {/* ফাইল অ্যাটাচমেন্ট (ঐচ্ছিক) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              প্রমাণক বা ছবি সংযুক্ত করুন (ঐচ্ছিক)
            </label>
            
            {!attachment ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  className="hidden"
                  id="complaint-attachment"
                />
                <label
                  htmlFor="complaint-attachment"
                  className="flex items-center justify-center space-x-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-4 text-xs font-semibold text-slate-600 hover:border-brand-orange hover:bg-orange-50/20 cursor-pointer transition min-h-[44px]"
                >
                  <Paperclip className="h-4 w-4 text-slate-400" />
                  <span>ছবি বা ডকুমেন্টস যুক্ত করুন (JPG, PNG, PDF — সর্বোচ্চ ৫MB)</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center space-x-2.5 truncate">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-brand-navy shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">{attachment.name}</p>
                    <p className="text-[10px] text-slate-400">{(attachment.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                  title="ফাইল মুছুন"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {fileError && (
              <p className="mt-1.5 text-xs font-medium text-rose-600 flex items-center space-x-1">
                <AlertCircle className="h-3.5 w-3.5 inline shrink-0" />
                <span>{fileError}</span>
              </p>
            )}
          </div>

          {/* সাবমিট অ্যাকশন */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1 order-2 sm:order-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>সাবমিট বাটনে চাপলে সরাসরি অধ্যক্ষের ইনবক্সে পৌঁছে যাবে</span>
            </span>

            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className="w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center space-x-2 rounded-xl bg-brand-orange px-8 py-3 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
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

export default ComplaintForm;

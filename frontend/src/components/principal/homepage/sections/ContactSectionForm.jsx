import { Save, Loader2, PhoneCall } from 'lucide-react';

const ContactSectionForm = ({ data = {}, onSave, saving = false, onMarkDirty }) => {
  const [formData, setFormData] = useState({
    badge: '',
    title: '',
    description: '',
    address: '',
    hotline: '',
    office_hours: '',
    form_title: '',
    form_description: '',
    ...data,
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (onMarkDirty) onMarkDirty();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave('contact', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 ">
        <div>
          <h2 className="text-base font-bold text-brand-navy  flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-brand-orange" />
            যোগাযোগ ও অনুসন্ধান সেকশন (Contact Section)
          </h2>
          <p className="text-xs text-slate-500">
            ক্যাম্পাসের ঠিকানা, হেল্পলাইন হটলাইন, অফিস সময়সূচি ও ইনকোয়ারি ফর্ম
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 px-6 text-xs font-bold text-white shadow-md transition disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>সংরক্ষণ হচ্ছে...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>পরিবর্তন সংরক্ষণ করুন</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">সেকশন ব্যাজ</label>
          <input
            type="text"
            value={formData.badge || ''}
            onChange={(e) => handleChange('badge', e.target.value)}
            placeholder="যেমন: যোগাযোগ করুন"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">শিরোনাম (Title)</label>
          <input
            type="text"
            required
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="যেমন: সরাসরি ক্যাম্পাসে আসুন বা যোগাযোগ করুন"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-bold focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700  mb-1">বিবরণ</label>
        <textarea
          rows={2}
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="যোগাযোগ সেকশনের ভূমিকা..."
          className="w-full rounded-xl border border-slate-300  bg-white  p-3 text-xs leading-relaxed focus:ring-2 focus:ring-brand-orange focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">ক্যাম্পাসের ঠিকানা</label>
          <textarea
            rows={3}
            required
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="যেমন: সোনারগাঁও আবাসিক এলাকা, দক্ষিণ সুরমা, সিলেট"
            className="w-full rounded-xl border border-slate-300  bg-white  p-2.5 text-xs leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">হটলাইন / মোবাইল নম্বর</label>
          <input
            type="text"
            required
            value={formData.hotline || ''}
            onChange={(e) => handleChange('hotline', e.target.value)}
            placeholder="যেমন: +880 1711-000000"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">অফিস সময়সূচি</label>
          <input
            type="text"
            required
            value={formData.office_hours || ''}
            onChange={(e) => handleChange('office_hours', e.target.value)}
            placeholder="যেমন: রবি - বৃহস্পতি: সকাল ৯:০০ - বিকাল ৪:০০"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50  border border-slate-200 ">
        <div>
          <label className="block text-xs font-bold text-brand-navy  mb-1">
            ইনকোয়ারি ফর্মের শিরোনাম
          </label>
          <input
            type="text"
            value={formData.form_title || ''}
            onChange={(e) => handleChange('form_title', e.target.value)}
            placeholder="যেমন: বার্তা পাঠান বা তথ্য জানতে চান?"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-navy  mb-1">
            ইনকোয়ারি ফর্মের সাব-টেক্সট
          </label>
          <input
            type="text"
            value={formData.form_description || ''}
            onChange={(e) => handleChange('form_description', e.target.value)}
            placeholder="যেমন: আমরা ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করব।"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs"
          />
        </div>
      </div>
    </form>
  );
};

export default ContactSectionForm;

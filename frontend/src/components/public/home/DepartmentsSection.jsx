import React, { useState } from 'react';
import { Laptop, CreditCard, BookOpen, Check, ChevronDown } from 'lucide-react';

const DepartmentsSection = ({ content = [] }) => {
  const [expandedDept, setExpandedDept] = useState(null);
  const departments = Object.fromEntries(content.map((department) => [department.key, department]));

  return (
    <section id="departments" className="bg-white py-14 sm:py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6">
        
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <span className="rounded-full bg-orange-50 border border-orange-200/60 px-3.5 py-1 text-xs font-black text-[#EA580C]">
            উচ্চমাধ্যমিক পাঠ্যক্রম
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0F2C59] tracking-tight mt-2">
            আমাদের ৩টি একাডেমিক বিভাগ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            বাংলাদেশ শিক্ষা বোর্ড নির্ধারিত সিলেবাস অনুযায়ী বিশ্বমানের বিজ্ঞান, বাণিজ্য ও মানবিক অনুষদ
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* বিভাগ ১: বিজ্ঞান */}
          <div className="group rounded-3xl bg-slate-50/70 p-6 border-2 border-slate-200/80 hover:border-[#EA580C] hover:bg-white hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-xl">
            <div>
              <div className="flex items-center justify-center w-12 h-12 text-white transition-transform duration-300 shadow-md rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 group-hover:scale-110">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#0F2C59] mt-4">{departments.science?.title || 'বিজ্ঞান বিভাগ (Science)'}</h3>
              <p className="mt-1 text-xs text-slate-500">{departments.science?.description || 'ভবিষ্যতের ডাক্তার, প্রকৌশলী ও বিজ্ঞানী তৈরির শ্রেষ্ঠ প্ল্যাটফর্ম।'}</p>

              <div className="my-4 space-y-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>পদার্থ, রসায়ন, গণিত ও জীববিজ্ঞান ল্যাব</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>মেডিকেল ও বুয়েট ভর্তি প্রস্তুতি ফাউন্ডেশন</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ন্যূনতম ভর্তি যোগ্যতা: SSC GPA 4.00</span>
                </div>
              </div>

              {/* স্মুথ কলাপ্সিবল এক্সপ্যানশন (Rule 2) */}
              <div className={`grid transition-all duration-300 ease-out ${expandedDept === 'sci' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-3 pb-2 text-[11px] text-slate-600 border-t border-slate-100 space-y-1.5 bg-orange-50/50 p-2.5 rounded-xl">
                    <p><strong>বাধ্যতামূলক বিষয়:</strong> বাংলা, ইংরেজি, আইসিটি, পদার্থবিজ্ঞান, রসায়ন।</p>
                    <p><strong>ঐচ্ছিক বিষয়:</strong> উচ্চতর গণিত / জীববিজ্ঞান।</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setExpandedDept(expandedDept === 'sci' ? null : 'sci')}
                className="text-xs font-bold text-slate-600 hover:text-[#EA580C] cursor-pointer flex items-center space-x-1 min-h-[44px]"
              >
                <span>{expandedDept === 'sci' ? 'সংক্ষেপ করুন' : 'সিলেবাস দেখুন'}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expandedDept === 'sci' ? 'rotate-180' : ''}`} />
              </button>
              <a href="#admission" className="text-xs font-black text-[#EA580C] hover:underline">
                ভর্তি তথ্য &rarr;
              </a>
            </div>
          </div>

          {/* বিভাগ ২: ব্যবসায় শিক্ষা */}
          <div className="flex flex-col justify-between p-6 transition-all duration-300 border-2 shadow-xs group rounded-3xl bg-slate-50/70 border-slate-200/80 hover:border-emerald-500 hover:bg-white hover:-translate-y-1 hover:shadow-xl">
            <div>
              <div className="flex items-center justify-center w-12 h-12 text-white transition-transform duration-300 shadow-md rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 group-hover:scale-110">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#0F2C59] mt-4">{departments.business?.title || 'ব্যবসায় শিক্ষা (Business Studies)'}</h3>
              <p className="mt-1 text-xs text-slate-500">{departments.business?.description || 'করপোরেট লিডার, ব্যাংকার ও সফল উদ্যোক্তা গড়ার বিশেষায়িত পাঠক্রম।'}</p>

              <div className="my-4 space-y-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>হিসাববিজ্ঞান, ফিন্যান্স ও ব্যবসায় সংগঠন</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ডিজিটাল অ্যাকাউন্টিং ও সফটওয়্যার ল্যাব</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ন্যূনতম ভর্তি যোগ্যতা: SSC GPA 3.00</span>
                </div>
              </div>

              <div className={`grid transition-all duration-300 ease-out ${expandedDept === 'bus' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-3 pb-2 text-[11px] text-slate-600 border-t border-slate-100 space-y-1.5 bg-emerald-50/50 p-2.5 rounded-xl">
                    <p><strong>বাধ্যতামূলক বিষয়:</strong> বাংলা, ইংরেজি, আইসিটি, হিসাববিজ্ঞান, ব্যবসায় সংগঠন।</p>
                    <p><strong>ঐচ্ছিক বিষয়:</strong> ফিন্যান্স ও ব্যাংকিং / বিপণন।</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setExpandedDept(expandedDept === 'bus' ? null : 'bus')}
                className="text-xs font-bold text-slate-600 hover:text-emerald-600 cursor-pointer flex items-center space-x-1 min-h-[44px]"
              >
                <span>{expandedDept === 'bus' ? 'সংক্ষেপ করুন' : 'সিলেবাস দেখুন'}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expandedDept === 'bus' ? 'rotate-180' : ''}`} />
              </button>
              <a href="#admission" className="text-xs font-black text-emerald-600 hover:underline">
                ভর্তি তথ্য &rarr;
              </a>
            </div>
          </div>

          {/* বিভাগ ৩: মানবিক */}
          <div className="flex flex-col justify-between p-6 transition-all duration-300 border-2 shadow-xs group rounded-3xl bg-slate-50/70 border-slate-200/80 hover:border-purple-500 hover:bg-white hover:-translate-y-1 hover:shadow-xl">
            <div>
              <div className="flex items-center justify-center w-12 h-12 text-white transition-transform duration-300 shadow-md rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 group-hover:scale-110">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#0F2C59] mt-4">{departments.humanities?.title || 'মানবিক বিভাগ (Humanities)'}</h3>
              <p className="mt-1 text-xs text-slate-500">আইনজীবী, বিসিএস ক্যাডার ও সমাজবিজ্ঞানীদের পাদপীঠ।</p>

              <div className="my-4 space-y-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>অর্থনীতি, পৌরনীতি, যুক্তিবিদ্যা ও সমাজকল্যাণ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>বিশ্ববিদ্যালয় 'খ' ইউনিট ভর্তি গাইডেন্স</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ন্যূনতম ভর্তি যোগ্যতা: SSC GPA 2.50</span>
                </div>
              </div>

              <div className={`grid transition-all duration-300 ease-out ${expandedDept === 'hum' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-3 pb-2 text-[11px] text-slate-600 border-t border-slate-100 space-y-1.5 bg-purple-50/50 p-2.5 rounded-xl">
                    <p><strong>বাধ্যতামূলক বিষয়:</strong> বাংলা, ইংরেজি, আইসিটি, পৌরনীতি ও সুশাসন, অর্থনীতি।</p>
                    <p><strong>ঐচ্ছিক বিষয়:</strong> যুক্তিবিদ্যা / সমাজকর্ম / ইসলামের ইতিহাস।</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setExpandedDept(expandedDept === 'hum' ? null : 'hum')}
                className="text-xs font-bold text-slate-600 hover:text-purple-600 cursor-pointer flex items-center space-x-1 min-h-[44px]"
              >
                <span>{expandedDept === 'hum' ? 'সংক্ষেপ করুন' : 'সিলেবাস দেখুন'}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expandedDept === 'hum' ? 'rotate-180' : ''}`} />
              </button>
              <a href="#admission" className="text-xs font-black text-purple-600 hover:underline">
                ভর্তি তথ্য &rarr;
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default DepartmentsSection;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Upload, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  FileSpreadsheet, 
  Copy, 
  Check 
} from 'lucide-react';
import { modalBackdropVariants, modalDialogVariants } from '../../../utils/motion';
import api from '../../../api/client';
import { toast } from 'sonner';

const StudentBulkImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [backendErrors, setBackendErrors] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xlsm')) {
        toast.error('শুধুমাত্র .xlsx অথবা .xlsm Excel ফাইল আপলোড করা যাবে');
        return;
      }
      setSelectedFile(file);
      setBackendErrors([]);
      setImportResults(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('অনুগ্রহ করে একটি Excel ফাইল নির্বাচন করুন');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    setImporting(true);
    setBackendErrors([]);

    try {
      const response = await api.post('academics/students/bulk-import/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResults(response.data?.data || []);
      toast.success(response.data?.message || 'শিক্ষার্থীদের তালিকা সফলভাবে ইমপোর্ট হয়েছে');
      onSuccess && onSuccess();
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        setBackendErrors(errors);
        toast.error(`ইমপোর্টে ${errors.length}টি লাইনে ত্রুটি পাওয়া গেছে। সংশোধন করে পুনরায় আপলোড করুন।`);
      } else {
        toast.error(error.response?.data?.message || 'Excel ফাইল প্রসেসিং ব্যর্থ হয়েছে');
      }
    } finally {
      setImporting(false);
    }
  };

  const copyRowPin = (pin, idx) => {
    navigator.clipboard.writeText(pin);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
    toast.success('PIN কপি করা হয়েছে');
  };

  const downloadErrorReportCsv = () => {
    if (!backendErrors.length) return;
    const rows = [['Row Number', 'Error Details']];
    backendErrors.forEach((e) => {
      rows.push([e.row, JSON.stringify(e.error)]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'student_import_errors.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        variants={modalBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <motion.div
        variants={modalDialogVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col"
      >
        {/* মোডাল হেডার */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#0A2147] to-[#0F2C59] p-5 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-brand-orange text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Excel ফাইলে শিক্ষার্থী বাল্ক ভর্তি</h3>
              <p className="text-xs text-slate-300">অফিসিয়াল টেমপ্লেট ব্যবহার করে একসাথে সকল শিক্ষার্থী ভর্তি ও PIN জেনারেট</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* কনটেন্ট বডি */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          {/* টেমপ্লেট ডাউনলোড গাইড */}
          <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="font-bold text-brand-navy">অফিসিয়াল এক্সেল টেমপ্লেট</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                হেডার কলাম, ডেটা ফরম্যাট ও নির্দেশিকা সহ টেমপ্লেটটি ডাউনলোড করে পূরণ করুন।
              </p>
            </div>
            <a
              href="/student_import_template.xlsx"
              download
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-blue-300 text-brand-navy font-bold hover:bg-blue-50 transition shrink-0 min-h-[40px]"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>টেমপ্লেট ডাউনলোড</span>
            </a>
          </div>

          {/* ফাইল আপলোড জোন */}
          {!importResults && (
            <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-3 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-700">পূরণকৃত Excel ফাইলটি এখানে ড্রপ করুন অথবা নির্বাচন করুন</p>
                <p className="text-[11px] text-slate-400 mt-0.5">সমর্থিত ফরম্যাট: .xlsx, .xlsm</p>
              </div>

              <input
                type="file"
                id="bulk-student-file"
                accept=".xlsx, .xlsm"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="bulk-student-file"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white font-bold cursor-pointer hover:bg-slate-800 transition min-h-[42px]"
              >
                <span>ফাইল পছন্দ করুন</span>
              </label>

              {selectedFile && (
                <p className="font-mono text-xs font-bold text-emerald-700 mt-2">
                  নির্বাচিত ফাইল: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          )}

          {/* ব্যাকএন্ড ত্রুটি তালিকা */}
          {backendErrors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>ইমপোর্ট ত্রুটি ({backendErrors.length}টি লাইনে সমস্যা):</span>
                </h4>
                <button
                  type="button"
                  onClick={downloadErrorReportCsv}
                  className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ত্রুটি রিপোর্ট ডাউনলোড</span>
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-[11px] text-rose-700 bg-white p-3 rounded-xl border border-rose-200">
                {backendErrors.map((err, i) => (
                  <div key={i} className="pb-1 border-b border-rose-100 last:border-none">
                    <strong>লাইন {err.row}:</strong> {typeof err.error === 'object' ? JSON.stringify(err.error) : err.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* সফল ইমপোর্ট রেজাল্ট */}
          {importResults && importResults.length > 0 && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  মোট {importResults.length} জন শিক্ষার্থীর অ্যাকাউন্ট ও পিন সফলভাবে তৈরি হয়েছে!
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5">শিক্ষার্থীর নাম</th>
                      <th className="p-2.5">SSC Roll</th>
                      <th className="p-2.5">সিস্টেম PIN</th>
                      <th className="p-2.5 text-right">কপি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importResults.map((res, i) => (
                      <tr key={res.id || i} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-800">{res.name}</td>
                        <td className="p-2.5 font-mono text-slate-600">{res.ssc_roll}</td>
                        <td className="p-2.5 font-mono font-bold text-brand-orange">{res.pin}</td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => copyRowPin(res.pin, i)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                            title="PIN কপি করুন"
                          >
                            {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ফুটার */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 min-h-[44px] cursor-pointer"
          >
            {importResults ? 'বন্ধ করুন' : 'বাতিল'}
          </button>
          {!importResults && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || importing}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-orange text-white font-extrabold shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50 min-h-[44px] cursor-pointer"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ইমপোর্ট হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>ফাইল প্রসেস করুন</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentBulkImportModal;

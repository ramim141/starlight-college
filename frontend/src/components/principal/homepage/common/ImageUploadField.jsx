import React, { useState, useEffect } from 'react';
import { ImagePlus, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getMediaUrl } from '../../../../api/homepage';

const MAX_SIZE_MB = 2;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

const ImageUploadField = ({
  label = 'ছবি নির্বাচন করুন',
  currentValue = null,
  onChange,
  disabled = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (currentValue instanceof File) {
      const objectUrl = URL.createObjectURL(currentValue);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof currentValue === 'string' && currentValue) {
      setPreviewUrl(getMediaUrl(currentValue));
    } else {
      setPreviewUrl(null);
    }
  }, [currentValue]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('শুধুমাত্র JPG, PNG বা WebP ফরম্যাটের ছবি আপলোড করুন');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`ছবির সাইজ সর্বোচ্চ ${MAX_SIZE_MB}MB হতে পারবে`);
      return;
    }

    onChange(file);
    toast.success('ছবি নির্বাচিত হয়েছে');
  };

  const handleRemove = () => {
    onChange(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-2">
      <span className="block text-xs font-bold text-slate-700 ">
        {label}
      </span>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 rounded-2xl border border-slate-200  bg-[#F3F6FB]/70 ">
        {previewUrl ? (
          <div className="relative group rounded-xl overflow-hidden border border-slate-300  bg-white  w-24 h-24 shrink-0 shadow-sm flex items-center justify-center">
            <img
              src={previewUrl}
              alt="প্রিভিউ"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                title="ছবি সরান"
                className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition min-h-[28px] min-w-[28px] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300  bg-white  flex flex-col items-center justify-center text-slate-400 shrink-0">
            <ImagePlus className="w-6 h-6 stroke-1 mb-1 text-slate-400" />
            <span className="text-[10px] font-semibold">ছবি নেই</span>
          </div>
        )}

        <div className="flex-1 space-y-1.5">
          <label className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-white  border border-slate-300  px-4 py-2 text-xs font-bold text-[#0F2C59]  shadow-sm hover:border-brand-orange hover:text-brand-orange transition">
            <RefreshCw className="w-3.5 h-3.5 text-brand-orange" />
            <span>{previewUrl ? 'নতুন ছবি নির্বাচন' : 'ডিভাইস থেকে ছবি তুলুন'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              disabled={disabled}
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
          <p className="text-[11px] text-slate-500 ">
            সমর্থিত ফরম্যাট: JPG, PNG, WebP (সর্বোচ্চ {MAX_SIZE_MB}MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;

import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Grid, 
  Users, 
  Search,
  Layers,
  Sparkles
} from 'lucide-react';
import ExamRoomModal from '../modals/ExamRoomModal';

const ExamRoomsTab = ({
  rooms = [],
  loading = false,
  isPrincipal = false,
  onCreateRoom,
  onUpdateRoom,
  onDeleteRoom,
  isCreating = false,
  isUpdating = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteConfirmRoom, setDeleteConfirmRoom] = useState(null);

  const filteredRooms = rooms.filter((r) => {
    return (
      r.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.building?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalCapacity = rooms.reduce((acc, r) => acc + (Number(r.capacity) || 0), 0);
  const totalBenches = rooms.reduce((acc, r) => acc + (Number(r.benches_count) || Math.floor((r.capacity || 0) / 2)), 0);

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setShowModal(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setShowModal(true);
  };

  const handleSaveRoom = async (payload) => {
    if (editingRoom) {
      await onUpdateRoom({ id: editingRoom.id, payload });
    } else {
      await onCreateRoom(payload);
    }
    setShowModal(false);
    setEditingRoom(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmRoom) {
      await onDeleteRoom(deleteConfirmRoom.id);
      setDeleteConfirmRoom(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* সামারি ও ফিল্টার বার */}
      <div className="flex flex-col gap-4 p-5 bg-white border md:flex-row md:items-center md:justify-between dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="absolute w-4 h-4 text-slate-400 left-3 top-2.5" />
            <input
              type="text"
              placeholder="রুম নম্বর বা ভবন খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-brand-orange border border-amber-200/50">
              মোট কক্ষ: {rooms.length} টি
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200/50">
              মোট আসন: {totalCapacity} জন
            </span>
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border border-indigo-200/50">
              মোট বেঞ্চ: {totalBenches} টি
            </span>
          </div>
        </div>

        {isPrincipal && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" /> নতুন পরীক্ষা কক্ষ
          </button>
        )}
      </div>

      {/* স্কেলিটন বা লোডিং */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 space-y-4 animate-pulse">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="w-1/2 h-5 mx-auto rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-3/4 h-4 mx-auto rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        /* খালি তালিকা */
        <div className="py-16 text-center bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-2xl bg-orange-50 dark:bg-orange-950/20 text-brand-orange">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            কোনো পরীক্ষা কক্ষ পাওয়া যায়নি
          </h3>
          <p className="max-w-md mx-auto text-xs text-slate-500">
            {searchTerm
              ? 'অনুসন্ধানের সাথে কোনো কক্ষ মেলেনি।'
              : 'পরীক্ষার হল ও সিট প্ল্যানিংয়ের জন্য "নতুন পরীক্ষা কক্ষ" তৈরি করুন।'}
          </p>
        </div>
      ) : (
        /* রুম কার্ড গ্রিড */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredRooms.map((r) => {
            const benchCount = Number(r.benches_count) || Math.floor((r.capacity || 40) / 2) || 20;
            const cols = 4;
            const rows = Math.ceil(benchCount / cols) || 5;

            return (
              <div
                key={r.id}
                className="relative flex flex-col justify-between p-6 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-md transition-all text-center group"
              >
                <div>
                  <div className="flex items-center justify-center w-14 h-14 mx-auto font-mono text-lg font-black rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-brand-orange border border-amber-200/50">
                    {r.room_number}
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">
                    কক্ষ {r.room_number}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {r.building || 'মূল ভবন'}
                  </p>

                  {/* ধারণক্ষমতা ও গ্রিড বিবরণ */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-left">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-emerald-500" /> ধারণক্ষমতা:
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200">{r.capacity} জন</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Grid className="w-3.5 h-3.5 text-indigo-500" /> সিট গ্রিড মাত্রা:
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">
                        {rows} × {cols} বেঞ্চ
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Layers className="w-3.5 h-3.5 text-brand-orange" /> মোট বেঞ্চ:
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">
                        {benchCount} টি
                      </strong>
                    </div>
                  </div>
                </div>

                {/* অ্যাকশন বাটনস */}
                {isPrincipal && (
                  <div className="flex items-center justify-center gap-2 pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenEdit(r)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> সম্পাদনা
                    </button>
                    <button
                      onClick={() => setDeleteConfirmRoom(r)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> মুছুন
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ক্রিয়েট / এডিট মডাল */}
      <ExamRoomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSaveRoom}
        initialData={editingRoom}
        isSubmitting={isCreating || isUpdating}
      />

      {/* ডিলিট কনফার্মেশন মডাল */}
      {deleteConfirmRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm p-6 space-y-4 bg-white border shadow-2xl dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                পরীক্ষা কক্ষ মুছে ফেলতে চান?
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                "কক্ষ {deleteConfirmRoom.room_number}" মুছে ফেলা হলে এর সিট প্ল্যানিং প্রভাবিত হতে পারে।
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmRoom(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamRoomsTab;

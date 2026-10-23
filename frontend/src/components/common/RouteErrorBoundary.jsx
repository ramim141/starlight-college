import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route chunk load failure:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-soft mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-brand-navy mb-2">
            পৃষ্ঠাটি লোড করতে সমস্যা হয়েছে
          </h2>
          <p className="max-w-md text-sm text-slate-500 mb-6 leading-relaxed">
            ইন্টারনেট সংযোগ বিঘ্নিত হওয়ায় বা নতুন সংস্করণ আপডেটের কারণে পৃষ্ঠাটি লোড করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="flex items-center space-x-2 rounded-xl bg-brand-navy px-6 py-3 text-sm font-bold text-white shadow-soft hover:bg-slate-800 transition active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>পুনরায় চেষ্টা করুন</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default RouteErrorBoundary;

import React from 'react';
import { AlertCircle, X, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true,
  type = 'danger',
}) => {
  if (!isOpen) return null;

  const colorClasses = {
    danger: 'bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white shadow-red-500/20',
    warning: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 text-white shadow-orange-500/20',
    info: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-white shadow-blue-500/20',
    success: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 text-white shadow-emerald-500/20',
  };

  const iconClasses = {
    danger: 'text-red-500 bg-red-100 dark:bg-red-900/30',
    warning: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
    info: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    success: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30',
  };

  const Icon = {
    danger: AlertTriangle,
    warning: AlertCircle,
    info: Info,
    success: CheckCircle2,
  }[type];

  const handleClose = () => {
    if (onCancel) onCancel();
    else onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 transform transition-all animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-start justify-between">
            <div className={`p-4 rounded-2xl ${iconClasses[type]} shrink-0 shadow-inner`}>
              <Icon className="h-6 w-6" />
            </div>
            <button 
              onClick={handleClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {title}
            </h3>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-base leading-relaxed font-medium">
              {message}
            </p>
          </div>

          <div className={`mt-10 flex items-center gap-3 ${showCancel ? 'sm:flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                if (onCancel) onCancel();
              }}
              className={`${showCancel ? 'w-full sm:w-auto' : 'w-full'} px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${colorClasses[type]}`}
            >
              {confirmText}
            </button>
            {showCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

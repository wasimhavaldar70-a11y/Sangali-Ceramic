import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ show, message, type, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 z-[200] max-w-sm w-full"
        >
          <div className={`flex items-start gap-3 p-4 border backdrop-blur-md shadow-2xl ${
            type === 'success' 
              ? 'bg-green-950/80 border-green-500/50 text-green-400' 
              : 'bg-red-950/80 border-red-500/50 text-red-400'
          }`}>
            {type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-1">
                {type === 'success' ? 'Success' : 'Error'}
              </h4>
              <p className="text-xs opacity-80 leading-relaxed">{message}</p>
            </div>
            <button onClick={onClose} className="text-current opacity-50 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

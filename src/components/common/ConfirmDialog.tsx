interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-3 text-slate-600">
          {message}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
import React from 'react'

export default function adminConfirmMsg({ type, content, close, onConfirm }) {
 const color = type == "Confirm" ? "green" : "red"
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        // close when clicking backdrop only
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-md mx-4 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl p-6">
        <h3 className="text-xl font-semibold text-zinc-100">
          {/* Delete property? */}
          {content.title}
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          {/* This action cannot be undone. Are you sure you want to permanently delete this property? */}
          {content.text}
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`
              px-4 py-2 rounded-lg
            bg-${color}-600 hover:bg-${color}-700
            text-sm font-semibold text-white`}
          >
            Yes, {type}
          </button>
        </div>
      </div>
    </div>
  )
}

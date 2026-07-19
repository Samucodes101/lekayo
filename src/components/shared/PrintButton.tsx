// src/components/shared/PrintButton.tsx
"use client"

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
    >
      🖨️ Print Receipt
    </button>
  )
}
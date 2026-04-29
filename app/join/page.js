"use client";

import { useState } from "react";

export default function JoinPage() {
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-6">

      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between">
        <a href="/" className="text-white font-medium text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition">← Nazad</a>
        <h1 className="text-white font-semibold text-lg">🎉 Pridruži se</h1>
        <div className="w-16" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm shadow-sm flex flex-col gap-5">
        <div>
          <h2 className="flex items-center gap-2 bg-pink-50 text-pink-800 px-4 py-2 rounded-lg text-base font-medium mb-1">
            Unesi kod kviza
          </h2>
          <p className="text-gray-400 text-sm px-1">Dobićeš ga od kreatora kviza</p>
        </div>

        <input
          className="w-full px-4 py-4 border border-gray-200 rounded-xl text-center text-3xl font-bold tracking-widest uppercase bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-300"
          placeholder="XXXXX"
          value={code}
          maxLength={5}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && code.length === 5 && (window.location.href = `/quiz/${code}`)}
        />

        <button
          onClick={() => { if (code.length === 5) window.location.href = `/quiz/${code}`; }}
          disabled={code.length !== 5}
          className="w-full py-3 bg-pink-600 hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition"
        >
          Uđi u kviz →
        </button>
      </div>
    </div>
  );
}
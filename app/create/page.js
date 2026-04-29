"use client";

import { useState } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: 5 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export default function CreatePage() {
  const [questions, setQuestions] = useState([{ question: "", answer: "" }]);
  const [current, setCurrent] = useState(0);
  const [createdCode, setCreatedCode] = useState(null);

  const handleChange = (field, value) => {
    const copy = [...questions];
    copy[current][field] = value;
    setQuestions(copy);
  };

  const addQuestion = () => {
    const copy = [...questions];
    // Ako sledeće pitanje već postoji (korisnik se vratio nazad), samo idi na njega
    if (current + 1 < copy.length) {
      setCurrent(current + 1);
    } else {
      copy.push({ question: "", answer: "" });
      setQuestions(copy);
      setCurrent(copy.length - 1);
    }
  };

  const prevQuestion = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const removeCurrentQuestion = () => {
    if (questions.length === 1) return;
    const copy = questions.filter((_, i) => i !== current);
    setQuestions(copy);
    setCurrent(Math.min(current, copy.length - 1));
  };

  const createQuiz = async () => {
    const valid = questions.filter((q) => q.question.trim());
    if (!valid.length) return alert("Unesi bar jedno pitanje");
    const code = generateCode();
    await addDoc(collection(db, "quizzes"), { code, questions: valid, status: "waiting" });
    setCreatedCode(code);
  };

  // ── Uspešno kreiran ──
  if (createdCode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-sm flex flex-col gap-5 text-center">
          <div className="text-5xl">🎉</div>
          <div>
            <h2 className="text-gray-800 text-xl font-semibold mb-1">Kviz kreiran!</h2>
            <p className="text-gray-400 text-sm">Podeli ovaj kod sa igračima</p>
          </div>
          <div className="bg-indigo-50 rounded-xl py-5">
            <p className="text-4xl font-bold tracking-widest text-indigo-600">{createdCode}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = `/responses/${createdCode}`}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
            >
              🧠 Otvori admin
            </button>
            <button
              onClick={() => { setCreatedCode(null); setQuestions([{ question: "", answer: "" }]); setCurrent(0); }}
              className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition"
            >
              + Novi kviz
            </button>
          </div>
          <a href="/" className="text-xs text-gray-300 hover:text-gray-500 transition">← Početna</a>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const filledCount = questions.filter((q) => q.question.trim()).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 gap-5">

      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between">
        <a href="/" className="text-white/50 hover:text-white text-sm transition">← Nazad</a>
        <h1 className="text-white font-semibold text-lg">✏️ Kreiraj kviz</h1>
        <span className="text-white/30 text-sm">{current + 1} / {questions.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md bg-white/10 rounded-full h-1">
        <div
          className="bg-indigo-400 h-1 rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Kartica sa pitanjem */}
      <div className="bg-white border border-gray-200 rounded-2xl p-7 w-full max-w-md shadow-sm flex flex-col gap-4">

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
            Pitanje {current + 1}
          </span>
          {questions.length > 1 && (
            <button
              onClick={removeCurrentQuestion}
              className="text-xs text-red-400 hover:text-red-600 transition"
            >
              Ukloni
            </button>
          )}
        </div>

        <input
          className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
          placeholder="Unesi pitanje..."
          value={q.question}
          onChange={(e) => handleChange("question", e.target.value)}
          autoFocus
        />
        <input
          className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
          placeholder="Tačan odgovor..."
          value={q.answer}
          onChange={(e) => handleChange("answer", e.target.value)}
        />

        {/* Navigacija između pitanja */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={prevQuestion}
            disabled={current === 0}
            className="flex-1 py-2 border border-gray-200 text-gray-400 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ← Prethodno
          </button>
          <button
            onClick={addQuestion}
            disabled={!q.question.trim()}
            className="flex-1 py-2 border border-dashed border-indigo-300 text-indigo-500 rounded-xl text-sm hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            + Sledeće
          </button>
        </div>
      </div>

      {/* Pregled pitanja */}
      {questions.length > 1 && (
        <div className="w-full max-w-md flex gap-2 flex-wrap">
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                i === current
                  ? "bg-indigo-600 text-white"
                  : q.question.trim()
                  ? "bg-white text-gray-600 border border-gray-200"
                  : "bg-white/20 text-white/40 border border-white/10"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Kreiraj kviz — uvek vidljivo */}
      <div className="w-full max-w-md">
        <button
          onClick={createQuiz}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
        >
          Kreiraj kviz
          {filledCount > 0 && (
            <span className="bg-indigo-500 text-xs px-2 py-0.5 rounded-full">
              {filledCount} {filledCount === 1 ? "pitanje" : "pitanja"}
            </span>
          )}
        </button>
      </div>

    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection, addDoc, onSnapshot, query,
  deleteDoc, doc, updateDoc
} from "firebase/firestore";

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: 5 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export default function Home() {
  const [questions, setQuestions] = useState([{ question: "", answer: "" }]);
  const [joinCode, setJoinCode] = useState("");
  const [createdCode, setCreatedCode] = useState(null);
  const [quizzes, setQuizzes] = useState([]);

  // Edit modal state
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editQuestions, setEditQuestions] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "quizzes"));
    const unsub = onSnapshot(q, (snap) => {
      setQuizzes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleChange = (i, field, value) => {
    const copy = [...questions];
    copy[i][field] = value;
    setQuestions(copy);
  };

  const addQuestion = () => setQuestions([...questions, { question: "", answer: "" }]);

  const createQuiz = async () => {
    const valid = questions.filter((q) => q.question.trim());
    if (!valid.length) return alert("Unesi pitanje");
    const code = generateCode();
    await addDoc(collection(db, "quizzes"), { code, questions: valid, status: "waiting" });
    setCreatedCode(code);
    setQuestions([{ question: "", answer: "" }]);
    alert(`Kviz kreiran! Kod: ${code}`);
  };

  const goToResponses = () => {
    if (createdCode) {
      window.location.href = `/responses/${createdCode}`;
    } else {
      const id = prompt("Unesi code:");
      if (id) window.location.href = `/responses/${id}`;
    }
  };

  // Delete
  const deleteQuiz = async (quiz) => {
    if (!confirm(`Obriši kviz ${quiz.code}?`)) return;
    await deleteDoc(doc(db, "quizzes", quiz.id));
  };

  // Otvori edit modal
  const openEdit = (quiz) => {
    setEditingQuiz(quiz);
    setEditQuestions(quiz.questions.map((q) => ({ ...q })));
  };

  const handleEditChange = (i, field, value) => {
    const copy = [...editQuestions];
    copy[i][field] = value;
    setEditQuestions(copy);
  };

  const addEditQuestion = () => setEditQuestions([...editQuestions, { question: "", answer: "" }]);

  const removeEditQuestion = (i) => {
    if (editQuestions.length === 1) return;
    setEditQuestions(editQuestions.filter((_, idx) => idx !== i));
  };

  const saveEdit = async () => {
    const valid = editQuestions.filter((q) => q.question.trim());
    if (!valid.length) return alert("Unesi bar jedno pitanje");
    await updateDoc(doc(db, "quizzes", editingQuiz.id), { questions: valid });
    setEditingQuiz(null);
  };

  const statusLabel = (status) => {
    if (status === "active") return { text: "Aktivan", color: "bg-green-500/20 text-green-300" };
    return { text: "Čeka", color: "bg-white/10 text-white/40" };
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-6 items-start justify-center px-4 py-10">

      {/* Leva kolona */}
      <div className="flex flex-col gap-6 w-full max-w-md">

        {/* CREATE */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-7 flex flex-col gap-4">
          <h2 className="flex items-center gap-2 bg-indigo-500/30 text-indigo-100 px-4 py-2 rounded-lg text-base font-medium">
            🎂 Kreiraj kviz
          </h2>
          <hr className="border-white/10" />

          <div className="flex flex-col gap-3">
            {questions.map((q, i) => (
              <div key={i} className="flex flex-col gap-2 p-4 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-xs text-white/40 uppercase tracking-wide font-medium">Pitanje {i + 1}</span>
                <input
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm bg-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                  placeholder="Unesi pitanje..."
                  value={q.question}
                  onChange={(e) => handleChange(i, "question", e.target.value)}
                />
                <input
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm bg-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                  placeholder="Tačan odgovor..."
                  value={q.answer}
                  onChange={(e) => handleChange(i, "answer", e.target.value)}
                />
              </div>
            ))}
          </div>

          <button onClick={addQuestion} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-sm text-white/40 hover:bg-white/5 transition">
            + Dodaj pitanje
          </button>
          <button onClick={createQuiz} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition">
            Kreiraj kviz
          </button>
        </div>

        {/* JOIN */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-7 flex flex-col gap-4">
          <h2 className="flex items-center gap-2 bg-pink-500/30 text-pink-100 px-4 py-2 rounded-lg text-base font-medium">
            🎉 Pridruži se kviZu
          </h2>
          <hr className="border-white/10" />
          <input
            className="w-full px-4 py-3 border border-white/20 rounded-lg text-center text-2xl font-medium tracking-widest uppercase bg-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            placeholder="UNESI KOD"
            value={joinCode}
            maxLength={5}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
          <button
            onClick={() => window.location.href = `/quiz/${joinCode}`}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
          >
            Pridruži se
          </button>
        </div>

        <button onClick={goToResponses} className="flex items-center justify-center gap-2 px-6 py-2.5 border border-white/20 rounded-lg text-sm text-white/50 hover:bg-white/10 transition">
          🧠 Admin panel
        </button>
      </div>

      {/* Desna kolona — lista kvizova */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 lg:sticky lg:top-10">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-medium text-base">📋 Svi kvizovi</h2>
          <span className="bg-white/10 text-white/50 text-xs font-bold px-2 py-0.5 rounded-full">{quizzes.length}</span>
        </div>

        <hr className="border-white/10" />

        {quizzes.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-6">Nema kvizova još...</p>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh] pr-1">
            {quizzes.map((quiz) => {
              const { text, color } = statusLabel(quiz.status);
              return (
                <div key={quiz.id} className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  {/* Gornji red — kod, status */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-white font-bold tracking-widest text-sm">{quiz.code}</span>
                      <span className="text-white/40 text-xs">{quiz.questions?.length} pitanja</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{text}</span>
                  </div>

                  {/* Donji red — dugmadi */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => window.location.href = `/responses/${quiz.code}`}
                      className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      Admin →
                    </button>
                    <button
                      onClick={() => openEdit(quiz)}
                      className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteQuiz(quiz)}
                      className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 px-3 py-1.5 rounded-lg transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingQuiz && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingQuiz(null); }}
        >
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-medium text-lg">✏️ Uredi kviz <span className="text-indigo-300 tracking-widest">{editingQuiz.code}</span></h2>
              <button onClick={() => setEditingQuiz(null)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
            </div>

            <hr className="border-white/10" />

            <div className="flex flex-col gap-3">
              {editQuestions.map((q, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 uppercase tracking-wide font-medium">Pitanje {i + 1}</span>
                    <button
                      onClick={() => removeEditQuestion(i)}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Ukloni
                    </button>
                  </div>
                  <input
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm bg-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                    placeholder="Pitanje..."
                    value={q.question}
                    onChange={(e) => handleEditChange(i, "question", e.target.value)}
                  />
                  <input
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm bg-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                    placeholder="Odgovor..."
                    value={q.answer}
                    onChange={(e) => handleEditChange(i, "answer", e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button onClick={addEditQuestion} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-sm text-white/40 hover:bg-white/5 transition">
              + Dodaj pitanje
            </button>

            <div className="flex gap-3">
              <button onClick={() => setEditingQuiz(null)} className="flex-1 py-2.5 border border-white/20 text-white/50 rounded-lg text-sm hover:bg-white/10 transition">
                Otkaži
              </button>
              <button onClick={saveEdit} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition">
                Sačuvaj
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
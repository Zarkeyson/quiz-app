"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection, onSnapshot, query,
  deleteDoc, doc, updateDoc
} from "firebase/firestore";

export default function AdminPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editQuestions, setEditQuestions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "quizzes"));
    const unsub = onSnapshot(q, (snap) => {
      setQuizzes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const deleteQuiz = async (quiz) => {
    if (!confirm(`Obriši kviz ${quiz.code}?`)) return;
    await deleteDoc(doc(db, "quizzes", quiz.id));
  };

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
    if (status === "active") return { text: "Aktivan", color: "bg-green-100 text-green-700" };
    return { text: "Čeka", color: "bg-gray-100 text-gray-500" };
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10 gap-6">

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-white/50 hover:text-white text-sm transition">← Nazad</a>
          <h1 className="text-white font-semibold text-lg">🧠 Admin panel</h1>
        </div>
        <a
          href="/create"
          className="text-xs bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
        >
          + Novi kviz
        </a>
      </div>

      {/* Lista kvizova */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-2xl shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-800 font-medium">Svi kvizovi</h2>
          <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{quizzes.length}</span>
        </div>

        <hr className="border-gray-100" />

        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 text-sm mb-3">Nema kvizova još</p>
            <a href="/create" className="text-sm text-indigo-500 hover:text-indigo-700 transition">Kreiraj prvi kviz →</a>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {quizzes.map((quiz) => {
              const { text, color } = statusLabel(quiz.status);
              return (
                <div key={quiz.id} className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-gray-800 font-bold tracking-widest text-sm">{quiz.code}</span>
                    <span className="text-gray-400 text-xs">{quiz.questions?.length} pitanja</span>
                  </div>

                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${color}`}>{text}</span>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => router.push(`/responses/${quiz.code}`)}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      Admin →
                    </button>
                    <button
                      onClick={() => openEdit(quiz)}
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg transition"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteQuiz(quiz)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg transition"
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
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-800 font-semibold text-lg">
                ✏️ Uredi <span className="text-indigo-600 tracking-widest">{editingQuiz.code}</span>
              </h2>
              <button onClick={() => setEditingQuiz(null)} className="text-gray-300 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <hr className="border-gray-100" />

            <div className="flex flex-col gap-3">
              {editQuestions.map((q, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Pitanje {i + 1}</span>
                    <button onClick={() => removeEditQuestion(i)} className="text-xs text-red-400 hover:text-red-600 transition">
                      Ukloni
                    </button>
                  </div>
                  <input
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    placeholder="Pitanje..."
                    value={q.question}
                    onChange={(e) => handleEditChange(i, "question", e.target.value)}
                  />
                  <input
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    placeholder="Odgovor..."
                    value={q.answer}
                    onChange={(e) => handleEditChange(i, "answer", e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button onClick={addEditQuestion} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-400 hover:bg-gray-50 transition">
              + Dodaj pitanje
            </button>

            <div className="flex gap-3">
              <button onClick={() => setEditingQuiz(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50 transition">
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
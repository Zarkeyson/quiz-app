"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import {
  collection, query, where, getDocs, doc,
  onSnapshot, updateDoc
} from "firebase/firestore";

const CARD_COLORS = [
  "bg-indigo-500/20 border-indigo-400/30 text-indigo-100",
  "bg-pink-500/20 border-pink-400/30 text-pink-100",
  "bg-amber-500/20 border-amber-400/30 text-amber-100",
  "bg-teal-500/20 border-teal-400/30 text-teal-100",
  "bg-purple-500/20 border-purple-400/30 text-purple-100",
  "bg-green-500/20 border-green-400/30 text-green-100",
  "bg-rose-500/20 border-rose-400/30 text-rose-100",
  "bg-sky-500/20 border-sky-400/30 text-sky-100",
];

export default function ResponsesPage({ code }) {
  const [quizId, setQuizId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("waiting");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [starting, setStarting] = useState(false);

  // Review mode state
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQuestion, setReviewQuestion] = useState(0);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const fetchQuiz = async () => {
      const q = query(collection(db, "quizzes"), where("code", "==", code.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) { setNotFound(true); setLoading(false); return; }
      const docSnap = snap.docs[0];
      setQuizId(docSnap.id);
      setQuiz(docSnap.data());
      setStatus(docSnap.data().status || "waiting");
      setLoading(false);
    };
    fetchQuiz();
  }, [code]);

  useEffect(() => {
    if (!quizId) return;
    const unsubQuiz = onSnapshot(doc(db, "quizzes", quizId), (d) => {
      setStatus(d.data()?.status || "waiting");
    });
    const unsubPlayers = onSnapshot(collection(db, "quizzes", quizId, "players"), (snap) => {
      setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubResponses = onSnapshot(
      query(collection(db, "responses"), where("quizId", "==", quizId)),
      (snap) => { setResponses(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); }
    );
    return () => { unsubQuiz(); unsubPlayers(); unsubResponses(); };
  }, [quizId]);

  const startQuiz = async () => {
    if (!quizId) return;
    setStarting(true);
    await updateDoc(doc(db, "quizzes", quizId), { status: "active" });
    setStarting(false);
  };

  const toggleChecked = (responseId, questionIdx) => {
    const key = `${responseId}-${questionIdx}`;
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isChecked = (responseId, questionIdx) => !!checked[`${responseId}-${questionIdx}`];

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white text-center">
          <div className="text-3xl mb-3">⏳</div>
          <p className="text-lg font-medium">Učitavanje...</p>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white text-center max-w-sm w-full">
          <div className="text-4xl mb-3">😕</div>
          <h2 className="text-xl font-medium mb-2">Kviz nije pronađen</h2>
          <button onClick={() => window.location.href = "/admin"} className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition">
            ← Nazad
          </button>
        </div>
      </div>
    );
  }

  // ── Lobby ──
  if (status === "waiting") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-sm flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-6 pb-5 flex flex-col gap-1">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-xs font-medium mb-2 w-fit">
              🧠 Admin panel
            </div>
            <h1 className="text-xl font-semibold text-gray-800">{quiz?.title || "Kviz"}</h1>
            <p className="text-gray-400 text-sm">
              Kod: <span className="font-bold tracking-widest text-gray-700">{code.toUpperCase()}</span>
              {" · "}{quiz?.questions?.length} pitanja
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Igrači */}
          <div className="px-6 py-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 font-semibold">Igrači u čekaonici</p>
              <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">{players.length}</span>
            </div>

            {players.length === 0 ? (
              <div className="bg-gray-50 rounded-xl px-4 py-6 text-center">
                <p className="text-gray-400 text-sm">Niko još nije ušao...</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {players.map((player, i) => (
                  <div key={player.id} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">{i + 1}</div>
                    <span className="text-gray-700 text-sm font-medium">{player.name}</span>
                    <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">✓ Spreman</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dugme */}
          <div className="px-6 pb-6 flex flex-col gap-2">
            <button
              onClick={startQuiz}
              disabled={players.length === 0 || starting}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition"
            >
              {starting ? "Pokretanje..." : `🚀 Pokreni kviz (${players.length} igrača)`}
            </button>
            <p className="text-center text-xs text-gray-400">Igrači se automatski pojavljuju kada uđu</p>
          </div>

        </div>
      </div>
    );
  }

  // ── Review mode ──
  if (reviewMode && quiz?.questions) {
    const questions = quiz.questions;
    const q = questions[reviewQuestion];

    // Skupi odgovore svih igrača za ovo pitanje
    const answersForQ = responses
      .map((resp, respIdx) => ({
        responseId: resp.id,
        answer: resp.answers?.[reviewQuestion]?.answer || "",
        colorClass: CARD_COLORS[respIdx % CARD_COLORS.length],
      }))
      .filter((a) => a.answer);

    const checkedCount = answersForQ.filter((a) => isChecked(a.responseId, reviewQuestion)).length;

    return (
      <div className="min-h-screen flex flex-col px-4 py-8 gap-6">

        {/* Navigacija gore */}
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          <button
            onClick={() => setReviewMode(false)}
            className="text-white/40 hover:text-white text-sm transition"
          >
            ← Nazad na odgovore
          </button>
          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setReviewQuestion(i)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition ${
                  i === reviewQuestion
                    ? "bg-white text-gray-800"
                    : "bg-white/20 text-white/60 hover:bg-white/30"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <span className="text-white/40 text-sm">{reviewQuestion + 1} / {questions.length}</span>
        </div>

        {/* Pitanje */}
        <div className="max-w-4xl mx-auto w-full text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Pitanje {reviewQuestion + 1}</p>
          <h1 className="text-3xl font-bold text-white leading-snug">{q.question}</h1>
          {q.answer && (
            <p className="text-white/40 text-sm mt-3">
              Tačan odgovor: <span className="text-green-400 font-medium">{q.answer}</span>
            </p>
          )}
        </div>

        {/* Odgovori razbacani */}
        {answersForQ.length === 0 ? (
          <div className="text-center text-white/30 text-sm py-8">Niko nije odgovorio na ovo pitanje</div>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center max-w-4xl mx-auto w-full px-4">
            {answersForQ.map((a) => (
              <button
                key={a.responseId}
                onClick={() => toggleChecked(a.responseId, reviewQuestion)}
                className={`relative px-6 py-4 rounded-2xl border text-base font-medium transition-all duration-200 ${a.colorClass} ${
                  isChecked(a.responseId, reviewQuestion)
                    ? "scale-105 ring-2 ring-green-400 ring-offset-2 ring-offset-transparent"
                    : "hover:scale-102 opacity-90 hover:opacity-100"
                }`}
              >
                {isChecked(a.responseId, reviewQuestion) && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-xs text-white font-bold">✓</span>
                )}
                {a.answer}
              </button>
            ))}
          </div>
        )}

        {/* Footer — rezultat i navigacija */}
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between mt-auto pt-4">
          <div className="text-white/50 text-sm">
            <span className="text-green-400 font-bold text-lg">{checkedCount}</span>
            <span className="mx-1">/</span>
            {answersForQ.length} tačnih
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setReviewQuestion((prev) => Math.max(0, prev - 1))}
              disabled={reviewQuestion === 0}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl text-sm font-medium transition"
            >
              ← Prethodno
            </button>
            <button
              onClick={() => setReviewQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={reviewQuestion === questions.length - 1}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl text-sm font-medium transition"
            >
              Sledeće →
            </button>
          </div>
        </div>

      </div>
    );
  }

  // ── Aktivan kviz — pregled odgovora ──
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10 gap-5">

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-2xl shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Admin · Kviz aktivan</p>
          <h1 className="text-xl font-medium text-gray-800">{quiz?.title || "Kviz"} · {code.toUpperCase()}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-800">{responses.length}</p>
            <p className="text-xs text-gray-400">/ {players.length} odgovora</p>
          </div>
          {responses.length > 0 && (
            <button
              onClick={() => setReviewMode(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
            >
              📊 Pregled
            </button>
          )}
        </div>
      </div>

      {/* Igrači */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-2xl shadow-sm flex flex-col gap-3">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Igrači</p>
        <hr className="border-gray-100" />
        {players.length === 0 ? (
          <p className="text-gray-300 text-sm text-center py-4">Nema igrača...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {players.map((player, i) => {
              const finished = responses.find((r) => r.name === player.name);
              return (
                <div key={player.id} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                    {i + 1}
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{player.name}</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${finished ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {finished ? "✓ Završio" : "U toku..."}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {responses.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        )}
      </div>

      <button onClick={() => window.location.href = "/admin"} className="text-xs text-gray-400 hover:text-gray-600 transition">
        ← Admin panel
      </button>
    </div>
  );
}
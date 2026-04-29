"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import {
  collection, query, where, getDocs, addDoc, doc,
  onSnapshot, serverTimestamp
} from "firebase/firestore";

export default function QuizPage({ code }) {
  const [quiz, setQuiz] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [name, setName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quizStatus, setQuizStatus] = useState("waiting");

  useEffect(() => {
    let unsub = null;

    const fetchQuiz = async () => {
      const q = query(collection(db, "quizzes"), where("code", "==", code.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const docSnap = snap.docs[0];
      setQuiz(docSnap.data());
      setQuizId(docSnap.id);
      setLoading(false);

      // Real-time listener na status kviza
      unsub = onSnapshot(doc(db, "quizzes", docSnap.id), (d) => {
        const status = d.data()?.status || "waiting";
        setQuizStatus(status);
      });
    };

    fetchQuiz();
    return () => { if (unsub) unsub(); };
  }, [code]);

  const submitName = async () => {
    if (!name.trim() || !quizId) return;

    // Upiši igrača u players podkolekciju
    await addDoc(collection(db, "quizzes", quizId, "players"), {
      name: name.trim(),
      joinedAt: serverTimestamp(),
    });

    setNameSubmitted(true);
  };

  const nextQuestion = () => {
    const updated = [...answers, { question: quiz.questions[current].question, answer }];
    setAnswers(updated);
    setAnswer("");

    if (current + 1 < quiz.questions.length) {
      setCurrent(current + 1);
    } else {
      addDoc(collection(db, "responses"), {
        quizId,
        code: code.toUpperCase(),
        name,
        answers: updated,
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white text-center">
          <div className="text-3xl mb-3">⏳</div>
          <p className="text-lg font-medium">Učitavanje kviza...</p>
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
          <p className="text-white/60 text-sm mb-6">Proveri da li je kod ispravan.</p>
          <button
            onClick={() => window.location.href = "/"}
            className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition"
          >
            ← Nazad na početnu
          </button>
        </div>
      </div>
    );
  }

  // ── Unos imena ──
  if (!nameSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-md flex flex-col gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/30 text-indigo-100 px-3 py-1 rounded-lg text-xs font-medium mb-3">
              🎉 Kviz: <span className="font-bold tracking-widest">{code.toUpperCase()}</span>
            </div>
            <h1 className="text-2xl font-medium text-white">{quiz.title || "Kviz"}</h1>
            <p className="text-white/50 text-sm mt-1">{quiz.questions.length} pitanja</p>
          </div>

          <hr className="border-white/10" />

          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50 uppercase tracking-wide font-medium">Tvoje ime</label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 text-sm"
              placeholder="Unesi ime..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitName()}
            />
          </div>

          <button
            onClick={submitName}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
          >
            Uđi u čekaonicu →
          </button>
        </div>
      </div>
    );
  }

  // ── Čekaonica ──
  if (quizStatus === "waiting") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-md flex flex-col gap-5 text-center">
          <div className="text-4xl">⏳</div>
          <div>
            <h2 className="text-xl font-medium text-white mb-1">Čekaonica</h2>
            <p className="text-white/50 text-sm">Čekaj da kreator pokrene kviz...</p>
          </div>

          <hr className="border-white/10" />

          <div className="bg-white/5 rounded-xl px-4 py-3">
            <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Prijavljen kao</p>
            <p className="text-white font-medium">{name}</p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Kraj ──
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-md text-center flex flex-col gap-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-medium text-white">Gotovo, {name}!</h2>
          <p className="text-white/50 text-sm">Tvoji odgovori su sačuvani. Sačekaj rezultate.</p>
          <hr className="border-white/10" />
          <button
            onClick={() => window.location.href = "/"}
            className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition"
          >
            ← Nazad na početnu
          </button>
        </div>
      </div>
    );
  }

  // ── Pitanje ──
  const q = quiz.questions[current];
  const progress = (current / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-md flex flex-col gap-5">

        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50 uppercase tracking-wide font-medium">{name}</span>
          <span className="text-xs text-white/50 font-medium">{current + 1} / {quiz.questions.length}</span>
        </div>

        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div
            className="bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <hr className="border-white/10" />

        <div>
          <p className="text-xs text-indigo-300 uppercase tracking-wide font-medium mb-2">
            Pitanje {current + 1}
          </p>
          <h2 className="text-xl font-medium text-white leading-snug">{q.question}</h2>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-white/50 uppercase tracking-wide font-medium">Tvoj odgovor</label>
          <input
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 text-sm"
            placeholder="Unesi odgovor..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && nextQuestion()}
            autoFocus
          />
        </div>

        <button
          onClick={nextQuestion}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
        >
          {current + 1 === quiz.questions.length ? "Završi kviz ✓" : "Sledeće pitanje →"}
        </button>

      </div>
    </div>
  );
}
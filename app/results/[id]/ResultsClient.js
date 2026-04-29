"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Results({ quizId }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, "results"), where("code", "==", quizId));
      const snap = await getDocs(q);
      const data = [];
      snap.forEach(d => data.push(d.data()));
      setResults(data.sort((a,b)=>b.score-a.score));
    };
    fetch();
  }, []);

  return (
    <div className="p-6 text-white">
      <h1>🏆 Leaderboard</h1>

      {results.map((r,i)=>(
        <div key={i} className={`p-3 mb-2 rounded ${
          i===0?"bg-yellow-400 text-black":
          i===1?"bg-gray-300 text-black":
          i===2?"bg-orange-400 text-black":
          "bg-zinc-800"
        }`}>
          {i+1}. {r.nickname} — {r.score}
        </div>
      ))}
    </div>
  );
}
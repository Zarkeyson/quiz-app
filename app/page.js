export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 gap-12">

      {/* Hero */}
      <div className="text-center flex flex-col items-center gap-3">
        <div className="text-6xl mb-1">🎂</div>
        <h1 className="text-4xl font-bold text-white tracking-tight">QuizApp</h1>
        <p className="text-white/50 text-base max-w-sm">
          Kreiraj kvizove, pozovi prijatelje i gledaj ko zna više.
        </p>
      </div>

      {/* 3 kartice u redu */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">

        {/* Kreiraj */}
        <a
          href="/create"
          className="group bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">
            ✏️
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-gray-800 font-semibold text-base">Kreiraj kviz</h2>
            <p className="text-gray-400 text-sm">Napravi pitanja i podeli kod</p>
          </div>
          <span className="text-xs text-indigo-600 font-medium group-hover:translate-x-1 transition-transform inline-block">
            Počni →
          </span>
        </a>

        {/* Pridruži se */}
        <a
          href="/join"
          className="group bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center text-2xl">
            🎉
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-gray-800 font-semibold text-base">Pridruži se</h2>
            <p className="text-gray-400 text-sm">Unesi kod i igraj kviz</p>
          </div>
          <span className="text-xs text-pink-600 font-medium group-hover:translate-x-1 transition-transform inline-block">
            Uđi →
          </span>
        </a>

        {/* Admin */}
        <a
          href="/admin"
          className="group bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">
            🧠
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-gray-800 font-semibold text-base">Admin panel</h2>
            <p className="text-gray-400 text-sm">Upravljaj kvizovima</p>
          </div>
          <span className="text-xs text-purple-600 font-medium group-hover:translate-x-1 transition-transform inline-block">
            Otvori →
          </span>
        </a>

      </div>

      <p className="text-white/20 text-xs">QuizApp · {new Date().getFullYear()}</p>

    </div>
  );
}
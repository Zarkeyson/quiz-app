// app/quiz/[code]/page.js
import QuizClient from "./QuizClient";

export default async function Page({ params }) {
  const { code } = await params;
  return <QuizClient code={code} />;
}
import ResultsClient from "./ResultsClient";

export default async function Page({ params }) {
  const { id } = await params;
  return <ResultsClient quizId={id} />;
}
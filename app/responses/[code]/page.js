import ResponsesClient from "./ResponsesClient";

export default async function Page({ params }) {
  const { code } = await params;
  return <ResponsesClient code={code} />;
}
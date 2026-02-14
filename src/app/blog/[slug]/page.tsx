import ArticlePage from './ArticlePage';

export async function generateStaticParams() {
  return [];
}

export const dynamicParams = true;

export default function Page() {
  return <ArticlePage />;
}

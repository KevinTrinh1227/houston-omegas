import ArticlePage from './ArticlePage';

// Returns empty array for static export - content is fetched client-side
export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <ArticlePage />;
}

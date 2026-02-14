import ArticlePage from './ArticlePage';

// Required for static export - blog content is fetched client-side
export function generateStaticParams() {
  return [];
}

export default function Page() {
  return <ArticlePage />;
}

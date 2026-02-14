import MemberProfilePage from './MemberProfilePage';

// At least one param required for static export - content is fetched client-side
export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function Page() {
  return <MemberProfilePage />;
}

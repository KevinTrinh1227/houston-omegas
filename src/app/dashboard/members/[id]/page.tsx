import MemberProfilePage from './MemberProfilePage';

export async function generateStaticParams() {
  return [];
}

export const dynamicParams = true;

export default function Page() {
  return <MemberProfilePage />;
}

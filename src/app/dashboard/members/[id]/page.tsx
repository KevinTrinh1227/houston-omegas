import MemberProfilePage from './MemberProfilePage';

export async function generateStaticParams() {
  return [];
}


export default function Page() {
  return <MemberProfilePage />;
}

import { HomePageShell } from '@/components/site/home-page-shell';
import { getLandingPageData } from '@/lib/content-service';

export const revalidate = 3600;

export default async function Home() {
  const content = await getLandingPageData();

  return <HomePageShell {...content} />;
}

import { HomePageShell } from '@/components/site/home-page-shell';
import { getPublicAssistantSettings } from '@/lib/admin-operator';
import { getLandingPageData } from '@/lib/content-service';

export const revalidate = 3600;

export default async function Home() {
  const [content, publicAssistant] = await Promise.all([
    getLandingPageData(),
    getPublicAssistantSettings(),
  ]);

  return <HomePageShell {...content} publicAssistant={publicAssistant} />;
}

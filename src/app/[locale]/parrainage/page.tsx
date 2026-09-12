import { CasSociauxClient } from "@/components/modules/cas-sociaux/cas-sociaux-client";
import { getSocialCases } from "@/lib/actions/cas-sociaux";

export default async function ParrainageRedirectPage() {
  const data = await getSocialCases();
  return (
    <div className="space-y-6 w-full max-w-full">
      <CasSociauxClient 
        initialSocialCases={data.socialCases || []} 
        initialStats={data.stats}
      />
    </div>
  );
}

import { CasSociauxClient } from "@/components/modules/cas-sociaux/cas-sociaux-client";
import { getSocialCases } from "@/lib/actions/cas-sociaux";

export default async function CasSociauxPage() {
  const data = await getSocialCases();
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <CasSociauxClient 
        initialSocialCases={data.socialCases || []} 
        initialStats={data.stats}
      />
    </div>
  );
}

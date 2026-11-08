"use client";
import { DetailList } from "@/shared/ui/detail-list";
import { Section } from "@/shared/ui/card-section";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { StatusBadge } from "@/shared/ui/badge";
import { useSession } from "../hooks";

export function ProfileCard() {
  const { data, isLoading, error, refetch } = useSession();
  if (error) return <Section><ErrorState error={error} onRetry={() => refetch()} /></Section>;
  if (isLoading || !data) return <Section><div className="space-y-3">{Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-6" />)}</div></Section>;
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,2fr)]">
      <Section>
        <DetailList columns={1} items={[
          { label: "Province", value: data.province }, { label: "District", value: data.district },
          { label: "Region", value: data.region }, { label: "Geo location", value: data.geoLocation },
          { label: "Status", value: <StatusBadge status={data.status} /> },
        ]} />
      </Section>
      <Section title={`CheckPoint Name: ${data.name}`}>
        <h3 className="mb-2 text-sm font-semibold">CheckPoint Details</h3>
        <DetailList columns={1} items={[
          { label: "Sthaniyasangh", value: data.sthaniyaSangh },
          { label: "E-mail", value: data.email },
          { label: "Checkpoint Type", value: data.checkpointType },
        ]} />
      </Section>
    </div>
  );
}

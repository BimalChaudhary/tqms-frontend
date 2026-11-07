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
    <Section title={data.name}>
      <DetailList items={[
        { label: "Sthaniya sangh", value: data.sthaniyaSangh }, { label: "Email", value: data.email },
        { label: "Checkpoint type", value: data.checkpointType }, { label: "State", value: data.province },
        { label: "District", value: data.district }, { label: "Region", value: data.region },
        { label: "Geo location", value: data.geoLocation }, { label: "Status", value: <StatusBadge status={data.status} /> },
      ]} />
    </Section>
  );
}

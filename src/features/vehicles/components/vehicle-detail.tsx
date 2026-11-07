"use client";
import { ListChecks, Pencil } from "lucide-react";
import Link from "next/link";
import { useTabParam } from "@/shared/hooks/use-tab-param";
import { Button } from "@/shared/ui/button";
import { Section } from "@/shared/ui/card-section";
import { DetailList } from "@/shared/ui/detail-list";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { Tabs, TabPanel } from "@/shared/ui/tabs";
import { formatDate } from "@/shared/lib/format";
import { useVehicle } from "../hooks";
import { SUB_RESOURCES } from "../sub-resources";
import type { VehicleGeneral } from "../types";
import { AuditLog } from "./audit-log";
import { SubRecordTab } from "./sub-record-tab";
import { TareWeightTab } from "./tare-weight-tab";

const TABS = [
  { id: "general", label: "General" },
  ...SUB_RESOURCES.map((r) => ({ id: r.id, label: r.tab })),
  { id: "tare-weight", label: "Tare weight" },
];

const GeneralTab = ({ g }: { g: VehicleGeneral }) => (
  <div className="grid gap-x-10 lg:grid-cols-2">
    <DetailList
      columns={1}
      items={[
        { label: "Engine number", value: g.engineNumber },
        { label: "Chassis number", value: g.chassisNumber },
        { label: "Registration date", value: formatDate(g.registrationDate) },
        { label: "Model no.", value: g.modelNo },
        { label: "Company name", value: g.companyName },
        { label: "No. of tyres", value: g.tyres },
        { label: "Owner", value: g.ownerName },
      ]}
    />
    <DetailList
      columns={1}
      items={[
        { label: "Vehicle category", value: g.category },
        { label: "Vehicle type", value: g.vehicleType },
        { label: "Capacity (metric tons)", value: g.capacityTons },
        { label: "Insurance company", value: g.insuranceCompany },
        { label: "Policy type", value: g.policyType },
        { label: "Policy number", value: g.policyNumber },
        { label: "Policy expiry", value: formatDate(g.policyExpiry) },
        { label: "Plate number", value: g.plateNo },
      ]}
    />
  </div>
);

export function VehicleDetailView({ id }: { id: string }) {
  const { data, isLoading, error, refetch } = useVehicle(id);
  const [tab, setTab] = useTabParam(
    TABS.map((t) => t.id),
    "general",
  );
  if (error)
    return (
      <div className="card">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  if (isLoading || !data)
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  const config = SUB_RESOURCES.find((r) => r.id === tab);

  return (
    <>
      <PageHeader
        title="Vehicle detail"
        crumbs={[
          { label: "Vehicles", href: "/vehicles" },
          { label: data.plateNo },
        ]}
        actions={
          <>
            <Link href={`/vehicles/${id}/edit`}>
              <Button variant="secondary">
                <Pencil className="size-4" /> Edit
              </Button>
            </Link>
            <Link href="/vehicles">
              <Button variant="secondary">
                <ListChecks className="size-4" /> Vehicle list
              </Button>
            </Link>
          </>
        }
      />
      <Section>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Vehicle number", data.plateNo],
            ["Sangh name", data.sanghName],
            ["Mobile", data.mobile],
            ["Email", data.email],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="mt-0.5 break-words text-sm font-medium">
                {v || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
      <div className="card mt-5 px-5 pb-5">
        <Tabs
          label="Vehicle sections"
          tabs={TABS}
          value={tab}
          onChange={setTab}
        />
        <TabPanel id={tab}>
          {tab === "general" ? (
            <GeneralTab g={data.general} />
          ) : tab === "tare-weight" ? (
            <TareWeightTab vehicleId={id} />
          ) : config ? (
            <SubRecordTab key={config.id} vehicleId={id} config={config} />
          ) : null}
        </TabPanel>
      </div>
      <AuditLog vehicleId={id} />
    </>
  );
}

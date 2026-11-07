"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import type { ListParams, Paginated, Single } from "@/shared/api/types";
import { SelectField, TextField } from "@/shared/forms/fields";
import { applyServerErrors } from "@/shared/forms/server-errors";
import { isValidVehicleNumber } from "@/shared/forms/validators";
import { useListState } from "@/shared/hooks/use-list-state";
import { Button } from "@/shared/ui/button";
import { Section } from "@/shared/ui/card-section";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { SearchInput } from "@/shared/ui/search-input";
import { useToast } from "@/shared/ui/toast";

/** Vehicles that are not in the TQMS register: Indian-plated or not-yet-registered Nepali trucks. */
export interface OtherVehicle {
  id: string;
  formattedNo: string;
  kind: "indian" | "unregistered";
  plateType: string | null;
  vehicleType: string | null;
}
const KEY = ["other-vehicles"];
const KINDS = [
  { value: "indian", label: "Indian" },
  { value: "unregistered", label: "Unregistered" },
];

const schema = z
  .object({
    kind: z.enum(["indian", "unregistered"], {
      errorMap: () => ({ message: "Select the vehicle kind" }),
    }),
    vehicleNumber: z.string().trim().min(1, "Enter the vehicle number"),
    vehicleTypeId: z.string().min(1, "Select a vehicle type"),
  })
  .superRefine((v, ctx) => {
    if (v.vehicleNumber && !isValidVehicleNumber(v.vehicleNumber))
      ctx.addIssue({
        code: "custom",
        path: ["vehicleNumber"],
        message:
          "Enter a valid plate number using letters, digits, spaces or hyphens",
      });
  });
type Values = z.infer<typeof schema>;

export function OtherVehicleList() {
  const list = useListState({ kind: "all" });
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [...KEY, list.params],
    placeholderData: keepPreviousData,
    queryFn: () =>
      apiFetch<Paginated<OtherVehicle>>("/other-vehicles", {
        params: list.params as ListParams,
      }),
  });
  const columns: Column<OtherVehicle>[] = [
    {
      key: "sn",
      header: "S.N",
      cell: (_, n) => n,
      className: "w-14 text-muted",
    },
    {
      key: "no",
      header: "Formatted number",
      cell: (v) => <span className="font-medium">{v.formattedNo}</span>,
    },
    {
      key: "kind",
      header: "Order Type",
      cell: (v) => (v.kind === "indian" ? "Indian" : "Unregistered"),
    },
    { key: "type", header: "Vehicle type", cell: (v) => v.vehicleType ?? "—" },
  ];
  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium">
            Other Type
            <select
              className="control mt-1.5 w-44!"
              value={list.state.filters.kind}
              onChange={(e) => list.setFilter("kind", e.target.value)}
            >
              <option value="all">All</option>
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <SearchInput
            value={list.state.q}
            onChange={list.setQ}
            placeholder="Search by number"
            label="Search other vehicles"
          />
          <Button
            variant="secondary"
            onClick={list.reset}
            disabled={!list.state.q && list.state.filters.kind === "all"}
          >
            Clear
          </Button>
        </div>
        <Link href="/other-vehicles/new">
          <Button>
            <Plus className="size-4" /> Add other vehicle
          </Button>
        </Link>
      </div>
      <DataTable
        caption="Other vehicles"
        columns={columns}
        rows={data?.data}
        rowKey={(v) => v.id}
        loading={isLoading}
        refreshing={isFetching && !isLoading}
        error={error}
        onRetry={() => refetch()}
        meta={data?.meta}
        onPage={list.setPage}
        onPageSize={list.setPageSize}
        empty={{
          title: "No other vehicles found",
          hint: "Add Indian or unregistered vehicles so they can be queued quickly.",
        }}
      />
    </>
  );
}

export function OtherVehicleForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const m = useMutation({
    mutationFn: (b: Values) =>
      apiFetch<Single<OtherVehicle>>("/other-vehicles", {
        method: "POST",
        body: { ...b },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: KEY });
      toast.success("Vehicle added");
      router.push("/other-vehicles");
    },
  });
  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind: undefined,
      vehicleNumber: "",
      vehicleTypeId: "",
    },
  });
  const vehicleNumber = useWatch({
    control: methods.control,
    name: "vehicleNumber",
  });
  return (
    <Section title="Other vehicle details">
      <FormProvider {...methods}>
        <form
          noValidate
          onSubmit={methods.handleSubmit(async (v) => {
            try {
              await m.mutateAsync(v);
            } catch (e) {
              applyServerErrors(e, methods.setError);
            }
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              name="kind"
              label="Others Type"
              required
              options={KINDS}
            />
            <TextField name="vehicleNumber" label="Formated number" required />
            <SelectField
              name="vehicleTypeId"
              label="Vehicle type"
              required
              lookup="vehicle-types"
            />
          </div>
          {m.isError && !m.error.fieldErrors && (
            <p role="alert" className="mt-4 text-sm text-bad">
              {m.error.message}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push("/other-vehicles")}
              disabled={m.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={m.isPending}>
              Save
            </Button>
          </div>
        </form>
      </FormProvider>
    </Section>
  );
}

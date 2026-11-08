"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useLookup } from "@/shared/api/lookup";
import { ComboField, SelectField, TextField } from "@/shared/forms/fields";
import { applyServerErrors } from "@/shared/forms/server-errors";
import { Button } from "@/shared/ui/button";
import { Section } from "@/shared/ui/card-section";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { PageHeader } from "@/shared/ui/page-header";
import { useSaveVehicle, useVehicle } from "../hooks";
import { previewPlate } from "../plate";
import { vehicleSchema, type VehicleValues } from "../schemas";

const EMPTY = { sanghId: "", ownerId: "", vehicleTypeId: "", plateColorId: "", engineNumber: "", chassisNumber: "", companyName: "", modelNo: "",
  plateType: "", zonalCodeId: "", provinceId: "", symbolId: "", lotNo: "", vehicleNumber: "", embossedNumber: "" } as unknown as VehicleValues;

const PLATE_TYPES = [{ value: "embossed", label: "Embossed" }, { value: "provincial", label: "Provincial" }, { value: "zonal", label: "Zonal" }];

export function VehicleForm({ id }: { id?: string }) {
  const { data, isLoading, error, refetch } = useVehicle(id ?? "");
  const crumbs = [{ label: "Vehicles", href: "/vehicles" }, { label: id ? "Edit" : "New" }];
  const header = <PageHeader title={id ? "Edit vehicle" : "Add vehicle"} crumbs={crumbs} />;
  if (id && error) return <>{header}<div className="card"><ErrorState error={error} onRetry={() => refetch()} /></div></>;
  if (id && (isLoading || !data)) return <>{header}<Section><div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div></Section></>;
  return <>{header}<Inner id={id} initial={data ? ({ ...EMPTY, ...data.form } as VehicleValues) : EMPTY} labels={data?.labels} /></>;
}

function Inner({ id, initial, labels }: { id?: string; initial: VehicleValues; labels?: { sangh: string; owner: string } }) {
  const router = useRouter();
  const save = useSaveVehicle(id);
  const methods = useForm<VehicleValues>({ resolver: zodResolver(vehicleSchema), defaultValues: initial });
  const v = useWatch({ control: methods.control });
  const zonal = useLookup("zonal-codes"); const symbols = useLookup("symbols"); const provinces = useLookup("provinces");
  const formatted = previewPlate(v as Partial<VehicleValues>, { zonal: zonal.data, symbols: symbols.data, provinces: provinces.data });

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={methods.handleSubmit(async (vals) => { try { await save.mutateAsync(vals); } catch (e) { applyServerErrors(e, methods.setError); } })} className="space-y-5">
        <Section title="Vehicle">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ComboField name="sanghId" label="Sthaniya sangh" required lookup="sanghs" minChars={0} placeholder="Select sthaniya sangh" initialLabel={labels?.sangh} />
            <ComboField name="ownerId" label="Vehicle owner" required lookup="vehicle-owners" placeholder="Search by phone number or name" initialLabel={labels?.owner} />
            <SelectField name="vehicleTypeId" label="Vehicle type" required lookup="vehicle-types" />
            <SelectField name="plateColorId" label="Plate colour" required lookup="plate-colors" />
            <TextField name="engineNumber" label="Engine number" />
            <TextField name="chassisNumber" label="Chassis number" />
            <TextField name="companyName" label="Company name" />
            <TextField name="modelNo" label="Model no." />
            <SelectField name="plateType" label="Plate type" required options={PLATE_TYPES} />
          </div>
        </Section>
        {v.plateType && (
          <Section title="Enter Plate Number Details">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {v.plateType === "zonal" && <SelectField name="zonalCodeId" label="Zonal Code" required lookup="zonal-codes" />}
              {v.plateType === "provincial" && <SelectField name="provinceId" label="State" required lookup="provinces" />}
              {v.plateType !== "embossed" ? <>
                <SelectField name="symbolId" label="Symbol No" required lookup="symbols" />
                <TextField name="lotNo" label="Lot Number" required inputMode="numeric" />
                <TextField name="vehicleNumber" label="Vehicle Number" required inputMode="numeric" />
              </> : <TextField name="embossedNumber" label="Embossed plate number" required />}
              <div className="space-y-1.5">
                <span className="block text-sm font-medium">Formatted Number</span>
                <input readOnly aria-readonly className="control font-medium" value={formatted} placeholder="Fills in as you type" />
              </div>
            </div>
          </Section>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => router.push(id ? `/vehicles/${id}` : "/vehicles")} disabled={save.isPending}>Cancel</Button>
          <Button type="submit" loading={save.isPending}>Save</Button>
        </div>
      </form>
    </FormProvider>
  );
}

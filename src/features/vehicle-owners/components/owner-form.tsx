"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import {
  FileField,
  ProvinceDistrictFields,
  SwitchField,
  TextField,
  PhoneField,
} from "@/shared/forms/fields";
import { applyServerErrors } from "@/shared/forms/server-errors";
import { Button } from "@/shared/ui/button";
import { Section } from "@/shared/ui/card-section";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { useOwner, useSaveOwner } from "../hooks";
import { ownerSchema, type OwnerValues } from "../schemas";
import type { OwnerDetail } from "../types";

const EMPTY: OwnerValues = {
  name: "",
  provinceId: "",
  districtId: "",
  localLevel: "",
  streetAddress: "",
  email: "",
  panNumber: "",
  phone: "",
  isIndividual: false,
  contactName: "",
  contactEmail: "",
  contactNumber: "",
  registrationNumber: "",
  citizenshipNumber: "",
};

export function OwnerForm({ id }: { id?: string }) {
  const { data, isLoading, error, refetch } = useOwner(id ?? "");
  const header = (
    <PageHeader
      title={id ? "Edit vehicle owner" : "Add vehicle owner"}
      crumbs={[
        { label: "Vehicle owners", href: "/vehicle-owners" },
        { label: id ? "Edit" : "New" },
      ]}
    />
  );
  if (id && error)
    return (
      <>
        {header}
        <div className="card">
          <ErrorState error={error} onRetry={() => refetch()} />
        </div>
      </>
    );
  if (id && (isLoading || !data))
    return (
      <>
        {header}
        <Section>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </Section>
      </>
    );
  return (
    <>
      {header}
      <Inner
        id={id}
        initial={data ? { ...EMPTY, ...data.form } : EMPTY}
        files={data?.files}
      />
    </>
  );
}

function Inner({
  id,
  initial,
  files,
}: {
  id?: string;
  initial: OwnerValues;
  files?: OwnerDetail["files"];
}) {
  const router = useRouter();
  const save = useSaveOwner(id);
  const methods = useForm<OwnerValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: initial,
  });
  const individual = useWatch({
    control: methods.control,
    name: "isIndividual",
  });

  return (
    <FormProvider {...methods}>
      <form
        noValidate
        className="space-y-5"
        onSubmit={methods.handleSubmit(async (v) => {
          try {
            await save.mutateAsync({ ...v });
          } catch (e) {
            applyServerErrors(e, methods.setError);
          }
        })}
      >
        <Section title="Owner details">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="name"
              label="Name"
              required
              placeholder="Owner or company name"
            />
            <FileField
              name="logo"
              label="Logo"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              existingName={files?.logo}
            />
            <ProvinceDistrictFields />
            <TextField name="localLevel" label="Local level" />
            <TextField name="streetAddress" label="Street address" />
            <TextField name="email" label="Email" type="email" />
            <TextField
              name="panNumber"
              label="PAN number"
              inputMode="numeric"
              digitsOnly
              maxLength={9}
              hint="9 digits"
            />
            <PhoneField name="phone" label="Phone number" required />
            <SwitchField
              name="isIndividual"
              label="Owner is an individual"
              hint="Individuals provide citizenship photos instead of company registration."
              className="sm:col-span-2"
            />
          </div>
        </Section>
        {individual && (
          <Section title="Enter Citizenship Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="citizenshipNumber" label="Citizenship number" />
              <FileField
                name="citizenshipFront"
                label="Citizenship front"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                existingName={files?.citizenshipFront}
              />
              <FileField
                name="citizenshipBack"
                label="Citizenship back"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                existingName={files?.citizenshipBack}
              />
            </div>
          </Section>
        )}
        {!individual && (
          <Section title="Contact Detail">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="contactName" label="Name" />
              <TextField name="contactEmail" label="Email" type="email" />
              <PhoneField name="contactNumber" label="Contact number" />
            </div>
          </Section>
        )}
        <Section title="Enter Registration Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="registrationNumber"
              label="Registration number"
            />
            <FileField
              name="registrationDocument"
              label="Registration document"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              hint="Upload a JPG, PNG or WebP image (up to 5 MB)."
              existingName={files?.registrationDocument}
            />
          </div>
        </Section>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push("/vehicle-owners")}
            disabled={save.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            Save
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

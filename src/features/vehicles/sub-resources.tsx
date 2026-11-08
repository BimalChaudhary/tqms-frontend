import type { ReactNode } from "react";
import type { FieldDef } from "@/shared/forms/dynamic-form";
import { formatBsDate, orDash } from "@/shared/lib/format";
import type { SubRecord } from "./types";

/**
 * Declarative definition of each vehicle-detail tab. Adding a tab means adding an entry here;
 * the table, dialog form, validation and CRUD wiring are shared (see SubRecordTab).
 */
export interface SubColumn { key: string; header: string; render: (r: SubRecord) => ReactNode }
export interface SubResource {
  id: string; tab: string; resource: string; noun: string; addLabel: string; columns: SubColumn[]; fields: FieldDef[];
  canAdd?: boolean; canEdit?: boolean; canDelete?: boolean;
}

const text = (k: string) => (r: SubRecord) => orDash(r[k] as string);
const date = (k: string) => (r: SubRecord) => formatBsDate(r[k] as string);
const file = (k: string) => (r: SubRecord) => r[`${k}Url`]
  ? <a href={String(r[`${k}Url`])} target="_blank" rel="noreferrer" className="text-brand-700 underline-offset-2 hover:underline">{orDash(r[`${k}Name`] as string) === "—" ? "View file" : String(r[`${k}Name`])}</a>
  : "—";

export const SUB_RESOURCES: SubResource[] = [
  { id: "documents", tab: "Documents", resource: "documents", noun: "Document", addLabel: "Add document", canAdd: true, canEdit: true, canDelete: true,
    columns: [{ key: "name", header: "Document name", render: text("name") }, { key: "type", header: "Type", render: text("documentTypeIdLabel") }, { key: "doc", header: "Document", render: file("document") }],
    fields: [
      { name: "name", label: "Document name", type: "text", required: true, placeholder: "e.g. Vehicle registration" },
      { name: "documentTypeId", label: "Document type", type: "select", lookup: "document-types", required: true },
      { name: "document", label: "Upload document", type: "file", required: true },
    ] },
  { id: "owners", tab: "Owner", resource: "owners", noun: "Owner", addLabel: "Add owner", canAdd: true, canEdit: true, canDelete: true,
    columns: [{ key: "name", header: "Name", render: text("ownerIdLabel") }, { key: "type", header: "Owner type", render: text("ownerType") }, { key: "linked", header: "Linked owner", render: (r) => r.linkedOwner ? String(r.linkedOwner) : "Not linked" }],
    fields: [{ name: "ownerId", label: "Vehicle owner", type: "combo", lookup: "vehicle-owners", required: true, placeholder: "Search by phone number or name" }] },
  { id: "beneficiaries", tab: "Beneficiary", resource: "beneficiaries", noun: "Beneficiary", addLabel: "Add beneficiary", canAdd: true, canEdit: true, canDelete: true,
    columns: [{ key: "name", header: "Beneficiary name", render: text("name") }, { key: "address", header: "Address", render: text("address") }, { key: "contact", header: "Contact number", render: text("contact") }],
    fields: [
      { name: "name", label: "Beneficiary name", type: "text", required: true },
      { name: "address", label: "Address", type: "text" },
      { name: "contact", label: "Contact number", type: "text", required: true, pattern: /^9[678]\d{8}$/, patternMessage: "Enter a 10-digit mobile number starting with 96, 97 or 98" },
    ] },
  { id: "check-passes", tab: "Check pass", resource: "check-passes", noun: "Check pass", addLabel: "Add check pass", canAdd: true, canEdit: true, canDelete: true,
    columns: [{ key: "from", header: "From", render: date("from") }, { key: "to", header: "To", render: date("to") }, { key: "doc", header: "Check pass document", render: file("document") }],
    fields: [
      { name: "from", label: "From", type: "date", required: true }, { name: "to", label: "To", type: "date", required: true, after: "from" },
      { name: "document", label: "Check pass document", type: "file" },
    ] },
  { id: "route-permits", tab: "Route permit", resource: "route-permits", noun: "Route permit", addLabel: "Add route permit", canAdd: true, canEdit: true, canDelete: true,
    columns: [{ key: "from", header: "Valid from", render: date("from") }, { key: "to", header: "Valid to", render: date("to") }, { key: "doc", header: "Permit document", render: file("document") }],
    fields: [
      { name: "from", label: "Valid from", type: "date", required: true }, { name: "to", label: "Valid to", type: "date", required: true, after: "from" },
      { name: "document", label: "Route permit document", type: "file", required: true },
    ] },
  { id: "insurances", tab: "Insurance", resource: "insurances", noun: "Insurance", addLabel: "Add insurance", canAdd: true, canEdit: true, canDelete: true,
    columns: [{ key: "company", header: "Company", render: text("companyIdLabel") }, { key: "policy", header: "Policy number", render: text("policyNumber") }, { key: "type", header: "Policy type", render: text("policyTypeIdLabel") },
      { key: "expiry", header: "Expiry date", render: date("expiryDate") }, { key: "doc", header: "Documents", render: file("document") }],
    fields: [
      { name: "companyId", label: "Insurance company", type: "select", lookup: "insurance-companies", required: true },
      { name: "policyNumber", label: "Policy number", type: "text", required: true },
      { name: "policyTypeId", label: "Policy type", type: "select", lookup: "policy-types", required: true },
      { name: "startDate", label: "Policy start date", type: "date", required: true }, { name: "expiryDate", label: "Policy expiry date", type: "date", required: true, after: "startDate" },
      { name: "document", label: "Insurance document", type: "file" },
    ] },
  { id: "type-cards", tab: "Type card", resource: "type-cards", noun: "Type card", addLabel: "Add type card", canAdd: true, canEdit: true, canDelete: true,
    columns: [{ key: "name", header: "Card type", render: text("cardTypeIdLabel") }, { key: "sangh", header: "Sthaniya", render: text("sanghIdLabel") }, { key: "start", header: "Card start", render: date("startDate") }, { key: "expiry", header: "Expiry date", render: date("expiryDate") }],
    fields: [
      { name: "cardTypeId", label: "Card type", type: "select", lookup: "card-types", required: true },
      { name: "sanghId", label: "Sthaniya", type: "select", lookup: "sanghs", required: true },
      { name: "startDate", label: "Card start date", type: "date", required: true }, { name: "expiryDate", label: "Expiry date", type: "date", required: true, after: "startDate" },
      { name: "narration", label: "Narration", type: "text", required: true },
    ] },
  { id: "bluebooks", tab: "Bluebook", resource: "bluebooks", noun: "Bluebook", addLabel: "Add bluebook", canAdd: true, canEdit: true, canDelete: true,
    columns: [{ key: "reg", header: "Registration date", render: date("registrationDate") }, { key: "expiry", header: "Expiry date", render: date("expiryDate") }, { key: "features", header: "Features", render: text("features") }, { key: "doc", header: "Document", render: file("document") }],
    fields: [
      { name: "registrationDate", label: "Registration date", type: "date", required: true }, { name: "expiryDate", label: "Expiry date", type: "date", required: true, after: "registrationDate" },
      { name: "document", label: "Bluebook document", type: "file" }, { name: "features", label: "Features", type: "text" },
    ] },
];

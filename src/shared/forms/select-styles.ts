import type { StylesConfig } from "react-select";
import type { Option } from "@/shared/api/types";

export const selectStyles: StylesConfig<Option, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderColor: state.isFocused ? "#57534e" : "#d6d3d1",
    borderRadius: 6,
    boxShadow: state.isFocused ? "0 0 0 2px rgba(87, 83, 78, .15)" : "none",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    "&:hover": { borderColor: state.isFocused ? "#57534e" : "#a8a29e" },
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 11px" }),
  indicatorsContainer: (base) => ({ ...base, minHeight: 40 }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  placeholder: (base) => ({ ...base, color: "#78716c" }),
  menu: (base) => ({ ...base, zIndex: 40, borderRadius: 6 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#57534e" : state.isFocused ? "#f5f5f4" : "white",
    color: state.isSelected ? "white" : "#292524",
    cursor: "pointer",
  }),
};

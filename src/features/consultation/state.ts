export interface ConsultationActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
}

export const initialConsultationState: ConsultationActionState = { status: "idle" };

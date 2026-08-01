"use client";

import { useActionState } from "react";
import { submitContactAction } from "./actions";
import { initialContactState } from "./state";
import { TextField, TextAreaField, CheckboxField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { StateNotice } from "@/components/ui/StateNotice";
import { UtmHiddenFields } from "@/components/forms/UtmHiddenFields";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactAction,
    initialContactState
  );

  if (state.status === "success") {
    return (
      <StateNotice tone="success" title="Đã gửi liên hệ thành công">
        {state.message}
      </StateNotice>
    );
  }

  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" && state.message ? (
        <StateNotice tone="error" title={state.message} />
      ) : null}

      <UtmHiddenFields />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="fullName"
          label="Họ tên"
          required
          defaultValue={values.fullName}
          error={errors.fullName}
          autoComplete="name"
        />
        <TextField
          id="phone"
          label="Số điện thoại"
          required
          type="tel"
          defaultValue={values.phone}
          error={errors.phone}
          autoComplete="tel"
        />
      </div>

      <TextField
        id="email"
        label="Email (không bắt buộc)"
        type="email"
        defaultValue={values.email}
        error={errors.email}
        autoComplete="email"
      />

      <TextAreaField
        id="message"
        label="Nội dung liên hệ"
        required
        defaultValue={values.message}
        error={errors.message}
      />

      <CheckboxField
        key={values.consent ?? "unset"}
        id="consent"
        label="Tôi đồng ý để VETJOY sử dụng thông tin này nhằm liên hệ và hỗ trợ yêu cầu của tôi."
        defaultChecked={values.consent === "on"}
        error={errors.consent}
      />

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Đang gửi..." : "GỬI LIÊN HỆ"}
      </Button>
    </form>
  );
}

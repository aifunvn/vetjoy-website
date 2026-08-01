"use client";

import { useActionState } from "react";
import { submitDealerAction } from "./actions";
import { initialDealerState } from "./state";
import {
  TextField,
  TextAreaField,
  SelectField,
  CheckboxField,
} from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { StateNotice } from "@/components/ui/StateNotice";
import { UtmHiddenFields } from "@/components/forms/UtmHiddenFields";
import { TrackView } from "@/components/analytics/TrackView";
import { dealerBusinessScales } from "@/lib/validation/dealer-schema";

export function DealerForm() {
  const [state, formAction, pending] = useActionState(
    submitDealerAction,
    initialDealerState
  );

  if (state.status === "success") {
    return (
      <>
        <TrackView event="dealer_submit" />
        <StateNotice tone="success" title="Đăng ký thành công">
          {state.message}
        </StateNotice>
      </>
    );
  }

  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6" noValidate>
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
          placeholder="0901234567"
        />
      </div>

      <TextField
        id="zalo"
        label="Zalo (nếu khác số điện thoại)"
        defaultValue={values.zalo}
        error={errors.zalo}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="businessName"
          label="Tên cửa hàng/doanh nghiệp"
          required
          defaultValue={values.businessName}
          error={errors.businessName}
        />
        <TextField
          id="areaAddress"
          label="Địa chỉ/khu vực kinh doanh"
          required
          defaultValue={values.areaAddress}
          error={errors.areaAddress}
        />
      </div>

      <TextAreaField
        id="currentProducts"
        label="Sản phẩm đang kinh doanh (nếu có)"
        defaultValue={values.currentProducts}
        error={errors.currentProducts}
        rows={3}
      />

      <SelectField
        key={values.businessScale ?? "unset"}
        id="businessScale"
        label="Quy mô kinh doanh"
        required
        defaultValue={values.businessScale ?? ""}
        error={errors.businessScale}
      >
        <option value="" disabled>
          Chọn quy mô
        </option>
        {dealerBusinessScales.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </SelectField>

      <TextAreaField
        id="cooperationNeeds"
        label="Nhu cầu hợp tác"
        required
        defaultValue={values.cooperationNeeds}
        error={errors.cooperationNeeds}
      />

      <CheckboxField
        key={values.consent ?? "unset"}
        id="consent"
        label="Tôi đồng ý để VETJOY sử dụng thông tin này nhằm liên hệ và hỗ trợ yêu cầu của tôi."
        defaultChecked={values.consent === "on"}
        error={errors.consent}
      />

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Đang gửi..." : "ĐĂNG KÝ ĐỐI TÁC"}
      </Button>
    </form>
  );
}

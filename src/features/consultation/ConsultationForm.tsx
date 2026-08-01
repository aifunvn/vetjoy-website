"use client";

import { useActionState } from "react";
import { submitConsultationAction } from "./actions";
import { initialConsultationState } from "./state";
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
import { consultationCustomerTypes } from "@/lib/validation/consultation-schema";

export function ConsultationForm() {
  const [state, formAction, pending] = useActionState(
    submitConsultationAction,
    initialConsultationState
  );

  if (state.status === "success") {
    return (
      <>
        <TrackView event="consultation_submit" />
        <StateNotice tone="success" title="Đã gửi yêu cầu thành công">
          {state.message}
        </StateNotice>
      </>
    );
  }

  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state.status === "error" && state.message ? (
        <StateNotice tone="error" title={state.message} />
      ) : null}

      <UtmHiddenFields />

      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-neutral-900">
          Thông tin liên hệ
        </legend>
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
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="zalo"
            label="Zalo (nếu khác số điện thoại)"
            defaultValue={values.zalo}
            error={errors.zalo}
          />
          <SelectField
            key={values.customerType ?? "unset"}
            id="customerType"
            label="Bạn là"
            required
            defaultValue={values.customerType ?? ""}
            error={errors.customerType}
          >
            <option value="" disabled>
              Chọn đối tượng
            </option>
            {consultationCustomerTypes.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </SelectField>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-neutral-900">
          Thông tin vật nuôi
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="animalType"
            label="Loại vật nuôi"
            required
            placeholder="Ví dụ: heo, gà, chó, mèo..."
            defaultValue={values.animalType}
            error={errors.animalType}
          />
          <TextField
            id="breed"
            label="Giống (nếu biết)"
            defaultValue={values.breed}
            error={errors.breed}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            id="age"
            label="Độ tuổi"
            defaultValue={values.age}
            error={errors.age}
          />
          <TextField
            id="herdSize"
            label="Số lượng đàn"
            defaultValue={values.herdSize}
            error={errors.herdSize}
          />
          <TextField
            id="affectedCount"
            label="Số con có biểu hiện"
            defaultValue={values.affectedCount}
            error={errors.affectedCount}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-neutral-900">
          Tình trạng hiện tại
        </legend>
        <TextField
          id="onsetTime"
          label="Thời gian xuất hiện biểu hiện"
          required
          placeholder="Ví dụ: 2 ngày trước"
          defaultValue={values.onsetTime}
          error={errors.onsetTime}
        />
        <TextAreaField
          id="mainSymptoms"
          label="Biểu hiện chính"
          required
          placeholder="Mô tả biểu hiện bạn quan sát được ở vật nuôi"
          defaultValue={values.mainSymptoms}
          error={errors.mainSymptoms}
        />
        <TextAreaField
          id="productsUsed"
          label="Sản phẩm/thuốc đã sử dụng (nếu có)"
          defaultValue={values.productsUsed}
          error={errors.productsUsed}
          rows={3}
        />
        <TextAreaField
          id="currentResult"
          label="Kết quả hiện tại"
          defaultValue={values.currentResult}
          error={errors.currentResult}
          rows={3}
        />
        <TextAreaField
          id="supportNeeded"
          label="Nội dung muốn được hỗ trợ"
          required
          defaultValue={values.supportNeeded}
          error={errors.supportNeeded}
        />

        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
          <label htmlFor="attachment" className="block text-sm font-medium text-neutral-500">
            Đính kèm hình ảnh/video (sắp ra mắt)
          </label>
          <input
            id="attachment"
            type="file"
            disabled
            className="mt-2 block w-full text-sm text-neutral-400"
          />
          <p className="mt-1 text-xs text-neutral-400">
            Tính năng tải hình ảnh/video minh họa đang được chuẩn bị và sẽ sớm được
            bổ sung.
          </p>
        </div>
      </fieldset>

      <CheckboxField
        key={values.consent ?? "unset"}
        id="consent"
        label="Tôi đồng ý để VETJOY sử dụng thông tin này nhằm liên hệ và hỗ trợ yêu cầu của tôi."
        defaultChecked={values.consent === "on"}
        error={errors.consent}
      />

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Đang gửi..." : "GỬI YÊU CẦU TƯ VẤN"}
      </Button>
    </form>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useRef, useState } from "react";

interface FacilityFormValues {
  name: string;
  address: string;
  nvosCategory: string;
  nvosRegNumber: string;
  okved: string;
}

interface Props {
  defaultValues?: Partial<FacilityFormValues>;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}

const NVOS_OPTIONS = [
  { value: "I", label: "I — Значительное воздействие" },
  { value: "II", label: "II — Умеренное воздействие" },
  { value: "III", label: "III — Незначительное воздействие" },
  { value: "IV", label: "IV — Минимальное воздействие" },
];

export function FacilityForm({ defaultValues, action, submitLabel = "Сохранить" }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;

    setPending(true);
    setError("");

    try {
      const formData = new FormData(formRef.current);
      await action(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Название объекта"
        name="name"
        defaultValue={defaultValues?.name}
        required
        placeholder="Производственный цех №1"
      />
      <Input
        label="Адрес"
        name="address"
        defaultValue={defaultValues?.address}
        required
        placeholder="г. Москва, ул. Примерная, д. 1"
      />
      <Select
        label="Категория НВОС"
        name="nvosCategory"
        defaultValue={defaultValues?.nvosCategory ?? "IV"}
        options={NVOS_OPTIONS}
        required
      />
      <Input
        label="Регистрационный номер НВОС"
        name="nvosRegNumber"
        defaultValue={defaultValues?.nvosRegNumber}
        placeholder="00-00000-00000-0"
        hint="Присваивается Росприроднадзором"
      />
      <Input
        label="Код ОКВЭД"
        name="okved"
        defaultValue={defaultValues?.okved}
        placeholder="35.14"
        hint="Основной вид деятельности"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}

      <div className="flex gap-3 mt-2">
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => history.back()}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}

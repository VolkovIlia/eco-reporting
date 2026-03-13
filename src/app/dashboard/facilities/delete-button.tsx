"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { deleteFacility } from "./actions";

interface Props {
  id: number;
  name: string;
}

export function DeleteFacilityButton({ id, name }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteFacility(id);
    setOpen(false);
    setLoading(false);
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        Удалить
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Удалить объект">
        <p className="text-gray-600 mb-6">
          Вы уверены, что хотите удалить объект <strong>{name}</strong>?
          Все связанные отчёты также будут удалены.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button variant="danger" loading={loading} onClick={handleDelete}>
            Удалить
          </Button>
        </div>
      </Dialog>
    </>
  );
}

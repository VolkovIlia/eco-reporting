"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    orgName: "",
    inn: "",
  });

  function updateField(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Пароль должен содержать минимум 8 символов");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Ошибка регистрации");
      setLoading(false);
      return;
    }

    // Auto login after registration
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/auth/login");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ЭкоОтчёт</h1>
          <p className="text-gray-500 mt-1">Создайте аккаунт</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Название организации"
              value={form.orgName}
              onChange={updateField("orgName")}
              required
              placeholder="ООО «Предприятие»"
            />
            <Input
              label="ИНН"
              value={form.inn}
              onChange={updateField("inn")}
              placeholder="0000000000"
              hint="10 или 12 цифр"
              pattern="^\d{10,12}$"
            />
            <Input
              label="Ваше имя"
              value={form.name}
              onChange={updateField("name")}
              placeholder="Иван Иванов"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={updateField("email")}
              required
              placeholder="email@company.ru"
            />
            <Input
              label="Пароль"
              type="password"
              value={form.password}
              onChange={updateField("password")}
              required
              placeholder="Минимум 8 символов"
              hint="Минимум 8 символов"
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Зарегистрироваться
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Уже есть аккаунт?{" "}
            <Link href="/auth/login" className="text-green-600 hover:underline font-medium">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

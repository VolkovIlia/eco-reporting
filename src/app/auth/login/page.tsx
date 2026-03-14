import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ЭкоОтчёт</h1>
          <p className="text-gray-500 mt-1">Войдите в свой аккаунт</p>
        </div>

        <Suspense fallback={<div className="text-center text-gray-500">Загрузка...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

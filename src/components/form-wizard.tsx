"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";

interface Step {
  title: string;
  content: ReactNode;
}

interface FormWizardProps {
  steps: Step[];
  onSubmit: () => Promise<void>;
  submitLabel?: string;
}

export function FormWizard({ steps, onSubmit, submitLabel = "Сохранить" }: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  async function handleSubmit() {
    setLoading(true);
    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep(idx)}
              className={[
                "w-8 h-8 rounded-full text-sm font-medium transition-colors",
                idx === currentStep
                  ? "bg-green-600 text-white"
                  : idx < currentStep
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-400",
              ].join(" ")}
            >
              {idx + 1}
            </button>
            <span className={[
              "text-sm",
              idx === currentStep ? "font-medium text-gray-900" : "text-gray-400",
            ].join(" ")}>
              {step.title}
            </span>
            {idx < steps.length - 1 && (
              <div className="w-8 h-px bg-gray-200 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Current step content */}
      <div>{steps[currentStep].content}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Button
          variant="secondary"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={isFirst}
        >
          Назад
        </Button>
        {isLast ? (
          <Button loading={loading} onClick={handleSubmit}>
            {submitLabel}
          </Button>
        ) : (
          <Button onClick={() => setCurrentStep((s) => s + 1)}>
            Далее
          </Button>
        )}
      </div>
    </div>
  );
}

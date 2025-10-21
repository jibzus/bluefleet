interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface ProcessFlowProps {
  title: string;
  steps: Step[];
}

export function ProcessFlow({ title, steps }: ProcessFlowProps) {
  return (
    <div className="slide-up rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <h3 className="mb-8 text-2xl font-semibold">{title}</h3>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-12 h-full w-0.5 bg-border" aria-hidden />
            )}
            <div className="flex gap-4">
              <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground">
                {step.icon}
              </div>
              <div className="flex-1 pt-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    STEP {step.number}
                  </span>
                </div>
                <h4 className="mb-1 text-lg font-semibold">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

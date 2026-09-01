interface StepperProps {
  pasos: string[];
  actual: number;
  className?: string;
}

export function Stepper({ pasos, actual, className = '' }: StepperProps) {
  return (
    <ol className={`flex flex-wrap items-center gap-2 ${className}`}>
      {pasos.map((paso, index) => {
        const numero = index + 1;
        const activo = numero === actual;
        const completado = numero < actual;
        return (
          <li key={paso} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  completado
                    ? 'bg-green-100 text-green-700'
                    : activo
                      ? 'bg-sigeb-blue text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {completado ? '✓' : numero}
              </span>
              <span
                className={`text-sm ${activo ? 'font-semibold text-sigeb-blue-dark' : 'text-gray-500'}`}
              >
                {paso}
              </span>
            </div>
            {index < pasos.length - 1 && (
              <span className="mx-1 h-px w-8 bg-gray-300" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

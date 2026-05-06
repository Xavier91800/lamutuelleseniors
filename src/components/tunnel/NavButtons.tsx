'use client';

import { Button } from '@/components/ui/Button';

interface NavButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  isFinal?: boolean;
  loading?: boolean;
}

export function NavButtons({
  onBack,
  onNext,
  nextLabel,
  backLabel = 'Retour',
  nextDisabled = false,
  isFinal = false,
  loading = false,
}: NavButtonsProps) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      {onBack ? (
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          ← {backLabel}
        </Button>
      ) : (
        <span />
      )}
      <Button
        type={onNext ? 'button' : 'submit'}
        onClick={onNext}
        disabled={nextDisabled || loading}
      >
        {loading ? 'Envoi…' : nextLabel ?? (isFinal ? 'Envoyer ma demande' : 'Continuer →')}
      </Button>
    </div>
  );
}

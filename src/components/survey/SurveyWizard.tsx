'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Send, Loader2, User, ShoppingBag, Store, BarChart3, Target, AlertCircle } from 'lucide-react';
import { SURVEY_CATEGORIES, SURVEY_FIELDS, getSurveyFieldsByCategory } from '@/lib/constants/survey-fields';
import { DemographicStep } from './steps/DemographicStep';
import { BehaviouralStep } from './steps/BehaviouralStep';
import { MarketStep } from './steps/MarketStep';
import { MarketSignalStep } from './steps/MarketSignalStep';
import { CulturalStep } from './steps/CulturalStep';
import { T } from '@/lib/constants/mock-data';

interface SurveyWizardProps {
  wallet: string;
  email?: string;
  clusterSlug: string;
  clusterName: string;
  token: string;
  onComplete: () => void;
}

type StepId = 'DEMOGRAPHIC' | 'BEHAVIOURAL' | 'MARKET' | 'MARKET_SIGNAL' | 'CULTURAL';

interface StepConfig {
  id: StepId;
  label: string;
  description: string;
  component: React.ComponentType<StepComponentProps>;
  icon: React.ReactNode;
  accent: string;
  accentBg: string;
}

interface StepComponentProps {
  values: Record<string, any>;
  onChange: (fieldCode: string, value: any) => void;
  errors: Record<string, string>;
}

const STEP_ACCENTS: Record<StepId, { color: string; bg: string }> = {
  DEMOGRAPHIC:  { color: '#5B8BA0', bg: '#EAF3F7' },
  BEHAVIOURAL:  { color: '#C17A5F', bg: '#F5E9E3' },
  MARKET:       { color: '#8B7BB8', bg: '#F0EDF7' },
  MARKET_SIGNAL:{ color: '#1B7A65', bg: '#E6F3EF' },
  CULTURAL:     { color: '#C45B7A', bg: '#F7EAF0' },
};

const STEPS: StepConfig[] = [
  { id: 'DEMOGRAPHIC',   label: 'Data Diri',     description: 'Ceritain sedikit tentang kamu',                          component: DemographicStep,   icon: <User size={18} />,       accent: STEP_ACCENTS.DEMOGRAPHIC.color,  accentBg: STEP_ACCENTS.DEMOGRAPHIC.bg },
  { id: 'BEHAVIOURAL',   label: 'Kebiasaan',     description: 'Gimana sih kebiasaan makan/minum kamu?',                 component: BehaviouralStep,   icon: <ShoppingBag size={18} />, accent: STEP_ACCENTS.BEHAVIOURAL.color,  accentBg: STEP_ACCENTS.BEHAVIOURAL.bg },
  { id: 'MARKET',        label: 'Pasar',         description: 'Soal harga dan tempat favorit kamu',                     component: MarketStep,        icon: <Store size={18} />,       accent: STEP_ACCENTS.MARKET.color,       accentBg: STEP_ACCENTS.MARKET.bg },
  { id: 'MARKET_SIGNAL', label: 'Sinyal Pasar',  description: 'Pengamatan kamu tentang area ini',                       component: MarketSignalStep,  icon: <BarChart3 size={18} />,   accent: STEP_ACCENTS.MARKET_SIGNAL.color, accentBg: STEP_ACCENTS.MARKET_SIGNAL.bg },
  { id: 'CULTURAL',      label: 'Budaya & Akses', description: 'Soal selera dan akses ke area ini',                      component: CulturalStep,      icon: <Target size={18} />,      accent: STEP_ACCENTS.CULTURAL.color,     accentBg: STEP_ACCENTS.CULTURAL.bg },
];

export function SurveyWizard({ wallet, email, clusterSlug, clusterName, token, onComplete }: SurveyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentStepConfig = STEPS[currentStep];
  const CurrentStepComponent = currentStepConfig.component;
  const accent = STEP_ACCENTS[currentStepConfig.id];

  const handleFieldChange = useCallback((fieldCode: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldCode]: value }));
    if (errors[fieldCode]) {
      setErrors(prev => { const next = { ...prev }; delete next[fieldCode]; return next; });
    }
  }, [errors]);

  const validateCurrentStep = useCallback((): boolean => {
    const stepFields = getSurveyFieldsByCategory(currentStepConfig.id);
    const newErrors: Record<string, string> = {};

    for (const field of stepFields) {
      if (!field.required) continue;
      const value = values[field.code];

      if (field.type === 'category_prices') {
        // Must have at least one category with a price
        if (!value || typeof value !== 'object' || Object.keys(value).length === 0) {
          newErrors[field.code] = 'Isi minimal satu kategori';
        } else {
          const hasAtLeastOne = Object.values(value).some(v => v !== undefined && v !== null && v !== '' && Number(v) > 0);
          if (!hasAtLeastOne) newErrors[field.code] = 'Isi minimal satu kategori';
        }
      } else if (field.type === 'multi_select') {
        if (!Array.isArray(value) || value.length === 0) {
          newErrors[field.code] = 'Pilih minimal satu opsi';
        }
      } else if (field.type === 'text_list') {
        if (!Array.isArray(value) || value.length === 0) {
          newErrors[field.code] = 'Tambahkan minimal satu item';
        }
      } else if (field.type === 'scale') {
        if (value === undefined || value === null) {
          newErrors[field.code] = 'Pilih nilai';
        }
      } else if (field.type === 'text') {
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          newErrors[field.code] = 'Wajib diisi';
        }
      } else if (field.type === 'select') {
        if (!value || value === '') {
          newErrors[field.code] = 'Pilih salah satu';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStepConfig.id, values]);

  const handleNext = useCallback(() => {
    if (!validateCurrentStep()) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, validateCurrentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/survey/${clusterSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, email, token, responses: Object.entries(values).map(([fieldCode, value]) => ({ fieldCode, value })) }),
      });
      if (!response.ok) { const data = await response.json(); throw new Error(data.message || 'Gagal mengirim survey'); }
      onComplete();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  }, [wallet, email, clusterSlug, values, onComplete, validateCurrentStep]);

  const isLastStep = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.g500 }}>Langkah {currentStep + 1} dari {STEPS.length}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: accent.color }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 6, background: T.c200, borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: accent.color, borderRadius: 9999, transition: 'width 500ms ease-out', width: `${progress}%` }} />
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 8 }}>
        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isFuture = index > currentStep;
          const stepAccent = STEP_ACCENTS[step.id];
          return (
            <button
              key={step.id}
              onClick={() => { if (index < currentStep) { setCurrentStep(index); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
              disabled={isFuture}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                flex: 1, border: 'none', background: 'none', cursor: isFuture ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', padding: '4px 2px', opacity: isFuture ? 0.4 : 1, transition: 'all 150ms',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: isActive ? stepAccent.color : isCompleted ? stepAccent.bg : T.c200,
                color: isActive ? '#fff' : isCompleted ? stepAccent.color : T.g500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 200ms ease',
                boxShadow: isActive ? `0 4px 12px ${stepAccent.color}40` : 'none',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
              }}>
                {isCompleted ? <CheckCircle size={18} color={stepAccent.color} /> : step.icon}
              </div>
              <span style={{
                fontSize: 10, fontWeight: isActive ? 700 : 500,
                color: isActive ? stepAccent.color : T.g500,
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div style={{ background: '#fff', border: `1px solid ${T.c200}`, borderRadius: 16, padding: '28px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T.c200}` }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: accent.bg, color: accent.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {currentStepConfig.icon}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 2 }}>{currentStepConfig.label}</h3>
            <p style={{ fontSize: 12, color: T.g500 }}>{currentStepConfig.description}</p>
          </div>
        </div>

        <CurrentStepComponent
          values={values}
          onChange={handleFieldChange}
          errors={errors}
        />
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '11px 20px', borderRadius: 9999, border: 'none',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
            color: T.g700, background: T.c200, cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            opacity: currentStep === 0 ? 0.5 : 1, transition: 'all 150ms',
          }}
        >
          <ChevronLeft size={16} />
          Kembali
        </button>

        {isLastStep ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 24px', borderRadius: 9999, border: 'none',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
              color: '#fff', background: T.p600, cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1, transition: 'all 150ms',
              boxShadow: submitting ? 'none' : '0 4px 14px rgba(27,122,101,0.3)',
            }}
          >
            {submitting ? <><Loader2 size={16} style={{ animation: 'lokal-spin 800ms linear infinite' }} />Mengirim...</>
              : <><Send size={16} />Kirim Survey</>}
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 24px', borderRadius: 9999, border: 'none',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
              color: '#fff', background: T.p600, cursor: 'pointer',
              transition: 'all 150ms', boxShadow: '0 4px 14px rgba(27,122,101,0.3)',
            }}
          >
            Selanjutnya
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Validation errors summary */}
      {Object.keys(errors).length > 0 && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: `${T.warning}10`, border: `1px solid ${T.warning}30`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={16} color={T.warning} />
          <span style={{ fontSize: 13, color: T.g700 }}>
            Mohon isi {Object.keys(errors).length} pertanyaan yang belum dijawab
          </span>
        </div>
      )}

      {/* Error message */}
      {submitError && (
        <div style={{ marginTop: 16, padding: '14px 16px', background: `${T.danger}10`, border: `1px solid ${T.danger}20`, borderRadius: 12 }}>
          <p style={{ fontSize: 13, color: T.danger }}>{submitError}</p>
        </div>
      )}
    </div>
  );
}

function CheckCircle({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

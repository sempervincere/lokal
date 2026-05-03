'use client';

import { getSurveyFieldsByCategory } from '@/lib/constants/survey-fields';
import { T } from '@/lib/constants/mock-data';

interface StepComponentProps {
  values: Record<string, any>;
  onChange: (fieldCode: string, value: any) => void;
  errors: Record<string, string>;
}

const cardBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
  borderRadius: 12, border: `2px solid ${T.c200}`, background: '#fff',
  cursor: 'pointer', transition: 'all 150ms', textAlign: 'left', fontFamily: 'inherit',
};

const circleBase: React.CSSProperties = {
  width: 20, height: 20, borderRadius: '50%', border: `2px solid ${T.c200}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms',
};

const squareBase: React.CSSProperties = {
  width: 20, height: 20, borderRadius: 6, border: `2px solid ${T.c200}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms',
};

const errorStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.danger, marginTop: 6,
};

const fields = getSurveyFieldsByCategory('CULTURAL');

export function CulturalStep({ values, onChange, errors }: StepComponentProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {fields.map((field) => (
        <div key={field.code}>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.g900 }}>{field.question}</span>
            {field.description && <span style={{ display: 'block', fontSize: 12, color: T.g500, marginTop: 3 }}>{field.description}</span>}
          </label>

          {field.type === 'scale' && field.min !== undefined && field.max !== undefined && (
            <ScaleInput min={field.min} max={field.max} labels={field.labels} value={values[field.code]} onChange={(val) => onChange(field.code, val)} error={errors[field.code]} />
          )}

          {field.type === 'multi_select' && field.options && (
            <MultiSelectInput options={field.options} value={values[field.code] || []} onChange={(val) => onChange(field.code, val)} error={errors[field.code]} />
          )}

          {field.type === 'select' && field.options && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {field.options.map((option) => {
                const isSelected = values[field.code] === option.value;
                return (
                  <button key={option.value} onClick={() => onChange(field.code, option.value)} style={{ ...cardBase, borderColor: isSelected ? T.p600 : T.c200, background: isSelected ? T.p100 : '#fff' }}>
                    <div style={{ ...circleBase, borderColor: isSelected ? T.p600 : T.c200, background: isSelected ? T.p600 : 'transparent' }}>
                      {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <span style={{ fontSize: 13, color: T.g700, fontWeight: isSelected ? 600 : 400 }}>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {errors[field.code] && (
            <div style={errorStyle}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: `${T.danger}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>!</span>
              {errors[field.code]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ScaleInput({ min, max, labels, value, onChange, error }: { min: number; max: number; labels?: [string, string]; value?: number; onChange: (val: number) => void; error?: string }) {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {labels && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <span style={{ fontSize: 11, color: T.g500 }}>{labels[0]}</span>
          <span style={{ fontSize: 11, color: T.g500 }}>{labels[1]}</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        {range.map((num) => (
          <button key={num} onClick={() => onChange(num)}
            style={{
              flex: 1, height: 44, borderRadius: 10, fontSize: 14, fontWeight: 600,
              border: 'none', fontFamily: 'inherit', cursor: 'pointer', transition: 'all 150ms',
              background: value === num ? T.p600 : '#fff',
              color: value === num ? '#fff' : T.g700,
              boxShadow: value === num ? '0 4px 12px rgba(27,122,101,0.25)' : `inset 0 0 0 1px ${T.c200}`,
            }}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiSelectInput({ options, value, onChange, error }: { options: Array<{ value: string; label: string }>; value: string[]; onChange: (val: string[]) => void; error?: string }) {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) onChange(value.filter(v => v !== optionValue));
    else onChange([...value, optionValue]);
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {options.map((option) => {
        const isSelected = value.includes(option.value);
        return (
          <button key={option.value} onClick={() => toggleOption(option.value)} style={{ ...cardBase, borderColor: isSelected ? T.p600 : T.c200, background: isSelected ? T.p100 : '#fff' }}>
            <div style={{ ...squareBase, borderColor: isSelected ? T.p600 : T.c200, background: isSelected ? T.p600 : 'transparent' }}>
              {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <span style={{ fontSize: 13, color: T.g700, fontWeight: isSelected ? 600 : 400 }}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

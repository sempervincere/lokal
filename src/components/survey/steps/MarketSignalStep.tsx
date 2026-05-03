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

const errorStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.danger, marginTop: 6,
};

const fields = getSurveyFieldsByCategory('MARKET_SIGNAL');

export function MarketSignalStep({ values, onChange, errors }: StepComponentProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {fields.map((field) => (
        <div key={field.code}>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.g900 }}>{field.question}</span>
            {field.description && <span style={{ display: 'block', fontSize: 12, color: T.g500, marginTop: 3 }}>{field.description}</span>}
          </label>

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

          {field.type === 'text' && (
            <textarea
              value={values[field.code] || ''}
              onChange={(e) => onChange(field.code, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              style={{
                width: '100%', padding: '14px 16px', background: '#fff', border: `1px solid ${T.c200}`,
                borderRadius: 12, fontSize: 14, fontFamily: 'inherit', color: T.g900,
                outline: 'none', resize: 'none', transition: 'border-color 150ms',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = T.p600; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.p100}`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = T.c200; e.currentTarget.style.boxShadow = 'none'; }}
            />
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

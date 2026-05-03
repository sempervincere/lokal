'use client';

import { useState } from 'react';
import { getSurveyFieldsByCategory, FB_CATEGORIES } from '@/lib/constants/survey-fields';
import { Plus, Trash2 } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';

interface StepComponentProps {
  values: Record<string, any>;
  onChange: (fieldCode: string, value: any) => void;
  errors: Record<string, string>;
}

/* ─── Shared Form Styles ─── */
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

const fields = getSurveyFieldsByCategory('BEHAVIOURAL');

export function BehaviouralStep({ values, onChange, errors }: StepComponentProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {fields.map((field) => (
        <div key={field.code}>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.g900 }}>{field.question}</span>
            {field.description && <span style={{ display: 'block', fontSize: 12, color: T.g500, marginTop: 3 }}>{field.description}</span>}
          </label>

          {field.type === 'category_prices' && (
            <CategoryPricesInput value={values[field.code] || {}} onChange={(val) => onChange(field.code, val)} error={errors[field.code]} />
          )}

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

function CategoryPricesInput({ value, onChange, error }: { value: Record<string, number>; onChange: (val: Record<string, number>) => void; error?: string }) {
  const [showAll, setShowAll] = useState(false);
  const displayCategories = showAll ? FB_CATEGORIES : FB_CATEGORIES.slice(0, 5);
  const handlePriceChange = (category: string, price: string) => {
    const numPrice = price === '' ? undefined : parseInt(price.replace(/\D/g, ''));
    const newValue = { ...value };
    if (numPrice === undefined) delete newValue[category];
    else newValue[category] = numPrice;
    onChange(newValue);
  };
  const filledCount = Object.values(value).filter(v => v !== undefined && v > 0).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: T.g500 }}>{filledCount} kategori diisi</span>
        <span style={{ fontSize: 12, color: T.p600, fontWeight: 600 }}>Min. 1 kategori</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {displayCategories.map((cat) => (
          <div key={cat.value} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid ${T.c200}`, borderRadius: 12, padding: '12px 14px' }}>
            <span style={{ fontSize: 18 }}>{cat.icon}</span>
            <span style={{ fontSize: 13, color: T.g700, flex: 1 }}>{cat.label}</span>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: T.g500 }}>Rp</span>
              <input
                type="text" inputMode="numeric" placeholder="0"
                value={value[cat.value]?.toLocaleString('id') || ''}
                onChange={(e) => handlePriceChange(cat.value, e.target.value)}
                style={{ width: 100, padding: '8px 10px 8px 32px', background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 8, fontSize: 13, textAlign: 'right', fontFamily: 'var(--font-mono), monospace', outline: 'none', transition: 'border-color 150ms' }}
                onFocus={(e) => e.currentTarget.style.borderColor = T.p600}
                onBlur={(e) => e.currentTarget.style.borderColor = T.c200}
              />
            </div>
          </div>
        ))}
      </div>
      {FB_CATEGORIES.length > 5 && (
        <button onClick={() => setShowAll(!showAll)} style={{ width: '100%', padding: '10px 0', fontSize: 12, fontWeight: 600, color: T.p600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          {showAll ? 'Tampilkan lebih sedikit' : `Tampilkan ${FB_CATEGORIES.length - 5} kategori lainnya`}
        </button>
      )}
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
          <button
            key={num} onClick={() => onChange(num)}
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

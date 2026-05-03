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

const errorStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.danger, marginTop: 6,
};

const fields = getSurveyFieldsByCategory('MARKET');

export function MarketStep({ values, onChange, errors }: StepComponentProps) {
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

          {field.type === 'text_list' && (
            <TextListInput value={values[field.code] || []} onChange={(val) => onChange(field.code, val)} placeholder={field.placeholder} maxItems={field.maxItems || 5} error={errors[field.code]} />
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
              <input type="text" inputMode="numeric" placeholder="0" value={value[cat.value]?.toLocaleString('id') || ''} onChange={(e) => handlePriceChange(cat.value, e.target.value)}
                style={{ width: 100, padding: '8px 10px 8px 32px', background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 8, fontSize: 13, textAlign: 'right', fontFamily: 'var(--font-mono), monospace', outline: 'none', transition: 'border-color 150ms' }}
                onFocus={(e) => e.currentTarget.style.borderColor = T.p600} onBlur={(e) => e.currentTarget.style.borderColor = T.c200}
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

function TextListInput({ value, onChange, placeholder, maxItems, error }: { value: string[]; onChange: (val: string[]) => void; placeholder?: string; maxItems: number; error?: string }) {
  const [newItem, setNewItem] = useState('');
  const addItem = () => { if (newItem.trim() && value.length < maxItems) { onChange([...value, newItem.trim()]); setNewItem(''); } };
  const removeItem = (index: number) => { onChange(value.filter((_, i) => i !== index)); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {value.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: `1px solid ${T.c200}`, borderRadius: 12, padding: '10px 14px' }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: T.p100, color: T.p600, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{index + 1}</span>
              <span style={{ flex: 1, fontSize: 13, color: T.g700 }}>{item}</span>
              <button onClick={() => removeItem(index)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: T.g500, transition: 'all 150ms' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${T.danger}10`; e.currentTarget.style.color = T.danger; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.g500; }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      {value.length < maxItems && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} placeholder={placeholder || 'Tambahkan item...'}
            style={{ flex: 1, padding: '12px 16px', background: '#fff', border: `1px solid ${T.c200}`, borderRadius: 12, fontSize: 14, fontFamily: 'inherit', color: T.g900, outline: 'none', transition: 'border-color 150ms' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.p600; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.p100}`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.c200; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <button onClick={addItem} disabled={!newItem.trim()} style={{ padding: '10px 16px', background: T.p600, color: '#fff', border: 'none', borderRadius: 12, cursor: newItem.trim() ? 'pointer' : 'not-allowed', opacity: newItem.trim() ? 1 : 0.4, transition: 'all 150ms', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={18} />
          </button>
        </div>
      )}
      <p style={{ fontSize: 11, color: T.g500 }}>{value.length} dari {maxItems} item</p>
    </div>
  );
}

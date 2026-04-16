import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MEAL_CONTEXT_LABELS } from '../constants';
import { format } from 'date-fns';

export default function AddGlucoseModal({ onClose, onSaved }) {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [context, setContext] = useState('before_meal');
  const [notes, setNotes] = useState('');
  const [measuredAt, setMeasuredAt] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const num = parseFloat(value);
    if (!num || num < 1 || num > 30) {
      setError('Введите корректное значение (1–30 ммоль/л)');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('glucose_readings').insert({
      user_id: user.id,
      value: num,
      meal_context: context,
      notes,
      measured_at: new Date(measuredAt).toISOString(),
    });
    setSaving(false);
    if (error) {
      setError('Ошибка при сохранении');
      return;
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-900">Добавить измерение</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="label">Уровень глюкозы (ммоль/л)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="30"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input-field text-lg font-semibold"
              placeholder="Например: 5.4"
              autoFocus
            />
          </div>

          <div>
            <label className="label">Контекст измерения</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(MEAL_CONTEXT_LABELS).map((key) => (
                <button
                  key={key}
                  onClick={() => setContext(key)}
                  className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                    context === key
                      ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {MEAL_CONTEXT_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Дата и время</label>
            <input
              type="datetime-local"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Заметки (необязательно)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field resize-none"
              rows={2}
              placeholder="Например: после физической нагрузки"
            />
          </div>

          {error && (
            <p className="text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t border-neutral-100">
          <button onClick={onClose} className="btn-secondary flex-1">
            Отмена
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

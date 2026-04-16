import { useEffect, useState } from 'react';
import { Plus, Trash2, ListFilter as Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MEAL_CONTEXT_LABELS } from '../constants';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import AddGlucoseModal from '../components/AddGlucoseModal';

function GlucoseBadge({ value }) {
  if (value < 3.9) return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-50 text-primary-700 border border-primary-200">Низкий</span>;
  if (value <= 7.8) return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-success-50 text-success-700 border border-success-100">Норма</span>;
  if (value <= 11.0) return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-warning-50 text-warning-600 border border-warning-100">Повышенный</span>;
  return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-danger-50 text-danger-600 border border-danger-100">Высокий</span>;
}

export default function GlucosePage() {
  const { user } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterContext, setFilterContext] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const fetchReadings = async () => {
    if (!user) return;
    let query = supabase
      .from('glucose_readings')
      .select('*')
      .eq('user_id', user.id)
      .order('measured_at', { ascending: false })
      .limit(100);

    if (filterContext !== 'all') {
      query = query.eq('meal_context', filterContext);
    }

    const { data } = await query;
    setReadings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReadings();
  }, [user, filterContext]);

  const handleDelete = async (id) => {
    setDeleting(id);
    await supabase.from('glucose_readings').delete().eq('id', id);
    setReadings((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  };

  const grouped = {};
  readings.forEach((r) => {
    const day = format(parseISO(r.measured_at), 'd MMMM yyyy', { locale: ru });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(r);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Журнал сахара крови</h2>
          <p className="text-sm text-neutral-500 mt-0.5">История измерений</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-500 mr-1">Фильтр:</span>
          <button
            onClick={() => setFilterContext('all')}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              filterContext === 'all' ? 'bg-primary-600 text-white border-primary-600' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
            }`}
          >
            Все
          </button>
          {Object.keys(MEAL_CONTEXT_LABELS).map((key) => (
            <button
              key={key}
              onClick={() => setFilterContext(key)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                filterContext === key ? 'bg-primary-600 text-white border-primary-600' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {MEAL_CONTEXT_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : readings.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-neutral-400 mb-3">Нет измерений</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Добавить первое измерение
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([day, items]) => (
            <div key={day} className="card overflow-hidden">
              <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-700">{day}</p>
              </div>
              <div className="divide-y divide-neutral-50">
                {items.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[56px]">
                        <p className="text-lg font-bold text-neutral-900">{r.value.toFixed(1)}</p>
                        <p className="text-xs text-neutral-400">ммоль/л</p>
                      </div>
                      <div>
                        <GlucoseBadge value={r.value} />
                        <p className="text-xs text-neutral-500 mt-1">{MEAL_CONTEXT_LABELS[r.meal_context]}</p>
                        {r.notes && <p className="text-xs text-neutral-400 mt-0.5 italic">{r.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-neutral-400">{format(parseISO(r.measured_at), 'HH:mm')}</p>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deleting === r.id}
                        className="text-neutral-300 hover:text-danger-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddGlucoseModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            fetchReadings();
          }}
        />
      )}
    </div>
  );
}

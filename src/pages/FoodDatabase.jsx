import { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronUp, Plus, X, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../constants';

function GIBadge({ gi }) {
  if (gi === 0) return <span className="text-xs text-neutral-400">—</span>;
  if (gi <= 35) return <span className="text-xs font-medium text-success-600">Низкий ({gi})</span>;
  if (gi <= 55) return <span className="text-xs font-medium text-warning-600">Средний ({gi})</span>;
  return <span className="text-xs font-medium text-danger-600">Высокий ({gi})</span>;
}

function FoodRow({ food }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900">{food.name}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
          </div>
          <span className="text-xs text-neutral-400">{food.category}</span>
        </td>
        <td className="px-4 py-3 text-sm text-neutral-700 text-right">{food.calories.toFixed(0)}</td>
        <td className="px-4 py-3 text-sm text-neutral-700 text-right">{food.carbs.toFixed(1)}</td>
        <td className="px-4 py-3 text-sm text-right">
          <span className="font-semibold text-primary-700">{food.bread_units?.toFixed(1)}</span>
        </td>
        <td className="px-4 py-3 text-right">
          <GIBadge gi={food.glycemic_index} />
        </td>
      </tr>
      {expanded && (
        <tr className="bg-primary-50/30">
          <td colSpan={5} className="px-4 py-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-0.5">Белки</p>
                <p className="text-sm font-semibold text-neutral-900">{food.proteins.toFixed(1)} г</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-0.5">Жиры</p>
                <p className="text-sm font-semibold text-neutral-900">{food.fats.toFixed(1)} г</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-0.5">Углеводы</p>
                <p className="text-sm font-semibold text-neutral-900">{food.carbs.toFixed(1)} г</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function AddFoodModal({ onClose, onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', category: 'Другое', calories: '', proteins: '', fats: '', carbs: '', glycemic_index: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Введите название продукта');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('foods').insert({
      name: form.name.trim(),
      category: form.category,
      calories: parseFloat(form.calories) || 0,
      proteins: parseFloat(form.proteins) || 0,
      fats: parseFloat(form.fats) || 0,
      carbs: parseFloat(form.carbs) || 0,
      glycemic_index: parseInt(form.glycemic_index) || 0,
      is_system: false,
      user_id: user.id,
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
          <h3 className="font-semibold text-neutral-900">Добавить продукт</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="label">Название</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Название продукта"
            />
          </div>
          <div>
            <label className="label">Категория</label>
            <select
              className="input-field"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.slice(1).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Калории (на 100г)</label>
              <input className="input-field" type="number" value={form.calories} onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label className="label">Углеводы (г)</label>
              <input className="input-field" type="number" value={form.carbs} onChange={(e) => setForm((f) => ({ ...f, carbs: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label className="label">Белки (г)</label>
              <input className="input-field" type="number" value={form.proteins} onChange={(e) => setForm((f) => ({ ...f, proteins: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label className="label">Жиры (г)</label>
              <input className="input-field" type="number" value={form.fats} onChange={(e) => setForm((f) => ({ ...f, fats: e.target.value }))} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="label">Гликемический индекс</label>
            <input className="input-field" type="number" value={form.glycemic_index} onChange={(e) => setForm((f) => ({ ...f, glycemic_index: e.target.value }))} placeholder="0" />
          </div>
          {error && <p className="text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-lg px-3 py-2">{error}</p>}
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

export default function FoodDatabase() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все категории');
  const [showModal, setShowModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const fetchFoods = async () => {
    let query = supabase.from('foods').select('*').order('name');
    if (category !== 'Все категории') query = query.eq('category', category);
    const { data } = await query;
    setFoods(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFoods();
  }, [category]);

  const filtered = foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">База продуктов</h2>
          <p className="text-sm text-neutral-500 mt-0.5">БЖУ, калории и хлебные единицы</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowInfo(!showInfo)} className="btn-secondary flex items-center gap-2">
            <Info className="w-4 h-4" />
            Что такое ХЕ?
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="card p-5 bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-primary-900 mb-2">Хлебная единица (ХЕ)</h3>
          <p className="text-sm text-primary-800 leading-relaxed">
            Хлебная единица (ХЕ) — единица измерения количества углеводов в продуктах питания.
            <strong> 1 ХЕ = 12 г углеводов</strong> или 25 г хлеба. Диабетикам рекомендуется потреблять
            <strong> не более 2–3 ХЕ за один приём пищи</strong>. При диабете 1 типа необходимо рассчитывать дозу инсулина на основе ХЕ.
            Гликемический индекс (ГИ) показывает скорость повышения сахара в крови после употребления продукта: до 35 — низкий (безопасно), 36–55 — средний, выше 55 —
            высокий.
          </p>
          <button onClick={() => setShowInfo(false)} className="mt-3 text-primary-600 text-sm hover:underline">
            Закрыть
          </button>
        </div>
      )}

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" placeholder="Поиск продукта..." />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field sm:w-52">
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Продукт</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">Ккал/100г</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">Углеводы</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">ХЕ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">ГИ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-neutral-400 text-sm">
                      Продукты не найдены
                    </td>
                  </tr>
                ) : (
                  filtered.map((food) => <FoodRow key={food.id} food={food} />)
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddFoodModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            fetchFoods();
          }}
        />
      )}
    </div>
  );
}

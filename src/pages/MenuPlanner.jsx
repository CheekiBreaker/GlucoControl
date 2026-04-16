import { useEffect, useState } from 'react';
import { Plus, Trash2, ChefHat, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MEAL_TYPE_LABELS } from '../constants';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

function calcNutrition(items) {
  return items.reduce(
    (acc, item) => {
      if (!item.food) return acc;
      const ratio = item.quantity / 100;
      return {
        calories: acc.calories + item.food.calories * ratio,
        proteins: acc.proteins + item.food.proteins * ratio,
        fats: acc.fats + item.food.fats * ratio,
        carbs: acc.carbs + item.food.carbs * ratio,
        bread_units: acc.bread_units + (item.food.bread_units || 0) * ratio,
      };
    },
    { calories: 0, proteins: 0, fats: 0, carbs: 0, bread_units: 0 }
  );
}

function AddMealModal({ onClose, onSaved }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from('meals').insert({
      user_id: user.id,
      name: name.trim(),
      meal_type: mealType,
      planned_date: date,
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h3 className="font-semibold">Новый приём пищи</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label">Название</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Завтрак с овсянкой" autoFocus />
          </div>
          <div>
            <label className="label">Тип приёма пищи</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(MEAL_TYPE_LABELS).map((key) => (
                <button
                  key={key}
                  onClick={() => setMealType(key)}
                  className={`py-2 text-sm rounded-lg border transition-colors ${
                    mealType === key ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium' : 'border-neutral-200 text-neutral-600'
                  }`}
                >
                  {MEAL_TYPE_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Дата</label>
            <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-neutral-100">
          <button onClick={onClose} className="btn-secondary flex-1">
            Отмена
          </button>
          <button onClick={handleSave} disabled={saving || !name.trim()} className="btn-primary flex-1">
            {saving ? 'Сохранение...' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddFoodToMealModal({ mealId, onClose, onSaved }) {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState('100');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('foods').select('*').order('name').then(({ data }) => setFoods(data || []));
  }, []);

  const filtered = foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())).slice(0, 20);

  const handleAdd = async () => {
    if (!selected) return;
    setSaving(true);
    await supabase.from('meal_items').insert({ meal_id: mealId, food_id: selected.id, quantity: parseFloat(quantity) || 100 });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h3 className="font-semibold">Добавить продукт</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input className="input-field pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск продукта..." autoFocus />
          </div>
          <div className="border border-neutral-200 rounded-lg max-h-48 overflow-y-auto scrollbar-thin">
            {filtered.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f)}
                className={`w-full text-left px-4 py-2.5 text-sm border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors ${
                  selected?.id === f.id ? 'bg-primary-50 text-primary-700' : 'text-neutral-800'
                }`}
              >
                <span className="font-medium">{f.name}</span>
                <span className="text-xs text-neutral-400 ml-2">{f.category}</span>
              </button>
            ))}
          </div>
          {selected && (
            <div>
              <label className="label">Количество (г)</label>
              <input type="number" className="input-field" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[50, 100, 150, 200].map((g) => (
                  <button
                    key={g}
                    onClick={() => setQuantity(String(g))}
                    className={`py-1 text-xs rounded-md border transition-colors ${
                      quantity === String(g) ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {g}г
                  </button>
                ))}
              </div>
              {selected && (
                <div className="mt-3 p-3 bg-neutral-50 rounded-lg grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <p className="text-neutral-500">Ккал</p>
                    <p className="font-semibold">{((selected.calories * parseFloat(quantity || '0')) / 100).toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Белки</p>
                    <p className="font-semibold">{((selected.proteins * parseFloat(quantity || '0')) / 100).toFixed(1)}г</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Жиры</p>
                    <p className="font-semibold">{((selected.fats * parseFloat(quantity || '0')) / 100).toFixed(1)}г</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">ХЕ</p>
                    <p className="font-semibold text-primary-700">{(((selected.bread_units || 0) * parseFloat(quantity || '0')) / 100).toFixed(1)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-neutral-100">
          <button onClick={onClose} className="btn-secondary flex-1">
            Отмена
          </button>
          <button onClick={handleAdd} disabled={saving || !selected} className="btn-primary flex-1">
            {saving ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MealCard({ meal, onDeleted }) {
  const [items, setItems] = useState([]);
  const [showAddFood, setShowAddFood] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase.from('meal_items').select('*, food:foods(*)').eq('meal_id', meal.id);
    setItems(data || []);
  };

  useEffect(() => {
    fetchItems();
  }, [meal.id]);

  const handleDeleteItem = async (itemId) => {
    await supabase.from('meal_items').delete().eq('id', itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleDeleteMeal = async () => {
    await supabase.from('meals').delete().eq('id', meal.id);
    onDeleted();
  };

  const nutrition = calcNutrition(items);
  const mealTypeColors = {
    breakfast: 'bg-warning-50 text-warning-700 border-warning-100',
    lunch: 'bg-success-50 text-success-700 border-success-100',
    dinner: 'bg-primary-50 text-primary-700 border-primary-200',
    snack: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${mealTypeColors[meal.meal_type]}`}>
              {MEAL_TYPE_LABELS[meal.meal_type]}
            </span>
          </div>
          <p className="font-semibold text-neutral-900 mt-1">{meal.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAddFood(true)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            Продукт
          </button>
          <button onClick={handleDeleteMeal} className="text-neutral-300 hover:text-danger-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="divide-y divide-neutral-50">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50">
              <div>
                <p className="text-sm font-medium text-neutral-800">{item.food?.name}</p>
                <p className="text-xs text-neutral-400">{item.quantity}г</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <span>{((item.food?.calories || 0) * (item.quantity / 100)).toFixed(0)} ккал</span>
                <span className="text-primary-600 font-medium">{(((item.food?.bread_units || 0) * item.quantity) / 100).toFixed(1)} ХЕ</span>
                <button onClick={() => handleDeleteItem(item.id)} className="text-neutral-300 hover:text-danger-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100 grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <p className="text-neutral-500">Ккал</p>
            <p className="font-bold text-neutral-900">{nutrition.calories.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-neutral-500">Белки</p>
            <p className="font-bold text-neutral-900">{nutrition.proteins.toFixed(1)}г</p>
          </div>
          <div>
            <p className="text-neutral-500">Жиры</p>
            <p className="font-bold text-neutral-900">{nutrition.fats.toFixed(1)}г</p>
          </div>
          <div>
            <p className="text-neutral-500">ХЕ</p>
            <p className="font-bold text-primary-700">{nutrition.bread_units.toFixed(1)}</p>
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="p-4 text-center">
          <p className="text-sm text-neutral-400">Нет продуктов</p>
          <button onClick={() => setShowAddFood(true)} className="text-primary-600 text-xs mt-1 hover:underline">
            Добавить продукт
          </button>
        </div>
      )}

      {showAddFood && (
        <AddFoodToMealModal
          mealId={meal.id}
          onClose={() => setShowAddFood(false)}
          onSaved={() => {
            setShowAddFood(false);
            fetchItems();
          }}
        />
      )}
    </div>
  );
}

export default function MenuPlanner() {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchMeals = async () => {
    if (!user) return;
    const { data } = await supabase.from('meals').select('*').eq('user_id', user.id).eq('planned_date', selectedDate).order('created_at');
    setMeals(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMeals();
  }, [user, selectedDate]);

  const displayDate = format(new Date(selectedDate + 'T00:00:00'), 'd MMMM yyyy', { locale: ru });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Планировщик меню</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Составьте рацион питания</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Добавить приём
        </button>
      </div>

      <div className="card p-4 flex items-center gap-4">
        <label className="text-sm font-medium text-neutral-700">Дата:</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field max-w-xs" />
        <span className="text-sm text-neutral-500">{displayDate}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : meals.length === 0 ? (
        <div className="card p-12 text-center">
          <ChefHat className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 mb-3">Нет приёмов пищи на эту дату</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Добавить приём пищи
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onDeleted={() => setMeals((prev) => prev.filter((m) => m.id !== meal.id))} />
          ))}
        </div>
      )}

      {showModal && (
        <AddMealModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            fetchMeals();
          }}
        />
      )}
    </div>
  );
}

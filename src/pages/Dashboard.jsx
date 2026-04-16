import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, TrendingDown, TrendingUp, Minus, Plus, CircleAlert as AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MEAL_CONTEXT_LABELS, GLUCOSE_RANGES } from '../constants';
import { format, subDays, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import AddGlucoseModal from '../components/AddGlucoseModal';

function getGlucoseStatus(value) {
  if (value < GLUCOSE_RANGES.low.max)
    return { label: 'Низкий', color: 'text-primary-600', bg: 'bg-primary-50 border-primary-200' };
  if (value <= GLUCOSE_RANGES.normal.max)
    return { label: 'Норма', color: 'text-success-600', bg: 'bg-success-50 border-success-100' };
  if (value <= GLUCOSE_RANGES.high.max)
    return { label: 'Повышенный', color: 'text-warning-600', bg: 'bg-warning-50 border-warning-100' };
  return { label: 'Высокий', color: 'text-danger-600', bg: 'bg-danger-50 border-danger-100' };
}

function getLineColor(value) {
  if (value < 3.9) return '#3b82f6';
  if (value <= 7.8) return '#22c55e';
  if (value <= 11.0) return '#f59e0b';
  return '#ef4444';
}

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const color = getLineColor(payload.value);
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const status = getGlucoseStatus(value);
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-neutral-500 mb-1">{label}</p>
        <p className="font-semibold text-neutral-900">{value} ммоль/л</p>
        <p className={`text-xs font-medium ${status.color}`}>{status.label}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [period, setPeriod] = useState(7);

  const fetchReadings = async () => {
    if (!user) return;
    const from = subDays(new Date(), period).toISOString();
    const { data } = await supabase
      .from('glucose_readings')
      .select('*')
      .eq('user_id', user.id)
      .gte('measured_at', from)
      .order('measured_at', { ascending: true });
    setReadings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReadings();
  }, [user, period]);

  const chartData = readings.map((r) => ({
    time: format(parseISO(r.measured_at), 'dd.MM HH:mm'),
    value: r.value,
    context: MEAL_CONTEXT_LABELS[r.meal_context],
  }));

  const lastReading = readings[readings.length - 1];
  const avgValue = readings.length > 0 ? readings.reduce((s, r) => s + r.value, 0) / readings.length : null;
  const maxValue = readings.length > 0 ? Math.max(...readings.map((r) => r.value)) : null;
  const minValue = readings.length > 0 ? Math.min(...readings.map((r) => r.value)) : null;

  const inRangeCount = readings.filter((r) => r.value >= 3.9 && r.value <= 7.8).length;
  const inRangePct = readings.length > 0 ? Math.round((inRangeCount / readings.length) * 100) : 0;

  const lastStatus = lastReading ? getGlucoseStatus(lastReading.value) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Дашборд</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Обзор вашего состояния</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Добавить измерение
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs font-medium text-neutral-500 mb-1">Последнее измерение</p>
          {lastReading ? (
            <>
              <p className="text-2xl font-bold text-neutral-900">{lastReading.value.toFixed(1)}</p>
              <p className="text-xs text-neutral-400">ммоль/л</p>
              <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full border ${lastStatus?.bg} ${lastStatus?.color}`}>
                {lastStatus?.label}
              </span>
            </>
          ) : (
            <p className="text-sm text-neutral-400 mt-2">Нет данных</p>
          )}
        </div>

        <div className="card p-4">
          <p className="text-xs font-medium text-neutral-500 mb-1">Среднее значение</p>
          {avgValue !== null ? (
            <>
              <p className="text-2xl font-bold text-neutral-900">{avgValue.toFixed(1)}</p>
              <p className="text-xs text-neutral-400">ммоль/л</p>
              <p className="text-xs text-neutral-400 mt-2">за {period} дней</p>
            </>
          ) : (
            <p className="text-sm text-neutral-400 mt-2">Нет данных</p>
          )}
        </div>

        <div className="card p-4">
          <p className="text-xs font-medium text-neutral-500 mb-1">Мин / Макс</p>
          {minValue !== null && maxValue !== null ? (
            <>
              <div className="flex items-center gap-2 mt-1">
                <TrendingDown className="w-4 h-4 text-primary-500" />
                <span className="text-lg font-bold text-neutral-900">{minValue.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="w-4 h-4 text-danger-500" />
                <span className="text-lg font-bold text-neutral-900">{maxValue.toFixed(1)}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-neutral-400 mt-2">Нет данных</p>
          )}
        </div>

        <div className="card p-4">
          <p className="text-xs font-medium text-neutral-500 mb-1">Время в норме</p>
          {readings.length > 0 ? (
            <>
              <p className="text-2xl font-bold text-neutral-900">{inRangePct}%</p>
              <p className="text-xs text-neutral-400">
                {inRangeCount} из {readings.length}
              </p>
              <div className="mt-2 h-1.5 bg-neutral-100 rounded-full">
                <div
                  className="h-full bg-success-500 rounded-full transition-all duration-500"
                  style={{ width: `${inRangePct}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-neutral-400 mt-2">Нет данных</p>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-600" />
            График уровня глюкозы
          </h3>
          <div className="flex gap-1">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setPeriod(d)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  period === d ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {d}д
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : readings.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-neutral-400">
            <AlertCircle className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">Нет данных за выбранный период</p>
            <button onClick={() => setShowModal(true)} className="mt-3 text-primary-600 text-sm hover:underline">
              Добавить первое измерение
            </button>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis domain={[2, 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={3.9} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: '3.9', fontSize: 10, fill: '#3b82f6' }} />
                <ReferenceLine y={7.8} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '7.8', fontSize: 10, fill: '#f59e0b' }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-primary-500 inline-block" /> До 3.9 — низкий
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-success-500 inline-block" /> 3.9–7.8 — норма
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-warning-500 inline-block" /> 7.8–11 — повышенный
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-danger-500 inline-block" /> Выше 11 — высокий
          </span>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-neutral-900 mb-3">Последние измерения</h3>
        {readings.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-4">Нет измерений</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {[...readings]
              .reverse()
              .slice(0, 10)
              .map((r) => {
                const status = getGlucoseStatus(r.value);
                return (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <Minus className={`w-3 h-3 ${status.color}`} />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{r.value.toFixed(1)} ммоль/л</p>
                        <p className="text-xs text-neutral-400">{MEAL_CONTEXT_LABELS[r.meal_context]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">{format(parseISO(r.measured_at), 'dd MMM', { locale: ru })}</p>
                      <p className="text-xs text-neutral-400">{format(parseISO(r.measured_at), 'HH:mm')}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

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

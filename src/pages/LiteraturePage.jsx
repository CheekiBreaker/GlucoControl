import { BookOpen, ExternalLink } from 'lucide-react';

export default function LiteraturePage() {
  const resources = [
    {
      title: 'Диабет: основы и управление',
      category: 'Основы',
      description: 'Полное руководство по пониманию диабета, его типов и методов контроля.',
      icon: '📚',
    },
    {
      title: 'Правильное питание при диабете',
      category: 'Питание',
      description: 'Принципы здорового питания, выбор продуктов и планирование меню для диабетиков.',
      icon: '🥗',
    },
    {
      title: 'Физическая активность и диабет',
      category: 'Спорт',
      description: 'Рекомендации по физической активности, упражнения и их влияние на уровень сахара.',
      icon: '🏃',
    },
    {
      title: 'Стресс и эмоциональное здоровье',
      category: 'Психология',
      description: 'Как стресс влияет на уровень глюкозы и методы управления эмоциями.',
      icon: '🧘',
    },
    {
      title: 'Профилактика осложнений',
      category: 'Здоровье',
      description: 'Информация о возможных осложнениях диабета и методах их профилактики.',
      icon: '⚕️',
    },
    {
      title: 'Инсулин: применение и расчёты',
      category: 'Инсулин',
      description: 'Детальное руководство по использованию инсулина и расчёту доз на основе ХЕ.',
      icon: '💉',
    },
  ];

  const tips = [
    {
      title: 'Мониторинг уровня глюкозы',
      points: [
        'Проверяйте уровень сахара в одно и то же время',
        'Ведите дневник измерений и факторов, влияющих на результаты',
        'Обсудите с врачом идеальные целевые значения для вас',
        'Используйте глюкометр правильно и проверяйте его точность',
      ],
    },
    {
      title: 'Питание и продукты',
      points: [
        'Изучайте гликемический индекс (ГИ) продуктов перед едой',
        'Считайте хлебные единицы (ХЕ) для контроля углеводов',
        'Ешьте медленные углеводы с клетчаткой',
        'Не пропускайте приёмы пищи и ешьте в одно время',
        'Избегайте сладких напитков и простых углеводов',
      ],
    },
    {
      title: 'Упражнения и активность',
      points: [
        'Начните с 150 минут умеренной активности в неделю',
        'Проверяйте уровень сахара до и после тренировки',
        'Имейте при себе быстрые углеводы на случай гипогликемии',
        'Занимайтесь силовыми упражнениями 2–3 раза в неделю',
      ],
    },
    {
      title: 'Сон и восстановление',
      points: [
        'Спите 7–9 часов в сутки для нормального метаболизма',
        'Соблюдайте регулярный режим сна',
        'Избегайте тяжёлой пищи за 3 часа до сна',
        'Недостаток сна повышает уровень сахара в крови',
      ],
    },
    {
      title: 'Управление стрессом',
      points: [
        'Практикуйте глубокое дыхание и медитацию',
        'Проводите время на свежем воздухе',
        'Общайтесь с близкими людьми',
        'Занимайтесь хобби и любимыми делами',
      ],
    },
    {
      title: 'Профилактика осложнений',
      points: [
        'Проверяйте ноги каждый день на повреждения',
        'Посещайте офтальмолога один раз в год',
        'Контролируйте кровяное давление',
        'Регулярно сдавайте анализ на холестерин',
        'Не курите и избегайте алкоголя',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">Образовательные материалы</h2>
        <p className="text-sm text-neutral-500 mt-0.5">Полезная информация для контроля диабета</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, i) => (
          <div key={i} className="card p-5 hover:shadow-md transition-shadow duration-200">
            <div className="text-3xl mb-3">{resource.icon}</div>
            <div className="mb-3">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">{resource.category}</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">{resource.title}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{resource.description}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {tips.map((section, i) => (
          <div key={i} className="card p-5">
            <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.points.map((point, j) => (
                <li key={j} className="flex gap-3 text-sm text-neutral-700">
                  <span className="text-primary-600 font-bold mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card p-5 bg-primary-50 border-primary-200">
        <h3 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Полезные ресурсы
        </h3>
        <div className="space-y-2 text-sm text-primary-800">
          <p>• Проконсультируйтесь с эндокринологом для персональной программы лечения</p>
          <p>• Посещайте школу диабета для повышения уровня знаний</p>
          <p>• Поддерживайте контакт с командой специалистов (врач, диетолог, психолог)</p>
          <p>• Присоединяйтесь к сообществам людей с диабетом для обмена опытом</p>
        </div>
      </div>
    </div>
  );
}

import { CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Lightbulb, Zap, Eye, Heart } from 'lucide-react';

export default function TipsPage() {
  const tips = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Быстрые углеводы для гипогликемии',
      description: 'Что съесть при низком уровне сахара',
      color: 'bg-warning-50 border-warning-200 text-warning-700',
      tips: [
        '3–4 таблетки глюкозы или меда',
        '1 стакан сока без сахара или молока',
        '15–20 гр сахара или сладкой конфеты',
        'Шоколад молочный (1–2 кусочка)',
        'Сухофрукты (несколько штук)',
        'Повторно проверьте уровень через 10–15 минут',
      ],
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: 'Выбор низкогликемических продуктов',
      description: 'Продукты с низким гликемическим индексом',
      color: 'bg-success-50 border-success-200 text-success-700',
      tips: [
        'Овощи: брокколи, цукини, помидоры, огурцы',
        'Фрукты: яблоки, груши, апельсины (в меру)',
        'Зерновые: овсяная каша, гречка, ячмень',
        'Бобовые: чечевица, горох, фасоль',
        'Рыба и морепродукты',
        'Избегайте: белый хлеб, макароны, картофель',
      ],
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Контроль порций и ХЕ',
      description: 'Как правильно планировать приёмы пищи',
      color: 'bg-primary-50 border-primary-200 text-primary-700',
      tips: [
        'Одна хлебная единица (ХЕ) = 12 г углеводов',
        'Завтрак: 1–2 ХЕ, обед: 2–3 ХЕ, ужин: 1–2 ХЕ',
        'Используйте тарелку-корзину для визуальной порции',
        'Половина тарелки - овощи, четверть - белки, четверть - углеводы',
        'Измеряйте продукты весами первые 2–3 недели',
        'Ешьте медленно, пережевывайте тщательно',
      ],
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Здоровый образ жизни',
      description: 'Факторы, влияющие на уровень сахара',
      color: 'bg-danger-50 border-danger-200 text-danger-700',
      tips: [
        'Регулярная физическая активность снижает уровень сахара',
        'Ходите пешком после каждого приёма пищи (15–20 минут)',
        'Занимайтесь спортом: плавание, велосипед, ходьба',
        'Недостаток сна повышает уровень глюкозы в крови',
        'Стресс и эмоции влияют на сахар - релаксируйте',
        'Пейте достаточно воды (6–8 стаканов в день)',
      ],
    },
  ];

  const warnings = [
    {
      icon: <AlertCircle className="w-5 h-5" />,
      title: 'Признаки гипогликемии (низкий сахар)',
      symptoms: [
        'Дрожь и потливость',
        'Голод и слабость',
        'Учащённое сердцебиение',
        'Раздражительность и тревога',
        'Затруднение концентрации',
      ],
      action: 'Немедленно съешьте 15–20 г быстрых углеводов',
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      title: 'Признаки гипергликемии (высокий сахар)',
      symptoms: [
        'Жажда и сухость во рту',
        'Частое мочеиспускание',
        'Усталость и слабость',
        'Размытое зрение',
        'Головная боль',
      ],
      action: 'Пейте больше воды, проверьте инсулин, обратитесь к врачу',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-warning-500" />
          Практические советы
        </h2>
        <p className="text-sm text-neutral-500 mt-0.5">Ежедневные рекомендации для контроля диабета</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {tips.map((tip, i) => (
          <div key={i} className={`card border p-5 ${tip.color}`}>
            <div className="flex items-start gap-3 mb-4">
              {tip.icon}
              <div>
                <h3 className="font-semibold">{tip.title}</h3>
                <p className="text-sm opacity-90">{tip.description}</p>
              </div>
            </div>
            <ul className="space-y-1 text-sm">
              {tip.tips.map((t, j) => (
                <li key={j} className="flex gap-2">
                  <span className="font-bold opacity-70">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {warnings.map((warning, i) => (
          <div key={i} className="card p-5 border border-danger-200 bg-danger-50/50">
            <h3 className="font-semibold text-danger-700 mb-3 flex items-center gap-2">
              {warning.icon}
              {warning.title}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-danger-600 uppercase mb-2">Симптомы:</p>
                <ul className="space-y-1 text-sm text-danger-700">
                  {warning.symptoms.map((s, j) => (
                    <li key={j} className="flex gap-2">
                      <span>•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-danger-600 uppercase mb-2">Действия:</p>
                <p className="text-sm font-semibold text-danger-700 bg-white rounded-lg p-3 border border-danger-100">
                  {warning.action}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5 bg-neutral-50">
        <h3 className="font-semibold text-neutral-900 mb-3">Когда обратиться к врачу</h3>
        <ul className="space-y-2 text-sm text-neutral-700">
          <li className="flex gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span>Уровень сахара стабильно выше 11 ммоль/л</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span>Частые случаи гипогликемии (ниже 3.9 ммоль/л)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span>Необычные симптомы или изменения в здоровье</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span>Тошнота, рвота, боли в животе (возможный кетоацидоз)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span>Проблемы с ногами, глазами или почками</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span>Перед началом нового лечения или препаратов</span>
          </li>
        </ul>
      </div>

      <div className="card p-5 bg-primary-50 border-primary-200">
        <h3 className="font-semibold text-primary-900 mb-2">Помните:</h3>
        <p className="text-sm text-primary-800">
          Диабет - это управляемое состояние. С правильным питанием, физической активностью, регулярным мониторингом и поддержкой медицинского специалиста вы можете
          жить полноценной и здоровой жизнью. Будьте позитивны и не отчаивайтесь!
        </p>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

const SCENARIOS = {
  normal: { base: 18, label: "طبيعي" },
  low: { base: 5, label: "خمول الرمش" },
  frozen: { base: 1, label: "تجمد العين" },
};

const n = (v) => new Intl.NumberFormat("ar-SA-u-nu-arab", { useGrouping: false }).format(v);
const stressOf = (rate) => (rate >= 15 ? 22 : Math.round(22 + ((15 - rate) / 15) * 72));
const levelOf = (s) => (s < 40 ? "low" : s < 70 ? "mid" : "high");
const LEVELS = {
  low: { text: "منخفض", eye: "ممتازة", tip: "استمر، عينك بحالة جيدة." },
  mid: { text: "متوسط", eye: "متعبة", tip: "خذ استراحة قصيرة وانظر لشيء بعيد 20 ثانية." },
  high: { text: "مرتفع", eye: "مجهدة", tip: "أوقف العمل دقيقتين وأغمض عينيك عدة مرات." },
};

export default function App() {
  const [tab, setTab] = useState("live");
  const [on, setOn] = useState(false);
  const [scenario, setScenario] = useState("normal");
  const [rate, setRate] = useState(18);
  const [blink, setBlink] = useState(false);
  const rateRef = useRef(rate);
  rateRef.current = rate;

  // معدل الرمش يتذبذب حول قيمة السيناريو
  useEffect(() => {
    if (!on) return;
    const base = SCENARIOS[scenario].base;
    setRate(base);
    const t = setInterval(() => {
      const jitter = base >= 15 ? Math.round(Math.random() * 4 - 2) : Math.round(Math.random() * 2 - 1);
      setRate(Math.max(0, base + jitter));
    }, 2000);
    return () => clearInterval(t);
  }, [on, scenario]);

  // رمشة مرئية بحسب المعدل الحالي
  useEffect(() => {
    if (!on) return;
    let timer;
    const loop = () => {
      const r = rateRef.current;
      if (r <= 1) { timer = setTimeout(loop, 1500); return; }
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 160);
        loop();
      }, (60 / r) * 1000);
    };
    loop();
    return () => clearTimeout(timer);
  }, [on]);

  const stress = on ? stressOf(rate) : 0;
  const lvl = LEVELS[levelOf(stress)];
  const level = levelOf(stress);
  const brightness = on ? Math.max(60, 100 - Math.round(stress / 3)) : 100;
  const productivity = on ? Math.round(100 - stress * 0.4) : 0;

  const pick = (s) => { setScenario(s); setOn(true); };

  return (
    <main className="app">
      <header className="top">
        <div>
          <h1>مُقلة <span className="en">Muqla</span></h1>
          <p className="sub">حارس إجهاد العين</p>
        </div>
        <p className="privacy-chip">المعالجة محلية، لا شيء يُرفع</p>
      </header>

      <nav className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "live"} onClick={() => setTab("live")}>اللوحة الحية</button>
        <button role="tab" aria-selected={tab === "impact"} onClick={() => setTab("impact")}>تأثير الإنتاجية</button>
      </nav>

      {tab === "live" ? (
        <>
          <section className={`stage ${on ? "active" : ""} lvl-${level}`} style={{ filter: `brightness(${brightness}%)` }}>
            <svg viewBox="0 0 240 120" className={`eye ${blink ? "blink" : ""}`} aria-label="عين تحاكي الرمش">
              <defs><clipPath id="lid"><path d="M10 60 Q120 -10 230 60 Q120 130 10 60Z" /></clipPath></defs>
              <path d="M10 60 Q120 -10 230 60 Q120 130 10 60Z" className="sclera" />
              <g clipPath="url(#lid)">
                <circle cx="120" cy="60" r="34" className="iris" />
                <circle cx="120" cy="60" r="15" className="pupil" />
                <circle cx="110" cy="50" r="5" className="glint" />
                <rect x="0" y="-60" width="240" height="120" className="lid" />
              </g>
            </svg>
            <p className="stage-note">{on ? "المراقبة تعمل (محاكاة)" : "المراقبة متوقفة"}</p>
          </section>

          <button className={`primary ${on ? "stop" : ""}`} onClick={() => setOn((v) => !v)}>
            {on ? "إيقاف المراقبة" : "تفعيل المراقبة الذكية"}
          </button>

          <section className="stats">
            <div><span className="k">دقة التتبع</span><b>{n(98)}٪</b></div>
            <div><span className="k">زمن الاستجابة</span><b>{n(12)} ms</b></div>
            <div><span className="k">بيانات مرسلة</span><b>{n(0)} KB</b></div>
          </section>

          <section className="card">
            <h2>معدل الرمش</h2>
            <p className="big">{on ? n(rate) : "—"}<small> رمشة / دقيقة</small></p>
            <p className="hint">المعدل الصحي: {n(15)}–{n(20)} رمشة في الدقيقة</p>
          </section>

          <section className="card">
            <h2>الإجهاد الرقمي {on && <span className={`badge ${level}`}>{lvl.text} · {n(stress)}٪</span>}</h2>
            <div className="meter" aria-hidden="true"><i style={{ width: `${stress}%` }} className={level} /></div>
            <div className="meter-scale"><span>منخفض</span><span>متوسط</span><span>مرتفع</span></div>
            <p className="eye-state">حالة العين: <b>{on ? lvl.eye : "—"}</b></p>
            {on && <p className="hint">{lvl.tip}</p>}
            <p className="hint">سطوع الشاشة التلقائي: {n(brightness)}٪</p>
          </section>

          <section className="card sim">
            <h2>لوحة المحاكاة للعرض التقديمي</h2>
            <div className="sim-btns">
              <button onClick={() => pick("low")}>محاكاة خمول الرمش ({n(5)} رمشات/د)</button>
              <button onClick={() => pick("frozen")}>محاكاة تجمد العين</button>
              <button onClick={() => pick("normal")}>إعادة ضبط (حالة طبيعية)</button>
            </div>
          </section>
        </>
      ) : (
        <section className="card">
          <h2>تأثير الإنتاجية</h2>
          <p className="big">{on ? n(productivity) : "—"}<small>٪ تركيز متوقع</small></p>
          <p className="hint">
            يقل التركيز كلما ارتفع الإجهاد. فعّل المراقبة من اللوحة الحية وجرّب أزرار المحاكاة لترى التغيّر.
          </p>
          <ul className="rule">
            <li>قاعدة ٢٠-٢٠-٢٠: كل ٢٠ دقيقة، انظر لشيء يبعد ٦ أمتار لمدة ٢٠ ثانية.</li>
            <li>اجعل الشاشة أسفل مستوى عينيك قليلاً.</li>
            <li>رمش بوعي عند القراءة الطويلة.</li>
          </ul>
        </section>
      )}

      <p className="foot">نسخة تجريبية: الأرقام محاكاة وليست كشفاً حقيقياً من الكاميرا.</p>
    </main>
  );
}

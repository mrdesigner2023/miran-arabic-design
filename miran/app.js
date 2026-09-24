(() => {
  const challenges = window.challengeData || [];
  const projectNames = {
    poster: "ملصق",
    identity: "هوية مصغّرة",
    social: "منشور توعوي",
    cover: "غلاف",
    infographic: "إنفوغراف",
    packaging: "تغليف",
    event: "فعالية",
    editorial: "صفحة تحريرية"
  };

  const constraintText = {
    mono: "استخدم لوناً واحداً ودرجاته؛ اجعل التباين في القيمة والملمس لا في كثرة الألوان.",
    "no-photo": "لا تستخدم صورة فوتوغرافية أو صورة جاهزة؛ ابنِ المشهد من كتابة وأشكال وآثار تصنعها بنفسك.",
    "one-shape": "ابنِ الفكرة من شكل هندسي أساسي واحد، وغيّر حجمه أو اتجاهه أو قصّه.",
    "type-led": "اجعل الحروف الصورة الأساسية؛ لا تضع العنوان بجوار الرسم كعنصرين منفصلين.",
    asymmetry: "اجعل التكوين غير متمركز، ووازن المساحات بصرياً لا بالتماثل.",
    "three-colors": "التزم بثلاثة ألوان كحد أقصى، بما فيها الخلفية.",
    whitespace: "اترك قرابة 40٪ من المساحة فارغة؛ استخدم الفراغ ليقود العين لا لتملأه لاحقاً.",
    grid: "نظّم العناصر على شبكة 3 × 3، ثم اكسر خانة واحدة لخلق نقطة تركيز.",
    handmade: "أدخل أثراً مرسوماً بيدك، حتى لو رقمنته لاحقاً؛ أبقِ شيئاً من طبيعته الأصلية.",
    collage: "ابنِ الصورة من قصاصات أو أشكال مركّبة؛ تجنّب أيقونة جاهزة واحدة تشرح كل شيء."
  };

  const levels = {
    beginner: {
      label: "مبتدئ",
      scope: "ابدأ بثلاثة مصغّرات بالقلم، ثم نفّذ فكرة واحدة فقط. ركّز على وضوحها قبل الزخرفة."
    },
    intermediate: {
      label: "متوسط",
      scope: "ارسم مسارين مختلفين قبل التنفيذ. اختر قراراً بصرياً واحداً يميّز كل مسار، ثم قارن بينهما."
    },
    advanced: {
      label: "متقدم",
      scope: "حوّل الفكرة إلى نظام صغير من ثلاث نسخ متناسقة. اختبر بقاء الفكرة واضحة عند تصغيرها."
    }
  };

  const routes = {
    20: [[4, "إحماء"], [5, "ثلاثة مصغّرات"], [8, "تركيب الفكرة"], [3, "مراجعة سريعة"]],
    30: [[5, "إحماء"], [7, "ثلاثة مصغّرات"], [14, "تركيب الفكرة"], [4, "مراجعة سريعة"]],
    45: [[7, "إحماء"], [10, "ثلاثة مصغّرات"], [22, "تركيب الفكرة"], [6, "مراجعة سريعة"]],
    60: [[8, "إحماء"], [12, "ثلاثة مصغّرات"], [32, "تركيب الفكرة"], [8, "مراجعة سريعة"]]
  };

  const storageKey = "miran-saved-challenges-v1";
  const form = document.querySelector("#settings-form");
  const projectSelect = document.querySelector("#project-type");
  const timeSelect = document.querySelector("#time-limit");
  const levelSelect = document.querySelector("#skill-level");
  const constraintSelect = document.querySelector("#visual-constraint");
  const title = document.querySelector("#challenge-title");
  const status = document.querySelector("#action-status");
  const savedSection = document.querySelector("#saved-section");
  const savedList = document.querySelector("#saved-list");
  let current = null;
  let sessionNumber = 1;
  let statusTimer = 0;

  function readSaved() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(value) ? value.filter((item) => item && item.title && item.project) : [];
    } catch {
      return [];
    }
  }

  function writeSaved(items) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
      return true;
    } catch {
      return false;
    }
  }

  function announce(message) {
    window.clearTimeout(statusTimer);
    status.textContent = message;
    statusTimer = window.setTimeout(() => { status.textContent = ""; }, 3200);
  }

  function getConfiguration() {
    const time = Number(timeSelect.value);
    const level = levelSelect.value;
    const requestedConstraint = constraintSelect.value;
    return {
      project: projectSelect.value,
      projectLabel: projectNames[projectSelect.value] || "مشروع بصري",
      time: routes[time] ? time : 30,
      level: levels[level] ? level : "beginner",
      constraint: requestedConstraint
    };
  }

  function renderRoute(minutes) {
    const list = document.querySelector("#time-route");
    list.replaceChildren();
    routes[minutes].forEach(([duration, label]) => {
      const item = document.createElement("li");
      const time = document.createElement("strong");
      const step = document.createElement("span");
      time.textContent = `${duration} د`;
      step.textContent = label;
      item.append(time, step);
      list.append(item);
    });
  }

  function renderBrief(challenge, config) {
    current = { ...challenge, config: { ...config }, effectiveConstraint: config.constraint === "auto" ? challenge.constraint : config.constraint };
    document.querySelector("#challenge-number").textContent = `تمرين ${String(sessionNumber).padStart(2, "0")}`;
    document.querySelector("#project-chip").textContent = config.projectLabel;
    document.querySelector("#meta-time").textContent = `${config.time} دقيقة`;
    document.querySelector("#meta-level").textContent = levels[config.level].label;
    title.textContent = challenge.title;
    document.querySelector("#challenge-deck").textContent = "ابدأ من قيدٍ ملموس، لا من صورة جاهزة.";
    document.querySelector("#brief-audience").textContent = challenge.audience;
    document.querySelector("#brief-objective").textContent = challenge.objective;

    const requiredList = document.querySelector("#brief-required");
    requiredList.replaceChildren();
    challenge.required.forEach((requirement) => {
      const item = document.createElement("li");
      item.textContent = requirement;
      requiredList.append(item);
    });

    document.querySelector("#brief-constraint").textContent = constraintText[current.effectiveConstraint];
    document.querySelector("#brief-cliche").textContent = challenge.cliche;
    document.querySelector("#brief-scope").textContent = levels[config.level].scope;
    document.querySelector("#brief-warmup").textContent = challenge.warmup;
    document.querySelector("#warmup-time").textContent = `${routes[config.time][0][0]} دقائق`;
    renderRoute(config.time);
    status.textContent = "";
  }

  function makeCopyText(item) {
    const config = item.config;
    const plan = routes[config.time].map(([duration, label]) => `• ${duration} دقائق — ${label}`).join("\n");
    return [
      `تحدّي مِران: ${item.title}`,
      `نوع المشروع: ${config.projectLabel} | الوقت: ${config.time} دقيقة | المستوى: ${levels[config.level].label}`,
      `لمن؟ ${item.audience}`,
      `الهدف: ${item.objective}`,
      "عناصر لا بدّ منها:",
      ...item.required.map((value) => `• ${value}`),
      `القيد البصري: ${constraintText[item.effectiveConstraint]}`,
      `تجنّب: ${item.cliche}`,
      `إحماء الفكرة: ${item.warmup}`,
      `مهمّة المستوى: ${levels[config.level].scope}`,
      "تقسيم الوقت:",
      plan
    ].join("\n\n");
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch { /* Try the local selection fallback below. */ }
    }
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch { copied = false; }
    field.remove();
    return copied;
  }

  function renderSaved() {
    const items = readSaved();
    savedSection.hidden = items.length === 0;
    document.querySelector("#saved-count").textContent = String(items.length);
    savedList.replaceChildren();
    items.forEach((item, index) => {
      const row = document.createElement("li");
      row.className = "saved-entry";
      const details = document.createElement("div");
      const name = document.createElement("strong");
      const meta = document.createElement("small");
      const remove = document.createElement("button");
      const copySaved = document.createElement("button");
      const tools = document.createElement("div");
      name.textContent = item.title;
      meta.textContent = `${item.project} · ${item.time} دقيقة · ${item.level}`;
      copySaved.className = "copy-saved";
      copySaved.type = "button";
      copySaved.textContent = "نسخ";
      copySaved.setAttribute("aria-label", `نسخ تحدّي ${item.title}`);
      copySaved.addEventListener("click", async () => {
        const copied = await copyText(item.brief || "");
        announce(copied ? "نُسخت النسخة المحفوظة." : "لم يتمكن المتصفح من النسخ.");
      });
      remove.className = "remove-saved";
      remove.type = "button";
      remove.textContent = "إزالة";
      remove.setAttribute("aria-label", `إزالة تحدّي ${item.title} من المحفوظات`);
      remove.addEventListener("click", () => {
        const latest = readSaved();
        latest.splice(index, 1);
        writeSaved(latest);
        renderSaved();
        announce("أُزيل التحدّي من قائمتك.");
      });
      details.append(name, meta);
      tools.className = "saved-tools";
      tools.append(copySaved, remove);
      row.append(details, tools);
      savedList.append(row);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const config = getConfiguration();
    const pool = challenges.filter((challenge) => challenge.project === config.project);
    if (!pool.length) {
      announce("تعذّر العثور على تحدٍّ لهذا النوع.");
      return;
    }
    const alternatives = pool.filter((challenge) => challenge.id !== current?.id);
    const next = (alternatives.length ? alternatives : pool)[Math.floor(Math.random() * (alternatives.length || pool.length))];
    sessionNumber += 1;
    renderBrief(next, config);
    title.focus({ preventScroll: true });
  });

  document.querySelector("#copy-button").addEventListener("click", async () => {
    const copied = await copyText(makeCopyText(current));
    announce(copied ? "نُسخ التحدّي كاملاً." : "لم يتمكن المتصفح من النسخ؛ جرّب زر الحفظ.");
  });

  document.querySelector("#save-button").addEventListener("click", () => {
    const items = readSaved();
    items.unshift({
      id: `${current.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: current.title,
      project: current.config.projectLabel,
      time: current.config.time,
      level: levels[current.config.level].label,
      savedAt: new Date().toISOString(),
      brief: makeCopyText(current)
    });
    const saved = writeSaved(items.slice(0, 50));
    if (saved) {
      renderSaved();
      announce("حُفظ محلياً في هذا المتصفح.");
    } else {
      announce("تعذّر الحفظ في إعدادات هذا المتصفح.");
    }
  });

  const firstChallenge = challenges.find((challenge) => challenge.id === "p01") || challenges[0];
  if (firstChallenge) renderBrief(firstChallenge, getConfiguration());
  renderSaved();
})();

/**
 * Simulador Oficial NYS DMV - Lógica del Cliente Web
 * Manejo de estado, navegación, persistencia en localStorage y calificación.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Estado de la Aplicación
  const state = {
    userName: localStorage.getItem("nys_dmv_user_name") || "Naty",
    questions: [],
    currentIndex: 0,
    userAnswers: {}, // { [questionId]: optionIndex }
    examHistory: JSON.parse(localStorage.getItem("nys_dmv_history") || "[]")
  };

  // Elementos del DOM
  const screens = {
    welcome: document.getElementById("screen-welcome"),
    exam: document.getElementById("screen-exam"),
    results: document.getElementById("screen-results")
  };

  const elements = {
    inputUserName: document.getElementById("input-user-name"),
    btnSaveName: document.getElementById("btn-save-name"),
    btnStartExam: document.getElementById("btn-start-exam"),
    historyContainer: document.getElementById("previous-history-container"),
    historyList: document.getElementById("history-list"),

    // Examen
    examUserBadge: document.getElementById("exam-user-badge"),
    questionCounter: document.getElementById("question-counter"),
    progressPercent: document.getElementById("progress-percent"),
    progressBarFill: document.getElementById("progress-bar-fill"),
    categoryBadge: document.getElementById("category-badge"),
    questionText: document.getElementById("question-text"),
    optionsContainer: document.getElementById("options-container"),
    btnPrevQuestion: document.getElementById("btn-prev-question"),
    btnNextQuestion: document.getElementById("btn-next-question"),
    quickNavPills: document.getElementById("quick-nav-pills"),

    // Resultados
    resultStatusBanner: document.getElementById("result-status-banner"),
    personalMessageCard: document.getElementById("personal-message-card"),
    statTotalScore: document.getElementById("stat-total-score"),
    statTotalHits: document.getElementById("stat-total-hits"),
    statSignsScore: document.getElementById("stat-signs-score"),
    resultDiagnosis: document.getElementById("result-diagnosis"),
    mistakesSection: document.getElementById("mistakes-section"),
    mistakesList: document.getElementById("mistakes-list"),
    btnRepeatTest: document.getElementById("btn-repeat-test"),
    btnReturnHome: document.getElementById("btn-return-home")
  };

  // Inicialización
  init();

  function init() {
    elements.inputUserName.value = state.userName;
    renderHistory();
    setupEventListeners();
  }

  function setupEventListeners() {
    // Guardar nombre
    elements.btnSaveName.addEventListener("click", () => {
      saveUserName();
    });

    elements.inputUserName.addEventListener("change", () => {
      saveUserName();
    });

    // Iniciar examen
    elements.btnStartExam.addEventListener("click", async () => {
      saveUserName();
      await loadQuestionsAndStart();
    });

    // Navegación
    elements.btnPrevQuestion.addEventListener("click", () => {
      if (state.currentIndex > 0) {
        state.currentIndex--;
        renderCurrentQuestion();
      }
    });

    elements.btnNextQuestion.addEventListener("click", () => {
      if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex++;
        renderCurrentQuestion();
      } else {
        // En la última pregunta, finalizar
        confirmAndFinishExam();
      }
    });

    // Botones de resultados
    elements.btnRepeatTest.addEventListener("click", () => {
      restartExam();
    });

    elements.btnReturnHome.addEventListener("click", () => {
      switchScreen("welcome");
      renderHistory();
    });
  }

  function saveUserName() {
    const val = elements.inputUserName.value.trim() || "Naty";
    state.userName = val;
    localStorage.setItem("nys_dmv_user_name", val);
  }

  function switchScreen(screenName) {
    Object.keys(screens).forEach(key => {
      screens[key].style.display = key === screenName ? "block" : "none";
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Carga de preguntas desde API o fallback local
  async function loadQuestionsAndStart() {
    try {
      const response = await fetch("/api/preguntas");
      const data = await response.json();
      state.questions = data.preguntas;
    } catch (err) {
      console.warn("No se pudo cargar desde /api/preguntas, buscando archivo local:", err);
      try {
        const localResp = await fetch("/preguntas_dmv_ny.json");
        state.questions = await localResp.json();
      } catch (e) {
        alert("Error al cargar el banco de preguntas. Por favor recarga la página.");
        return;
      }
    }

    state.currentIndex = 0;
    state.userAnswers = {};
    elements.examUserBadge.innerHTML = `<i class="fa-solid fa-user-check"></i> ${state.userName}`;
    
    buildQuickNavPills();
    switchScreen("exam");
    renderCurrentQuestion();
  }

  function buildQuickNavPills() {
    elements.quickNavPills.innerHTML = "";
    state.questions.forEach((q, idx) => {
      const pill = document.createElement("button");
      pill.className = "nav-pill";
      pill.textContent = idx + 1;
      pill.title = `Ir a pregunta ${idx + 1}`;
      pill.addEventListener("click", () => {
        state.currentIndex = idx;
        renderCurrentQuestion();
      });
      elements.quickNavPills.appendChild(pill);
    });
  }

  function updateQuickNavPills() {
    const pills = elements.quickNavPills.querySelectorAll(".nav-pill");
    pills.forEach((pill, idx) => {
      const q = state.questions[idx];
      const isAnswered = state.userAnswers[q.id] !== undefined;
      const isCurrent = state.currentIndex === idx;

      pill.classList.toggle("current", isCurrent);
      pill.classList.toggle("answered", isAnswered);
    });
  }

  function renderCurrentQuestion() {
    const q = state.questions[state.currentIndex];
    const total = state.questions.length;
    const progress = Math.round(((state.currentIndex + 1) / total) * 100);

    // Barra de progreso y metadatos
    elements.questionCounter.textContent = `Pregunta ${state.currentIndex + 1} de ${total}`;
    elements.progressPercent.textContent = `${progress}%`;
    elements.progressBarFill.style.width = `${progress}%`;

    // Categoría
    if (q.is_sign_question) {
      elements.categoryBadge.className = "badge-category sign";
      elements.categoryBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Señal de Tránsito (Regla Obligatoria)`;
    } else {
      elements.categoryBadge.className = "badge-category rule";
      elements.categoryBadge.innerHTML = `<i class="fa-solid fa-car-side"></i> Regla de Conducción`;
    }

    // Texto de la pregunta
    elements.questionText.textContent = q.question;

    // Renderizar opciones
    elements.optionsContainer.innerHTML = "";
    const letters = ["A", "B", "C", "D"];
    const currentSelected = state.userAnswers[q.id];

    q.options.forEach((optText, optIdx) => {
      const card = document.createElement("div");
      card.className = "option-card" + (currentSelected === optIdx ? " selected" : "");
      
      card.innerHTML = `
        <div class="option-letter">${letters[optIdx]}</div>
        <div class="option-text">${optText}</div>
      `;

      card.addEventListener("click", () => {
        state.userAnswers[q.id] = optIdx;
        renderCurrentQuestion();
        updateQuickNavPills();
      });

      elements.optionsContainer.appendChild(card);
    });

    // Botones de navegación
    elements.btnPrevQuestion.disabled = state.currentIndex === 0;

    if (state.currentIndex === total - 1) {
      elements.btnNextQuestion.innerHTML = `<span>Finalizar Examen</span> <i class="fa-solid fa-flag-checkered"></i>`;
    } else {
      elements.btnNextQuestion.innerHTML = `<span>Siguiente</span> <i class="fa-solid fa-arrow-right"></i>`;
    }

    updateQuickNavPills();
  }

  function confirmAndFinishExam() {
    const total = state.questions.length;
    const answeredCount = Object.keys(state.userAnswers).length;

    if (answeredCount < total) {
      const confirmEnd = confirm(
        `Has respondido ${answeredCount} de ${total} preguntas. ¿Seguro que deseas calificar y finalizar el examen ahora?`
      );
      if (!confirmEnd) return;
    }

    calculateAndShowResults();
  }

  async function calculateAndShowResults() {
    let resultData = null;

    // Intentar evaluar en el backend para máxima precisión oficial
    try {
      const resp = await fetch("/api/evaluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: state.userName,
          respuestas: state.userAnswers
        })
      });
      resultData = await resp.json();
    } catch (e) {
      // Fallback de cálculo idéntico en cliente si se corre de forma estática
      resultData = clientSideEvaluate();
    }

    // Guardar en el historial de localStorage
    saveAttemptHistory(resultData);

    // Renderizar resultados en pantalla
    displayResultsScreen(resultData);
  }

  function clientSideEvaluate() {
    let totalAciertos = 0;
    let senalesAciertos = 0;
    let totalSenales = 0;
    const errores = [];

    state.questions.forEach(q => {
      if (q.is_sign_question) totalSenales++;
      const userChoice = state.userAnswers[q.id];

      if (userChoice !== undefined && userChoice === q.correct_answer_index) {
        totalAciertos++;
        if (q.is_sign_question) senalesAciertos++;
      } else {
        errores.append({
          id: q.id,
          question: q.question,
          category: q.category,
          is_sign_question: q.is_sign_question,
          options: q.options,
          user_answer_index: userChoice,
          user_answer_text: userChoice !== undefined ? q.options[userChoice] : "No respondida",
          correct_answer_index: q.correct_answer_index,
          correct_answer_text: q.options[q.correct_answer_index],
          explanation: q.explanation
        });
      }
    });

    const total = state.questions.length;
    const porcentaje = Math.round((totalAciertos / total) * 100);
    const cumpleTotal = totalAciertos >= 14;
    const cumpleSenales = senalesAciertos >= 2;
    const aprobado = cumpleTotal and cumpleSenales;

    return {
      candidato: state.userName,
      aprobado: aprobado,
      total_preguntas: total,
      total_aciertos: totalAciertos,
      porcentaje_obtenido: porcentaje,
      porcentaje_minimo_requerido: 70.0,
      aciertos_minimos_requeridos: 14,
      total_senales: totalSenales,
      aciertos_senales: senalesAciertos,
      senales_minimas_requeridas: 2,
      cumple_total: cumpleTotal,
      cumple_senales: cumpleSenales,
      motivo_fallo: !aprobado ? (!cumpleSenales ? "Reprobaste por la regla crítica de señales de tránsito." : "No alcanzaste los 14 aciertos mínimos.") : "",
      errores: errores
    };
  }

  function displayResultsScreen(res) {
    switchScreen("results");

    // Banner de Estado
    if (res.aprobado) {
      elements.resultStatusBanner.className = "result-banner pass";
      elements.resultStatusBanner.innerHTML = `
        <div class="banner-badge">
          <i class="fa-solid fa-circle-check"></i> ¡APROBADO!
        </div>
      `;

      // Tarjeta personalizada para Naty (Amor y Orgullo)
      elements.personalMessageCard.className = "personal-card pass";
      elements.personalMessageCard.innerHTML = `
        <h3><i class="fa-solid fa-heart"></i> Mensaje Especial Para Ti</h3>
        <p class="personal-quote">
          "Naty eres el amor de mi vida y la mejor del mundo mundial. Estoy orgulloso de ti, sigue adelante"
        </p>
      `;

      // Lanzar confeti de celebración
      launchConfetti();

      elements.resultDiagnosis.className = "diagnosis-alert pass";
      elements.resultDiagnosis.innerHTML = `
        <i class="fa-solid fa-circle-check fa-lg"></i>
        <span><strong>¡Cumpliste ambos requisitos del Estado de Nueva York!</strong> Superaste el 70% global y acertaste al menos 2 de las 4 preguntas de señales.</span>
      `;
    } else {
      elements.resultStatusBanner.className = "result-banner fail";
      elements.resultStatusBanner.innerHTML = `
        <div class="banner-badge">
          <i class="fa-solid fa-circle-xmark"></i> REPROBADO
        </div>
      `;

      // Tarjeta personalizada de ánimo
      elements.personalMessageCard.className = "personal-card fail";
      elements.personalMessageCard.innerHTML = `
        <h3><i class="fa-solid fa-hand-holding-heart"></i> ¡No te desanimes!</h3>
        <p class="personal-quote">
          "¡No te rindas mi amor, cada error es un paso más para aprender! Tú puedes con esto."
        </p>
      `;

      elements.resultDiagnosis.className = "diagnosis-alert fail";
      elements.resultDiagnosis.innerHTML = `
        <i class="fa-solid fa-circle-exclamation fa-lg"></i>
        <span>${res.motivo_fallo || "No se cumplieron los criterios de aprobación del NYS DMV."}</span>
      `;
    }

    // Métricas en cajas
    elements.statTotalScore.textContent = `${res.porcentaje_obtenido}%`;
    elements.statTotalHits.textContent = `${res.total_aciertos} de ${res.total_preguntas} aciertos`;
    elements.statSignsScore.textContent = `${res.aciertos_senales} / ${res.total_senales}`;

    // REPORTE PEDAGÓGICO: Mostrar SOLO las preguntas falladas
    renderMistakesReport(res.errores);
  }

  function renderMistakesReport(errores) {
    elements.mistakesList.innerHTML = "";

    if (!errores || errores.length === 0) {
      elements.mistakesSection.style.display = "none";
      return;
    }

    elements.mistakesSection.style.display = "block";
    const letters = ["A", "B", "C", "D"];

    errores.forEach((err, idx) => {
      const card = document.createElement("div");
      card.className = "mistake-card" + (err.is_sign_question ? " sign-mistake" : "");

      const userLetter = err.user_answer_index !== null && err.user_answer_index !== undefined ? letters[err.user_answer_index] : "-";
      const correctLetter = letters[err.correct_answer_index];
      const tagText = err.is_sign_question ? "Señal de Tránsito (Obligatoria)" : "Norma Vial";

      card.innerHTML = `
        <div class="mistake-top">
          <span class="mistake-number">Fallo #${idx + 1}</span>
          <span class="badge-category ${err.is_sign_question ? 'sign' : 'rule'}">${tagText}</span>
        </div>
        <h4 class="mistake-question">${err.question}</h4>

        <div class="mistake-answers">
          <div class="ans-row wrong">
            <span class="ans-icon"><i class="fa-solid fa-xmark"></i></span>
            <span><strong>Tu respuesta:</strong> (${userLetter}) ${err.user_answer_text}</span>
          </div>
          <div class="ans-row correct">
            <span class="ans-icon"><i class="fa-solid fa-check"></i></span>
            <span><strong>Respuesta correcta oficial:</strong> (${correctLetter}) ${err.correct_answer_text}</span>
          </div>
        </div>

        <div class="mistake-explanation">
          <strong><i class="fa-solid fa-circle-info"></i> Explicación Oficial del NYS DMV:</strong>
          ${err.explanation}
        </div>
      `;

      elements.mistakesList.appendChild(card);
    });
  }

  function restartExam() {
    state.currentIndex = 0;
    state.userAnswers = {};
    buildQuickNavPills();
    switchScreen("exam");
    renderCurrentQuestion();
  }

  function saveAttemptHistory(res) {
    const attempt = {
      date: new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      score: res.porcentaje_obtenido,
      hits: res.total_aciertos,
      signs: res.aciertos_senales,
      passed: res.aprobado
    };

    state.examHistory.unshift(attempt);
    if (state.examHistory.length > 5) state.examHistory.pop(); // Guardar últimos 5
    localStorage.setItem("nys_dmv_history", JSON.stringify(state.examHistory));
  }

  function renderHistory() {
    if (!state.examHistory || state.examHistory.length === 0) {
      elements.historyContainer.style.display = "none";
      return;
    }

    elements.historyContainer.style.display = "block";
    elements.historyList.innerHTML = "";

    state.examHistory.forEach(item => {
      const div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML = `
        <span><i class="fa-regular fa-calendar"></i> ${item.date}</span>
        <span><strong>${item.hits}/20</strong> (${item.score}%) - Señales: ${item.signs}/4</span>
        <span class="${item.passed ? 'history-status-pass' : 'history-status-fail'}">
          ${item.passed ? 'APROBADO' : 'REPROBADO'}
        </span>
      `;
      elements.historyList.appendChild(div);
    });
  }

  function launchConfetti() {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    }
  }
});

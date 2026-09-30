/**
 * Simulador Oficial NYS DMV - Lógica del Cliente Web (Edición Avanzada 50 Preguntas)
 * Manejo de estado, carrusel responsivo de navegación, modal de mapa de preguntas,
 * persistencia en localStorage y evaluación oficial dual.
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

    // Examen en vivo
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
    btnScrollPillsLeft: document.getElementById("btn-scroll-pills-left"),
    btnScrollPillsRight: document.getElementById("btn-scroll-pills-right"),
    btnToggleMap: document.getElementById("btn-toggle-map"),
    btnOpenMapMobile: document.getElementById("btn-open-map-mobile"),
    mapAnsweredCounter: document.getElementById("map-answered-counter"),

    // Modal de Mapa de Preguntas
    modalQuestionsMap: document.getElementById("modal-questions-map"),
    btnCloseMapModal: document.getElementById("btn-close-map-modal"),
    mapGridContainer: document.getElementById("map-grid-container"),
    mapSummaryText: document.getElementById("map-summary-text"),

    // Resultados
    resultStatusBanner: document.getElementById("result-status-banner"),
    personalMessageCard: document.getElementById("personal-message-card"),
    statTotalScore: document.getElementById("stat-total-score"),
    statTotalHits: document.getElementById("stat-total-hits"),
    statRequiredHits: document.getElementById("stat-required-hits"),
    statSignsScore: document.getElementById("stat-signs-score"),
    statSignsSub: document.getElementById("stat-signs-sub"),
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

    // Navegación secuencial
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
        // En la última pregunta, confirmar y finalizar
        confirmAndFinishExam();
      }
    });

    // Flechas de desplazamiento del carrusel de píldoras
    if (elements.btnScrollPillsLeft) {
      elements.btnScrollPillsLeft.addEventListener("click", () => {
        elements.quickNavPills.scrollBy({ left: -160, behavior: "smooth" });
      });
    }

    if (elements.btnScrollPillsRight) {
      elements.btnScrollPillsRight.addEventListener("click", () => {
        elements.quickNavPills.scrollBy({ left: 160, behavior: "smooth" });
      });
    }

    // Modal de Mapa de Preguntas
    if (elements.btnToggleMap) {
      elements.btnToggleMap.addEventListener("click", openMapModal);
    }
    if (elements.btnOpenMapMobile) {
      elements.btnOpenMapMobile.addEventListener("click", openMapModal);
    }
    if (elements.btnCloseMapModal) {
      elements.btnCloseMapModal.addEventListener("click", closeMapModal);
    }
    if (elements.modalQuestionsMap) {
      elements.modalQuestionsMap.addEventListener("click", (e) => {
        if (e.target === elements.modalQuestionsMap) {
          closeMapModal();
        }
      });
    }

    // Tecla Escape para cerrar modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && elements.modalQuestionsMap && elements.modalQuestionsMap.style.display !== "none") {
        closeMapModal();
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
    buildMapGrid();
    switchScreen("exam");
    renderCurrentQuestion();
  }

  // Construir las píldoras horizontales (carrusel)
  function buildQuickNavPills() {
    elements.quickNavPills.innerHTML = "";
    state.questions.forEach((q, idx) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "nav-pill" + (q.is_sign_question ? " sign-pill" : "");
      pill.setAttribute("data-idx", idx);
      pill.textContent = idx + 1;
      pill.title = `Pregunta ${idx + 1}${q.is_sign_question ? " (Señal obligatoria)" : ""}`;
      
      pill.addEventListener("click", () => {
        state.currentIndex = idx;
        renderCurrentQuestion();
      });

      elements.quickNavPills.appendChild(pill);
    });
  }

  // Construir la cuadrícula del modal de mapa completo
  function buildMapGrid() {
    if (!elements.mapGridContainer) return;
    elements.mapGridContainer.innerHTML = "";

    state.questions.forEach((q, idx) => {
      const badge = document.createElement("div");
      badge.className = "map-item-badge" + (q.is_sign_question ? " is-sign" : "");
      badge.setAttribute("data-map-idx", idx);
      badge.textContent = idx + 1;
      badge.title = `Pregunta ${idx + 1}: ${q.question.substring(0, 50)}...`;

      badge.addEventListener("click", () => {
        state.currentIndex = idx;
        renderCurrentQuestion();
        closeMapModal();
      });

      elements.mapGridContainer.appendChild(badge);
    });
  }

  function openMapModal() {
    updateMapGridStatus();
    if (elements.modalQuestionsMap) {
      elements.modalQuestionsMap.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  }

  function closeMapModal() {
    if (elements.modalQuestionsMap) {
      elements.modalQuestionsMap.style.display = "none";
      document.body.style.overflow = "";
    }
  }

  // Actualizar estados visuales de las píldoras y el mapa
  function updateQuickNavPills() {
    const total = state.questions.length;
    const answeredCount = Object.keys(state.userAnswers).length;

    // Actualizar píldoras horizontales
    const pills = elements.quickNavPills.querySelectorAll(".nav-pill");
    pills.forEach((pill, idx) => {
      const q = state.questions[idx];
      const isAnswered = state.userAnswers[q.id] !== undefined;
      const isCurrent = state.currentIndex === idx;

      pill.classList.toggle("current", isCurrent);
      pill.classList.toggle("answered", isAnswered);
    });

    // Auto-scroll para centrar la píldora actual en la pantalla móvil y desktop
    const activePill = elements.quickNavPills.querySelector(`.nav-pill[data-idx="${state.currentIndex}"]`);
    if (activePill) {
      activePill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    // Actualizar contadores del mapa
    if (elements.mapAnsweredCounter) {
      elements.mapAnsweredCounter.textContent = `${answeredCount}/${total}`;
    }
    if (elements.mapSummaryText) {
      elements.mapSummaryText.textContent = `${answeredCount} de ${total} preguntas respondidas (${total - answeredCount} pendientes)`;
    }

    // Actualizar cuadrícula del modal si está abierta
    updateMapGridStatus();
  }

  function updateMapGridStatus() {
    if (!elements.mapGridContainer) return;
    const badges = elements.mapGridContainer.querySelectorAll(".map-item-badge");
    badges.forEach((badge, idx) => {
      const q = state.questions[idx];
      const isAnswered = state.userAnswers[q.id] !== undefined;
      const isCurrent = state.currentIndex === idx;

      badge.classList.toggle("current", isCurrent);
      badge.classList.toggle("answered", isAnswered);
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
      elements.categoryBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Señal de Tránsito Crítica (Evaluación Especial)`;
    } else {
      elements.categoryBadge.className = "badge-category rule";
      elements.categoryBadge.innerHTML = `<i class="fa-solid fa-car-side"></i> Conducción Defensiva & Leyes Viales`;
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
      const pendingCount = total - answeredCount;
      const confirmEnd = confirm(
        `Has respondido ${answeredCount} de ${total} preguntas (te faltan ${pendingCount} por responder).\n\n¿Deseas calificar y finalizar el examen ahora?`
      );
      if (!confirmEnd) {
        // Abrir el mapa para que vea cuáles le faltan
        openMapModal();
        return;
      }
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
      // Fallback de cálculo en cliente si se corre de forma estática
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
        errores.push({
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
    const minimoAciertos = Math.round(total * 0.70); // 35 de 50
    const minimoSenales = totalSenales > 0 ? Math.max(2, Math.round(totalSenales * 0.70)) : 0; // 7 de 10
    
    const cumpleTotal = totalAciertos >= minimoAciertos;
    const cumpleSenales = senalesAciertos >= minimoSenales;
    const aprobado = cumpleTotal && cumpleSenales;

    let motivoFallo = "";
    if (!aprobado) {
      if (!cumpleTotal && !cumpleSenales) {
        motivoFallo = `No se alcanzó el puntaje global mínimo (${totalAciertos}/${minimoAciertos}) ni el mínimo en señales de tránsito (${senalesAciertos}/${minimoSenales}).`;
      } else if (!cumpleTotal) {
        motivoFallo = `Se obtuvieron ${totalAciertos} aciertos de ${total} (Mínimo requerido: ${minimoAciertos} aciertos - 70%).`;
      } else if (!cumpleSenales) {
        motivoFallo = `Regla crítica de señales: Obtuviste ${senalesAciertos} aciertos de ${totalSenales} en señales (Mínimo requerido: ${minimoSenales} aciertos).`;
      }
    }

    return {
      candidato: state.userName,
      aprobado: aprobado,
      total_preguntas: total,
      total_aciertos: totalAciertos,
      porcentaje_obtenido: porcentaje,
      porcentaje_minimo_requerido: 70.0,
      aciertos_minimos_requeridos: minimoAciertos,
      total_senales: totalSenales,
      aciertos_senales: senalesAciertos,
      senales_minimas_requeridas: minimoSenales,
      cumple_total: cumpleTotal,
      cumple_senales: cumpleSenales,
      motivo_fallo: motivoFallo,
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
          <i class="fa-solid fa-circle-check"></i> ¡APROBADO CON EXCELENCIA!
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
        <span><strong>¡Superaste la prueba avanzada de 50 preguntas de NY!</strong> Lograste ${res.total_aciertos} aciertos generales (mínimo ${res.aciertos_minimos_requeridos || 35}) y dominaste las señales viales obligatorias (${res.aciertos_senales}/${res.total_senales}).</span>
      `;
    } else {
      elements.resultStatusBanner.className = "result-banner fail";
      elements.resultStatusBanner.innerHTML = `
        <div class="banner-badge">
          <i class="fa-solid fa-circle-xmark"></i> NO APROBADO EN ESTE INTENTO
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
        <span>${res.motivo_fallo || "No se cumplieron todos los criterios oficiales de aprobación del NYS DMV."}</span>
      `;
    }

    // Métricas en cajas
    elements.statTotalScore.textContent = `${res.porcentaje_obtenido}%`;
    elements.statTotalHits.textContent = `${res.total_aciertos} de ${res.total_preguntas} aciertos`;
    elements.statSignsScore.textContent = `${res.aciertos_senales} / ${res.total_senales}`;

    if (elements.statRequiredHits) {
      elements.statRequiredHits.textContent = `${res.aciertos_minimos_requeridos || 35} aciertos mínimos requeridos (70%)`;
    }
    if (elements.statSignsSub) {
      elements.statSignsSub.textContent = `Mínimo obligatorio: ${res.senales_minimas_requeridas || 7} aciertos`;
    }

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
      const tagText = err.is_sign_question ? "Señal Crítica de Tránsito" : "Conducción Defensiva & Leyes";

      card.innerHTML = `
        <div class="mistake-top">
          <span class="mistake-number">Fallo #${idx + 1} de ${errores.length}</span>
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
          <strong><i class="fa-solid fa-circle-info"></i> Explicación Oficial del Manual NYS DMV:</strong>
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
    buildMapGrid();
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
      total: res.total_preguntas,
      signs: res.aciertos_senales,
      totalSigns: res.total_senales,
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
      const totalQ = item.total || 50;
      const totalS = item.totalSigns || 10;
      div.innerHTML = `
        <span><i class="fa-regular fa-calendar"></i> ${item.date}</span>
        <span><strong>${item.hits}/${totalQ}</strong> (${item.score}%) - Señales: ${item.signs}/${totalS}</span>
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

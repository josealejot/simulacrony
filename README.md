# 🚗 Simulador Oficial del Examen de Conducción NYS DMV (Nueva York)

Aplicación web interactiva en Python y JavaScript diseñada para preparar a candidatos hispanohablantes para el examen oficial del permiso de conducir del Estado de Nueva York (*NYS Learner Permit Test*).

---

## 🌟 Características Principales

1. **50 Preguntas Oficiales Avanzadas en Español:**
   - Nivel de dificultad avanzado que requiere lógica, juicio situacional y conocimiento exhaustivo del *Manual del Conductor de NY*.
   - Incluye 10 preguntas críticas de señales, dilemas de intersección (4-Way Stop, rotondas, buses escolares con mediana), física de frenado (ABS, hidroplaneo a 50 mph, reventón a 65 mph, hielo negro en puentes), leyes Move Over, Leandra's Law y consecuencias administrativas de Implied Consent y Zero Tolerance.
2. **Navegación Móvil Moderna y Fluida:**
   - Carrusel horizontal interactivo de píldoras con auto-centrado suave para evitar acumulaciones verticales en pantallas de teléfonos.
   - Acceso con un toque a un **Mapa Modal de 50 preguntas** con código de colores (Respondidas, Actual, Pendientes y Señales Críticas).
   - Botones de acción táctiles cómodos y optimizados para pulgares.
3. **Evaluación Dual Rigurosa (Reglas Oficiales del NYS DMV):**
   - **Criterio Global:** Mínimo **70%** (al menos 35 de 50 preguntas acertadas).
   - **Regla Crítica de Señales:** Mínimo **70% de aciertos en señales** (al menos 7 de 10 acertadas).
4. **Persistencia en Memoria Local (`localStorage`):**
   - Guarda el nombre del usuario y el historial de intentos anteriores con fecha, aciertos y puntaje.
5. **Mensajes Personalizados y Motivacionales:**
   - **Si Aprueba:** Mensaje destacado con animación de confeti:  
     `"Naty eres el amor de mi vida y la mejor del mundo mundial. Estoy orgulloso de ti, sigue adelante"`
   - **Si Reprueba:** Mensaje de aliento:  
     `"¡No te rindas mi amor, cada error es un paso más para aprender! Tú puedes con esto."` con botón directo para **Repetir prueba**.
6. **Retroalimentación Pedagógica Oficial:**
   - Al finalizar, despliega **únicamente las preguntas erróneas**, mostrando la respuesta dada por el usuario, la respuesta correcta oficial y la explicación extraída del *Manual del Conductor de NY*.

---

## 📁 Estructura del Proyecto

```text
├── app.py                 # Servidor Flask con endpoints de API y calificación dinámica
├── simulador_dmv.py       # Versión de consola en Python para pruebas locales (50 preguntas)
├── preguntas_dmv_ny.json  # Banco de 50 preguntas oficiales avanzadas en español
├── requirements.txt       # Dependencias (Flask, gunicorn)
├── Procfile               # Comando de ejecución en Render.com
├── render.yaml            # Configuración de despliegue automático
├── templates/
│   └── index.html         # Interfaz web responsiva y semántica
├── static/
│   ├── css/
│   │   └── style.css      # Estilos modernos con glassmorphism
│   └── js/
│       └── app.js         # Lógica cliente, navegación y localStorage
└── README.md              # Documentación del proyecto
```

---

## 💻 1. Ejecución Local en tu Computadora

1. Abre una terminal (PowerShell o CMD) en esta carpeta:
   ```bash
   pip install -r requirements.txt
   ```
2. Inicia la aplicación web:
   ```bash
   python app.py
   ```
3. Abre tu navegador web en:
   ```text
   http://127.0.0.1:5000
   ```

*(Opcional: Si quieres probar la versión por consola terminal, ejecuta `python simulador_dmv.py`).*

---

## 🚀 2. Cómo Subir este Proyecto a GitHub

1. En la carpeta del proyecto, inicializa Git y haz tu primer commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Simulador NYS DMV Web App para Naty"
   ```
2. Crea un repositorio nuevo en tu cuenta de [GitHub](https://github.com/new) (por ejemplo, con el nombre `simulador-dmv-ny`).
3. Conecta y sube el código a GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/simulador-dmv-ny.git
   git push -u origin main
   ```

---

## 🌐 3. Despliegue Gratis en Render.com

1. Regístrate o inicia sesión en [Render.com](https://render.com).
2. Haz clic en **"New +"** y selecciona **"Web Service"**.
3. Conecta tu cuenta de GitHub y elige tu repositorio (`simulador-dmv-ny`).
4. Configura los siguientes campos:
   - **Name:** `simulador-dmv-ny` (o el nombre que prefieras).
   - **Region:** Ohio (US East) o Frankfurt.
   - **Branch:** `main`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Instance Type:** `Free`
5. Haz clic en **"Create Web Service"**.
6. En 1-2 minutos, Render generará tu enlace público (ej. `https://simulador-dmv-ny.onrender.com`). ¡Podrás abrirlo desde cualquier celular, tablet o computadora!

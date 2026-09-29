# 🚗 Simulador Oficial del Examen de Conducción NYS DMV (Nueva York)

Aplicación web interactiva en Python y JavaScript diseñada para preparar a candidatos hispanohablantes para el examen oficial del permiso de conducir del Estado de Nueva York (*NYS Learner Permit Test*).

---

## 🌟 Características Principales

1. **20 Preguntas Oficiales en Español:**
   - Proporción idéntica a la prueba real del NY DMV: 4 de señales de tránsito, 4 de alcohol y drogas, 5 de derecho de paso y 7 de normas de circulación.
2. **Evaluación Dual Rigurosa (Reglas Oficiales del NYS DMV):**
   - **Criterio Global:** Mínimo **70%** (al menos 14 de 20 preguntas acertadas).
   - **Regla Crítica de Señales:** Mínimo **2 de las 4 preguntas de señales** obligatoriamente acertadas (descalificación inmediata si no se cumple, aún teniendo más de 14 aciertos totales).
3. **Persistencia en Memoria Local (`localStorage`):**
   - Guarda el nombre del usuario y el historial de intentos anteriores con fecha, aciertos y puntaje.
4. **Mensajes Personalizados y Motivacionales:**
   - **Si Aprueba:** Mensaje destacado con animación de confeti:  
     `"Naty eres el amor de mi vida y la mejor del mundo mundial. Estoy orgulloso de ti, sigue adelante"`
   - **Si Reprueba:** Mensaje de aliento:  
     `"¡No te rindas mi amor, cada error es un paso más para aprender! Tú puedes con esto."` con botón directo para **Repetir prueba**.
5. **Retroalimentación Pedagógica Oficial:**
   - Al finalizar, despliega **únicamente las preguntas erróneas**, mostrando la respuesta dada por el usuario, la respuesta correcta oficial y la explicación extraída del *Manual del Conductor de NY*.

---

## 📁 Estructura del Proyecto

```text
├── app.py                 # Servidor Flask con endpoints de API y calificación
├── simulador_dmv.py       # Versión de consola en Python para pruebas locales
├── preguntas_dmv_ny.json  # Banco de 20 preguntas oficiales en español
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

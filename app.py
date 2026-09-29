#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor Flask para el Simulador Web del Examen Teórico del NYS DMV
Listo para despliegue en GitHub y Render.com
"""

import os
import json
from flask import Flask, render_template, jsonify, request, send_from_directory

app = Flask(__name__, static_folder="static", template_folder="templates")

# Cargar banco de preguntas oficial en español
def obtener_preguntas():
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preguntas_dmv_ny.json")
    with open(ruta, "r", encoding="utf-8") as f:
        return json.load(f)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/preguntas", methods=["GET"])
def api_preguntas():
    """Retorna las preguntas para el examen (sin exponer indebidamente la respuesta correcta si se desea, o completas)."""
    preguntas = obtener_preguntas()
    # Enviamos la lista de preguntas
    return jsonify({
        "status": "success",
        "total": len(preguntas),
        "preguntas": preguntas
    })

@app.route("/api/evaluar", methods=["POST"])
def api_evaluar():
    """
    Evalúa las respuestas del candidato aplicando rigurosamente:
    1. Calificación global: mínimo 14 de 20 (70%)
    2. Regla crítica de señales: mínimo 2 de 4 en preguntas de señales
    """
    datos = request.get_json() or {}
    respuestas_candidato = datos.get("respuestas", {})  # Diccionario {id_pregunta: opcion_idx}
    nombre_candidato = datos.get("nombre", "Naty").strip() or "Naty"

    preguntas = obtener_preguntas()
    mapa_preguntas = {str(p["id"]): p for p in preguntas}

    total_preguntas = len(preguntas)
    total_aciertos = 0
    total_senales = 0
    aciertos_senales = 0
    errores = []

    for p in preguntas:
        p_id = str(p["id"])
        es_senal = p.get("is_sign_question", False)
        if es_senal:
            total_senales += 1

        opcion_elegida = respuestas_candidato.get(p_id)
        es_correcta = False

        if opcion_elegida is not None and int(opcion_elegida) == p["correct_answer_index"]:
            es_correcta = True
            total_aciertos += 1
            if es_senal:
                aciertos_senales += 1
        else:
            # Registrar detalle del error
            idx_elegido = int(opcion_elegida) if opcion_elegida is not None else None
            texto_elegido = p["options"][idx_elegido] if (idx_elegido is not None and 0 <= idx_elegido < len(p["options"])) else "No respondida"

            errores.append({
                "id": p["id"],
                "question": p["question"],
                "category": p.get("category", ""),
                "is_sign_question": es_senal,
                "options": p["options"],
                "user_answer_index": idx_elegido,
                "user_answer_text": texto_elegido,
                "correct_answer_index": p["correct_answer_index"],
                "correct_answer_text": p["options"][p["correct_answer_index"]],
                "explanation": p["explanation"]
            })

    porcentaje_obtenido = round((total_aciertos / total_preguntas) * 100, 1) if total_preguntas > 0 else 0
    
    cumple_total = total_aciertos >= 14
    cumple_senales = aciertos_senales >= 2 if total_senales >= 4 else True
    aprobado = cumple_total and cumple_senales

    mensaje_aprobado = "Naty eres el amor de mi vida y la mejor del mundo mundial. Estoy orgulloso de ti, sigue adelante"
    mensaje_reprobado = "¡No te rindas mi amor, cada error es un paso más para aprender! Tú puedes con esto."

    # Motivo en caso de fallo
    motivo_fallo = ""
    if not aprobado:
        if not cumple_total and not cumple_senales:
            motivo_fallo = "No se alcanzó el puntaje global mínimo (14/20) ni el mínimo requerido en señales de tránsito (2/4)."
        elif not cumple_total:
            motivo_fallo = f"Se obtuvieron {total_aciertos} aciertos generales de 20 (Mínimo requerido: 14 aciertos)."
        elif not cumple_senales:
            motivo_fallo = f"Regla crítica de descalificación: Obtuviste {aciertos_senales} aciertos de 4 en señales de tránsito (Mínimo requerido: 2 aciertos)."

    return jsonify({
        "status": "success",
        "candidato": nombre_candidato,
        "aprobado": aprobado,
        "total_preguntas": total_preguntas,
        "total_aciertos": total_aciertos,
        "porcentaje_obtenido": porcentaje_obtenido,
        "porcentaje_minimo_requerido": 70.0,
        "aciertos_minimos_requeridos": 14,
        "total_senales": total_senales,
        "aciertos_senales": aciertos_senales,
        "senales_minimas_requeridas": 2,
        "cumple_total": cumple_total,
        "cumple_senales": cumple_senales,
        "motivo_fallo": motivo_fallo,
        "mensaje_personalizado": mensaje_aprobado if aprobado else mensaje_reprobado,
        "errores": errores
    })

if __name__ == "__main__":
    # Puerto dinámico asignado por Render o 5000 en local
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

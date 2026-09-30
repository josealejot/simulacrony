#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simulador Oficial del Examen Teórico de Conducción del NYS DMV
(Permiso de Aprendizaje de Nueva York - Learner Permit Test)
Adaptado 100% en español con reglas oficiales de calificación y retroalimentación pedagógica.
"""

import json
import os
import sys

# Colores ANSI para mejorar la legibilidad en terminal
class Color:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    VERDE = "\033[92m"
    ROJO = "\033[91m"
    AMARILLO = "\033[93m"
    AZUL = "\033[94m"
    CYAN = "\033[96m"
    MAGENTA = "\033[95m"

def limpiar_pantalla():
    os.system('cls' if os.name == 'nt' else 'clear')

def cargar_preguntas(ruta_json="preguntas_dmv_ny.json"):
    """Carga y valida el banco de preguntas en formato JSON."""
    if not os.path.exists(ruta_json):
        # Si se ejecuta desde otra ruta, buscar en el mismo directorio del script
        base_dir = os.path.dirname(os.path.abspath(__file__))
        ruta_json = os.path.join(base_dir, ruta_json)

    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            preguntas = json.load(f)
            return preguntas
    except Exception as e:
        print(f"{Color.ROJO}Error al cargar el archivo de preguntas: {e}{Color.RESET}")
        sys.exit(1)

def mostrar_encabezado():
    print(f"{Color.AZUL}{Color.BOLD}{'=' * 75}{Color.RESET}")
    print(f"{Color.CYAN}{Color.BOLD}   SIMULADOR OFICIAL DEL EXAMEN TEÓRICO DE MANEJO - NYS DMV (ESPAÑOL){Color.RESET}")
    print(f"{Color.CYAN}{Color.BOLD}                EDICIÓN AVANZADA Y SITUACIONAL (50 PREGUNTAS)         {Color.RESET}")
    print(f"{Color.AZUL}{Color.BOLD}{'=' * 75}{Color.RESET}")
    print(f"{Color.BOLD}Parámetros oficiales del Estado de Nueva York:{Color.RESET}")
    print(f"  • Total de preguntas: {Color.BOLD}50 preguntas avanzadas{Color.RESET}")
    print(f"  • Puntuación mínima global requerida: {Color.BOLD}70% (mínimo 35 aciertos de 50){Color.RESET}")
    print(f"  • Regla crítica de señales: {Color.BOLD}Mínimo 70% de aciertos en preguntas de señales{Color.RESET}")
    print(f"{Color.AZUL}{'=' * 75}{Color.RESET}\n")

def realizar_examen(preguntas):
    """Ejecuta la sesión interactiva del examen y recopila las respuestas."""
    respuestas_usuario = []
    
    total_preguntas = len(preguntas)
    
    for i, p in enumerate(preguntas, 1):
        limpiar_pantalla()
        mostrar_encabezado()
        
        tipo_seccion = f"{Color.AMARILLO}[SECCIÓN SEÑALES DE TRÁNSITO]{Color.RESET}" if p.get("is_sign_question") else f"{Color.CYAN}[REGLAS Y NORMAS VIALES]{Color.RESET}"
        
        print(f"Pregunta {Color.BOLD}{i} de {total_preguntas}{Color.RESET} {tipo_seccion}")
        print(f"{Color.BOLD}{p['question']}{Color.RESET}\n")
        
        letras = ["A", "B", "C", "D"]
        for idx, opcion in enumerate(p["options"]):
            letra = letras[idx]
            print(f"   {Color.BOLD}{idx + 1}){Color.RESET} ({letra}) {opcion}")
        
        # Validación de entrada
        eleccion_idx = None
        while eleccion_idx is None:
            entrada = input(f"\n{Color.BOLD}Seleccione su respuesta (1-4 o A-D): {Color.RESET}").strip().upper()
            if entrada in ["1", "2", "3", "4"]:
                eleccion_idx = int(entrada) - 1
            elif entrada in ["A", "B", "C", "D"]:
                eleccion_idx = letras.index(entrada)
            else:
                print(f"{Color.ROJO}Entrada no válida. Por favor ingrese 1, 2, 3, 4 o A, B, C, D.{Color.RESET}")
        
        es_correcta = (eleccion_idx == p["correct_answer_index"])
        
        respuestas_usuario.append({
            "pregunta_id": p["id"],
            "pregunta_texto": p["question"],
            "categoria": p.get("category", ""),
            "es_senal": p.get("is_sign_question", False),
            "opciones": p["options"],
            "respuesta_usuario_idx": eleccion_idx,
            "respuesta_correcta_idx": p["correct_answer_index"],
            "es_correcta": es_correcta,
            "explicacion": p["explanation"]
        })

    return respuestas_usuario

def evaluar_y_reportar(respuestas):
    """
    Evalúa según las 2 reglas oficiales del NYS DMV:
    1. Aciertos generales: >= 14/20 (70%)
    2. Aciertos de señales: >= 2/4 (50%)
    """
    limpiar_pantalla()
    
    total_preguntas = len(respuestas)
    total_aciertos = sum(1 for r in respuestas if r["es_correcta"])
    porcentaje_obtenido = (total_aciertos / total_preguntas) * 100 if total_preguntas > 0 else 0
    
    # Evaluación específica de señales
    preguntas_senales = [r for r in respuestas if r["es_senal"]]
    total_senales = len(preguntas_senales)
    aciertos_senales = sum(1 for r in preguntas_senales if r["es_correcta"])
    
    minimo_aciertos = int(round(total_preguntas * 0.70))
    minimo_senales = max(2, int(round(total_senales * 0.70))) if total_senales > 0 else 0
    
    cumple_total = total_aciertos >= minimo_aciertos
    cumple_senales = aciertos_senales >= minimo_senales
    
    aprobado = cumple_total and cumple_senales
    
    # ----------------- REPORTE DE RESULTADOS -----------------
    print(f"\n{Color.AZUL}{Color.BOLD}{'=' * 75}{Color.RESET}")
    print(f"{Color.CYAN}{Color.BOLD}           REPORTE FINAL DE RESULTADOS - NYS LEARNER PERMIT{Color.RESET}")
    print(f"{Color.AZUL}{Color.BOLD}{'=' * 75}{Color.RESET}\n")
    
    # A) Resultado definitivo y mensajes requeridos
    if aprobado:
        print(f"{Color.VERDE}{Color.BOLD}   ESTADO DEL EXAMEN: [ APROBADO ]{Color.RESET}\n")
        print(f"{Color.MAGENTA}{Color.BOLD}╔{'═' * 73}╗{Color.RESET}")
        print(f"{Color.MAGENTA}{Color.BOLD}║  Naty eres el amor de mi vida y la mejor del mundo mundial.           ║{Color.RESET}")
        print(f"{Color.MAGENTA}{Color.BOLD}║  Estoy orgulloso de ti, sigue adelante.                                ║{Color.RESET}")
        print(f"{Color.MAGENTA}{Color.BOLD}╚{'═' * 73}╝{Color.RESET}\n")
    else:
        print(f"{Color.ROJO}{Color.BOLD}   ESTADO DEL EXAMEN: [ REPROBADO ]{Color.RESET}\n")
        print(f"{Color.AMARILLO}{Color.BOLD}¡No te rindas mi amor, cada error es un paso más para aprender! Tú puedes con esto.{Color.RESET}\n")
        
        # Explicación de por qué no aprobó según las reglas
        if not cumple_total and not cumple_senales:
            print(f"{Color.ROJO}Motivo: No se alcanzó el puntaje mínimo general ({total_aciertos}/{minimo_aciertos}) ni el mínimo de señales ({aciertos_senales}/{minimo_senales}).{Color.RESET}")
        elif not cumple_total:
            print(f"{Color.ROJO}Motivo: Se obtuvieron {total_aciertos} aciertos generales de {total_preguntas} (mínimo requerido: {minimo_aciertos} - 70%).{Color.RESET}")
        elif not cumple_senales:
            print(f"{Color.ROJO}Motivo CRÍTICO: Aunque aprobó el total general, reprobó la sección de señales de tránsito con {aciertos_senales}/{total_senales} (mínimo requerido: {minimo_senales}).{Color.RESET}")
        print()

    # B y C) Porcentajes y comparativa oficial de NY
    print(f"{Color.BOLD}--- RESUMEN DE PUNTUACIÓN ---{Color.RESET}")
    print(f"• Aciertos totales obtenidos: {Color.BOLD}{total_aciertos} de {total_preguntas}{Color.RESET}")
    print(f"• Porcentaje total obtenido: {Color.BOLD}{porcentaje_obtenido:.1f}%{Color.RESET}")
    print(f"• Porcentaje mínimo requerido por el Estado de NY: {Color.BOLD}70.0% ({minimo_aciertos} de {total_preguntas} aciertos){Color.RESET}")
    print(f"• Sección de señales de tránsito: {Color.BOLD}{aciertos_senales} de {total_senales} acertadas{Color.RESET} (Mínimo obligatorio: {minimo_senales} aciertos)")
    print(f"{Color.AZUL}{'-' * 75}{Color.RESET}\n")

    # D) Resumen de preguntas incorrectas con pedagogía
    errores = [r for r in respuestas if not r["es_correcta"]]
    
    if errores:
        print(f"{Color.ROJO}{Color.BOLD}--- DETALLE PEDAGÓGICO DE RESPUESTAS INCORRECTAS ({len(errores)} fallos) ---{Color.RESET}")
        print(f"Repasa estas preguntas para dominar los conceptos antes de la prueba en la oficina del DMV:\n")
        
        for idx, error in enumerate(errores, 1):
            letras = ["A", "B", "C", "D"]
            user_opt_letter = letras[error["respuesta_usuario_idx"]]
            user_opt_text = error["opciones"][error["respuesta_usuario_idx"]]
            correct_opt_letter = letras[error["respuesta_correcta_idx"]]
            correct_opt_text = error["opciones"][error["respuesta_correcta_idx"]]
            
            tipo = "[SEÑAL DE TRÁNSITO]" if error["es_senal"] else "[NORMA VIAL]"
            
            print(f"{Color.BOLD}{idx}. {tipo} {error['pregunta_texto']}{Color.RESET}")
            print(f"   {Color.ROJO}✘ Su respuesta fue:{Color.RESET} ({user_opt_letter}) {user_opt_text}")
            print(f"   {Color.VERDE}✔ Respuesta correcta:{Color.RESET} ({correct_opt_letter}) {correct_opt_text}")
            print(f"   {Color.CYAN}📖 Explicación oficial NY DMV:{Color.RESET} {error['explicacion']}")
            print(f"{Color.AZUL}{'.' * 75}{Color.RESET}\n")
    else:
        print(f"{Color.VERDE}{Color.BOLD}¡Puntuación perfecta! No tuviste ningún fallo en este examen.{Color.RESET}\n")
        
    return aprobado

def iniciar_simulador():
    """Bucle principal de ejecución del simulador con opción de repetición."""
    preguntas = cargar_preguntas("preguntas_dmv_ny.json")
    
    while True:
        respuestas = realizar_examen(preguntas)
        aprobado = evaluar_y_reportar(respuestas)
        
        if not aprobado:
            print(f"\n{Color.BOLD}¿Deseas intentar nuevamente la prueba para afianzar tus conocimientos?{Color.RESET}")
            opcion = input(f"Escribe {Color.VERDE}{Color.BOLD}[1]{Color.RESET} o {Color.VERDE}{Color.BOLD}Repetir prueba{Color.RESET} para reiniciar (o Enter para salir): ").strip().lower()
            if opcion in ["1", "repetir prueba", "repetir", "si", "s", "r"]:
                continue
            else:
                print(f"\n{Color.CYAN}¡Mucho éxito en tu preparación! La constancia garantiza el éxito.{Color.RESET}")
                break
        else:
            opcion = input(f"\n{Color.BOLD}¿Deseas practicar el simulador una vez más? (s/n): {Color.RESET}").strip().lower()
            if opcion in ["s", "si", "sí", "repetir"]:
                continue
            else:
                print(f"\n{Color.MAGENTA}¡Felicidades nuevamente por este gran logro!{Color.RESET}")
                break

if __name__ == "__main__":
    iniciar_simulador()

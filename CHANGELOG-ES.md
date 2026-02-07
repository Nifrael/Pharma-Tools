# Registro de Cambios (Changelog)

Todos los cambios notables de este proyecto se documentarán en este archivo.

## [0.4.0] - 2026-02-07

### 🧠 Inteligencia Artificial y Pedagogía

- **Integración de Gemini 3**: Migración al nuevo SDK `google-genai` y uso del modelo `gemini-3-flash-preview`.
- **Explicaciones Contextuales**: La IA genera ahora una explicación divulgativa y tranquilizadora basada en el perfil del paciente y sus respuestas al cuestionario.
- **Ingeniería de Prompts**: Sistema de instrucciones estricto para evitar alucinaciones y adaptarse al perfil (edad, género, embarazo).

### 🏗️ Arquitectura Backend (Refactorización Modular)

- **Descomposición del Monolito**: Transformación del servicio de automedicación en un módulo estructurado (`backend/services/automedication/`):
  - `question_filters.py`: Lógica pura de filtrado (edad, género, vía).
  - `risk_calculator.py`: Calculadora de puntuación agnóstica.
  - `db_repository.py`: Capa de acceso a datos (DAO) aislada.
- **Código Limpio (Clean Code)**: Separación estricta de la lógica de negocio (funciones puras) y las entradas/salidas (IO).

### 🚢 DevOps y Despliegue en la Nube

- **Dockerización**: Creación de una imagen Docker optimizada para el backend con generación automática de la base SQLite durante la construcción (Build).
- **Estrategia Híbrida**:
  - Backend desplegado en **Render** (vía Docker).
  - Frontend desplegado en **Vercel** (optimización para Astro).
- **Configuración Dinámica**: Implementación de `PUBLIC_API_URL` para una comunicación fluida entre el front y el back.

### 🧪 Calidad y Fiabilidad

- **Refuerzo de Pruebas**: Incremento a **21 pruebas automatizadas**.
- **TDD de Legado**: Uso de pruebas de caracterización para asegurar la refactorización del código existente.
- **Validación de la API**: Pruebas de integración en los endpoints de FastAPI (Mocking de LLM y DB).

## [0.3.0] - 2026-02-01

### 🔄 PIVOTE MAYOR: Aseguramiento de la Automedicación

**Cambio de estrategia**: El proyecto abandona el objetivo inicial de análisis exhaustivo de interacciones medicamentosas (demasiado complejo y costoso obtener una base de datos certificada y actualizada) para centrarse en el **apoyo a la toma de decisiones para la automedicación**.
El objetivo es ahora asegurar la toma de medicamentos de acceso directo (OTC) a través de un cuestionario de salud dinámico.

### 🚀 Nuevas Funcionalidades

- **Puntuación de Riesgo de Automedicación**: Sistema inteligente que modela los riesgos (Embarazo, Problemas hepáticos, etc.) en forma de etiquetas y preguntas.
- **Cuestionario Dinámico**: El frontend genera las preguntas pertinentes en función del medicamento seleccionado.
- **Cálculo de Puntuación**: Algoritmo puro que determina un nivel de riesgo (VERDE, NARANJA, ROJO) basado en las respuestas del paciente.
- **Búsqueda Simplificada**: Motor de búsqueda centrado en medicamentos OTC y sustancias activas.

### 🏗️ Arquitectura y Técnica (Rediseño KISS)

- **Base de Datos Minimalista**:
  - Abandono del esquema complejo de `interactions`.
  - Nueva estructura simplificada: `drugs`, `substances`, `questions`.
  - Fuente de verdad: Archivo Excel "Liste-OTC" certificado + BDPM.
- **ETL (Extract Transform Load)**:
  - Nuevo script `forge_data.py` que cruza los datos oficiales (BDPM) con la lista de OTC autorizados.
  - Generación de un repositorio JSON único y controlable.
- **Calidad de Código (TDD)**:
  - Implementación de **Test Driven Development** para la lógica crítica.
  - Tipado fuerte con `Enum` (RiskLevel) para evitar "strings mágicos".
  - Separación estricta: Lógica de negocio (Pura) vs. Acceso a datos.

### 🗑️ Eliminaciones (Limpieza)

- Eliminación del motor de análisis de interacciones complejo (`interaction_service.py`).
- Eliminación de scripts de reparación de PDF de la ANSM (demasiado inestables).
- Limpieza de tablas antiguas de la base de datos no utilizadas.

## [Desarrollo]

### Funcionalidades

- Inicialización de la arquitectura del proyecto (Frontend Astro/React, Backend FastAPI).
- Adición del punto de entrada de la API FastAPI y del endpoint `/health`.
- Implementación del entorno de pruebas Frontend (Vitest).
- Creación del componente `SearchDrug` con pruebas unitarias (TDD).

### Backend y Datos

- Creación de modelos de datos Pydantic (`Drug`, `Substance`) simplificados para las interacciones.
- Implementación del servicio `drug_loader` para ingerir archivos oficiales de la BDPM (ANSM).
- Desarrollo de un motor de búsqueda híbrido (Marca + Molécula) con normalización de acentos.
- Implementación de pruebas de integración automatizadas (Pytest) para la lógica de negocio y la API.
- Endpoint `/api/search` funcional para la búsqueda de medicamentos.

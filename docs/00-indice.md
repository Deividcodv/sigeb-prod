# Índice de documentos — Recreación de SIGEB (6 personas)

> Lee estos documentos **en este orden**. Todo está escrito para personas que parten de **cero**
> (sin conocimientos previos de código, Git, GitHub ni Scrum). Cada documento asume que ya hiciste
> lo que explica el anterior.

---

## Mapa de lectura

| Orden | Documento | Contenido | Para quién |
|---|---|---|---|
| 1 | `01-scrum-como-trabajamos.md` | Qué es Scrum, quién hace qué, ceremonias, artefactos, Definition of Done y el calendario de los 6 sprints | Todos |
| 2 | `02-git-github-conceptos-basicos.md` | Qué son Git y GitHub, instalación desde cero en Windows, vocabulario mínimo y primeros comandos | Todos |
| 3 | `05-versiones-asignadas-por-persona.md` | La versión de código exacta que le toca a cada persona, de dónde descargarla y cómo | Todos |
| 4 | `04-pr-paso-a-paso-por-persona.md` | Cómo cada persona crea su rama, sube su código y abre su Pull Request paso a paso | Cada persona |
| 5 | `03-github-david-aprobar-pr.md` | Cómo David revisa, prueba, aprueba y mergea los PRs, y cómo verifica que todo quede fiel al proyecto original | Solo David |
| 6 | `guia-recreacion-6-personas.md` | Resumen general de toda la simulación (este sí se lee completo al final) | Todos |

---

## Datos clave de referencia (los usas en casi todos los documentos)

| Dato | Valor |
|---|---|
| Repositorio de referencia (tiene el código original) | `https://github.com/Deividcodv/sigeb-prod.git` (alias: `sigeb-prod`) |
| Repositorio nuevo (donde trabajamos) | `sigeb-equipo` (privado, creado por David) |
| **Estado final = CI #40 = commit `a720298`** | Es la versión a la que debe llegar el repositorio nuevo al cierre (16 oct) |
| Hitos por sprint | S1=`4b0795f`, S2=`acb3b0e`, S3=`41285d4`, S4=`ab66393`, S5=`dcba851`, S6=`e36ac2c` |
| Rama de integración | `develop` |
| Rama de producción | `master` (protegida) |
| Ramas de trabajo | `feature/<modulo>-<descripcion>` |
| Ramas de arreglos | `hotfix/<descripcion>` |

### Los 6 sprints

| Sprint | Fechas | Hito | Tema |
|---|---|---|---|
| S1 | 07–11 sep | `4b0795f` | Auth y seguridad |
| S2 | 14–18 sep | `acb3b0e` | Convocatorias, catálogos, solicitudes, CI |
| S3 | 21–25 sep | `41285d4` | Evaluación, comités, sesiones, decisiones |
| S4 | 28 sep–02 oct | `ab66393` | Reportes, auditoría, asistente IA, layout |
| S5 | 05–09 oct | `dcba851` | Portal público, web auth, dashboard |
| S6 | 12–16 oct | `e36ac2c` | Sistema interno, paneles, constancia PDF |
| Estabilización | 12–16 oct | `a720298` (CI #40) | Hotfixes de specs, CI y reportes |

---

## Terminología rápida (glosario)

- **Repo / repositorio**: carpeta del proyecto con todo su historial de cambios, guardada en GitHub.
- **Clone / clonar**: copiar el repositorio a tu computadora.
- **Branch / rama**: versión paralela del código donde trabajas sin afectar la principal.
- **Commit**: guardar un cambio con un mensaje describiendo qué hiciste.
- **Push**: subir tus commits al repositorio en GitHub.
- **Pull / pull request**: "Pull" = descargar cambios de GitHub a tu PC. "Pull Request (PR)" = pedir que revisen y mezclen tus cambios.
- **Merge**: mezclar una rama con otra.
- **CI**: "Continuous Integration" — un programa que corre automáticamente cuando haces un PR para verificar que el código funciona.

*Detalle completo de cada concepto en `02-git-github-conceptos-basicos.md`.*
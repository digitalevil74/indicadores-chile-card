# Indicadores Chile Card

Tarjeta personalizada para Home Assistant que muestra indicadores económicos de Chile directamente en el dashboard, utilizando datos obtenidos desde **[mindicador.cl](https://mindicador.cl/)** y **[findic.cl](https://findic.cl/)** mediante sus APIs públicas.

La tarjeta consulta ambas fuentes y selecciona automáticamente el dato con la fecha más reciente disponible para cada indicador.

El objetivo del proyecto es ofrecer una tarjeta simple, visual y configurable para consultar información económica relevante sin necesidad de crear manualmente múltiples sensores o automatizaciones.

## Indicadores

La tarjeta permite mostrar los siguientes indicadores:

- UF
- UTM
- Dólar observado
- Euro
- IPC
- Tasa de Política Monetaria
- IMACEC
- Tasa de desempleo
- Libra de cobre
- IVP
- Bitcoin

## Características

- Integración directa con Home Assistant
- Instalación mediante HACS
- Selección de los indicadores que se desean mostrar
- Orden configurable desde YAML
- Formato adaptado a Chile
- Fecha de actualización de los datos
- Mes de referencia para indicadores mensuales
- Consulta automática de dos fuentes de datos
- Selección automática del dato más reciente disponible
- Compatible con temas de Home Assistant
- Diseño compacto en dos columnas
- Bandera de Chile integrada mediante SVG

## Configuración

La tarjeta puede utilizarse sin ninguna configuración adicional:

```yaml
type: custom:indicadores-chile-card
```

En este caso se mostrarán los cuatro indicadores predeterminados:

- UF
- Dólar observado
- IPC
- IMACEC

### Selección de indicadores

Los indicadores que se desean mostrar pueden seleccionarse mediante la opción `indicadores`.

```yaml
type: custom:indicadores-chile-card
indicadores:
  - uf
  - dolar
  - ipc
  - imacec
```

Los indicadores disponibles son:

| Código | Indicador |
|---|---|
| `uf` | Unidad de Fomento |
| `dolar` | Dólar observado |
| `euro` | Euro |
| `utm` | Unidad Tributaria Mensual |
| `ipc` | Índice de Precios al Consumidor |
| `imacec` | Indicador Mensual de Actividad Económica |
| `tpm` | Tasa de Política Monetaria |
| `libra_cobre` | Libra de cobre |
| `tasa_desempleo` | Tasa de desempleo |
| `ivp` | Índice de Valor Promedio |
| `bitcoin` | Bitcoin |

Los indicadores se muestran en el mismo orden en que aparecen en la configuración.

Por ejemplo:

```yaml
type: custom:indicadores-chile-card
indicadores:
  - dolar
  - euro
  - libra_cobre
  - bitcoin
```

También es posible mostrar sólo uno o dos indicadores:

```yaml
type: custom:indicadores-chile-card
indicadores:
  - uf
  - dolar
```

O cambiar completamente el orden:

```yaml
type: custom:indicadores-chile-card
indicadores:
  - imacec
  - ipc
  - dolar
  - uf
```

> Debe configurarse al menos un indicador y sólo pueden utilizarse los códigos indicados anteriormente.

## Formato de fechas

La tarjeta muestra la fecha de acuerdo con el tipo de indicador.

Para indicadores diarios, como UF o Dólar observado:

```text
11 sept 2026
```

Para indicadores mensuales, como IPC o IMACEC:

```text
Agosto de 2026
```

Esto permite identificar fácilmente a qué período corresponde cada dato.

## Fuente de datos

Los indicadores son obtenidos mediante las APIs públicas de:

- **[mindicador.cl](https://mindicador.cl/)**
- **[findic.cl](https://findic.cl/)**

La tarjeta consulta ambas fuentes y selecciona automáticamente el dato con la fecha más reciente disponible para cada indicador.

Si una de las fuentes no está disponible, la tarjeta puede continuar utilizando la otra mientras existan datos disponibles.

La disponibilidad, frecuencia de actualización y exactitud de los datos dependen de los servicios externos utilizados.

## Instalación

El proyecto se encuentra actualmente en desarrollo.

Puede instalarse mediante HACS como repositorio personalizado.

### Repositorio personalizado en HACS

Agrega el siguiente repositorio:

```text
https://github.com/digitalevil74/indicadores-chile-card
```

Selecciona como tipo:

```text
Dashboard
```

Una vez instalada, agrega la tarjeta manualmente al dashboard:

```yaml
type: custom:indicadores-chile-card
```

## Desarrollo

El proyecto utiliza:

- TypeScript
- Lit
- Web Components
- Vite
- HACS

Para instalar las dependencias:

```bash
npm install
```

Para comprobar el código TypeScript:

```bash
npm run comprobar
```

Para compilar la tarjeta:

```bash
npm run build
```

El archivo generado se encuentra en:

```text
dist/indicadores-chile-card.js
```

## Estado del proyecto

🚧 **En desarrollo**

El proyecto continúa en desarrollo y pueden producirse cambios en la configuración o en el funcionamiento de la tarjeta antes de alcanzar una primera versión estable.

## Contribuciones

Las sugerencias, reportes de errores y contribuciones son bienvenidas.

## Licencia

Este proyecto se distribuye bajo la licencia **GNU General Public License v3.0**.

Consulta el archivo [LICENSE](LICENSE) para más información.

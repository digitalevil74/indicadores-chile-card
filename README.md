# Indicadores Chile Card

Tarjeta personalizada para Home Assistant que muestra indicadores económicos de Chile directamente en el dashboard, utilizando datos obtenidos desde **[mindicador.cl](https://mindicador.cl/)** mediante su API pública.

El objetivo del proyecto es ofrecer una tarjeta simple, visual y configurable para consultar información económica relevante sin necesidad de crear manualmente múltiples sensores o automatizaciones.

## Indicadores

La tarjeta está pensada para mostrar, entre otros:

* UF
* UTM
* Dólar observado
* Euro
* IPC
* Tasa de Política Monetaria
* IMACEC
* Tasa de desempleo
* Libra de cobre

## Características previstas

* Integración directa con Home Assistant
* Instalación mediante HACS
* Selección de los indicadores que se desean mostrar
* Diferentes modos de visualización
* Formato adaptado a Chile
* Fecha de actualización de los datos
* Variación del indicador respecto de valores anteriores
* Historial y gráficos simples
* Editor gráfico para configurar la tarjeta desde Home Assistant

## Ejemplo de configuración

```yaml
type: custom:indicadores-chile-card
indicadores:
  - uf
  - dolar
  - euro
  - utm
```

> La configuración puede cambiar mientras el proyecto se encuentre en desarrollo.

## Instalación

El proyecto se encuentra actualmente en desarrollo.

Cuando exista una primera versión estable podrá instalarse mediante HACS como una tarjeta personalizada de Home Assistant.

## Fuente de datos

Los indicadores son obtenidos desde **[mindicador.cl](https://mindicador.cl/)** mediante su API pública.

La disponibilidad, frecuencia de actualización y exactitud de los datos dependen del servicio proporcionado por `mindicador.cl`.

## Estado del proyecto

🚧 **En desarrollo**

Este proyecto nació también como una forma de aprender y experimentar con:

* Home Assistant Custom Cards
* TypeScript
* Lit
* Web Components
* HACS

## Contribuciones

Las sugerencias, reportes de errores y contribuciones son bienvenidas.

## Licencia

Este proyecto se distribuye bajo la licencia **GNU General Public License v3.0**.

Consulta el archivo [LICENSE](LICENSE) para más información.

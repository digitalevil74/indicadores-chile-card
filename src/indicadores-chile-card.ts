import { LitElement, html, css } from "lit";

interface ConfiguracionTarjeta {
  type?: string;
}

interface Indicador {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

interface RespuestaIndicadores {
  uf?: Indicador;
  dolar?: Indicador;
  ipc?: Indicador;
  imacec?: Indicador;
}

type CodigoIndicador =
  | "uf"
  | "dolar"
  | "ipc"
  | "imacec";

interface IndicadorSeleccionado {
  indicador: Indicador;
  fuente: "mindicador.cl" | "findic.cl";
}

class IndicadoresChileCard extends LitElement {

  private configuracion?: ConfiguracionTarjeta;

  private datos:
    Partial<Record<CodigoIndicador, IndicadorSeleccionado>> = {};

  private cargando = false;
  private error?: string;
  private iniciado = false;

  static styles = css`
    ha-card {
      padding: 20px;
    }

    .titulo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 18px;
    }

    .titulo ha-icon {
      color: var(--primary-color);
    }

    .indicadores {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px 24px;
    }

    .indicador {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px 0;
      border-bottom: 1px solid var(--divider-color);
    }

    .nombre {
      color: var(--secondary-text-color);
      padding-top: 2px;
    }

    .datos {
      text-align: right;
    }

    .valor {
      font-size: 16px;
      font-weight: bold;
    }

    .fecha {
      margin-top: 4px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .mensaje {
      padding: 20px;
      text-align: center;
      color: var(--secondary-text-color);
    }

    .error {
      padding: 20px;
      text-align: center;
      color: var(--error-color);
    }
  `;

  setConfig(configuracion: ConfiguracionTarjeta) {
    this.configuracion = configuracion;
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.iniciado) {
      this.iniciado = true;
      void this.cargarIndicadores();
    }
  }

  private async consultarApi(
    url: string
  ): Promise<RespuestaIndicadores> {

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error(
        `Error HTTP ${respuesta.status}`
      );
    }

    return (await respuesta.json()) as RespuestaIndicadores;
  }

  private seleccionarMasReciente(
    mindicador: Indicador | undefined,
    findic: Indicador | undefined
  ): IndicadorSeleccionado | undefined {

    if (!mindicador && !findic) {
      return undefined;
    }

    if (mindicador && !findic) {
      return {
        indicador: mindicador,
        fuente: "mindicador.cl"
      };
    }

    if (!mindicador && findic) {
      return {
        indicador: findic,
        fuente: "findic.cl"
      };
    }

    const fechaMindicador =
      new Date(mindicador!.fecha).getTime();

    const fechaFindic =
      new Date(findic!.fecha).getTime();

    if (fechaFindic > fechaMindicador) {
      return {
        indicador: findic!,
        fuente: "findic.cl"
      };
    }

    return {
      indicador: mindicador!,
      fuente: "mindicador.cl"
    };
  }

  private async cargarIndicadores() {

    this.cargando = true;
    this.error = undefined;

    this.requestUpdate();

    const resultados = await Promise.allSettled([
      this.consultarApi(
        "https://mindicador.cl/api"
      ),

      this.consultarApi(
        "https://findic.cl/api/"
      )
    ]);

    const respuestaMindicador =
      resultados[0].status === "fulfilled"
        ? resultados[0].value
        : undefined;

    const respuestaFindic =
      resultados[1].status === "fulfilled"
        ? resultados[1].value
        : undefined;

    if (
      !respuestaMindicador &&
      !respuestaFindic
    ) {
      this.error =
        "No fue posible obtener datos desde ninguna fuente.";

      this.cargando = false;
      this.requestUpdate();

      return;
    }

    const codigos: CodigoIndicador[] = [
      "uf",
      "dolar",
      "ipc",
      "imacec"
    ];

    for (const codigo of codigos) {

      const seleccionado =
        this.seleccionarMasReciente(
          respuestaMindicador?.[codigo],
          respuestaFindic?.[codigo]
        );

      if (seleccionado) {
        this.datos[codigo] = seleccionado;
      }
    }

    this.cargando = false;

    this.requestUpdate();
  }

  private formatearValor(
    codigo: CodigoIndicador,
    indicador: Indicador
  ) {

    if (
      codigo === "ipc" ||
      codigo === "imacec"
    ) {
      return (
        new Intl.NumberFormat(
          "es-CL",
          {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2
          }
        ).format(indicador.valor)
        + " %"
      );
    }

    return (
      "$ " +
      new Intl.NumberFormat(
        "es-CL",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      ).format(indicador.valor)
    );
  }

  private formatearFecha(
    codigo: CodigoIndicador,
    fechaTexto: string
  ) {

    const fecha = new Date(fechaTexto);

    if (
      codigo === "ipc" ||
      codigo === "imacec"
    ) {

      const texto =
        new Intl.DateTimeFormat(
          "es-CL",
          {
            month: "long",
            year: "numeric",
            timeZone: "UTC"
          }
        ).format(fecha);

      return (
        texto.charAt(0).toUpperCase() +
        texto.slice(1)
      );
    }

    return new Intl.DateTimeFormat(
      "es-CL",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
      }
    ).format(fecha);
  }

  private mostrarIndicador(
    codigo: CodigoIndicador,
    nombre: string
  ) {

    const seleccionado =
      this.datos[codigo];

    if (!seleccionado) {
      return html``;
    }

    const indicador =
      seleccionado.indicador;

    return html`
      <div
        class="indicador"
        title="Fuente: ${seleccionado.fuente}"
      >

        <span class="nombre">
          ${nombre}
        </span>

        <div class="datos">

          <div class="valor">
            ${this.formatearValor(
              codigo,
              indicador
            )}
          </div>

          <div class="fecha">
            ${this.formatearFecha(
              codigo,
              indicador.fecha
            )}
          </div>

        </div>

      </div>
    `;
  }

  getCardSize() {
    return 3;
  }

  render() {

    return html`
      <ha-card>

        <div class="titulo">

          <ha-icon
            icon="mdi:finance">
          </ha-icon>

          Indicadores Chile

        </div>

        ${
          this.cargando

            ? html`
                <div class="mensaje">
                  Cargando indicadores...
                </div>
              `

            : this.error

              ? html`
                  <div class="error">
                    ${this.error}
                  </div>
                `

              : html`
                  <div class="indicadores">

                    ${this.mostrarIndicador(
                      "uf",
                      "UF"
                    )}

                    ${this.mostrarIndicador(
                      "dolar",
                      "Dólar observado"
                    )}

                    ${this.mostrarIndicador(
                      "ipc",
                      "IPC"
                    )}

                    ${this.mostrarIndicador(
                      "imacec",
                      "IMACEC"
                    )}

                  </div>
                `
        }

      </ha-card>
    `;
  }
}

customElements.define(
  "indicadores-chile-card",
  IndicadoresChileCard
);
import { LitElement, html, css } from "lit";

interface ConfiguracionTarjeta {
  type?: string;
  indicadores?: CodigoIndicador[];
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

const INDICADORES_PREDETERMINADOS: CodigoIndicador[] = [
  "uf",
  "dolar",
  "ipc",
  "imacec"
];

const NOMBRES_INDICADORES: Record<CodigoIndicador, string> = {
  uf: "UF",
  dolar: "Dólar Obs.",
  ipc: "IPC",
  imacec: "IMACEC"
};

class IndicadoresChileCard extends LitElement {

  private configuracion: ConfiguracionTarjeta = {
    indicadores: INDICADORES_PREDETERMINADOS
  };

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
      gap: 9px;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 18px;
    }

    .bandera {
      width: 25px;
      height: 17px;
      border-radius: 2px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .bandera svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    .indicadores {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
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

    const indicadores =
      configuracion.indicadores ??
      INDICADORES_PREDETERMINADOS;

    if (!Array.isArray(indicadores)) {
      throw new Error(
        "La opción 'indicadores' debe ser una lista."
      );
    }

    if (indicadores.length === 0) {
      throw new Error(
        "Debes seleccionar al menos un indicador."
      );
    }

    const permitidos: CodigoIndicador[] = [
      "uf",
      "dolar",
      "ipc",
      "imacec"
    ];

    for (const indicador of indicadores) {

      if (!permitidos.includes(indicador)) {
        throw new Error(
          `Indicador no válido: ${indicador}. ` +
          `Usa: uf, dolar, ipc o imacec.`
        );
      }

    }

    this.configuracion = {
      ...configuracion,
      indicadores
    };
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
    codigo: CodigoIndicador
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
          ${NOMBRES_INDICADORES[codigo]}
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

    const indicadores =
      this.configuracion.indicadores ??
      INDICADORES_PREDETERMINADOS;

    return html`
      <ha-card>

        <div class="titulo">

          <div class="bandera">
            <svg
              viewBox="0 0 30 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Bandera de Chile"
            >

              <rect
                x="0"
                y="0"
                width="30"
                height="10"
                fill="#ffffff"
              />

              <rect
                x="0"
                y="10"
                width="30"
                height="10"
                fill="#d52b1e"
              />

              <rect
                x="0"
                y="0"
                width="10"
                height="10"
                fill="#0039a6"
              />

              <polygon
                points="
                  5,2
                  5.7,4.1
                  7.9,4.1
                  6.1,5.4
                  6.8,7.5
                  5,6.2
                  3.2,7.5
                  3.9,5.4
                  2.1,4.1
                  4.3,4.1
                "
                fill="#ffffff"
              />

            </svg>
          </div>

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

                    ${indicadores.map(
                      codigo =>
                        this.mostrarIndicador(
                          codigo
                        )
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
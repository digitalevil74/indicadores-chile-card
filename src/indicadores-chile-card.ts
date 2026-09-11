import { LitElement, html, css } from "lit";

type CodigoIndicador =
  | "uf"
  | "dolar"
  | "euro"
  | "utm"
  | "ipc"
  | "imacec"
  | "tpm"
  | "libra_cobre"
  | "tasa_desempleo"
  | "ivp"
  | "bitcoin";

type TipoFormato =
  | "clp"
  | "clp_entero"
  | "usd"
  | "porcentaje";

type TipoFecha =
  | "fecha"
  | "mes";

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
  euro?: Indicador;
  utm?: Indicador;
  ipc?: Indicador;
  imacec?: Indicador;
  tpm?: Indicador;
  libra_cobre?: Indicador;
  tasa_desempleo?: Indicador;
  ivp?: Indicador;
  bitcoin?: Indicador;
}

interface IndicadorSeleccionado {
  indicador: Indicador;
  fuente: "mindicador.cl" | "findic.cl";
}

interface DefinicionIndicador {
  nombre: string;
  formato: TipoFormato;
  tipoFecha: TipoFecha;
}

const INDICADORES_DISPONIBLES: CodigoIndicador[] = [
  "uf",
  "dolar",
  "euro",
  "utm",
  "ipc",
  "imacec",
  "tpm",
  "libra_cobre",
  "tasa_desempleo",
  "ivp",
  "bitcoin"
];

const INDICADORES_PREDETERMINADOS: CodigoIndicador[] = [
  "uf",
  "dolar",
  "ipc",
  "imacec"
];

const DEFINICIONES: Record<
  CodigoIndicador,
  DefinicionIndicador
> = {

  uf: {
    nombre: "UF",
    formato: "clp",
    tipoFecha: "fecha"
  },

  dolar: {
    nombre: "Dólar Obs.",
    formato: "clp",
    tipoFecha: "fecha"
  },

  euro: {
    nombre: "Euro",
    formato: "clp",
    tipoFecha: "fecha"
  },

  utm: {
    nombre: "UTM",
    formato: "clp_entero",
    tipoFecha: "mes"
  },

  ipc: {
    nombre: "IPC",
    formato: "porcentaje",
    tipoFecha: "mes"
  },

  imacec: {
    nombre: "IMACEC",
    formato: "porcentaje",
    tipoFecha: "mes"
  },

  tpm: {
    nombre: "TPM",
    formato: "porcentaje",
    tipoFecha: "fecha"
  },

  libra_cobre: {
    nombre: "Cobre",
    formato: "usd",
    tipoFecha: "fecha"
  },

  tasa_desempleo: {
    nombre: "Desempleo",
    formato: "porcentaje",
    tipoFecha: "mes"
  },

  ivp: {
    nombre: "IVP",
    formato: "clp",
    tipoFecha: "fecha"
  },

  bitcoin: {
    nombre: "Bitcoin",
    formato: "usd",
    tipoFecha: "fecha"
  }
};


class IndicadoresChileCard extends LitElement {

  private configuracion: ConfiguracionTarjeta = {
    indicadores: INDICADORES_PREDETERMINADOS
  };

  private datos:
    Partial<
      Record<CodigoIndicador, IndicadorSeleccionado>
    > = {};

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
      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      gap: 12px 24px;
    }

    .indicador {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      padding: 10px 0;

      border-bottom:
        1px solid var(--divider-color);
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

      color:
        var(--secondary-text-color);
    }

    .mensaje {
      padding: 20px;

      text-align: center;

      color:
        var(--secondary-text-color);
    }

    .error {
      padding: 20px;

      text-align: center;

      color:
        var(--error-color);
    }

  `;


  setConfig(
    configuracion: ConfiguracionTarjeta
  ) {

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


    for (const indicador of indicadores) {

      if (
        !INDICADORES_DISPONIBLES.includes(
          indicador
        )
      ) {

        throw new Error(
          `Indicador no válido: ${indicador}.`
        );

      }

    }


    this.configuracion = {
      ...configuracion,
      indicadores
    };

    this.requestUpdate();

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

    const respuesta =
      await fetch(url);


    if (!respuesta.ok) {

      throw new Error(
        `Error HTTP ${respuesta.status}`
      );

    }


    return (
      await respuesta.json()
    ) as RespuestaIndicadores;

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
      new Date(
        mindicador!.fecha
      ).getTime();


    const fechaFindic =
      new Date(
        findic!.fecha
      ).getTime();


    if (
      fechaFindic >
      fechaMindicador
    ) {

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


    const resultados =
      await Promise.allSettled([

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


    for (
      const codigo of
      INDICADORES_DISPONIBLES
    ) {

      const seleccionado =
        this.seleccionarMasReciente(

          respuestaMindicador?.[codigo],

          respuestaFindic?.[codigo]

        );


      if (seleccionado) {

        this.datos[codigo] =
          seleccionado;

      }

    }


    this.cargando = false;

    this.requestUpdate();

  }


  private formatearValor(
    codigo: CodigoIndicador,
    indicador: Indicador
  ) {

    const definicion =
      DEFINICIONES[codigo];


    if (
      definicion.formato ===
      "porcentaje"
    ) {

      return (
        new Intl.NumberFormat(
          "es-CL",
          {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2
          }
        ).format(
          indicador.valor
        )
        + " %"
      );

    }


    if (
      definicion.formato ===
      "usd"
    ) {

      return (
        "US$ " +
        new Intl.NumberFormat(
          "es-CL",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        ).format(
          indicador.valor
        )
      );

    }


    if (
      definicion.formato ===
      "clp_entero"
    ) {

      return (
        "$ " +
        new Intl.NumberFormat(
          "es-CL",
          {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }
        ).format(
          indicador.valor
        )
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
      ).format(
        indicador.valor
      )
    );

  }


  private formatearFecha(
    codigo: CodigoIndicador,
    fechaTexto: string
  ) {

    const fecha =
      new Date(fechaTexto);

    const definicion =
      DEFINICIONES[codigo];


    if (
      definicion.tipoFecha ===
      "mes"
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
        texto.charAt(0).toUpperCase()
        + texto.slice(1)
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


    const definicion =
      DEFINICIONES[codigo];


    return html`

      <div
        class="indicador"
        title="Fuente: ${seleccionado.fuente}"
      >

        <span class="nombre">

          ${definicion.nombre}

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
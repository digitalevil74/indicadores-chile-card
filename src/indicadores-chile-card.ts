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
  uf: Indicador;
  dolar: Indicador;
  ipc: Indicador;
  imacec: Indicador;
}

type CodigoIndicador =
  | "uf"
  | "dolar"
  | "ipc"
  | "imacec";

class IndicadoresChileCard extends LitElement {

  private configuracion?: ConfiguracionTarjeta;
  private datos?: RespuestaIndicadores;
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
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--divider-color);
    }

    .nombre {
      color: var(--secondary-text-color);
    }

    .valor {
      font-size: 16px;
      font-weight: bold;
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

  private async cargarIndicadores() {

    this.cargando = true;
    this.error = undefined;
    this.requestUpdate();

    try {

      const respuesta = await fetch(
        "https://mindicador.cl/api"
      );

      if (!respuesta.ok) {
        throw new Error(
          `Error HTTP ${respuesta.status}`
        );
      }

      this.datos =
        await respuesta.json() as RespuestaIndicadores;

    } catch (error) {

      if (error instanceof Error) {
        this.error = error.message;
      } else {
        this.error =
          "No fue posible obtener los indicadores.";
      }

    } finally {

      this.cargando = false;
      this.requestUpdate();

    }
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
        ).format(indicador.valor) + " %"
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

  private mostrarIndicador(
    codigo: CodigoIndicador,
    nombre: string
  ) {

    if (!this.datos) {
      return html``;
    }

    const indicador = this.datos[codigo];

    return html`
      <div class="indicador">

        <span class="nombre">
          ${nombre}
        </span>

        <span class="valor">
          ${this.formatearValor(
            codigo,
            indicador
          )}
        </span>

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
          <ha-icon icon="mdi:finance"></ha-icon>
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
                    No fue posible obtener los indicadores.
                    <br>
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
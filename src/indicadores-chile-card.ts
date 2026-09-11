import { LitElement, html, css } from "lit";

interface ConfiguracionTarjeta {
  type?: string;
}

class IndicadoresChileCard extends LitElement {

  private configuracion?: ConfiguracionTarjeta;

  static styles = css`
    ha-card {
      padding: 20px;
    }

    .titulo {
      font-size: 20px;
      font-weight: bold;
    }

    .contenido {
      margin-top: 16px;
      text-align: center;
      font-size: 18px;
    }
  `;

  setConfig(configuracion: ConfiguracionTarjeta) {
    this.configuracion = configuracion;
  }

  getCardSize() {
    return 2;
  }

  render() {
    return html`
      <ha-card>
        <div class="titulo">
          🇨🇱 Indicadores Chile
        </div>

        <div class="contenido">
          Hola mundo
        </div>
      </ha-card>
    `;
  }
}

customElements.define(
  "indicadores-chile-card",
  IndicadoresChileCard
);
import {
  OPENING_HOURS,
  RESTAURANT_INSTAGRAM,
  RESTAURANT_INSTAGRAM_HANDLE,
  RESTAURANT_UNIT,
} from "./config.js";
import { escapeHtml } from "./utils.js";

// Fonte unica: os horarios ficam em config.js. Sem eles preenchidos, o site
// direciona para o Instagram em vez de mostrar um horario inventado.
export function renderOpeningHours() {
  const target = document.querySelector("[data-opening-hours]");
  if (!target) {
    return;
  }

  if (!OPENING_HOURS.length) {
    target.innerHTML = `
      <p>
        Confira os dias e horários atualizados no nosso Instagram
        <a href="${escapeHtml(RESTAURANT_INSTAGRAM)}" target="_blank" rel="noreferrer">${escapeHtml(RESTAURANT_INSTAGRAM_HANDLE)}</a>.
      </p>
    `;
    return;
  }

  const rows = OPENING_HOURS.map(
    ({ days, hours }) => `
      <div class="hours-row">
        <span>${escapeHtml(days)}</span>
        <strong>${escapeHtml(hours)}</strong>
      </div>
    `
  ).join("");

  target.innerHTML = `
    <div class="hours-list">${rows}</div>
    ${RESTAURANT_UNIT ? `<p class="hours-unit"><span aria-hidden="true">📍</span> Unidade ${escapeHtml(RESTAURANT_UNIT)}</p>` : ""}
  `;
}

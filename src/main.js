import './style.css'
import { calculate } from './calculator.js'
import { initPresetsUI } from './presets-ui.js'

const DEFAULTS = {
  starterHydration: 100,
  doughHydration: 80,
  saltPercentage: 2,
  starterWeight: 200,
}

document.getElementById('app').innerHTML = `
  <div class="app">
    <header>
      <h1>sourdough calculator</h1>
    </header>

    <main>
      <section class="inputs-section">
        <div class="field-group">
          <div class="field-label">
            <span>starter hydration</span>
            <span class="field-hint">how wet your starter is</span>
          </div>
          <div class="slider-row">
            <input type="range" id="starterHydSlider" min="50" max="200" step="1" value="${DEFAULTS.starterHydration}" />
            <div class="pct-input-wrap">
              <input type="number" id="starterHydNum" value="${DEFAULTS.starterHydration}" min="50" max="200" step="1" />
              <span class="pct-sym">%</span>
            </div>
          </div>
        </div>

        <div class="field-group">
          <div class="field-label">
            <span>target dough hydration</span>
            <span class="field-hint">final loaf hydration</span>
          </div>
          <div class="slider-row">
            <input type="range" id="doughHydSlider" min="50" max="120" step="1" value="${DEFAULTS.doughHydration}" />
            <div class="pct-input-wrap">
              <input type="number" id="doughHydNum" value="${DEFAULTS.doughHydration}" min="50" max="120" step="1" />
              <span class="pct-sym">%</span>
            </div>
          </div>
        </div>

        <div class="field-group">
          <div class="field-label">
            <span>salt</span>
            <span class="field-hint">% of total flour weight</span>
          </div>
          <div class="slider-row">
            <input type="range" id="saltSlider" min="0" max="5" step="0.1" value="${DEFAULTS.saltPercentage}" />
            <div class="pct-input-wrap">
              <input type="number" id="saltNum" value="${DEFAULTS.saltPercentage}" min="0" max="5" step="0.1" />
              <span class="pct-sym">%</span>
            </div>
          </div>
        </div>

        <div class="field-group">
          <div class="field-label">
            <span>starter weight</span>
          </div>
          <div class="weight-input">
            <input type="number" id="starterWeight" value="${DEFAULTS.starterWeight}" min="1" max="5000" placeholder="200" />
            <span class="unit">g</span>
          </div>
        </div>
      </section>

      <hr class="divider" />

      <section class="results-section">
        <div class="result-grid">
          <div class="result-card">
            <div class="result-label">flour to add</div>
            <div class="result-value" id="flourOut">—</div>
            <div class="result-unit">grams</div>
          </div>
          <div class="result-card">
            <div class="result-label">water to add</div>
            <div class="result-value" id="waterOut">—</div>
            <div class="result-unit">grams</div>
          </div>
          <div class="result-card">
            <div class="result-label">salt</div>
            <div class="result-value" id="saltOut">—</div>
            <div class="result-unit">grams</div>
          </div>
        </div>
        <div class="result-total">
          <span class="total-label">total dough weight</span>
          <span class="total-value" id="totalOut">—</span>
        </div>
        <div class="warnings" id="warnings" style="display:none"></div>
      </section>

      <hr class="divider" />

      <section class="presets-section">
        <div class="presets-header">
          <h2>presets</h2>
          <button id="save-preset-btn">save current</button>
        </div>
        <div id="save-preset-form" class="save-preset-form" style="display:none">
          <input type="text" id="preset-name-input" placeholder="recipe name" />
          <button id="confirm-save-btn">save</button>
          <button id="cancel-save-btn" class="secondary">cancel</button>
        </div>
        <div id="presets-list" class="presets-list"></div>
      </section>
    </main>
  </div>
`

function linkSliderAndInput(sliderId, inputId) {
  const slider = document.getElementById(sliderId)
  const input = document.getElementById(inputId)

  slider.addEventListener('input', () => {
    input.value = parseFloat(slider.value)
    recalculate()
  })

  input.addEventListener('input', () => {
    const v = parseFloat(input.value)
    if (isNaN(v)) return
    const clamped = Math.min(parseFloat(slider.max), Math.max(parseFloat(slider.min), v))
    slider.value = clamped
    recalculate()
  })

  input.addEventListener('blur', () => {
    let v = parseFloat(input.value)
    if (isNaN(v)) v = parseFloat(slider.value)
    const clamped = Math.min(parseFloat(slider.max), Math.max(parseFloat(slider.min), v))
    const step = parseFloat(slider.step) || 1
    const decimals = step < 1 ? String(step).split('.')[1].length : 0
    input.value = parseFloat(clamped.toFixed(decimals))
    slider.value = input.value
    recalculate()
  })
}

function getInputs() {
  return {
    starterWeight: parseFloat(document.getElementById('starterWeight').value),
    starterHydration: parseFloat(document.getElementById('starterHydSlider').value),
    doughHydration: parseFloat(document.getElementById('doughHydSlider').value),
    saltPercentage: parseFloat(document.getElementById('saltSlider').value),
  }
}

function setInputs({ starterWeight, starterHydration, doughHydration, saltPercentage }) {
  document.getElementById('starterWeight').value = starterWeight

  document.getElementById('starterHydSlider').value = starterHydration
  document.getElementById('starterHydNum').value = starterHydration

  document.getElementById('doughHydSlider').value = doughHydration
  document.getElementById('doughHydNum').value = doughHydration

  document.getElementById('saltSlider').value = saltPercentage
  document.getElementById('saltNum').value = saltPercentage

  recalculate()
}

function recalculate() {
  const result = calculate(getInputs())

  document.getElementById('flourOut').textContent = result.addFlour !== null ? result.addFlour : '—'
  document.getElementById('waterOut').textContent = result.addWater !== null ? result.addWater : '—'
  document.getElementById('saltOut').textContent = result.salt !== null ? result.salt : '—'
  document.getElementById('totalOut').textContent = result.totalDoughWeight !== null ? result.totalDoughWeight + ' g' : '—'

  const warningsEl = document.getElementById('warnings')
  if (result.warnings.length > 0) {
    warningsEl.style.display = 'block'
    warningsEl.innerHTML = result.warnings.map(w => `<p>${w}</p>`).join('')
  } else {
    warningsEl.style.display = 'none'
    warningsEl.innerHTML = ''
  }
}

linkSliderAndInput('starterHydSlider', 'starterHydNum')
linkSliderAndInput('doughHydSlider', 'doughHydNum')
linkSliderAndInput('saltSlider', 'saltNum')

document.getElementById('starterWeight').addEventListener('input', recalculate)

initPresetsUI(getInputs, setInputs)

recalculate()

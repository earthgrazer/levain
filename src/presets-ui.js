import { loadPresets, savePreset, deletePreset, updatePresetName } from './storage.js'

/**
 * @param {Function} getInputsFn - returns current inputs object
 * @param {Function} setInputsFn - accepts inputs object, updates UI and recalculates
 */
export function initPresetsUI(getInputsFn, setInputsFn) {
  const saveBtn = document.getElementById('save-preset-btn')
  const saveForm = document.getElementById('save-preset-form')
  const nameInput = document.getElementById('preset-name-input')
  const confirmBtn = document.getElementById('confirm-save-btn')
  const cancelBtn = document.getElementById('cancel-save-btn')

  function showForm() {
    saveForm.style.display = 'flex'
    nameInput.value = ''
    nameInput.focus()
  }

  function hideForm() {
    saveForm.style.display = 'none'
    nameInput.value = ''
  }

  function doSave() {
    const name = nameInput.value.trim()
    if (!name) {
      nameInput.focus()
      return
    }
    savePreset(name, getInputsFn())
    renderPresetsList()
    hideForm()
  }

  saveBtn.addEventListener('click', showForm)
  confirmBtn.addEventListener('click', doSave)
  cancelBtn.addEventListener('click', hideForm)
  nameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSave()
    if (e.key === 'Escape') hideForm()
  })

  renderPresetsList()

  function renderPresetsList() {
    const list = document.getElementById('presets-list')
    const presets = loadPresets()

    if (presets.length === 0) {
      list.innerHTML = '<p class="presets-empty">no presets saved yet</p>'
      return
    }

    list.innerHTML = presets.map(preset => {
      const { starterWeight, doughHydration, saltPercentage } = preset.inputs
      const meta = `${starterWeight}g starter · ${doughHydration}% hydration · ${saltPercentage}% salt`
      return `
        <div class="preset-item" data-id="${preset.id}">
          <div class="preset-info">
            <span class="preset-name" title="double-click to rename">${escapeHtml(preset.name)}</span>
            <span class="preset-meta">${escapeHtml(meta)}</span>
          </div>
          <div class="preset-actions">
            <button class="load-btn" data-id="${preset.id}">load</button>
            <button class="delete-btn" data-id="${preset.id}">delete</button>
          </div>
        </div>
      `
    }).join('')

    list.querySelectorAll('.load-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = loadPresets().find(p => p.id === btn.dataset.id)
        if (preset) setInputsFn(preset.inputs)
      })
    })

    list.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        deletePreset(btn.dataset.id)
        renderPresetsList()
      })
    })

    list.querySelectorAll('.preset-name').forEach(nameEl => {
      nameEl.addEventListener('dblclick', () => {
        const item = nameEl.closest('.preset-item')
        const id = item.dataset.id
        const current = nameEl.textContent

        const input = document.createElement('input')
        input.type = 'text'
        input.value = current
        input.className = 'rename-input'
        nameEl.replaceWith(input)
        input.focus()
        input.select()

        function commit() {
          const newName = input.value.trim()
          if (newName && newName !== current) {
            updatePresetName(id, newName)
          }
          renderPresetsList()
        }

        input.addEventListener('blur', commit)
        input.addEventListener('keydown', e => {
          if (e.key === 'Enter') { input.blur() }
          if (e.key === 'Escape') { renderPresetsList() }
        })
      })
    })
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

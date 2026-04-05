const STORAGE_KEY = 'sourdough_presets'

/**
 * @returns {Preset[]}
 */
export function loadPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to load presets:', err)
    return []
  }
}

/**
 * @param {string} name
 * @param {Object} inputs
 * @returns {Preset}
 */
export function savePreset(name, inputs) {
  const preset = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    inputs: { ...inputs },
  }
  try {
    const presets = loadPresets()
    presets.push(preset)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
  } catch (err) {
    console.error('Failed to save preset:', err)
  }
  return preset
}

/**
 * @param {string} id
 */
export function deletePreset(id) {
  try {
    const presets = loadPresets().filter(p => p.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
  } catch (err) {
    console.error('Failed to delete preset:', err)
  }
}

/**
 * @param {string} id
 * @param {string} newName
 */
export function updatePresetName(id, newName) {
  try {
    const presets = loadPresets().map(p => p.id === id ? { ...p, name: newName } : p)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
  } catch (err) {
    console.error('Failed to update preset name:', err)
  }
}

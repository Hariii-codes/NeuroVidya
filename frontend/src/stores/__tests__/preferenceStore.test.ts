import { renderHook, act } from '@testing-library/react'
import { usePreferenceStore } from '../preferenceStore'

describe('PreferenceStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { resetToDefaults } = usePreferenceStore.getState()
    resetToDefaults()
  })

  it('has default preferences', () => {
    const { result } = renderHook(() => usePreferenceStore())
    expect(result.current.font).toBe('Lexend')
    expect(result.current.fontSize).toBe(20)
    expect(result.current.theme).toBe('cream')
  })

  it('updates preference', async () => {
    const { result } = renderHook(() => usePreferenceStore())

    await act(async () => {
      await result.current.updatePreference('fontSize', 24)
    })

    expect(result.current.fontSize).toBe(24)
  })

  it('resets to defaults', () => {
    const { result } = renderHook(() => usePreferenceStore())

    act(() => {
      result.current.resetToDefaults()
    })

    expect(result.current.fontSize).toBe(20)
    expect(result.current.theme).toBe('cream')
  })
})

/**
 * Tests for useTTS hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTTS } from '../useTTS'

// Use the global speechSynthesis mock that was set up in setup.ts
const getSpeechMock = () => global.speechSynthesis as any

describe('useTTS', () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    const mock = getSpeechMock()
    mock.speak?.mockClear?.()
    mock.cancel?.mockClear?.()
    mock.pause?.mockClear?.()
    mock.resume?.mockClear?.()
  })

  it('returns initial state', () => {
    const { result } = renderHook(() => useTTS())
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.isPaused).toBe(false)
  })

  it('speaks text', () => {
    const { result } = renderHook(() => useTTS())

    act(() => {
      result.current.speak('Hello world')
    })

    const mock = getSpeechMock()
    expect(mock.speak).toHaveBeenCalled()
  })

  it('stops speaking', () => {
    const { result } = renderHook(() => useTTS())

    act(() => {
      result.current.stop()
    })

    const mock = getSpeechMock()
    expect(mock.cancel).toHaveBeenCalled()
  })
})

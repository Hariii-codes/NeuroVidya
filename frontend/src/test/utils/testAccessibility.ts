// frontend/src/test/utils/testAccessibility.ts
// Accessibility testing utilities

import { axeViolations, AxeResults } from 'axe-core'

/**
 * Test accessibility of a rendered component
 * Returns any accessibility violations found
 */
export async function testAccessibility(container: HTMLElement): Promise<AxeResults> {
  const results = await axeViolations(container)
  return results
}

/**
 * Assert that a container has no accessibility violations
 * @throws Error with details if violations are found
 */
export async function expectNoAccessibilityViolations(container: HTMLElement): Promise<void> {
  const results = await testAccessibility(container)
  if (results.violations.length > 0) {
    const violationDetails = results.violations
      .map((v) => `${v.id}: ${v.description} (${v.nodes.length} affected)`)
      .join('\n')
    throw new Error(`Accessibility violations found:\n${violationDetails}`)
  }
}

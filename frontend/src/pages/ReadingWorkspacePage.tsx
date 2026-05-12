import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { ReadingWorkspace } from '@/components/reading/ReadingWorkspace'

export function ReadingWorkspacePage() {
  return (
    <ProtectedRoute>
      <ReadingWorkspace />
    </ProtectedRoute>
  )
}

export interface Hypothesis {
  id: string
  label: 'Probable cause' | 'Failure hypothesis' | 'Alternative explanation'
  summary: string
  temporalAssociation: string
  supportingEvidence: string[]
  possiblePropagationPathway: string
  modelConfidence: number
  validated: false
}

export interface Investigation {
  id: string
  missionId: string
  state: 'COMPLETE' | 'IN_PROGRESS' | 'NOT_STARTED'
  summary: string
  completedAtUtc: string
  hypothesisCount: number
  dataMode: 'DEMO DATA'
}
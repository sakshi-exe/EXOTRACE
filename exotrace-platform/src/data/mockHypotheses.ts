import type { Hypothesis } from '../types/investigation'

export const mockHypotheses: Hypothesis[] = [
  {
    id: 'H-01',
    label: 'Probable cause',
    summary: 'Power-bus instability may be an early contributor in this event sequence.',
    temporalAssociation: 'Voltage variation appears before the later thermal and communications flags in the mock timeline.',
    supportingEvidence: ['Mock bus-voltage trend shifts near 14:11 UTC.', 'Current fluctuation is listed five minutes later.'],
    possiblePropagationPathway: 'Power variation → possible thermal stress → later subsystem flags; pathway is unverified.',
    modelConfidence: 0.62,
    validated: false,
  },
  {
    id: 'H-02',
    label: 'Failure hypothesis',
    summary: 'Thermal excursion may have contributed to downstream subsystem stress.',
    temporalAssociation: 'The mock temperature deviation follows the listed power events.',
    supportingEvidence: ['Temperature trend rises after the mock voltage variation.'],
    possiblePropagationPathway: 'Thermal change → possible subsystem stress; competing explanations remain open.',
    modelConfidence: 0.48,
    validated: false,
  },
  {
    id: 'H-03',
    label: 'Alternative explanation',
    summary: 'Communications degradation may be independent of the power sequence.',
    temporalAssociation: 'The communications flag occurs later, without evidence establishing a dependency.',
    supportingEvidence: ['Mock SNR declines after the earlier power and thermal flags.'],
    possiblePropagationPathway: 'Independent link or sensor behavior is an alternative to a shared failure pathway.',
    modelConfidence: 0.31,
    validated: false,
  },
]
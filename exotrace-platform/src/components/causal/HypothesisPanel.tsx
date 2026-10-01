import { Waypoints } from 'lucide-react'
import { mockHypotheses } from '../../data/mockHypotheses'
import { Panel } from '../common/Panel'

export function HypothesisPanel() {
  return <Panel title="FAILURE HYPOTHESES · DEMO DATA" icon={Waypoints}>
    <ol className="hypothesis-list">{mockHypotheses.map((hypothesis, index) => <li className="hypothesis" key={hypothesis.id}>
      <span className="hypothesis-number">0{index + 1}</span>
      <div className="hypothesis-body">
        <div className="hypothesis-label">{hypothesis.label}</div>
        <div className="hypothesis-title">{hypothesis.summary}</div>
        <p className="hypothesis-copy"><strong>Temporal association:</strong> {hypothesis.temporalAssociation}</p>
        <p className="hypothesis-copy"><strong>Possible propagation pathway:</strong> {hypothesis.possiblePropagationPathway}</p>
      </div>
      <div className="confidence-block"><span className="confidence">{Math.round(hypothesis.modelConfidence * 100)}%</span><span className="confidence-caption">MODEL CONFIDENCE*</span><span className="confidence-bar"><span style={{ width: `${hypothesis.modelConfidence * 100}%` }} /></span></div>
    </li>)}</ol>
    <p className="hypothesis-footnote">* Illustrative demo score only; not a calibrated probability or validated causal result.</p>
  </Panel>
}
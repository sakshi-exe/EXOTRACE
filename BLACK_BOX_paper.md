# BLACK BOX: A Temporal and Causal-Hypothesis Framework for Explainable Spacecraft Mission Forensics from Heterogeneous Telemetry

> **Status of this document.** This is a *research proposal and methodology paper*. It contains **no experimental results**. Every performance value is marked `[TO BE EXPERIMENTALLY DETERMINED]` (abbreviated TBD in tables). Throughout, content is labelled as one of: **[Proposed]** (a design decision to be implemented), **[Simulated]** (to be evaluated on synthetic data with known ground truth), or **[Validated]** (supported by completed experiments, of which there are currently none). Reference details should be re-verified against the original publisher before submission; entries I am less certain of are marked "verify".

---

## 1. TITLE

**BLACK BOX: A Temporal and Causal-Hypothesis Framework for Explainable Spacecraft Mission Forensics from Heterogeneous Telemetry**

*(Original working title: "BLACK BOX: An AI-Powered Spacecraft Mission Forensics System for Temporal Anomaly Detection, Failure Reconstruction, and Causal Analysis".)*

---

## 2. ABSTRACT

Spacecraft health monitoring commonly relies on limit checking and, increasingly, on machine-learning anomaly detectors. These methods flag abnormal telemetry but typically do not explain how a failure developed, which anomalies were precursors, or which subsystem interactions plausibly propagated the fault. This gap matters in post-failure investigation, where analysts must build an ordered, evidence-backed account from heterogeneous multivariate telemetry. This paper proposes BLACK BOX, a modular framework for spacecraft mission forensics. The pipeline synchronizes and normalizes telemetry, detects anomalies with a baseline Isolation Forest and a primary LSTM autoencoder, and converts anomaly scores into discrete events using change-point detection and hysteresis-based onset estimation. Events are ordered in time and linked through a subsystem dependency graph that combines expert-specified structure with data-driven lagged-dependence evidence. Candidate root-cause hypotheses are ranked by a transparent score combining temporal precedence, dependency support, statistical evidence, and coverage, and are explicitly labelled as causal hypotheses rather than established causes. An explanation layer provides per-channel and temporal attributions and evidence chains; a language model, if used, only verbalizes structured evidence and never reads raw telemetry. The framework is designed to be evaluated on synthetic fault-injection scenarios with known ground truth (thermal runaway, power degradation, attitude-control failure, radiation-induced anomaly), with public real-mission datasets reserved for detection-only validation. No experimental results are reported here; all performance values are marked as to be determined. The expected contribution is an integrated, testable methodology and evaluation protocol for failure-sequence reconstruction and explainable causal-hypothesis generation.

---

## 3. KEYWORDS

Spacecraft telemetry; anomaly detection; multivariate time series; failure reconstruction; causal hypothesis generation; change-point detection; explainable AI; fault diagnosis, isolation and recovery (FDIR); subsystem dependency graph; mission forensics.

---

## 4. INTRODUCTION

### 4.1 Importance of spacecraft telemetry
A spacecraft is operated remotely; telemetry is, in practice, the primary window into its condition. Housekeeping telemetry reports temperatures, bus voltages and currents, battery state, attitude and rate sensors, radio-link quality, processor health, and the discrete states of subsystems and actuators. It supports routine operations, supports commanding decisions, and, after a failure, is often the *only* evidence available, because the vehicle cannot be physically inspected [1].

### 4.2 Complexity of modern health monitoring
Modern spacecraft are tightly coupled systems. Power generation depends on attitude (array pointing) and orbit (eclipse); thermal state depends on power dissipation and on attitude relative to the Sun; radio-link margin depends on antenna pointing and transmitter temperature; flight software behaviour depends on all of them through autonomous mode changes. Telemetry is therefore *heterogeneous* (continuous analog channels, counters, discrete flags), *asynchronously sampled*, noisy, periodically gappy (ground-contact windows, downlink limits), and *non-stationary* (orbital cycles, mode changes, aging). Nominal behaviour is multimodal: a "high" temperature in sunlight can be normal, while the same value in eclipse may not be.

### 4.3 Limitations of threshold-based detection
Out-of-limit (OOL) checking compares each channel against fixed or mode-dependent bounds. It is simple, auditable, and flight-proven, but it (i) ignores context, so a value inside limits may still be abnormal for the current orbit phase; (ii) treats channels independently, so it cannot see abnormal *relationships* (e.g., current rising while voltage sags); (iii) alarms only after a bound is crossed, which can be late for slowly developing faults; and (iv) produces alarm floods during cascading failures, where the first (causal) alarm is buried among consequences [2], [3].

### 4.4 Anomaly detection versus failure diagnosis
*Anomaly detection* answers "is the data unusual?" *Failure diagnosis* answers "which fault is present, where, and why?" Isermann and others distinguish detection, isolation, and identification of faults [4]; spaceflight FDIR adds recovery [2]. A detector may be accurate and still be of little use to an investigator: it does not order events, separate precursors from consequences, or distinguish a sensor fault from a process fault. *Forensics* additionally requires a retrospective, evidence-preserving account that a human can audit.

### 4.5 Need for temporal reasoning
Failures usually develop over time. Whether anomaly *A* began before anomaly *B*, by how long, and whether *A* persisted, are the primary observable clues to propagation. Temporal ordering is *necessary but not sufficient* for causal inference: an earlier event may be a coincidence, a common-cause effect (e.g., eclipse entry), or an artefact of different sensor sampling rates. Rigorous temporal reasoning must therefore model detection delay, onset uncertainty, and sampling effects explicitly.

### 4.6 Need for explainable AI in safety-critical systems
Spacecraft operations are safety- and mission-critical, and operators are accountable for decisions. Opaque scores are difficult to verify, certify, or challenge [5]. Explanations must be *faithful* to what the model computed and must expose supporting evidence and competing explanations; post-hoc explanation methods have known failure modes (correlated features, instability, attention not equating to explanation) that must be tested rather than assumed away [6], [7].

### 4.7 Motivation for mission forensics
After an anomaly or loss of a mission, investigation boards must reconstruct timelines from large telemetry archives, often manually. A system that proposes a timeline, ranks competing hypotheses, and links each claim to specific telemetry evidence could shorten and structure this work, while leaving judgement to engineers. The illustrative event chain used in this paper (voltage anomaly → temperature deviation → communication degradation → subsystem failure) is a *template for the kind of output sought*, not a claimed finding; the numeric offsets in the examples (e.g., 17 or 37 minutes) are illustrative and are not drawn from any mission.

### 4.8 Research question and objectives
**Research question (RQ).** *Can an AI-based temporal and causal-reasoning framework reconstruct the progression and probable root causes of spacecraft failures from heterogeneous telemetry data?*

We decompose this into testable sub-questions and objectives:

| ID | Objective | Associated hypothesis (to be tested) |
|----|-----------|--------------------------------------|
| O1 | Detect anomalies in multivariate telemetry with controlled false-alarm rates | H1: A multivariate learned detector achieves lower detection latency than per-channel thresholds at equal false-alarm rate. |
| O2 | Extract discrete events with estimated onset, duration and ordering, and identify precursors | H2: Event-level temporal reasoning recovers ground-truth event order and precursor lead time better than raw detector outputs. |
| O3 | Model subsystem dependencies as a graph combining expert structure and data evidence | H3: Adding the dependency graph improves root-subsystem identification over temporal ordering alone. |
| O4 | Generate and rank causal hypotheses with explicit alternatives and uncertainty | H4: Ranked hypotheses contain the injected root cause in the top-*k* more often than baselines; confidence is calibratable. |
| O5 | Provide faithful, evidence-linked explanations and structured reports | H5: Explanations cover the ground-truth evidence and are stable under perturbation. |
| O6 | Define a leakage-free evaluation protocol for forensics | — (methodological contribution) |

H1–H5 are hypotheses, **not findings**.

---

## 5. PROBLEM STATEMENT

### 5.1 Inputs
Let the spacecraft expose *n* telemetry channels indexed by *i* ∈ {1,…,n}. The observed telemetry is

```
X(t) = { x₁(t), x₂(t), …, xₙ(t) },   t ∈ 𝒯 = [t₀, t_end]
```

Channel *i* is observed at irregular, channel-specific times {t_{i,k}} with sampling period Δ_i, so *X*(t) is only partially observed at any *t*. We define an observation mask *m_i(t)* ∈ {0,1} (1 if a fresh sample exists). Each channel belongs to exactly one subsystem via σ: {1..n} → 𝒮, where 𝒮 = {Power, Thermal, ADCS, Comms, OBC, Propulsion, Payload, …}. Context variables *c(t)* (eclipse flag, orbit phase, commanded mode, ground-contact flag) are treated as *exogenous covariates*, since they are known or computable and can confound apparent relationships.

A failure time *t_f* is given (or detected) as the first time a predefined failure criterion holds (e.g., safe-mode entry, loss of a subsystem, loss of downlink). Investigation is performed on the window [*t_f* − *L*, *t_f* + *Δ_post*], where *L* is the look-back horizon (a design parameter).

### 5.2 Outputs
BLACK BOX must output the following, each defined formally:

1. **Anomalies.** A set of anomalous intervals per channel, 𝒜_i = {[a, b]}, with scores *a_i(t)* ∈ ℝ≥0.
2. **Events.** Each interval is summarized as an event *e = (i, σ(i), t_on, t_pk, t_off, ŝ, π_e, p_e)*: onset, peak time, offset, severity, persistence, and nominal-data p-value (Section 13).
3. **Precursor events.** Events with *t_on(e) < t_f* that are statistically distinguishable from nominal fluctuations and not explained by exogenous context. Lead time ℓ(e) = *t_f* − *t_on(e)*.
4. **Subsystem interactions.** A weighted directed graph *G = (V, E, w)* over subsystems (or channels), with edge weights representing *evidence for a plausible propagation link*, not established causation.
5. **Failure propagation.** An ordered set of paths through *G* that connect early events to the failure event, each with plausible lags.
6. **Probable root causes.** A ranked list *ℋ = {h₁,…,h_K}*, where each hypothesis *h = (r, π)* names a root event/subsystem *r* and a propagation path π, with a relative plausibility score and listed alternatives.

### 5.3 Formal problem
Given *X*(*t*), context *c*(*t*), a nominal-behaviour training set 𝒟_nom, a subsystem map σ, an expert prior graph *G_prior*, and failure time *t_f*, find the mapping

```
F : (X, c, σ, G_prior, t_f)  →  (Events, G*, ℋ, Report)
```

such that (a) detected events align with ground-truth anomalous intervals; (b) the event order and lead times agree with the ground truth within tolerance; (c) the true root subsystem is within the top-*k* of ℋ; and (d) every claim in Report is traceable to specific telemetry evidence.

### 5.4 Scope statements
* The system is **retrospective (post-event)**, not an onboard real-time controller.
* "Root cause" in this paper means a *probable root cause hypothesis* at the level of subsystem/failure mode, not a component-level verified cause.
* Ground truth for causal structure exists only in synthetic data (known generator). On real data, we can only assess consistency with expert-reviewed timelines.

---

## 6. RESEARCH GAP

Existing approaches are valuable, and each addresses part of the problem. The limitations below are *tendencies of method classes*, not claims about every individual system.

1. **Static threshold systems.** Auditable and certified-in-practice, but context-blind, univariate, and late for gradual drifts; they cannot express relational anomalies, and they produce alarm cascades without indicating which alarm came first *causally* [2], [3].
2. **Isolated anomaly detectors.** Many published detectors output a point-wise or window-wise score and are evaluated by detection metrics alone [8], [9], [10]. The output is typically not structured into events with onset, duration, and ordering across subsystems.
3. **Black-box deep learning.** Deep detectors (LSTM, Transformer, VAE-based) can capture non-linear multivariate dependencies [9], [10], [11], [12], but offer limited insight into *why* a window scored high, and attributions can be unfaithful or unstable [6], [7], [13].
4. **Detection without sequence reconstruction.** A detector may flag the final failure but not the earlier, weaker precursors. Reported metrics often reward overlap with labelled ranges, not the correct *order* of events or the lead time, and common evaluation conventions (e.g., point adjustment) can overstate performance [14], [15].
5. **Missing interpretable failure explanations.** Even when detection is explained at feature level, the link from "feature X is important" to "subsystem A probably triggered subsystem B, with these alternatives" generally requires expert effort. Knowledge-based and model-based diagnosis can supply this structure [4], [16] but typically requires hand-built models per spacecraft.

**Specific gap addressed.** Prior work provides strong components (detectors, change-point methods, causal discovery, knowledge representation, attribution). We are not aware of a *claim* that the following combination has been validated end-to-end for spacecraft telemetry forensics (the literature search in Phase 1 must confirm or refute this): a single pipeline that (i) turns multivariate detector output into time-stamped events, (ii) estimates ordering and lead time with quantified uncertainty and nominal-data significance, (iii) combines an expert subsystem graph with data-driven lagged-dependence evidence, (iv) produces ranked, *explicitly hypothetical* root-cause paths with alternatives, and (v) is evaluated with **sequence-level** metrics (ordering, lead time, top-*k* root cause, evidence coverage) under a leakage-free protocol. This project aims to *specify and test* that combination, not to assert that nothing similar exists.

---

## 7. RELATED WORK

For each area we summarize what has been done, common methods, limitations, and how BLACK BOX differs.

### 7.1 Spacecraft health monitoring
*What has been done.* Operational monitoring relies on limit checking, expert rules, and FDIR hierarchies, with ground analysts trending housekeeping data; surveys cover FDIR for small satellites [2], and mission design texts describe subsystem structure and telemetry [1]. Data-driven approaches include Inductive Monitoring System (IMS), which learns nominal clusters of system vectors (verify details of [3]) and telemetry mining for diagnosis [17] (verify).
*Limitations.* Rules and limits are labour-intensive per mission, brittle to mode changes, and mostly not designed to produce retrospective event narratives.
*BLACK BOX differs* by treating thresholds as one baseline, adding multivariate learned detection, and focusing the output on reconstructed event sequences.

### 7.2 Telemetry anomaly detection
*What has been done.* LSTM-based forecasting with nonparametric dynamic thresholding was evaluated on spacecraft telemetry from NASA SMAP and MSL, with expert-labelled anomalies [8]. Other work applies clustering, one-class methods, and forecasting residuals to housekeeping data.
*Limitations.* Datasets are anonymized and channel-level; anomalies are labelled, but not as subsystem-causal chains. Per-channel models ignore cross-channel causality [8], and benchmark labelling quality has been questioned across time-series anomaly datasets [15].
*BLACK BOX differs* by operating on multi-channel windows and post-processing detection into events used by downstream reasoning.

### 7.3 Multivariate time-series anomaly detection
*What has been done.* Broad surveys classify methods (statistical, distance/density, reconstruction, forecasting, deep) [18], [19], [20]. Representative methods include Isolation Forest [21], One-Class SVM [22], and deep generative approaches such as stochastic RNNs for multivariate series [10].
*Limitations.* Scores are produced without explicit semantics; thresholds are dataset-tuned; evaluation protocols vary and can be misleading [14], [15].
*BLACK BOX differs* by defining thresholds from nominal-only calibration, reporting event-level metrics, and treating the detector as the first stage of a reasoning pipeline.

### 7.4 LSTM- and Transformer-based detection
*What has been done.* LSTMs model temporal dependence [23] and were applied to anomaly detection via prediction error [9] and encoder-decoder reconstruction [11]. Transformers [24] have been adapted, e.g., Anomaly Transformer uses an "association discrepancy" criterion [12].
*Limitations.* Transformers need more data and tuning; with small, scarce spacecraft datasets, over-fitting is a risk. Attention weights should not be assumed to be explanations [13].
*BLACK BOX differs* by choosing an LSTM autoencoder as primary model for tractability and interpretable per-channel residuals, and treating a Transformer variant as an optional extension to compare (Section 12).

### 7.5 Autoencoders
*What has been done.* Autoencoders and variants learn a compact representation of nominal data; anomalies produce high reconstruction error. Reviews cover deep one-class and reconstruction-based approaches [25], [26]. LSTM encoder-decoder models apply this to multi-sensor sequences [11].
*Limitations.* Autoencoders can reconstruct anomalies well if capacity is too high; reconstruction error mixes several channels, hiding which one drives it unless residuals are decomposed.
*BLACK BOX differs* by decomposing error into per-channel residuals normalized by nominal statistics, which feed event extraction and attribution.

### 7.6 Change-point detection
*What has been done.* Offline and online methods include CUSUM, PELT [27], and Bayesian online change-point detection [28]; surveys compare them [29].
*Limitations.* Sensitive to penalty/prior choices, noise, and seasonality; results on raw telemetry with orbital periodicity are poor unless deseasonalized.
*BLACK BOX differs* by applying change-point detection to *normalized residual/score series* (after context removal), using it to refine onset times, not to detect faults by itself.

### 7.7 Fault diagnosis
*What has been done.* Model-based diagnosis (residual generation, parity, observers), process-history methods, and qualitative/knowledge-based reasoning are classic categories [4], [16]. Spacecraft FDIR layers combine detection with isolation and recovery [2].
*Limitations.* Model-based methods need accurate physics models; knowledge-based methods need curated rules; data-driven classifiers need labelled faults that are rare in space systems.
*BLACK BOX differs* by using a light expert graph rather than a full physical model, and by generating *hypotheses with alternatives* instead of one classifier label.

### 7.8 Causal inference
*What has been done.* Structural causal models and do-calculus [30]; constraint-based discovery [31]; Granger causality for time series [32]; transfer entropy [33]; PCMCI for large nonlinear time series with autocorrelation [34].
*Limitations.* These methods assume (e.g.) causal sufficiency, stationarity, correct lag specification, and adequate sampling; feedback loops and common drivers (such as orbital cycles) violate or complicate them. Statistical output is evidence for association with temporal precedence, not proof of causation [30], [32].
*BLACK BOX differs* by using these tools as **evidence generators** feeding a hypothesis score, conditioning on known exogenous context, and using the term *causal hypothesis* / *causal consistency* throughout. Causal claims about real spacecraft are *not* made.

### 7.9 Knowledge graphs
*What has been done.* Knowledge graphs represent entities and relations and support reasoning and retrieval; surveys cover construction and application [35]. Probabilistic graphical models and dynamic Bayesian networks represent temporal dependencies [36], [37].
*Limitations.* Building and maintaining spacecraft-specific graphs requires expert time; graph edges can encode assumptions as facts.
*BLACK BOX differs* by storing edge *provenance* (expert vs. data-derived) and evidence strength, so that assumptions are visible and testable.

### 7.10 Explainable AI
*What has been done.* Model-agnostic attribution (LIME [38], SHAP [39]), gradient-based attribution (Integrated Gradients [40]), and arguments for inherently interpretable models in high-stakes domains [5]; frameworks for evaluating interpretability [41].
*Limitations.* Attributions can be unstable, can misrepresent correlated features, and are not by themselves causal explanations [6], [39], [5]. Attention weights may not constitute explanations [13].
*BLACK BOX differs* by (i) using the autoencoder's native residual decomposition as the primary attribution, (ii) applying SHAP/Integrated Gradients as cross-checks, (iii) measuring explanation stability, and (iv) producing evidence chains rather than only feature rankings.

### 7.11 AI-assisted spacecraft operations
*What has been done.* ML for anomaly detection, trending, and operator assistance in ground segments; benchmarking efforts for satellite telemetry exist (e.g., an ESA anomaly benchmark [42], verify). Large language models have been proposed generally for summarization and retrieval-augmented tasks [43], with documented hallucination risks [44].
*Limitations.* Operational adoption is cautious because of verification and validation demands; LLM outputs can be unsupported by data [44].
*BLACK BOX differs* by constraining the LLM to verbalize a *closed, structured evidence object* and by validating each generated statement against that object (Section 18).

### 7.12 Summary comparison

| Area | Typical output | Event ordering | Cross-subsystem links | Alternatives/uncertainty | Evidence-linked explanation |
|------|---------------|---------------|-----------------------|--------------------------|----------------------------|
| Threshold/OOL | Alarm | Alarm time only | No | No | Rule text |
| Per-channel ML detector | Score/label | Implicit | No | Limited | Rarely |
| Multivariate deep detector | Score/label | Implicit | Implicit (latent) | Limited | Post-hoc attribution |
| Model-based diagnosis | Fault class | Possible | Via physics model | Possible | Residual logic |
| **BLACK BOX (proposed)** | Events + ranked hypotheses + report | Explicit, with uncertainty | Explicit graph with provenance | Explicit | Evidence chains |

*The BLACK BOX row describes design intent, not validated capability.*


---

## 8. PROPOSED SYSTEM

**[Proposed]** Architecture (linear flow with feedback of context and priors):

```
Telemetry Sources → Preprocessing → Synchronization → Feature Engineering
→ Anomaly Detection → Temporal Event Extraction → Subsystem Dependency Modeling
→ Causal Hypothesis Generation → Failure Reconstruction → Explainable AI Layer
→ Mission Investigation Report
```

| # | Layer | Input → Output | Key design decision and rationale |
|---|-------|----------------|-----------------------------------|
| 1 | Telemetry sources | Raw housekeeping frames, event logs, command logs → per-channel timestamped samples with units, subsystem tag σ(i) | Keep *commands and mode changes* as first-class data: they are known interventions and the main confounders. |
| 2 | Preprocessing | Samples → cleaned samples + quality flags | Cleaning must never silently remove evidence; anomalies and glitches are flagged, not deleted (Section 11). |
| 3 | Synchronization | Asynchronous samples → common grid X̃(kΔ) with staleness mask | Temporal ordering is the core output, so timestamp alignment error must be modelled and propagated as ordering uncertainty. |
| 4 | Feature engineering | Aligned data → windows, engineered features, context-conditioned residual inputs | Features encode physics-relevant structure (rates of change, power = V·I, orbit phase) so models need less data. |
| 5 | Anomaly detection | Windows → per-channel and subsystem anomaly scores a_i(t), A_s(t) | Baseline (Isolation Forest) and primary (LSTM autoencoder) so gains over simple methods are measurable. |
| 6 | Temporal event extraction | Score series → events (onset, peak, offset, severity, persistence, p-value) | Converts continuous scores to discrete, auditable objects; onset estimated by change-point refinement. |
| 7 | Dependency modeling | Events + expert prior + lagged statistics → weighted directed graph G* with provenance | Hybrid graph limits data requirements and exposes assumptions. |
| 8 | Causal hypothesis generation | Events, G* → ranked hypotheses h=(r,π) | Scoring is a transparent weighted combination, not a learned black box, to allow auditing. |
| 9 | Failure reconstruction | Hypotheses + events → chronological narrative structure | Deterministic algorithm so the same evidence yields the same timeline. |
| 10 | Explainable AI layer | Models, events, hypotheses → attributions, evidence chains, alternatives | Native residual attribution first; SHAP/IG as cross-checks; stability tested. |
| 11 | Mission investigation report | Structured evidence object → human-readable report (template, optionally LLM-verbalized) | Report is a rendering of structured evidence; unsupported statements are rejected by a validator. |

Cross-cutting principle: **every downstream object stores pointers to upstream evidence** (channel, time interval, score, model version, parameter values), enabling audit and replay.

---

## 9. TELEMETRY DATA MODEL

### 9.1 Parameter taxonomy
The table is a *proposed generic* data model. Sampling rates are illustrative design choices for the synthetic generator, **not** the specification of any real mission.

| Group | Parameter | Type | Unit | Illustrative sampling | Typical noise / issue | Subsystem |
|-------|-----------|------|------|-----------------------|-----------------------|-----------|
| Thermal | Temperature (battery, panel, transmitter, OBC) | Continuous | °C | 0.1–1 Hz | Quantization, sensor drift | Thermal |
| Power | Bus voltage | Continuous | V | 1 Hz | Load-switching ripple | Power |
| Power | Bus/load current | Continuous | A | 1 Hz | Spikes at switching | Power |
| Power | Battery state of charge (SoC) | Continuous (estimated) | % | 0.1 Hz | Estimator error, not a direct measurement | Power |
| Power | Solar array power | Continuous | W | 1 Hz | Zero in eclipse; cosine-law dependence on pointing | Power |
| Attitude | Attitude quaternion/Euler error | Continuous | deg | 1 Hz | Estimator-dependent | ADCS |
| Attitude | Gyroscope rate | Continuous | deg/s | 1–10 Hz | Bias drift, random walk | ADCS |
| Comms | RSSI / SNR | Continuous | dBm / dB | 0.1–1 Hz | Pointing/range/weather dependent; only valid during contact | Comms |
| Environment | Radiation counter / particle flux | Count | counts/s | 0.1 Hz | Poisson noise, SAA/orbit dependence | Payload/Env |
| Computing | CPU load, memory use, reset counter, EDAC/SEU counters | Continuous / counter | %, count | 0.01–0.1 Hz | Monotonic counters, rollovers | OBC |
| States | Subsystem mode/health flags | Categorical | enum | Event-driven | Mode transitions are commanded or autonomous | All |
| Actuators | Thruster/valve status, reaction-wheel speed | Binary / continuous | — | Event-driven / 1 Hz | Duty cycles | Propulsion/ADCS |
| Context | Eclipse flag, orbit phase, ground-contact flag, command log | Binary/continuous | — | Computed/event | Must be reliable | Exogenous |

### 9.2 Data-handling issues and design decisions
* **Sampling rates.** Channels have different rates. We resample to a common grid Δ (Section 11.4). Choosing Δ trades temporal resolution against noise and compute; the rule is Δ ≤ ½·(shortest anticipated precursor lag) so that ordering is resolvable. Ordering between events closer than Δ is declared *indeterminate* rather than guessed.
* **Missing values.** Types: (i) random dropouts, (ii) *structured* gaps (no downlink outside ground contact), (iii) sensor-dead flatlines. They require different treatment; imputing a structured gap hides the gap and may fabricate evidence (Section 11.1).
* **Noise.** Modelled per channel as additive Gaussian plus channel-specific artefacts (quantization, spikes). Filtering is conservative to avoid delaying onset estimates.
* **Normalization.** Robust per-channel (and per-operating-mode) scaling fit on nominal training data only.
* **Synchronization.** Timestamps may be spacecraft clock vs. ground receipt time with offsets; we assume a corrected common timeline with bounded error ε_t, a limitation noted in Section 26.
* **Telemetry windows.** Window length *W* should cover at least one dominant dynamic period of interest; because orbits impose a quasi-periodic structure, we also provide orbit-phase as an input feature. Stride *s* < W gives overlapping windows; overlap matters for leakage (Section 21).

---

## 10. DATASET STRATEGY

### 10.1 Categories
**A. Real spacecraft telemetry datasets.** *Candidates (availability, licensing, and annotation granularity must be verified in Phase 2):*
* **NASA SMAP/MSL telemetry anomaly dataset** released with Hundman et al. [8]: expert-labelled anomalies but anonymized channels; limited subsystem semantics, so suitable for **detection-only** validation, not causal evaluation. Known labelling weaknesses are discussed in [15].
* **ESA Anomaly Detection Benchmark (ESA-ADB)** for satellite telemetry [42] (verify content, annotation fields, licence): potentially multi-channel with mission context; to be checked for whether subsystem-level or root-cause annotations exist.
* **OPS-SAT-derived telemetry anomaly data** (verify existence, license, citation before use).
* Community-received amateur satellite beacons (e.g., via open networks) are possible but are typically sparse, mission-specific, and require decoding; treated as exploratory only.

*No claim is made that any of these contain annotated multi-subsystem failure chains.*

**B. Public space/engineering datasets (proxy).** Battery degradation and run-to-failure data (e.g., NASA Prognostics Center of Excellence repositories), thermal and power test data, public IMU/gyro noise datasets. These are *component-level proxies* used to calibrate the realism of synthetic models (battery resistance growth, sensor noise), not spacecraft failure-chain data.

**C. Synthetic telemetry.** Generated by a coupled, parameterized simulator (below). The generator's *structural equations define the ground-truth causal graph*, which is what makes causal-consistency evaluation possible at all.

**D. Simulated failure scenarios.** Fault-injected variants of C with labelled onset, propagation, and failure times.

### 10.2 Scientifically defensible synthetic generation methodology **[Proposed]**
1. **Nominal backbone.** A low-order coupled model of a LEO-like satellite (illustrative orbit period ~90–100 min, eclipse fraction as a parameter).
   * Power: `P_sa(t) = P_max · cosθ_sun(t) · η_deg · 1[sunlit(t)]`; `dSoC/dt = (I_chg − I_load)/C_batt`; `V_bus = V_oc(SoC) − I_batt · R_int`.
   * Thermal (lumped): `C_th · dT/dt = Q_int(t) + Q_ext(t) − k·(T − T_env(t))`, with `Q_int = I²R_int + P_load_dissipation`.
   * ADCS: wheel/gyro model, `θ_err(t)` driven by disturbance torque and controller; gyro `ω_meas = ω + b(t) + n`, with bias random walk.
   * Comms: `SNR(t) = SNR₀ − g(θ_err) − h(T_trx) − path_loss(range)`, valid only in contact windows.
   * Environment/computing: Poisson radiation counts modulated by orbit phase; CPU load tied to mode; SEU counter increments with radiation flux.
2. **Realism calibration.** Parameter ranges chosen from textbook/engineering references [1] and public proxies (Category B); all values logged. Because the generator is simplified, **absolute numbers are not claimed to match any real spacecraft**; the aim is realistic *structure* (coupling, lags, noise, gaps).
3. **Randomization.** Each episode draws parameters from distributions (noise levels, coupling strengths, lags, onset times, gap patterns) with a random seed; the seed and parameters are stored.
4. **Fault injection** modifies specific structural equations or parameters at a labelled time *t_inj*, producing a known propagation path; the "failure" is a defined criterion (e.g., SoC below limit → safe mode).
5. **Hard cases.** Include confounders (eclipse-driven co-variation), sensor-only faults (no process change), benign mode changes, concurrent independent anomalies, and telemetry gaps.
6. **Nominal-only episodes** to measure false-alarm rates.
7. **Held-out generator regimes** (parameter ranges unseen in training) to test generalization (Section 21).

### 10.3 Failure scenarios
Quantities in brackets are `[TO BE EXPERIMENTALLY DETERMINED]` design parameters.

**Scenario 1 — Thermal runaway (battery/electronics).**
* *Normal:* Temperature oscillates with orbit (sun/eclipse); heaters cycle under thermostat control.
* *Fault injection:* Increase heat generation Q_int by a growing term (internal short or stuck-on load) and/or degrade the heat rejection coefficient *k*, starting at *t_inj*.
* *Telemetry changes:* Temperature rise rate exceeds the nominal for the orbit phase; current draw shifts; voltage sag as R_int increases with temperature; later comms SNR drops if transmitter temperature rises.
* *Expected precursors:* Slope change in battery temperature (change point) before any hard limit is crossed; reduced thermal recovery in eclipse.
* *Progression:* Thermal drift → voltage/current anomaly → protection trip or safe-mode entry (failure criterion) `[lag range TBD]`.

**Scenario 2 — Power subsystem degradation.**
* *Normal:* Array output follows cosine law; SoC charge/discharge cycle repeats each orbit.
* *Fault injection:* Gradual array degradation η_deg(t) decrease and/or battery capacity fade and internal-resistance increase.
* *Telemetry changes:* Lower peak array power; deeper SoC discharge; larger voltage dip during eclipse; heater demand rises (thermal effect).
* *Expected precursors:* Trend in orbit-minimum SoC; increased voltage ripple under load.
* *Progression:* SoC trend → undervoltage events → load shedding → comms or payload shutdown → failure criterion.

**Scenario 3 — Attitude-control failure.**
* *Normal:* Pointing error small; wheel speeds within range; gyro bias small.
* *Fault injection:* Gyro bias jump or drift, or wheel friction increase/stall, at *t_inj*.
* *Telemetry changes:* Pointing error grows; wheel current rises; array pointing degrades (power falls); antenna mispointing reduces SNR.
* *Expected precursors:* Gyro-residual change-point; wheel current anomaly before pointing error exceeds limits.
* *Progression:* ADCS anomaly → power generation reduction and SNR degradation → safe mode (failure criterion).
* *Hard variant:* sensor-only fault where the gyro lies but true attitude is fine (tests sensor-vs-process discrimination).

**Scenario 4 — Radiation-induced anomaly.**
* *Normal:* Radiation counts follow orbit-dependent baseline; EDAC corrects rare upsets.
* *Fault injection:* Radiation-flux burst (event-like) increasing SEU rate; optionally a latch-up-like current spike or processor reset loop.
* *Telemetry changes:* EDAC/SEU counters jump; CPU resets; transient current spike; possible corrupted sensor reading or mode flip.
* *Expected precursors:* Radiation count increase and counter changes *preceding* resets; may be seconds to minutes, so sampling rate matters.
* *Progression:* Environment spike → OBC error counters → reset/mode change → transient loss of function → failure criterion.
* *Confounder:* Radiation spike coinciding with, but not causing, an unrelated thermal fault.

---

## 11. DATA PREPROCESSING

### 11.1 Missing-value handling
Classify each missing run by cause using the contact/command log:
* *Structured gap* (no contact): **do not impute**; keep mask *m_i(t)=0*; models receive the mask, and event extraction does not create events inside gaps.
* *Short random dropout* (≤ g_max samples, `g_max` TBD): bounded last-observation-carried-forward or linear interpolation, with a "staleness" feature τ_i(t) = t − t_last,i.
* *Long unplanned gap*: flagged as a possible evidence-loss interval; reported explicitly.
Rationale: aggressive imputation can create artificial smoothness that either hides precursors or creates false ones.

### 11.2 Outlier treatment
Single-sample spikes (e.g., telemetry bit errors) are detected by a Hampel filter: sample *x_k* is flagged if
```
| x_k − median(x_{k−h..k+h}) | > κ · 1.4826 · MAD(x_{k−h..k+h})
```
Flagged samples are *marked* and replaced with the local median **only in the model input copy**; the raw value remains in the evidence store. Rationale: a "glitch" might itself be the fault signature.

### 11.3 Normalization
Robust scaling with nominal training statistics (and per operating mode *q* where modes are distinct):
```
x̃_i(t) = ( x_i(t) − med_{i,q} ) / ( 1.4826 · MAD_{i,q} + ε )
```
Robust statistics reduce sensitivity to contaminated "nominal" data. Statistics are computed **on training nominal data only** (Section 21). Counters are differenced first (Δx), with rollover handled; categorical states are one-hot or embedding encoded.

### 11.4 Resampling and synchronization
Choose grid step Δ. For channel *i* with native period Δ_i:
* If Δ_i < Δ: aggregate (mean, plus min/max/std to preserve extremes).
* If Δ_i > Δ: hold last value (zero-order hold) with staleness feature; do not interpolate across state changes.
Timestamps are corrected for known offsets (clock drift model `t_true = t_meas − (a + b·t_meas)`), with residual error bound ε_t carried as an *ordering tolerance*: two onsets with |t_on,a − t_on,b| < ε_t + Δ are treated as simultaneous/indeterminate.

### 11.5 Sliding windows
For window length *W* (samples) and stride *s*:
```
w_k = [ x̃(kΔ·s − (W−1)Δ), …, x̃(kΔ·s) ]  ∈ ℝ^{W×n}
```
Window labels (if used for supervised evaluation) are assigned from ground-truth intervals by an overlap rule (≥ ρ fraction). *W* should span at least one local dynamic period; selected by validation episodes.

### 11.6 Noise filtering
Light causal smoothing only (e.g., exponentially weighted moving average, EWMA, with α):
```
x̄(t) = α·x̃(t) + (1−α)·x̄(t−Δ)
```
A causal filter adds delay ≈ (1−α)/α samples, which biases onset estimates later; this delay is measured and corrected in onset refinement (Section 13). Non-causal (zero-phase) filtering is allowed for *offline forensic* analysis but must be disabled in any claim about real-time latency.

### 11.7 Feature scaling and engineered features
Per-window features (for Isolation Forest/One-Class SVM; the deep model uses raw windows): mean, std, min, max, slope (least squares), second difference, spectral energy in orbit-period band, cross-channel features (e.g., power P=V·I; residual of V vs SoC relationship), and context (orbit phase sin/cos, eclipse flag). Features are standardized with training-fold statistics.

---

## 12. ANOMALY DETECTION

### 12.1 Candidate models compared

| Model | Idea | Advantages | Limitations for spacecraft telemetry |
|-------|------|-----------|--------------------------------------|
| Isolation Forest [21] | Random trees isolate anomalies in fewer splits | Fast, few assumptions, works on engineered features, no labels | Window-level only; no temporal modelling unless features encode it; sensitive to irrelevant features; contamination parameter needed |
| One-Class SVM [22] | Boundary around nominal data in kernel space | Principled; works with small data | Kernel/ν tuning; scales poorly; no temporal modelling; multimodal nominal behaviour is hard |
| Autoencoder (dense) | Compress/reconstruct window | Learns multivariate relations; per-feature residual | Ignores order within window unless flattened; may over-generalize |
| LSTM autoencoder [11], [23] | Sequence encoder-decoder | Captures temporal dependency; per-channel/time residual; modest data needs | Training instability; long-range limits; reconstruction can generalize to anomalies |
| Temporal CNN (TCN) [45] | Dilated causal convolutions | Parallel training; long receptive fields; stable | Fixed receptive field; less natural for irregular sampling |
| Transformer-based [12], [24] | Self-attention over window | Long-range dependencies | Data-hungry; many hyperparameters; attention ≠ explanation [13]; heavy for small projects |

### 12.2 Chosen baseline and primary model
* **Baselines (reporting all):** (i) per-channel static/dynamic threshold (OOL-like, mode-aware); (ii) **Isolation Forest** on engineered window features. Isolation Forest is the principal ML baseline since it is label-free, quick, and standard.
* **Primary model: LSTM autoencoder.** Justification: temporal structure is essential; per-channel, per-time residuals give *native attribution* needed for forensics; it trains on nominal data only (anomalies are rare/unlabelled); moderate size suits project-scale compute. **Hypothesis H1 states it will outperform baselines; this is not assumed.**
* **Optional extensions for comparison:** TCN autoencoder; Transformer encoder (compared, not presumed better).

### 12.3 Anomaly-score computation (primary model)
Let window *w* with input X ∈ ℝ^{W×n} be reconstructed as X̂. Per-channel, per-time residual:
```
r_i(t) = x̃_i(t) − x̂_i(t)
```
Nominal residual statistics (μ_i, σ_i) estimated on a *validation nominal set* (not the training set, to avoid optimistic residuals):
```
z_i(t) = ( |r_i(t)| − μ_i ) / σ_i          (normalized channel residual)
```
Smoothed channel score (causal EWMA, parameter β):
```
a_i(t) = β·max(z_i(t),0) + (1−β)·a_i(t−Δ)
```
Subsystem score aggregates channels in subsystem *s* by top-*k* mean (robust to a few noisy channels):
```
A_s(t) = mean of top-k { a_i(t) : σ(i) = s }
```
System score: `A(t) = max_s A_s(t)`. Overlapping windows produce multiple reconstructions of the same time step; they are averaged.
Isolation Forest provides window score `s_IF(w) = 2^{−E[h(x)]/c(N)}` per [21].

**Thresholding.** Thresholds θ come from the nominal validation distribution (e.g., high quantile, or peaks-over-threshold with extreme-value fitting), set to target a false-alarm rate per day of nominal operation `[target TBD]`. Dynamic thresholding [8] is a compared alternative. Thresholds are never tuned on the test episodes.

**Context handling.** Orbit-phase features are fed to the model so that eclipse-driven variation is "expected"; in addition, an ablation without context features quantifies the confounding effect.

---

## 13. TEMPORAL REASONING

### 13.1 Event definition from scores
For each channel (and subsystem) score series *a(t)*, use **hysteresis thresholds** θ_high > θ_low with minimum persistence *m*:
* **Detection time** t_det: first time a(t) ≥ θ_high for ≥ m consecutive samples.
* **Event offset** t_off: first time after detection a(t) < θ_low for ≥ m samples.
* **Duration** D = t_off − t_on (or censored at t_f if still active).
Hysteresis avoids chatter and is appropriate because telemetry noise would cause repeated crossings of a single threshold.

### 13.2 Anomaly onset and change points
Detection time lags the true onset. We refine onset in two steps:
1. **Backtracking.** Search backward from t_det to the last time a(t) was within the nominal band: t_bt.
2. **Change-point refinement.** Run a change-point detector on the normalized residual series in [t_bt − Δ_w, t_det] — CUSUM, with S_k = max(0, S_{k−1} + z_k − κ), onset ≈ last zero of S before alarm; or PELT [27] with penalty tuned on nominal data; or Bayesian online CPD [28] as alternative. The refined onset is t_on, with a **onset uncertainty interval** [t_on⁻, t_on⁺] from the change-point posterior or bootstrap.
Detector smoothing delay (Section 11.6) is subtracted.

*Why the residual and not raw telemetry:* raw telemetry has orbital periodicity that triggers many "change points" unrelated to faults; the residual (after the nominal model explains periodic behaviour) isolates departures.

### 13.3 Event significance (distinguishing precursors from noise)
For each event, compute an empirical nominal p-value by comparing its statistic (e.g., peak a or integrated score ∫a dt) with the distribution of the same statistic over matched-length windows from nominal-only episodes:
```
p_e = ( 1 + #{ nominal windows with stat ≥ stat(e) } ) / ( 1 + N_nom )
```
Events with p_e above α (multiple-comparison controlled, e.g., Benjamini–Hochberg across channels) are not labelled precursors. This gives a data-driven protection against calling ordinary fluctuations "precursors".

### 13.4 Event ordering
Define a partial order: event *a* precedes *b* if `t_on⁺(a) < t_on⁻(b)` (intervals do not overlap). Otherwise they are *concurrent/indeterminate*. Ordering confidence can be reported as `P(t_on(a) < t_on(b))` under the onset posterior or bootstrap. Output is a partial order (DAG of precedence), not necessarily a total order.

### 13.5 Precursor events and lead time
An event *e* is a **precursor** if: (i) t_on(e) < t_f; (ii) p_e ≤ α; (iii) it persists or recurs (persistence π_e ≥ π_min); (iv) it is not explained by context (e.g., coincident eclipse entry, commanded mode change). Lead time:
```
ℓ(e) = t_f − t_on(e),    with uncertainty  [ t_f − t_on⁺ , t_f − t_on⁻ ]
```

### 13.6 How the system can determine "an anomaly occurred 37 minutes before final failure"
**[Proposed procedure, illustrative numbers only]**
1. Establish t_f from the failure criterion (e.g., the timestamp of safe-mode entry flag).
2. Compute scores over [t_f − L, t_f]; extract events.
3. For the earliest significant event (say, power channel), refine onset t_on by CUSUM/PELT.
4. Compute ℓ = t_f − t_on. If ℓ = 37 min, report "onset estimated 37 min before failure (uncertainty ±u min)".
5. Validity depends on: Δ and ε_t (resolution), look-back L ≥ 37 min, detector sensitivity (a weaker precursor may exist but remain below θ), and significance p_e. The claim is "earliest *detectable* significant deviation", not "the true physical start". The latter is verifiable only in synthetic data where t_inj is known; there the **lead-time error** `|ℓ̂ − ℓ_true|` is measurable.

### 13.7 Temporal dependency measures between events
For event pairs (a, b), estimate an empirical lag distribution across episodes (when multiple examples exist) or via lagged cross-correlation / transfer entropy on residual series [33]:
```
C_ab(τ) = corr( a_a(t), a_b(t+τ) ),   τ ∈ [0, τ_max]
```
τ̂_ab = argmax; plausible lag windows are compared with expert-specified physical delay ranges for the link.

### 13.8 Temporal scoring methodology
Define a **precursor significance score** for event *e*:
```
Ψ(e) = w₁·σ̃(ŝ_e) + w₂·π̃_e + w₃·(−log₁₀ p_e)/Z + w₄·u(e) ,   Σ w = 1
```
where ŝ_e is peak severity (rank-normalized σ̃), π̃_e normalized persistence, p_e nominal p-value (Z a normalizer), and u(e)=1/(1+width of onset interval) rewards well-localized onsets. Weights *w_j* are `[TO BE EXPERIMENTALLY DETERMINED]` on validation episodes, with equal weights as default; sensitivity analysis is required.

For **pairwise temporal consistency** of an edge a→b in a hypothesis:
```
T(a→b) = 1[ t_on⁺(a) ≤ t_on⁻(b) ] · exp( −(τ_ab − τ̄_link)² / 2σ_link² )
```
i.e., ordering respected AND observed lag τ_ab compatible with the expected lag window of the link (τ̄_link, σ_link from expert prior).

---

## 14. SUBSYSTEM DEPENDENCY MODEL

### 14.1 Graph definition
`G = (V, E, w)`; nodes *V* are subsystems (coarse level) and optionally channels (fine level). A directed edge u→v means "a disturbance in u can plausibly influence v". Example *prior* edges (illustrative, to be reviewed by domain experts; real spacecraft are not chains):

```
Power  → Thermal    (dissipation I²R, heater load)
Thermal → Power     (battery performance vs temperature)
Power  → Comms      (transmitter power, bus voltage)
Thermal → Comms     (transmitter/amplifier temperature)
ADCS   → Power      (array pointing)
ADCS   → Comms      (antenna pointing)
Power  → ADCS       (wheel/sensor supply)
Environment → OBC   (radiation → upsets)
OBC    → (all)      (mode logic, reset)
```
The linear chain "Power → Thermal → Communication → Attitude" in the task description is an *illustrative path*; the full graph is a directed graph with cycles (e.g., Power ↔ Thermal), which is realistic and must be handled (Section 14.3).

### 14.2 What nodes and edges represent
* **Node states:** per-subsystem anomaly status and score A_s(t); discrete states (nominal, degraded, anomalous, failed) as an interpretable summary.
* **Edge attributes:** direction; **provenance** (expert / literature / data); expected lag window [τ_min, τ_max]; mechanism text (e.g., "heat dissipation"); **data-evidence weight** w_data ∈ [0,1] from lagged statistics on nominal+fault data; **combined weight**
```
w_uv = λ·w_prior(u,v) + (1−λ)·w_data(u,v),     λ ∈ [0,1]
```
* **Observed relationships** (statistical associations in data) are kept separate from **potential propagation paths** (paths in the prior graph consistent with timing). Data-only edges absent from the prior are flagged "unexplained association: needs expert review", not silently accepted.

### 14.3 Method comparison

| Method | Strengths | Weaknesses for this task | Role in BLACK BOX |
|--------|-----------|--------------------------|-------------------|
| Knowledge graph (property graph) | Encodes domain structure, provenance, mechanisms; human-auditable | Manual construction; no uncertainty by itself | **Backbone for prior graph and evidence store** |
| Bayesian network | Probabilistic reasoning, handles uncertainty | Static; acyclic; CPT estimation needs data | Not primary |
| Dynamic Bayesian network (DBN) [36], [37] | Temporal; cycles via time slices | Needs structure/parameter learning, discretization, much data | **Future work / optional comparison** |
| Granger causality [32] | Simple lagged predictive test | Linear; assumes stationarity; confounders (shared drivers) give false links; only *predictive* precedence | **Evidence generator** (on residuals, conditioned on context) |
| Transfer entropy [33] | Non-linear information flow | Data-hungry; estimator sensitivity | Optional evidence generator |
| PCMCI [34] | Handles autocorrelation, high dimension, lags | Assumes causal sufficiency, stationarity | **Optional evidence generator** if data permit |
| Structural causal model (SCM) [30] | Formal interventions/counterfactuals | Requires known or identified structure; real spacecraft SCM not known | **Used for the synthetic generator**, enabling ground-truth evaluation; for real data only as a hypothesis format |

**Recommendation.** A **hybrid**: a knowledge-graph prior (expert structure + lag windows) combined with lagged-dependence evidence (Granger/PCMCI-style tests on context-adjusted residual series) to weight edges, with SCM used in the *simulator* for ground truth. Rationale: spacecraft data are scarce (arguing against data-hungry DBN learning), expert knowledge of subsystem coupling is strong, and the investigation needs auditable assumptions. We make **no claim of causal certainty from correlation**: identifiability would require assumptions (sufficiency, stationarity, correct lag, no hidden confounders) that cannot be verified in real telemetry [30], [34].

---

## 15. CAUSAL ANALYSIS

### 15.1 What is generated
A **causal hypothesis** *h = (r, π)*: a proposed root event/subsystem *r* and an ordered path π = (r → v₁ → … → v_m → failure) through the dependency graph. The claim is *"the observed data are consistent with this propagation"*, never *"this proved the cause"* (term: **causal consistency**).

### 15.2 Evidence components
For each candidate hypothesis, five evidence components are computed, each in [0,1]:

1. **Temporal precedence T(h).** Mean pairwise temporal consistency over path edges, T(a→b) (Section 13.8). Precedence is necessary for a causal reading but not sufficient.
2. **Dependency structure D(h).** Product or mean of combined edge weights w_uv along π; a path using edges with no prior or data support gets low D.
3. **Statistical evidence E(h).** For each edge, a lagged test (e.g., Granger-type F-test or conditional-independence test) on residual series **conditioned on context c(t)** and on other candidate parents; p-values are corrected for multiple testing (FDR). E(h) = aggregated (1 − p̃).
4. **Domain knowledge K(h).** Does a physical mechanism for each edge exist in the prior with a lag window containing the observed lag? Binary or graded by expert.
5. **Coverage/parsimony C(h).** Fraction of significant events explained by π (coverage) minus a penalty for unexplained significant events and for path length (parsimony).

### 15.3 Hypothesis score and confidence
```
S(h) = α_T·T(h) + α_D·D(h) + α_E·E(h) + α_K·K(h) + α_C·C(h) − λ_u·U(h)
```
U(h) penalizes significant events inconsistent with *h* (unexplained). Weights `α_·` are `[TO BE EXPERIMENTALLY DETERMINED]`, with equal defaults and sensitivity analysis.

Relative plausibility across the candidate set:
```
P̂(h_k) = exp(S(h_k)/τ) / Σ_j exp(S(h_j)/τ)
```
This is a *relative ranking weight*, **not a calibrated probability**. Calibration (reliability diagrams, expected calibration error on validation episodes with known truth) is required before any probability language is used; otherwise report ranks and the score gap to the next hypothesis. Uncertainty is additionally characterized by bootstrap/perturbation: the fraction of perturbed runs (noise seeds, parameter jitter, timestamp jitter within ε_t) in which each hypothesis remains top-1 (**stability**).

### 15.4 Alternative hypotheses (explicitly generated)
The engine always produces alternatives, including:
* **Reversed direction** (b→a rather than a→b) when lag evidence is ambiguous.
* **Common cause** (c → a and c → b), including exogenous context (eclipse, orbit phase, commanded mode, radiation environment).
* **Sensor/telemetry fault** (measurement chain failure; the physical process is nominal) — tested using redundancy and cross-channel physical consistency (e.g., voltage × current vs. thermal response).
* **Independent concurrent anomalies** (no propagation).
* **Hidden/unobserved cause** (an unmeasured subsystem), declared when significant events remain unexplained.

### 15.5 Avoiding confusion between correlation and causation
Safeguards (none eliminates the problem; they reduce it and make it visible):
1. **Terminology discipline:** only "hypothesis", "consistency", "probable".
2. **Condition on context:** orbit-phase and eclipse removed via model or covariates before testing lagged dependence.
3. **Use residuals, not raw series,** so shared periodic structure does not create spurious links.
4. **Natural interventions:** known commands (heater on, load switch, wheel command, mode change) are quasi-interventions; if a disturbance follows a commanded change with a physically plausible lag, evidence is stronger than for spontaneous co-occurrence. This still falls short of a controlled experiment.
5. **Prior-graph restriction:** hypotheses use edges supported by a physical mechanism; purely statistical edges are flagged for review.
6. **Multiple-testing control** and nominal-data null distributions.
7. **Falsification in simulation:** in the synthetic generator we can perform *true interventions* (counterfactual runs with the fault removed or the edge cut) to check whether the hypothesized path is necessary; this supports evaluating the method but does not transfer automatically to real spacecraft.
8. **Report limitations** and an "evidence insufficient" outcome when scores are close or event order is indeterminate.

---

## 16. FAILURE RECONSTRUCTION ENGINE

### 16.1 Goal
Convert events + top hypotheses into a chronological narrative with times expressed relative to *t_f* and uncertainty.

### 16.2 Algorithm (step by step)
1. **Input:** events 𝓔, failure time t_f, graph G*, ranked hypotheses ℋ.
2. **Event filtering:** keep events with significance p_e ≤ α and context-unexplained; mark the rest "background".
3. **Event merging:** merge events from the same subsystem if intervals overlap or the gap < δ_merge (avoids fragmenting one fault into many).
4. **Time normalization:** compute ℓ(e) = t_f − t_on(e) and its uncertainty interval for each retained event.
5. **Partial ordering:** build precedence DAG per Section 13.4; flag indeterminate pairs.
6. **Hypothesis alignment:** for the top-*K* hypotheses, annotate each event with its role (root candidate, intermediate, consequence, unexplained).
7. **Phase segmentation:** group events into phases (precursor, escalation, failure) by gaps in the lead-time axis or by subsystem change.
8. **Narrative items:** for each event produce a structured entry: {lead time, subsystem, channel(s), type (e.g., persistent deviation, trend change), severity, evidence pointers, role under each hypothesis, confidence descriptors}.
9. **Consistency check:** verify that the narrative order does not contradict the precedence DAG; contradictions trigger an "ordering indeterminate" annotation.
10. **Output:** structured timeline object (Section 18 schema) and templated text.

Example rendering (illustrative; same format as the task description, **not a finding**):

```
−37 min : Power channel deviation detected (earliest significant event; onset ±u min).
−31 min : Persistent voltage instability (event persists ≥ π_min).
−26 min : Battery temperature trend change (change point).
−14 min : Communication SNR degradation.
  0 min : Subsystem failure criterion met (t_f).
Hypothesis h1 (rank 1, S = TBD): Power → Thermal → Comms → failure.
Alternatives: h2 (Thermal-origin), h3 (common cause: context), h4 (sensor fault).
```

### 16.3 Complexity and determinism
Event extraction O(n·T); pairwise ordering O(|𝓔|²); hypothesis enumeration restricted to paths in G* of length ≤ m_max (bounded). All steps are deterministic given fixed seeds and model weights, supporting replay for audit.

---

## 17. EXPLAINABLE AI

### 17.1 Layered explanation design
| Component | Method | Appropriate use | Caveat |
|-----------|--------|-----------------|--------|
| Anomaly scores | a_i(t), A_s(t) | Primary evidence of "how abnormal, where, when" | Depend on nominal calibration |
| Per-channel contribution | Autoencoder residual z_i(t) | Native, faithful to model output | Reconstruction coupling may spread error across channels |
| Feature importance (tree model) | TreeSHAP on Isolation Forest [39] | Explaining baseline | Correlated features share credit |
| Deep attribution | GradientSHAP/Integrated Gradients [40] or KernelSHAP on a windowed model [39] | Cross-check of residual attribution | Baseline choice matters; expensive; may be unstable [6] |
| Attention analysis | Only if Transformer used | Exploratory visualization | Not treated as an explanation [13] |
| Temporal contribution | Attribution aggregated over time within window; leave-time-block-out occlusion | Which time span drove the score | Occlusion can create off-distribution inputs |
| Evidence chains | Linked records: event → score → attribution → edge evidence → hypothesis | Auditable argument | Only as strong as the underlying evidence |

### 17.2 Question-to-evidence mapping
| Question | Answer source |
|----------|---------------|
| What happened? | Failure criterion at t_f; summary of significant events and top hypothesis |
| When did it start? | Earliest significant event onset t_on with uncertainty interval |
| What changed first? | Minimum t_on in the precedence DAG; channel attribution at onset |
| What happened next? | Successor events in DAG with lags and consistency scores T(a→b) |
| Which subsystem was involved? | Subsystem scores A_s(t), root subsystem of h₁, role labels |
| What evidence supports the hypothesis? | Evidence chain: T, D, E, K, C components with raw values and test statistics |
| What alternative explanations exist? | Alternatives from Section 15.4 with their scores and what evidence would discriminate them |

### 17.3 Faithfulness and stability checks (required, not assumed)
* **Deletion/insertion tests:** removing top-attributed channels/times should lower the anomaly score more than random removal.
* **Perturbation stability:** top-*k* attribution overlap (Jaccard) under small input noise and seed changes.
* **Ground-truth agreement (synthetic):** attribution mass on channels actually perturbed by the injected fault.
* **Method agreement:** residual vs. SHAP/IG rankings (rank correlation), reported as agreement, not as proof of correctness.

---

## 18. LLM INTEGRATION

### 18.1 Role and constraint
**[Proposed]** The LLM is a *verbalizer and question-answering interface over a closed evidence object*. It does **not** read raw telemetry, does not compute scores, and cannot add facts.

```
Telemetry → ML models → structured evidence → temporal/causal analysis
         → validated JSON evidence object → LLM (explanation only) → report
```

### 18.2 Hallucination mitigation
1. **Closed-world input:** only the JSON object (and static templates) is supplied.
2. **Instruction:** every sentence must cite an `evidence_id`; no numbers other than those in the JSON.
3. **Schema-constrained generation:** structured intermediate output (list of claims with evidence IDs) before prose.
4. **Post-hoc validator:** automatic check that (a) all cited IDs exist, (b) numbers/times match the JSON, (c) causal wording is limited to allowed phrases ("consistent with", "probable"), (d) alternatives are included. Failed reports are regenerated or fall back to the template report.
5. **Template fallback:** a deterministic report generator that works without an LLM; the LLM is an optional readability layer, and the ablation (Section 23) tests whether it adds value.
6. **Human review** required before any report is used.
These measures *reduce* but do not remove hallucination risk [44]; measured claim-support rates are `[TO BE EXPERIMENTALLY DETERMINED]`.

### 18.3 Example JSON schema (input to the LLM)
```json
{
  "report_id": "string",
  "data_provenance": {"source": "synthetic|real", "scenario_id": "string", "model_versions": {"detector": "string", "graph": "string"}},
  "failure": {"t_f": "ISO-8601", "criterion": "string", "subsystem": "string"},
  "timeline_resolution_s": "number",
  "events": [
    {
      "event_id": "E1",
      "subsystem": "Power",
      "channels": ["bus_voltage"],
      "type": "persistent_deviation | trend_change | spike | state_change",
      "t_onset": "ISO-8601",
      "onset_interval": ["ISO-8601", "ISO-8601"],
      "lead_time_min": "number",
      "peak_score": "number",
      "persistence_min": "number",
      "nominal_p_value": "number",
      "top_attributions": [{"channel": "string", "contribution": "number"}],
      "context_explained": false
    }
  ],
  "precedence": [{"before": "E1", "after": "E2", "confidence": "number", "indeterminate": false}],
  "hypotheses": [
    {
      "hypothesis_id": "H1",
      "rank": 1,
      "path": ["Power", "Thermal", "Comms"],
      "score": "number",
      "components": {"temporal": "number", "dependency": "number", "statistical": "number", "domain": "number", "coverage": "number"},
      "edge_evidence": [{"edge": ["Power", "Thermal"], "lag_min": "number", "p_adj": "number", "provenance": "expert|data|both"}],
      "stability": "number",
      "unexplained_events": ["E4"]
    }
  ],
  "alternatives": [{"type": "common_cause|sensor_fault|reverse|independent|hidden", "description": "string", "discriminating_evidence_needed": "string"}],
  "limitations": ["string"],
  "allowed_phrases": ["consistent with", "probable", "hypothesis", "supported by evidence E#"]
}
```

---

## 19. ALGORITHM

```
Algorithm 1: BLACK BOX Pipeline (offline forensic analysis)
Input : Raw telemetry streams {(t_{i,k}, x_{i,k})}, context logs c(t), command log,
        subsystem map σ, prior graph G_prior, failure time t_f (or failure criterion Φ),
        nominal training set D_nom, validation nominal set D_val,
        hyperparameters Θ = {Δ, W, s, θ_high, θ_low, m, α, k, λ, weights}
Output: Events E, graph G*, ranked hypotheses H, structured evidence J, report R

 // ---------- Training phase (nominal data only) ----------
 1  fit_scalers(D_nom) → (med, MAD)
 2  W_nom ← make_windows(preprocess(D_nom))
 3  M_base ← fit_IsolationForest(features(W_nom))
 4  M_main ← train_LSTM_AE(W_nom)                     // early stopping on D_val loss
 5  (μ_i, σ_i) ← residual_stats(M_main, preprocess(D_val))
 6  θ ← calibrate_threshold(scores(D_val), target_FAR)
 7  null_stats ← event_statistics(D_val)               // for p-values

 // ---------- Inference phase ----------
 8  X̃ ← synchronize(resample(clean(raw)), Δ)          // masks, staleness, flags
 9  if t_f undefined: t_f ← first time Φ holds
10  for each window w_k in windows(X̃):
11      X̂ ← M_main(w_k);  r ← X̃ − X̂
12      z_i(t) ← (|r_i(t)| − μ_i)/σ_i;   update a_i(t) by EWMA
13  A_s(t) ← topk_mean{a_i(t): σ(i)=s};  A(t) ← max_s A_s(t)
14  E ← ∅
15  for each channel/subsystem score series a(·):
16      for each interval I found by hysteresis(a, θ_high, θ_low, m):
17          t_on, [t_on⁻, t_on⁺] ← refine_onset(a, I)           // backtrack + CUSUM/PELT
18          e ← summarize(I, t_on, severity, persistence)
19          e.p ← empirical_p(e, null_stats)
20          e.context_explained ← explained_by_context(e, c)
21          E ← E ∪ {e}
22  E ← merge_overlapping(E, δ_merge);   E ← FDR_filter(E, α)
23  DAG ← precedence(E, ε_t + Δ)
24  G* ← combine(G_prior, lagged_tests(E, a, c), λ)                // provenance kept
25  Cand ← enumerate_paths(G*, E, m_max)
26  for h in Cand: S(h) ← Σ components (T, D, E, K, C) − penalty U
27  H ← rank(Cand by S);  attach alternatives (reverse, common-cause, sensor, independent, hidden)
28  stability ← perturbation_analysis(H)                           // noise/seed/time jitter
29  A_attr ← attributions(M_main, E)  (+ SHAP/IG cross-check)
30  J ← build_evidence_object(E, DAG, H, A_attr, stability, provenance, limitations)
31  validate_schema(J)
32  R ← template_report(J);  if LLM enabled: R ← verbalize(J) with validator, else R
33  return E, G*, H, J, R
```

---

## 20. SYSTEM IMPLEMENTATION

| Component | Technology | Why |
|-----------|-----------|-----|
| Language | Python 3.x | Standard research ecosystem |
| Data handling | NumPy, Pandas | Time-indexed resampling, masks, windowing |
| Signal/statistics | SciPy (+ statsmodels for Granger tests) | Filters, tests, CUSUM; classical lagged-dependence tests |
| Baselines | scikit-learn | Isolation Forest, One-Class SVM, scalers, metrics |
| Deep models | PyTorch | LSTM/TCN/Transformer autoencoders; flexible training and attribution via Captum (optional) |
| Change points | `ruptures` (PELT, etc.) or custom CUSUM | Tested implementations of segmentation methods |
| Causal discovery (optional) | `tigramite` (PCMCI) | Implements PCMCI-style tests [34] |
| Graph | NetworkX | Directed graph with edge attributes (provenance, lag windows), path enumeration |
| Explainability | SHAP, Captum | TreeSHAP for Isolation Forest, gradient attribution for networks |
| Synthetic generator | NumPy/SciPy ODE integration (`scipy.integrate`) | Reproducible, seedable fault-injection simulator |
| Experiment tracking | Config files (YAML), fixed seeds, MLflow or equivalent | Reproducibility |
| API | FastAPI | Serve pipeline and evidence JSON |
| UI | Streamlit (prototype) or React (extended) | Timeline, graph, and evidence browsing |
| LLM (optional) | Any API/local model with schema-constrained prompts | Verbalization only, with validator |

Engineering practices: version data, models, and configs; unit-test the synthetic generator (conservation checks, expected steady states); log every random seed.

---

## 21. EXPERIMENTAL DESIGN

**[Simulated]** unless stated; there is no result yet.

### 21.1 Unit of splitting: the *episode*
One episode = one continuous simulation run (nominal or fault-injected) with its own random seed. **All data derived from the same episode (all windows, overlapping windows, all events) go to exactly one of train/validation/test.** This is the central leakage control: splitting windows randomly would place overlapping windows of the same failure in both train and test.

### 21.2 Split design
* **Training:** nominal-only episodes (unsupervised detector training). `N_train [TBD]`.
* **Validation:** separate nominal episodes (residual statistics, thresholds, null distributions) plus a small set of fault episodes for tuning weights (w_j, α_·, λ). `N_val [TBD]`.
* **Test:** unseen fault episodes for each scenario and nominal-only episodes for false-alarm measurement. `N_test [TBD]`.
* **Generalization tests:** (i) *held-out parameter regime* (e.g., coupling strengths or noise levels outside the training ranges); (ii) *held-out scenario variant* (e.g., fault location unseen in validation); (iii) *different synthetic "spacecraft" configuration* (different orbit/inertia/capacity) to emulate domain shift.
* **Real-data (detection only):** SMAP/MSL or ESA-ADB with their official train/test splits where provided [8], [42].

### 21.3 Temporal leakage prevention
1. Fit scalers, thresholds, null distributions **only** on training/validation-nominal data; never on test.
2. Within a continuous record, use blocked (forward-chaining) splits, not shuffled K-fold [46]; leave a **guard gap** ≥ W between train and validation/test segments.
3. Hyperparameters tuned on validation only; test touched once for final reporting.
4. Do not use `t_f` or labels in any detector input; `t_f` is used only by the forensic stage as specified.
5. Context features must be computable causally (orbit phase from time, not from fault state).
6. Fault-injection parameters of test episodes are sampled from independent seeds; verify no duplicate parameter sets across splits.
7. Check for **label leakage via mode flags** that the fault itself toggles (e.g., a safe-mode flag must not be an input feature for detecting the precursor).

### 21.4 Baselines
(B1) Static per-channel thresholds (nominal ±*kσ* or mode-aware limits); (B2) Isolation Forest [21]; (B3) One-Class SVM [22]; (B4) Dense autoencoder; (B5) TCN autoencoder [45]; (B6) Transformer autoencoder (optional); (B7) for hypothesis ranking: "earliest-event-is-root" heuristic, "highest-score subsystem is root" heuristic, "Granger-only graph" (no prior), and random ranking. These trivial heuristics are essential: they show whether the full reasoning adds anything.

### 21.5 Scenarios
The four scenarios (Section 10.3) plus nominal-only and hard cases (sensor-only fault, confounder, concurrent independent anomaly, telemetry gap). Each scenario: `N episodes [TBD]` with randomized onset time, severity, lags, noise.

### 21.6 Evaluation protocol
1. Train on nominal episodes; calibrate on validation; freeze.
2. Run on test episodes; compute metrics per scenario and aggregated.
3. Repeat over `R [TBD]` random seeds; report mean ± standard deviation and confidence intervals (bootstrap over episodes).
4. Significance: paired tests/bootstrap between models on the same episodes with multiple-comparison control.
5. Report event-level metrics as primary; avoid point-adjust inflation [14], [15]; report any point-adjusted figure only as secondary and labelled.
6. Include failure cases (qualitative error analysis) for every scenario.

---

## 22. EVALUATION METRICS

### 22.1 Anomaly detection (event level)
A detected event is a **true positive (TP)** if its interval overlaps a ground-truth anomalous interval (with tolerance τ_tol); **FP** otherwise; **FN** = missed ground-truth interval.
* Precision = TP/(TP+FP); Recall = TP/(TP+FN); F1 = 2PR/(P+R). Range-aware variants [14] reported as supplement.
* **False Alarm Rate (FAR)** = FP events per 24 h of nominal operation (from nominal-only test episodes).
* **Detection latency** = t_det − t_inj (ground truth available only in synthetic data); report median and IQR.
* **AUROC** on window-level scores (only when window labels are defined); note AUROC can be optimistic under strong class imbalance, so also report precision–recall curves.

### 22.2 Failure diagnosis
* **Subsystem identification accuracy** = fraction of test episodes where top-1 root subsystem equals the injected one.
* **Top-*k* hypothesis accuracy** (k = 1,2,3): the true (root, path) or true root subsystem appears among the top *k*.
* **Path accuracy:** edit distance / Jaccard between predicted and true propagation path.
* **Calibration** (if probabilities are claimed): expected calibration error.

### 22.3 Temporal reconstruction
* **Event ordering accuracy:** fraction of ground-truth ordered event pairs whose order is recovered; also Kendall's τ over the matched events; indeterminate pairs counted separately (not counted as correct).
* **Precursor detection latency / lead-time error:** |ℓ̂ − ℓ_true| (synthetic); **precursor recall** = fraction of ground-truth precursors detected with ℓ ≥ ℓ_min.
* **Onset error:** |t̂_on − t_inj|.

### 22.4 Explanation
* **Evidence coverage:** fraction of ground-truth causal events/channels appearing in the evidence chain; and fraction of report claims supported by an evidence ID (**claim-support rate**).
* **Explanation consistency:** Jaccard overlap of top-*k* attributed channels under perturbation; agreement between residual and SHAP/IG rankings.
* **Faithfulness:** deletion-test score drop vs. random baseline.
* **Human expert agreement (where feasible):** blinded ratings of usefulness, correctness, and completeness on a Likert scale by `N_experts [TBD]` reviewers; inter-rater reliability (Cohen's κ or Krippendorff's α). If no domain experts are available, this is **omitted and stated as a limitation**, not simulated.

---

## 23. ABLATION STUDY

| Model | Components | Question answered |
|-------|------------|-------------------|
| A | Anomaly detection only (LSTM-AE scores; earliest alarm as presumed root) | Baseline forensic value of detection alone |
| B | A + temporal reasoning (event extraction, onset refinement, significance, ordering) | Does temporal reasoning improve ordering, lead-time estimation, and root ranking? |
| C | B + dependency graph (prior + data evidence) and hypothesis scoring | Does structure improve root-subsystem/path identification and reduce wrong "earliest = root" cases (confounders)? |
| D | Full BLACK BOX (C + explanation layer + evidence object + optional LLM report) | Does the explanation/report layer improve evidence coverage, consistency, and (if measured) human agreement without hurting correctness? |

Additional ablations (single-factor removal from D): no context covariates; no prior graph (data-only); no statistical-evidence term; no persistence/significance filter; Granger vs. PCMCI evidence; causal vs. non-causal filtering; LLM vs. template report; different detectors (IF vs. LSTM-AE vs. TCN-AE).

*What the study would demonstrate:* the incremental contribution of each module, and where it fails (e.g., if C ≈ B, the dependency graph adds nothing in these scenarios; if D's claim-support rate with LLM < template, the LLM layer is not justified). Differences must be supported by paired statistical tests over episodes.

---

## 24. RESULTS SECTION (TEMPLATE ONLY)

> **No results exist.** All cells are placeholders. Do not fill cells except from executed experiments, and record the seeds/config for each.

**Table R1 — Anomaly detection (event level), aggregated over test episodes**

| Model | Precision | Recall | F1 | FAR (/24 h) | Detection Latency (median, IQR) | AUROC |
|-------|-----------|--------|----|-------------|-----------------|-------|
| Static threshold (B1) | TBD | TBD | TBD | TBD | TBD | n/a |
| Isolation Forest | TBD | TBD | TBD | TBD | TBD | TBD |
| One-Class SVM | TBD | TBD | TBD | TBD | TBD | TBD |
| Dense Autoencoder | TBD | TBD | TBD | TBD | TBD | TBD |
| LSTM Autoencoder | TBD | TBD | TBD | TBD | TBD | TBD |
| TCN Autoencoder | TBD | TBD | TBD | TBD | TBD | TBD |
| Proposed (primary) | TBD | TBD | TBD | TBD | TBD | TBD |

**Table R2 — Per-scenario detection and lead time**

| Scenario | Detection Latency | Onset Error | Precursor Recall | Lead-Time Error |
|----------|------------------|-------------|------------------|-----------------|
| Thermal runaway | TBD | TBD | TBD | TBD |
| Power degradation | TBD | TBD | TBD | TBD |
| Attitude-control failure | TBD | TBD | TBD | TBD |
| Radiation-induced anomaly | TBD | TBD | TBD | TBD |

**Table R3 — Failure diagnosis and temporal reconstruction**

| Method | Root-Subsystem Acc. | Top-1 | Top-3 | Path Jaccard | Ordering Acc. | Kendall τ |
|--------|--------------------|-------|-------|-------------|---------------|-----------|
| Random ranking | TBD | TBD | TBD | TBD | TBD | TBD |
| Earliest-event heuristic | TBD | TBD | TBD | TBD | TBD | TBD |
| Highest-score heuristic | TBD | TBD | TBD | TBD | TBD | TBD |
| Granger-only | TBD | TBD | TBD | TBD | TBD | TBD |
| BLACK BOX (full) | TBD | TBD | TBD | TBD | TBD | TBD |

**Table R4 — Ablation (Models A–D)** columns: Detection F1, Ordering Acc., Lead-Time Error, Top-1/Top-3, Evidence Coverage, Claim-Support Rate, Stability — all TBD.

**Table R5 — Explanation quality:** Evidence coverage; top-*k* Jaccard; deletion-test drop vs. random; residual–SHAP rank correlation; expert rating (if conducted) — all TBD.

**Trends to investigate once experiments exist (questions, not predictions):**
1. Does the LSTM-AE improve over Isolation Forest at matched FAR, or is the gain within seed variance?
2. How does detection latency vary with fault severity and sampling rate; is there a "detectability floor"?
3. Does lead-time error grow with onset gradualness (slow drifts are hard to date)?
4. Where does "earliest event = root cause" fail (confounders, sensor-only faults)?
5. Does the dependency graph help mainly in confounder/concurrent cases?
6. How sensitive is ranking to weights, to prior-graph errors (inject deliberately wrong edges), to timestamp jitter?
7. Do residual and SHAP attributions agree, and does disagreement predict wrong hypotheses?
8. Performance degradation under domain shift (held-out generator regimes) and with increasing missing data.
9. LLM claim-support rate relative to template reports.

---

## 25. DISCUSSION

*This section is prospective: it states how results should be interpreted, not what was found.*

**What success would mean.** At minimum: (i) the multivariate detector beats threshold and Isolation Forest baselines at matched false-alarm rate on held-out synthetic episodes; (ii) the event/temporal stage recovers ground-truth ordering and lead time better than raw detector alarms; (iii) the dependency-graph stage improves root-subsystem accuracy specifically on confounded and concurrent-fault cases beyond the trivial heuristics; (iv) explanations are faithful and stable. Success on synthetic data would show the *method is workable under controlled assumptions*; it would not show operational readiness.

**Expected strengths (hypotheses).** Multivariate and contextual detection of relational anomalies; explicit uncertainty on ordering; transparency of the hypothesis score; auditable evidence chains.

**Expected failure cases.**
* *Slow drifts:* onset is poorly localized; lead-time error should grow.
* *Fast cascades:* events fall within Δ + ε_t, giving indeterminate ordering.
* *Strong feedback loops* (Power ↔ Thermal): direction of influence is ambiguous from timing alone.
* *Hidden causes:* unmeasured variables produce unexplained events.
* *Sparse telemetry:* low sampling rate hides short precursors.

**Interpretability trade-offs.** The LSTM-AE is less transparent than Isolation Forest or thresholds but offers native per-channel residuals; the hypothesis scorer is intentionally simple (weighted components) to preserve auditability at the cost of possible accuracy loss versus a learned ranker. Post-hoc SHAP adds cost and instability; residual attribution is cheaper but model-specific.

**False positives.** Benign mode changes, eclipse transitions, calibration activities, and maneuvers can resemble anomalies; context features and command logs mitigate but cannot remove this. A false precursor in a report is costly because it can misdirect an investigation; the nominal p-value filter and the "evidence insufficient" outcome are intended to bias toward restraint.

**Sensor failures.** A failing sensor can imitate a process fault (and the reverse). The framework includes a sensor-fault alternative, using redundancy and cross-channel physical consistency; performance on the sensor-only synthetic scenario will quantify discrimination.

**Telemetry gaps.** Gaps remove evidence; onset can be misdated to the gap edge. The framework reports gaps explicitly and widens onset intervals around them.

**Domain shift between spacecraft.** Models trained on nominal telemetry of one vehicle are not expected to transfer without recalibration; channels, modes, and dynamics differ. Held-out configuration tests are designed to measure, not assume, transfer.

**Synthetic vs. real data.** Success on synthetic data may reflect agreement between generator assumptions and method assumptions (e.g., the same lag structure used to create and detect faults). Therefore: vary generator structure between training and test; include model-misspecified generator variants; use real data for detection-only validation; and state that causal-structure results are valid only relative to the simulator.

---

## 26. LIMITATIONS

| Limitation | Description | Consequence / mitigation |
|-----------|-------------|--------------------------|
| Limited public spacecraft telemetry | Real data are often proprietary, anonymized, or lack subsystem semantics and causal annotations | Detection-only real-data validation; synthetic for forensic claims; seek collaboration |
| Synthetic failure assumptions | Generator equations encode our assumptions | Misspecification tests; randomized structures; no claim of mission realism |
| Causal inference limits | Temporal precedence + statistics ≠ causation; hidden confounders, feedback, nonstationarity | "Hypothesis/consistency" wording; alternatives; context conditioning |
| Limited real-mission validation | No operational mission used here | Treat as research prototype; independent validation required |
| Sensor noise and faults | Noise limits onset resolution; sensor faults mimic process faults | Uncertainty intervals; sensor-fault alternative |
| Timestamp uncertainty | Clock/ground-time errors affect ordering | Ordering tolerance ε_t; indeterminate pairs |
| Model generalization | Nominal models are spacecraft- and mode-specific | Recalibration; domain-shift experiments |
| Expert-graph dependence | Wrong prior edges bias hypotheses | Provenance tagging; robustness test with corrupted edges |
| Weight/threshold tuning | Many hyperparameters | Validation-only tuning; sensitivity analysis |
| LLM hallucination | Plausible but unsupported text | Closed evidence input, validator, template fallback, human review |
| Computational constraints | Undergraduate-scale compute; SHAP and deep training costs | Smaller models, subsampled attribution; report compute |
| Metric validity | Anomaly metrics can be inflated by evaluation conventions [14], [15] | Event-level primary metrics |
| Human evaluation | Domain experts may be unavailable | Omit and state; do not simulate |

---

## 27. ETHICAL AND SAFETY CONSIDERATIONS

* **Intended use:** *investigation and decision support only.* The system is **not** designed or validated for autonomous commanding, onboard fault management, or any safety-critical control action. Operational use would require independent verification and validation (V&V), qualification under the relevant agency/organizational standards, and hardware/software assurance beyond this paper's scope.
* **Human-in-the-loop:** Reports are advisory. Hypotheses must be reviewed by engineers with access to design documentation, raw data, and non-telemetry evidence (ground tests, command history, vendor data).
* **Autonomous decision limits:** No recovery or commanding is derived from outputs. Automation bias (over-trusting ranked hypotheses) is a risk; reports display uncertainty, alternatives, and "evidence insufficient" outcomes prominently.
* **Explainability:** Explanations are checked for faithfulness; explanation ≠ proof of causation; attributions are presented with their limitations [5], [6].
* **Verification and validation:** Unit tests of the generator and pipeline; reproducible seeds; independent test episodes; documented failure cases; version-controlled evidence objects for audit.
* **Data governance:** Real telemetry may be export-controlled or proprietary; respect license and confidentiality terms; do not publish sensitive operational data.
* **LLM use:** Disclose model, prompts, validator, and measured error rates; keep humans responsible for conclusions.
* **Honest reporting:** Report negative results and failure cases; avoid language implying deployment or validated causality.

---

## 28. FUTURE WORK

1. **Real spacecraft telemetry:** partnerships or open mission archives with documented anomaly investigations; use published anomaly reports as qualitative ground truth for timeline comparison (where available).
2. **Digital twins:** higher-fidelity simulators for counterfactual (intervention) tests of hypotheses.
3. **Physics-informed ML:** embed conservation/thermal and electrical constraints in the model so residuals are physically interpretable and data needs shrink.
4. **Graph neural networks:** learn spatio-temporal dependencies with the expert graph as an inductive bias; compare against the simple scoring approach.
5. **Multimodal reasoning:** combine telemetry with event logs, command histories, and anomaly reports.
6. **Onboard inference:** lightweight detectors on constrained processors; analyze compute/memory and V&V implications.
7. **Federated learning:** privacy-preserving learning across operators with non-shared telemetry; domain-shift challenges.
8. **Autonomous fault management:** only after extensive validation; connect hypotheses to FDIR recovery logic under strict safety cases.
9. **Mission-control integration:** interfaces to ground-system tooling, with provenance and access control.
10. **DBN and structural causal modelling** with richer data; proper causal discovery benchmarks.

---

## 29. CONCLUSION

This paper specifies BLACK BOX, a methodology for turning multivariate spacecraft telemetry into temporally ordered events, subsystem-level propagation hypotheses, and evidence-linked explanations, together with a leakage-aware evaluation plan on synthetic fault scenarios with known ground truth. The central premise, that event-level temporal reasoning and a hybrid expert/data dependency graph can improve reconstruction of failure sequences beyond anomaly detection alone, is a **hypothesis** that remains to be tested. Causal language is limited to hypotheses and causal consistency. Contributions will be supported only to the extent that the planned ablations show measurable gains over simple baselines and survive tests of robustness and domain shift.

---

## 30. CONTRIBUTIONS (PROPOSED)

1. **A modular forensic pipeline specification** connecting multivariate anomaly detection, event extraction, dependency modelling, hypothesis ranking, and evidence-linked reporting.
2. **A temporal event formalism** (hysteresis detection, change-point onset refinement, nominal-data significance, uncertainty-aware partial ordering, lead-time estimation).
3. **A hybrid dependency model** that stores provenance of each edge and combines expert structure with lagged-dependence evidence, with an explicit separation of observed association and potential propagation.
4. **A transparent causal-hypothesis scoring scheme** with mandatory alternatives (reversed, common-cause, sensor-fault, independent, hidden) and stability analysis.
5. **A synthetic fault-injection methodology with ground-truth causal structure** and four reproducible scenarios plus hard cases.
6. **An evaluation protocol** with episode-level splitting, sequence-level metrics (ordering, lead-time error, top-*k* root cause, evidence coverage), and an ablation design.

*Each is a proposed contribution; none is claimed as demonstrated until the experiments in Section 36 are done.*

---

## 31. REFERENCES

> Verify every entry (authors, venue, pages, year) against the publisher/arXiv before submission. Entries marked "(verify)" are ones where I am less certain of exact details; do not cite them without checking. No DOIs are given deliberately.

[1] J. R. Wertz and W. J. Larson, Eds., *Space Mission Analysis and Design*, 3rd ed. Microcosm Press / Kluwer Academic Publishers, 1999.

[2] M. Tipaldi and B. Bruenjes, "Survey on fault detection, isolation, and recovery strategies in the space domain," *Journal of Aerospace Information Systems*, vol. 12, no. 2, pp. 235–256, 2015. (verify)

[3] D. L. Iverson, "Inductive system health monitoring," in *Proc. Int. Conf. on Artificial Intelligence (IC-AI)*, 2004. (verify)

[4] R. Isermann, "Model-based fault-detection and diagnosis – status and applications," *Annual Reviews in Control*, vol. 29, no. 1, pp. 71–85, 2005.

[5] C. Rudin, "Stop explaining black box machine learning models for high stakes decisions and use interpretable models instead," *Nature Machine Intelligence*, vol. 1, pp. 206–215, 2019.

[6] F. Doshi-Velez and B. Kim, "Towards a rigorous science of interpretable machine learning," arXiv:1702.08608, 2017. *(cited for evaluation of interpretability; instability of post-hoc methods should be additionally supported by empirical literature identified in Phase 1)*

[7] S. Jain and B. C. Wallace, "Attention is not explanation," in *Proc. NAACL-HLT*, 2019.

[8] K. Hundman, V. Constantinou, C. Laporte, I. Colwell, and T. Soderstrom, "Detecting spacecraft anomalies using LSTMs and nonparametric dynamic thresholding," in *Proc. 24th ACM SIGKDD Int. Conf. Knowledge Discovery & Data Mining*, 2018, pp. 387–395.

[9] P. Malhotra, L. Vig, G. Shroff, and P. Agarwal, "Long short term memory networks for anomaly detection in time series," in *Proc. ESANN*, 2015.

[10] Y. Su, Y. Zhao, C. Niu, R. Liu, W. Sun, and D. Pei, "Robust anomaly detection for multivariate time series through stochastic recurrent neural network," in *Proc. 25th ACM SIGKDD*, 2019.

[11] P. Malhotra, A. Ramakrishnan, G. Anand, L. Vig, P. Agarwal, and G. Shroff, "LSTM-based encoder-decoder for multi-sensor anomaly detection," arXiv:1607.00148, 2016.

[12] J. Xu, H. Wu, J. Wang, and M. Long, "Anomaly Transformer: Time series anomaly detection with association discrepancy," in *Proc. ICLR*, 2022.

[13] *(see [7])* — attention-as-explanation caveat.

[14] N. Tatbul, T. J. Lee, S. Zdonik, M. Alam, and J. Gottschlich, "Precision and recall for time series," in *Advances in Neural Information Processing Systems (NeurIPS)*, 2018.

[15] R. Wu and E. Keogh, "Current time series anomaly detection benchmarks are flawed and are worse than you think," arXiv:2009.13807, 2020. (verify publication venue/year)

[16] V. Venkatasubramanian, R. Rengaswamy, K. Yin, and S. N. Kavuri, "A review of process fault detection and diagnosis: Part I: Quantitative model-based methods," *Computers & Chemical Engineering*, vol. 27, no. 3, pp. 293–311, 2003.

[17] T. Yairi, Y. Kato, and K. Hori, "Telemetry-mining: A machine learning approach to anomaly detection and fault diagnosis for space systems," in *Proc. 2nd IEEE Int. Conf. Space Mission Challenges for Information Technology*, 2006. (verify)

[18] V. Chandola, A. Banerjee, and V. Kumar, "Anomaly detection: A survey," *ACM Computing Surveys*, vol. 41, no. 3, Art. 15, 2009.

[19] A. Blázquez-García, A. Conde, U. Mori, and J. A. Lozano, "A review on outlier/anomaly detection in time series data," *ACM Computing Surveys*, vol. 54, no. 3, Art. 56, 2021.

[20] G. Pang, C. Shen, L. Cao, and A. van den Hengel, "Deep learning for anomaly detection: A review," *ACM Computing Surveys*, vol. 54, no. 2, 2021.

[21] F. T. Liu, K. M. Ting, and Z.-H. Zhou, "Isolation forest," in *Proc. IEEE Int. Conf. Data Mining (ICDM)*, 2008, pp. 413–422.

[22] B. Schölkopf, J. C. Platt, J. Shawe-Taylor, A. J. Smola, and R. C. Williamson, "Estimating the support of a high-dimensional distribution," *Neural Computation*, vol. 13, no. 7, pp. 1443–1471, 2001.

[23] S. Hochreiter and J. Schmidhuber, "Long short-term memory," *Neural Computation*, vol. 9, no. 8, pp. 1735–1780, 1997.

[24] A. Vaswani et al., "Attention is all you need," in *Advances in Neural Information Processing Systems (NeurIPS)*, 2017.

[25] L. Ruff et al., "A unifying review of deep and shallow anomaly detection," *Proceedings of the IEEE*, vol. 109, no. 5, pp. 756–795, 2021.

[26] *(see [20], [25])*

[27] R. Killick, P. Fearnhead, and I. A. Eckley, "Optimal detection of changepoints with a linear computational cost," *Journal of the American Statistical Association*, vol. 107, no. 500, pp. 1590–1598, 2012.

[28] R. P. Adams and D. J. C. MacKay, "Bayesian online changepoint detection," arXiv:0710.3742, 2007.

[29] S. Aminikhanghahi and D. J. Cook, "A survey of methods for time series change point detection," *Knowledge and Information Systems*, vol. 51, pp. 339–367, 2017.

[30] J. Pearl, *Causality: Models, Reasoning, and Inference*, 2nd ed. Cambridge University Press, 2009.

[31] P. Spirtes, C. Glymour, and R. Scheines, *Causation, Prediction, and Search*, 2nd ed. MIT Press, 2000.

[32] C. W. J. Granger, "Investigating causal relations by econometric models and cross-spectral methods," *Econometrica*, vol. 37, no. 3, pp. 424–438, 1969.

[33] T. Schreiber, "Measuring information transfer," *Physical Review Letters*, vol. 85, no. 2, pp. 461–464, 2000.

[34] J. Runge et al., "Detecting and quantifying causal associations in large nonlinear time series datasets," *Science Advances*, vol. 5, no. 11, eaau4996, 2019.

[35] S. Ji, S. Pan, E. Cambria, P. Marttinen, and P. S. Yu, "A survey on knowledge graphs: Representation, acquisition, and applications," *IEEE Trans. Neural Networks and Learning Systems*, vol. 33, no. 2, pp. 494–514, 2022.

[36] K. P. Murphy, "Dynamic Bayesian networks: Representation, inference and learning," Ph.D. dissertation, Univ. California, Berkeley, 2002.

[37] J. Pearl, *Probabilistic Reasoning in Intelligent Systems*. Morgan Kaufmann, 1988.

[38] M. T. Ribeiro, S. Singh, and C. Guestrin, "'Why should I trust you?': Explaining the predictions of any classifier," in *Proc. 22nd ACM SIGKDD*, 2016.

[39] S. M. Lundberg and S.-I. Lee, "A unified approach to interpreting model predictions," in *Advances in Neural Information Processing Systems (NeurIPS)*, 2017.

[40] M. Sundararajan, A. Taly, and Q. Yan, "Axiomatic attribution for deep networks," in *Proc. ICML*, 2017.

[41] *(see [6])*

[42] K. Kotowski et al., "European Space Agency benchmark for anomaly detection in satellite telemetry," arXiv:2406.17826, 2024. (verify authors/title/content)

[43] P. Lewis et al., "Retrieval-augmented generation for knowledge-intensive NLP tasks," in *Advances in Neural Information Processing Systems (NeurIPS)*, 2020.

[44] Z. Ji et al., "Survey of hallucination in natural language generation," *ACM Computing Surveys*, vol. 55, no. 12, Art. 248, 2023.

[45] S. Bai, J. Z. Kolter, and V. Koltun, "An empirical evaluation of generic convolutional and recurrent networks for sequence modeling," arXiv:1803.01271, 2018.

[46] C. Bergmeir and J. M. Benítez, "On the use of cross-validation for time series predictor evaluation," *Information Sciences*, vol. 191, pp. 192–213, 2012.

*Housekeeping note: [13], [26], [41] are internal pointers to other entries in this draft and should be renumbered/merged when formatting for IEEE. Datasets (SMAP/MSL, ESA-ADB, NASA Prognostics repositories) should be cited from their official release pages/papers after verifying access terms.*

---

## 32. FIGURES TO INCLUDE

**Figure 1 — BLACK BOX system architecture.** Horizontal block diagram with the 11 layers of Section 8 as boxes in sequence. Above: "Context & priors" box (eclipse/orbit, command log, expert graph) with arrows into layers 4, 5, 7. Below: "Evidence store" (database icon) receiving arrows from every layer, labelled "provenance + versioning". Colors: data layers (blue), analysis layers (green), explanation layers (orange). Label "Human review" as final gate after the report.

**Figure 2 — Telemetry processing pipeline.** Left-to-right flow: asynchronous per-channel streams (different tick spacing drawn as colored dot rows) → quality flags/Hampel → resampling to grid Δ with mask & staleness → robust scaling (nominal stats) → sliding windows (overlapping rectangles, W and s annotated). Insert a callout "fit on training nominal only" on scaling.

**Figure 3 — Multivariate telemetry anomaly example.** Stacked time-series panels (shared x-axis): bus voltage, battery temperature, SNR, current, eclipse flag (as shaded band). Shade orbit-periodic regions; show a fault-injected segment (clearly captioned "synthetic example"). Bottom panel: system anomaly score A(t) with θ_high/θ_low lines and detected interval. Mark t_inj and t_f with vertical lines.

**Figure 4 — Temporal failure reconstruction.** Horizontal timeline with t_f at right (0). Event bars from t_on to t_off per subsystem on separate rows; whiskers for onset uncertainty; lead-time labels (−ℓ) above; precedence arrows only where intervals do not overlap; hatched bars for indeterminate pairs; gaps greyed.

**Figure 5 — Spacecraft subsystem dependency graph.** Directed graph with nodes Power, Thermal, ADCS, Comms, OBC, Environment, Payload. Edge thickness = combined weight w_uv; edge style: solid = expert+data, dashed = expert-only, dotted = data-only (flagged). Edge labels: lag window [τ_min, τ_max]. Show the cycle Power ↔ Thermal.

**Figure 6 — Causal hypothesis graph.** Top-3 hypotheses as colored paths on the Figure 5 layout, each with score S(h) and component bar (T, D, E, K, C). Side panel listing alternatives (reverse, common cause, sensor fault, independent, hidden) with their scores. Title must say "hypotheses", not "causes".

**Figure 7 — Explainable AI output.** Composite: (a) heatmap of residual z_i(t) (channels × time) with onset marker; (b) bar chart of channel contributions at onset with SHAP/IG overlay for comparison; (c) evidence-chain card: event → score → attribution → edge test → hypothesis; (d) alternatives table.

**Figure 8 — Experimental evaluation framework.** Flowchart: simulator (scenario, seed, parameters) → episode generator → episode-level split (train nominal / validation / test) → training → calibration → inference → metrics (detection, temporal, diagnosis, explanation) → statistics (paired bootstrap). Highlight "no episode crosses split boundaries" and "leakage barrier" between validation and test.

---

## 33. TABLES TO INCLUDE

1. **Existing approaches comparison** (Section 7.12) with citations and capability columns.
2. **Telemetry parameters** (Section 9.1).
3. **Failure scenarios** (Section 10.3): columns for normal behaviour, injection, telemetry changes, precursors, progression, failure criterion.
4. **Model comparison** (Section 12.1) plus compute cost and parameter count columns (TBD).
5. **Evaluation metrics** (Section 22): definition, level (event/window/episode), data requirement.
6. **Ablation study** (Section 23, Table R4).
7. **Limitations** (Section 26).
8. *(Recommended additional)* Hyperparameter table with tuning ranges and selection protocol; synthetic generator parameter distributions.

---

## 34. RESEARCH NOVELTY

**No absolute novelty is claimed.** Each component exists in the literature (detectors, change-point methods, lagged-dependence tests, knowledge graphs, attribution, retrieval-grounded LLMs). The *potential* contribution is the **integration and evaluation** of:

| Element | What must be experimentally shown before it is claimed |
|---------|--------------------------------------------------------|
| Temporal anomaly detection | Primary model beats threshold/IF baselines at matched FAR on held-out episodes (and on real detection benchmarks), with seed-robust confidence intervals |
| Subsystem dependency modeling | Graph-augmented ranking beats temporal-order-only and Granger-only baselines, especially on confounded and concurrent cases; robustness to wrong prior edges quantified |
| Failure-sequence reconstruction | Higher ordering accuracy and lower lead-time error than raw alarm times; calibrated uncertainty intervals (coverage of true onsets near nominal level) |
| Causal hypothesis generation | True root in top-*k* more often than heuristics; stable under perturbation; discrimination of sensor-fault and common-cause alternatives; limits stated for real data |
| Explainable AI | Faithfulness (deletion tests), stability, and evidence coverage beyond attribution-only baselines; expert agreement if feasible |
| LLM-assisted investigation | Claim-support rate and factual consistency at least equal to template reports, with improved readability judged by humans; otherwise drop the LLM |

A literature search (Phase 1) must also establish whether equivalent integrated systems already exist; if they do, the contribution should be reframed as a replication, an open benchmark, or a methodological variant.

---

## 35. FINAL RESEARCH ROADMAP

| Phase | Activity | Difficulty (1–5) | Deliverables | Key risks |
|-------|----------|-----------------|--------------|-----------|
| 1 Literature review | Survey FDIR, anomaly detection, causal TS, XAI; verify novelty; verify all references | 2 | Annotated bibliography, gap statement, verified references | Missing prior integrated work |
| 2 Dataset construction | Build simulator, four scenarios + hard cases; acquire SMAP/MSL/ESA-ADB; document generator | 4 | Reproducible generator, dataset card, split files | Unrealistic generator; bugs; time sink |
| 3 Baseline anomaly detection | Thresholds, IF, OC-SVM, LSTM-AE; calibration | 3 | Baseline results table, thresholds, code | Overfitting; weak nominal modelling |
| 4 Temporal reasoning | Hysteresis events, CUSUM/PELT onset, p-values, ordering, lead time | 3 | Event extractor, temporal metrics | Onset ambiguity; sampling effects |
| 5 Causal/dependency modeling | Prior graph, lagged tests, hypothesis scoring, alternatives | 5 | Graph, scorer, perturbation analysis | Confounding; prior-graph bias; over-claiming |
| 6 Explainability | Residual attribution, SHAP/IG, stability, evidence chains | 3 | Explanation module, faithfulness tests | Unfaithful attribution |
| 7 LLM investigation layer | JSON schema, prompt, validator, template fallback | 2–3 | Report generator, claim-support evaluation | Hallucination; evaluation subjectivity |
| 8 Experiments | Run protocol with multiple seeds | 3 | Results tables, stats | Leakage; compute |
| 9 Ablation studies | Models A–D and single-factor removals | 3 | Ablation tables, analysis | Small effect sizes |
| 10 Paper validation | Replicate, error analysis, writing, internal review, expert feedback if available | 3 | Paper, code/data release plan | Claims exceeding evidence |

**Minimum viable research version (MVP):** synthetic generator with 2–3 scenarios; baselines (threshold, IF) + LSTM-AE; event extraction with onset refinement; expert graph with temporal-precedence scoring (no PCMCI); residual attribution; template report (no LLM); episode-level split with at least 3 seeds; detection + ordering + lead-time + top-*k* metrics; detection-only check on SMAP/MSL. This could answer a bounded version of the RQ on synthetic data.

**Advanced version (publication target):** all four scenarios plus hard cases; real-data detection benchmarks (SMAP/MSL and ESA-ADB); full baseline set including TCN/Transformer; PCMCI-style evidence and DBN comparison; calibration analysis; robustness to corrupted priors, jitter, and gaps; domain-shift tests; SHAP/IG faithfulness study; LLM-vs-template comparison with validator; expert evaluation (if recruitable); public release of generator and evaluation code.

---

## 36. WHAT WE NEED TO ACTUALLY BUILD BEFORE CLAIMING THESE RESULTS

Nothing in this document is a result. To turn the proposal into a defensible paper, the following must exist and be reported.

### 36.1 Datasets
1. **Synthetic generator** with unit tests (energy balance, steady-state checks), a documented parameter distribution table, and fixed seeds; at least 4 fault scenarios + hard cases (sensor-only fault, confounder, concurrent independent anomaly, telemetry gap, benign mode change).
2. **Episode counts** `[N_train, N_val, N_test per scenario: TBD]`, chosen by power analysis or at least sufficient to produce non-overlapping confidence intervals for the primary comparison.
3. **Ground-truth files:** t_inj, event intervals, true propagation path, true root subsystem, t_f, for every fault episode.
4. **Real datasets:** SMAP/MSL and/or ESA-ADB acquired with license check; documented preprocessing; used for detection-only experiments. Examine annotation granularity first.
5. **Split manifests** that prove no episode appears in more than one partition, with guard gaps for continuous real records.

### 36.2 Models
1. Baselines: static thresholds, Isolation Forest, One-Class SVM, dense AE, TCN-AE (optionally Transformer-AE).
2. Primary: LSTM autoencoder with documented architecture, loss, optimizer, early stopping on validation nominal loss.
3. Event extraction module (hysteresis, CUSUM/PELT, p-values), precedence DAG.
4. Dependency graph with provenance; lagged-test evidence module; hypothesis scorer with alternatives; trivial heuristic rankers for comparison.
5. Explanation module (residual attribution, SHAP/IG cross-check); evidence-object builder; template report; optional LLM verbalizer with validator.

### 36.3 Experiments
1. Hyperparameter selection on validation only; a single frozen configuration evaluated once on test.
2. ≥ `R [TBD]` seeds; mean ± SD and bootstrap CIs; paired tests with multiple-comparison correction.
3. Ablations A–D and single-factor removals (Section 23).
4. Sensitivity: scoring weights, Δ and W, onset-refinement method, FAR target, prior-graph corruption, timestamp jitter, missing-data rate.
5. Generalization: held-out parameter regimes, held-out fault variants, alternate synthetic spacecraft configuration, model-misspecified generator.
6. Real-data detection experiments with the official protocols; compare against published baselines only when protocols are identical.
7. Failure-case analysis for each scenario.

### 36.4 Metrics
Event-level precision/recall/F1, FAR/24 h, detection latency, AUROC and PR curves; root-subsystem accuracy, top-*k*, path Jaccard, calibration (if probabilities claimed); ordering accuracy, Kendall τ, onset and lead-time error, precursor recall; evidence coverage, claim-support rate, attribution stability, faithfulness (deletion/insertion), expert agreement (if available, with inter-rater reliability).

### 36.5 Validation steps
1. Leakage audit checklist completed and documented (Section 21.3).
2. Reproducibility: code, configs, seeds, environment lock files; reruns reproduce numbers within tolerance.
3. Sanity checks: random-ranking and shuffled-time controls should perform near chance; if the full system beats them only marginally, report it.
4. Negative controls: apply the pipeline to nominal-only episodes and confirm few reported precursors/hypotheses ("evidence insufficient" rate).
5. Causal validation in simulation by interventional/counterfactual runs; explicit statement that this does not establish causality on real spacecraft.
6. Literature verification: confirm all references and the novelty position.
7. Independent review of the prior graph and scenarios by someone with space-systems knowledge, if possible.
8. Final claim audit: each sentence in Abstract/Conclusion must map to a table or figure produced by completed experiments; otherwise remove or relabel it as hypothesis.

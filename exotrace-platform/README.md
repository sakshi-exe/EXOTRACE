# EXOTRACE

**AI-Powered Spacecraft Mission Forensics**  
Trace the anomaly. Reconstruct the failure. Explain the mission.

EXOTRACE is a research prototype for spacecraft telemetry investigation. This phase provides a frontend, versioned API contracts, demo fixtures, and future model interfaces. It does not implement machine learning and does not make validated spacecraft diagnoses.

> **DEMO DATA:** All mission status, telemetry, anomaly records, timeline events, scores, and hypotheses in this prototype are simulated interface fixtures. They are not scientific findings or operational spacecraft data.

## Run locally

Frontend:

```sh
npm install
npm run dev
```

Backend (Python 3.11+):

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --app-dir backend --reload --port 8000
```

The frontend defaults to `http://localhost:8000/api/v1`. Set `VITE_API_BASE_URL` in `.env.local` to change it. Configure allowed browser origins with `EXOTRACE_CORS_ORIGINS` (comma-separated).

Run checks:

```sh
npm run build
pytest
```

## Project layout

```text
backend/app/
  api/routes/       Versioned FastAPI resource handlers
  core/             Shared API configuration and demo disclaimer
  ml/               Model protocols and domain-level contracts only
  repositories/     In-memory demo fixtures; replace with validated adapters
  schemas/          Pydantic request/response contracts
src/
  services/         Typed API client
  types/            Frontend API types
  App.tsx           Route shell and initial mission views
```

## API surface

All resources are under `/api/v1` and fixture-backed responses include `metadata.data_mode: "DEMO DATA"` plus a disclaimer.

- `GET /health`
- `GET /missions`
- `GET /missions/{mission_id}/overview`
- `GET /missions/{mission_id}/telemetry`
- `GET /missions/{mission_id}/anomalies`
- `GET /missions/{mission_id}/timeline`
- `GET /missions/{mission_id}/hypotheses`
- `GET /missions/{mission_id}/report`
- `GET /models/status`

The model registry is informational. Isolation Forest, autoencoders, temporal models, change-point detection, Bayesian methods, graph neural networks, and explainability methods are not implemented or represented as validated.

## Prototype boundaries

- `SAT-X01` and its displayed measurements are demonstration fixtures.
- Hypothesis scores are illustrative UI values, not calibrated probabilities or confidence estimates.
- No causal relationships or failure root cause are established.
- The fourth overview metric is “Events Reviewed”; the source brief ended mid-metric at “CR”, so no intended metric is inferred.
# Huzur Faz 3 Release Readiness

## Amac
AI trust panelini sadece gozlem degil, yayin karari destek katmani haline getirmek.

## Katmanlar
- `aiHealthSnapshotService`
- `aiHealthDiagnosticsService`
- `aiRolloutGateService`
- `aiReleaseReadinessService`

## Readiness sinyalleri
- canli health snapshot tazeligi
- rollout gate sonucu
- aktif AI flag kapsami
- yuzey bazli snapshot kapsami

## Sonuc seviyeleri
- `ready`
- `monitor`
- `blocked`

## UI yuzeyi
- `src/components/Settings.jsx`
- operator iki kisilik ekipte tek bakista:
  - trust
  - rollout onerisi
  - release readiness
gorebilir

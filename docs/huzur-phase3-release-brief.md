# Huzur Faz 3 Release Brief

## Amac
AI trust, rollout gate, readiness, ops checklist ve incident sinyallerini tek bir ship/no-ship ozetine donusturmek.

## Katmanlar
- `src/services/aiReleaseBriefService.js`
- `src/components/Settings.jsx`

## Karar turleri
- `ship`
- `staged`
- `no_ship`

## Cikti alanlari
- karar etiketi
- kisa yayin ozeti
- ana riskler
- sonraki 3 adim
- flag / incident / trust ozetleri

## Beklenen kazanim
- iki kisilik ekipte release kararini yorumlamayi hizlandirmak
- AI health panelini operator dostu tek ozet ekranina cevirmek
- faz 3 sonunda geri donmeden ilerlenebilir bir yayin kapisi olusturmak

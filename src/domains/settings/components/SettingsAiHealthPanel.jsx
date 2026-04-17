const renderBadge = (theme, label) => (
  <div
    style={{
      padding: '8px 12px',
      borderRadius: '999px',
      background: theme.bg,
      color: theme.color,
      border: `1px solid ${theme.border || theme.bg}`,
      fontSize: '0.72rem',
      fontWeight: '900',
      textTransform: 'uppercase'
    }}
  >
    {label}
  </div>
);

const renderBulletList = (items = []) => (
  <div style={{ display: 'grid', gap: '6px' }}>
    {items.map((item) => (
      <div key={item} style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', lineHeight: '1.45' }}>
        - {item}
      </div>
    ))}
  </div>
);

function SettingsAiHealthPanel({
  aiGlobalReleaseStatus,
  aiHealthSummary,
  aiIncidentSummary,
  aiOpsChecklist,
  aiReleaseBrief,
  globalReleaseTheme,
  overallHealthTheme,
  releaseBriefTheme,
  releaseReadiness,
  releaseReadinessTheme,
  rolloutGate,
  rolloutGateTheme,
  surfacePalette
}) {
  return (
    <div className="settings-group">
      <div className="settings-group-title premium-text">AI guven durumu</div>
      <div
        className="settings-card premium-glass hover-lift"
        style={{
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '14px',
          border: `1px solid ${overallHealthTheme.border}`,
          background: `linear-gradient(145deg, ${overallHealthTheme.bg}, rgba(15, 118, 110, 0.06))`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div>
            <div className="settings-label">Son AI saglik ozeti</div>
            <div className="settings-desc">
              {aiHealthSummary?.averageTrust
                ? `Ortalama trust ${Math.round(aiHealthSummary.averageTrust * 100)}%`
                : 'Henuz yeterli AI health verisi yok'}
            </div>
          </div>
          {renderBadge(overallHealthTheme, overallHealthTheme.label)}
        </div>

        {aiHealthSummary ? (
          <>
            {aiGlobalReleaseStatus ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '16px',
                  background: globalReleaseTheme.bg,
                  border: `1px solid ${globalReleaseTheme.border}`,
                  display: 'grid',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '900', color: globalReleaseTheme.color, textTransform: 'uppercase' }}>
                    Global release health
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                    {globalReleaseTheme.label}
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                  {aiGlobalReleaseStatus.recommendedAction}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                    Fallback: %{Math.round((aiGlobalReleaseStatus.fallbackRate || 0) * 100)}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                    Low trust: %{Math.round((aiGlobalReleaseStatus.lowTrustRate || 0) * 100)}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                    Stale yuzey: {aiGlobalReleaseStatus.staleSurfaceCount || 0}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                    Weekly cron: {aiGlobalReleaseStatus.weeklyCronHealthy ? 'Saglam' : 'Sorunlu'}
                  </div>
                </div>
              </div>
            ) : null}

            {rolloutGate ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '16px',
                  background: rolloutGateTheme.bg,
                  border: `1px solid ${rolloutGateTheme.bg}`,
                  display: 'grid',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '900', color: rolloutGateTheme.color, textTransform: 'uppercase' }}>
                    Rollout onerisi
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                    {rolloutGate.label}
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                  {rolloutGate.enabledFlagCount}/{rolloutGate.totalFlagCount} AI flag aktif.
                </div>
                {renderBulletList(rolloutGate.actions)}
              </div>
            ) : null}

            {releaseReadiness ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '16px',
                  background: releaseReadinessTheme.bg,
                  border: `1px solid ${releaseReadinessTheme.bg}`,
                  display: 'grid',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '900', color: releaseReadinessTheme.color, textTransform: 'uppercase' }}>
                    Release readiness
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                    {releaseReadinessTheme.label}
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {releaseReadiness.checks.map((check) => (
                    <div key={check.key} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.76rem', color: 'var(--nav-text)', fontWeight: '700' }}>
                        {check.label}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)' }}>
                        {check.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {aiReleaseBrief ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '16px',
                  background: releaseBriefTheme.bg,
                  border: `1px solid ${releaseBriefTheme.border}`,
                  display: 'grid',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '900', color: releaseBriefTheme.color, textTransform: 'uppercase' }}>
                    Yayin briefi
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                    {aiReleaseBrief.label}
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                  {aiReleaseBrief.summary}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                    Flag: {aiReleaseBrief.enabledFlagCount}/{aiReleaseBrief.totalFlagCount}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                    Incident 24s: {aiReleaseBrief.incident24hCount}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                    Watch/Dikkat: {aiReleaseBrief.watchCount}/{aiReleaseBrief.actionCount}
                  </div>
                </div>
                {renderBulletList(aiReleaseBrief.risks)}
                {renderBulletList(aiReleaseBrief.nextSteps)}
              </div>
            ) : null}

            {aiOpsChecklist ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '16px',
                  background: 'rgba(15, 118, 110, 0.08)',
                  border: '1px solid rgba(15, 118, 110, 0.14)',
                  display: 'grid',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '900', color: 'var(--nav-text)', textTransform: 'uppercase' }}>
                    Operator aksiyonlari
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--nav-text-muted)', marginTop: '6px', lineHeight: '1.5' }}>
                    {aiOpsChecklist.headline}
                  </div>
                </div>

                {renderBulletList(aiOpsChecklist.operatorActions)}

                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '900', color: 'var(--nav-text)' }}>
                    Cekirdek smoke seti
                  </div>
                  {aiOpsChecklist.smokeChecks.map((check) => (
                    <div
                      key={check.key}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '14px',
                        background: 'var(--nav-hover)',
                        border: '1px solid var(--nav-border)'
                      }}
                    >
                      <div style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                        {check.label}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', marginTop: '4px', lineHeight: '1.45' }}>
                        {check.detail}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--nav-text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                        Beklenen sinyal: {check.expectedSignal}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '900', color: 'var(--nav-text)' }}>
                    Manuel konsol kontrolleri
                  </div>
                  {aiOpsChecklist.manualConsoleChecks.map((check) => (
                    <div key={check.key} style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', lineHeight: '1.45' }}>
                      - <span style={{ color: 'var(--nav-text)', fontWeight: '700' }}>{check.label}:</span> {check.detail}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '900', color: 'var(--nav-text)' }}>
                    Hizli runbook
                  </div>
                  {aiOpsChecklist.incidentRunbooks.map((runbook) => (
                    <div key={runbook.key} style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', lineHeight: '1.45' }}>
                      - <span style={{ color: 'var(--nav-text)', fontWeight: '700' }}>{runbook.label}:</span> {runbook.trigger} Ilk adim: {runbook.firstStep}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                Dikkat: {aiHealthSummary.actionCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                Izleme: {aiHealthSummary.watchCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                Incident 24s: {aiIncidentSummary?.last24hCount || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                Guncelleme: {aiHealthSummary.latestAiHealthAt ? new Date(aiHealthSummary.latestAiHealthAt).toLocaleString('tr-TR') : 'yok'}
              </div>
            </div>

            {aiIncidentSummary?.latestIncident ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '16px',
                  background: 'rgba(249, 115, 22, 0.10)',
                  border: '1px solid rgba(249, 115, 22, 0.16)',
                  display: 'grid',
                  gap: '6px'
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: '900', color: 'var(--nav-text)' }}>
                  Son AI incident
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', lineHeight: '1.45' }}>
                  {aiIncidentSummary.latestIncident.kind} / {aiIncidentSummary.latestIncident.stage} - {aiIncidentSummary.latestIncident.message || 'Mesaj yok'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--nav-text-muted)' }}>
                  {new Date(aiIncidentSummary.latestIncident.at).toLocaleString('tr-TR')}
                </div>
              </div>
            ) : null}

            <div style={{ display: 'grid', gap: '10px' }}>
              {aiHealthSummary.surfaces.map((surface) => {
                const surfaceTheme = surfacePalette[surface.status] || surfacePalette.watch;

                return (
                  <div
                    key={surface.key}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '16px',
                      background: 'var(--nav-hover)',
                      border: '1px solid var(--nav-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                        {surface.label}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', marginTop: '4px', lineHeight: '1.45' }}>
                        {surface.warning || `${surface.sourceCount} kaynak sinyali mevcut`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: '900', color: surfaceTheme.color, textTransform: 'uppercase' }}>
                        {surfaceTheme.label}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', marginTop: '4px' }}>
                        {Number.isFinite(surface.trustScore) ? `%${Math.round(surface.trustScore * 100)}` : 'Trust yok'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="settings-desc">AI health sinyalleri yukleniyor.</div>
        )}
      </div>
    </div>
  );
}

export default SettingsAiHealthPanel;

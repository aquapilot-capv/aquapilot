-- Ajoute le nom de l'agent sur chaque mesure (affiché dans « relevé par … »)
ALTER TABLE mesures ADD COLUMN IF NOT EXISTS agent TEXT;
CREATE INDEX IF NOT EXISTS idx_mesures_date ON mesures (date_mesure);

-- Ne garder « actifs » que les captages jaugés depuis 2024 (Chantabot, La Placette… passent en historique)
UPDATE sites SET actif = FALSE
WHERE type = 'captage'
  AND id NOT IN (
    SELECT DISTINCT p.site_id FROM points p JOIN mesures m ON m.point_id = p.id
    WHERE p.famille = 'jaugeage' AND m.date_mesure >= '2024-01-01');

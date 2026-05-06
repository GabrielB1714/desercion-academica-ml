const riskClassByLevel = {
  bajo: 'risk-low',
  medio: 'risk-medium',
  alto: 'risk-high',
};

function normalizeRiskLevel(level) {
  return String(level || '').trim().toLowerCase();
}

function ResultComponent({ result, isLoading }) {
  if (isLoading) {
    return <div className="result-card loading-card">Calculando predicción...</div>;
  }

  if (!result) {
    return null;
  }

  const normalizedLevel = normalizeRiskLevel(result.risk_level);
  const riskClass = riskClassByLevel[normalizedLevel] || 'risk-neutral';
  const riskPercentage = Number(result.risk_percentage);
  const formattedPercentage = Number.isNaN(riskPercentage)
    ? result.risk_percentage
    : `${riskPercentage.toFixed(2)}%`;

  return (
    <article className={`result-card ${riskClass}`}>
      <p className="result-label">Resultado de predicción</p>
      <h2>{result.risk_level}</h2>
      <p className="risk-percentage">{formattedPercentage}</p>
    </article>
  );
}

export default ResultComponent;

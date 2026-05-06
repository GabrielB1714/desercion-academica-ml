import { useState } from 'react';
import './App.css';
import FormComponent from './components/FormComponent';
import ResultComponent from './components/ResultComponent';

function App() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="app-shell">
      <section className="app-card">
        <div className="app-header">
          <p className="eyebrow">Predicción de deserción académica</p>
          <h1>Formulario de datos del estudiante</h1>
          <p>
            Ingresa notas, asistencia y contexto académico para calcular el
            riesgo de deserción con el servicio Flask.
          </p>
        </div>

        <FormComponent
          onResult={setPredictionResult}
          onLoadingChange={setIsLoading}
        />

        <ResultComponent result={predictionResult} isLoading={isLoading} />
      </section>
    </main>
  );
}

export default App;

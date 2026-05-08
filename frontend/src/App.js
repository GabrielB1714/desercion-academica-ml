import { useState } from 'react';
import './App.css';
import FormComponent from './components/FormComponent';
import ResultComponent from './components/ResultComponent';
import StudentsTable from './components/StudentsTable';

function App() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studentsHistory, setStudentsHistory] = useState([]);

  const addStudentPrediction = (studentPrediction) => {
    setStudentsHistory((currentHistory) => [
      {
        id: `${Date.now()}-${currentHistory.length}`,
        ...studentPrediction,
      },
      ...currentHistory,
    ]);
  };

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
          onPredictionCreated={addStudentPrediction}
        />

        <ResultComponent result={predictionResult} isLoading={isLoading} />

        <StudentsTable students={studentsHistory} />
      </section>
    </main>
  );
}

export default App;

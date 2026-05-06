import { useMemo, useState } from 'react';

const PREDICT_URL = 'http://localhost:5000/predict';

const emptyFormValues = {
  grade: '',
  attendance: '',
  failedSubjects: '',
  socioeconomicLevel: '1',
};

function calculateAverage(values) {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
}

function FormComponent({ onResult, onLoadingChange }) {
  const [formValues, setFormValues] = useState(emptyFormValues);
  const [grades, setGrades] = useState([]);
  const [attendanceValues, setAttendanceValues] = useState([]);
  const [errors, setErrors] = useState({});

  const averageGrade = useMemo(() => calculateAverage(grades), [grades]);
  const attendancePercentage = useMemo(
    () => calculateAverage(attendanceValues),
    [attendanceValues]
  );

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const validateNumber = (value, min, max, label) => {
    if (value === '') {
      return `${label} es obligatorio.`;
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return `${label} debe ser un número válido.`;
    }

    if (numericValue < min || numericValue > max) {
      return `${label} debe estar entre ${min} y ${max}.`;
    }

    return '';
  };

  const addGrade = () => {
    const error = validateNumber(formValues.grade, 0, 5, 'La nota');

    if (error) {
      setErrors((currentErrors) => ({ ...currentErrors, grade: error }));
      return;
    }

    setGrades((currentGrades) => [...currentGrades, Number(formValues.grade)]);
    setFormValues((currentValues) => ({ ...currentValues, grade: '' }));
    setErrors((currentErrors) => ({ ...currentErrors, grade: '' }));
  };

  const addAttendance = () => {
    const error = validateNumber(
      formValues.attendance,
      0,
      100,
      'La asistencia'
    );

    if (error) {
      setErrors((currentErrors) => ({ ...currentErrors, attendance: error }));
      return;
    }

    setAttendanceValues((currentValues) => [
      ...currentValues,
      Number(formValues.attendance),
    ]);
    setFormValues((currentValues) => ({ ...currentValues, attendance: '' }));
    setErrors((currentErrors) => ({ ...currentErrors, attendance: '' }));
  };

  const removeGrade = (indexToRemove) => {
    setGrades((currentGrades) =>
      currentGrades.filter((_, index) => index !== indexToRemove)
    );
  };

  const removeAttendance = (indexToRemove) => {
    setAttendanceValues((currentValues) =>
      currentValues.filter((_, index) => index !== indexToRemove)
    );
  };

  const validateForm = () => {
    const nextErrors = {};

    if (grades.length === 0) {
      nextErrors.grades = 'Ingresa al menos una nota para calcular el promedio.';
    }

    if (attendanceValues.length === 0) {
      nextErrors.attendanceValues =
        'Ingresa al menos un valor de asistencia para calcular el promedio.';
    }

    const failedSubjectsError = validateNumber(
      formValues.failedSubjects,
      0,
      99,
      'Materias perdidas'
    );

    if (failedSubjectsError) {
      nextErrors.failedSubjects = failedSubjectsError;
    }

    const socioeconomicError = validateNumber(
      formValues.socioeconomicLevel,
      1,
      3,
      'Nivel socioeconómico'
    );

    if (socioeconomicError) {
      nextErrors.socioeconomicLevel = socioeconomicError;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      onResult(null);
      return;
    }

    const payload = {
      average_grade: averageGrade,
      attendance_percentage: attendancePercentage,
      failed_subjects: Number(formValues.failedSubjects),
      socioeconomic_level: Number(formValues.socioeconomicLevel),
    };

    try {
      onLoadingChange(true);
      setErrors({});

      const response = await fetch(PREDICT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener la predicción.');
      }

      const prediction = await response.json();
      onResult(prediction);
    } catch (error) {
      onResult(null);
      setErrors((currentErrors) => ({
        ...currentErrors,
        submit:
          'Ocurrió un error al conectar con el servidor de predicción. Verifica que Flask esté activo en el puerto 5000.',
      }));
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <section className="form-section">
        <div className="section-heading">
          <h2>Notas</h2>
          <span>Promedio: {averageGrade.toFixed(2)}</span>
        </div>

        <div className="inline-control">
          <label htmlFor="grade">Agregar nota</label>
          <input
            id="grade"
            name="grade"
            type="number"
            min="0"
            max="5"
            step="0.01"
            value={formValues.grade}
            onChange={updateField}
            placeholder="Ej: 4.2"
          />
          <button type="button" onClick={addGrade}>
            Agregar
          </button>
        </div>
        {errors.grade && <p className="error-message">{errors.grade}</p>}
        {errors.grades && <p className="error-message">{errors.grades}</p>}

        <ul className="value-list" aria-label="Notas ingresadas">
          {grades.map((grade, index) => (
            <li key={`${grade}-${index}`}>
              <span>{grade.toFixed(2)}</span>
              <button type="button" onClick={() => removeGrade(index)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="form-section">
        <div className="section-heading">
          <h2>Asistencia</h2>
          <span>Promedio: {attendancePercentage.toFixed(2)}%</span>
        </div>

        <div className="inline-control">
          <label htmlFor="attendance">Agregar asistencia</label>
          <input
            id="attendance"
            name="attendance"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formValues.attendance}
            onChange={updateField}
            placeholder="Ej: 92"
          />
          <button type="button" onClick={addAttendance}>
            Agregar
          </button>
        </div>
        {errors.attendance && (
          <p className="error-message">{errors.attendance}</p>
        )}
        {errors.attendanceValues && (
          <p className="error-message">{errors.attendanceValues}</p>
        )}

        <ul className="value-list" aria-label="Asistencias ingresadas">
          {attendanceValues.map((attendance, index) => (
            <li key={`${attendance}-${index}`}>
              <span>{attendance.toFixed(2)}%</span>
              <button type="button" onClick={() => removeAttendance(index)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="form-section grid-section">
        <div className="field-control">
          <label htmlFor="failedSubjects">Materias perdidas</label>
          <input
            id="failedSubjects"
            name="failedSubjects"
            type="number"
            min="0"
            step="1"
            value={formValues.failedSubjects}
            onChange={updateField}
            placeholder="Ej: 1"
          />
          {errors.failedSubjects && (
            <p className="error-message">{errors.failedSubjects}</p>
          )}
        </div>

        <div className="field-control">
          <label htmlFor="socioeconomicLevel">Nivel socioeconómico</label>
          <select
            id="socioeconomicLevel"
            name="socioeconomicLevel"
            value={formValues.socioeconomicLevel}
            onChange={updateField}
          >
            <option value="1">1 - Bajo</option>
            <option value="2">2 - Medio</option>
            <option value="3">3 - Alto</option>
          </select>
          {errors.socioeconomicLevel && (
            <p className="error-message">{errors.socioeconomicLevel}</p>
          )}
        </div>
      </section>

      {errors.submit && <p className="error-message submit-error">{errors.submit}</p>}

      <button className="submit-button" type="submit">
        Calcular riesgo
      </button>
    </form>
  );
}

export default FormComponent;

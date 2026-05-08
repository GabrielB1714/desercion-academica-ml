import { useMemo, useState } from 'react';

const PREDICT_URL = 'http://localhost:5000/predict';

const emptyFormValues = {
  studentName: '',
  faculty: '',
  course: '',
  grade: '',
  totalClasses: '',
  absences: '',
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

function calculateAttendancePercentage(totalClasses, absences) {
  const total = Number(totalClasses);
  const missed = Number(absences);

  if (!total || total <= 0 || Number.isNaN(total) || Number.isNaN(missed)) {
    return 0;
  }

  return Number((((total - missed) / total) * 100).toFixed(2));
}

function FormComponent({ onResult, onLoadingChange, onPredictionCreated }) {
  const [formValues, setFormValues] = useState(emptyFormValues);
  const [grades, setGrades] = useState([]);
  const [errors, setErrors] = useState({});

  const averageGrade = useMemo(() => calculateAverage(grades), [grades]);
  const attendancePercentage = useMemo(
    () =>
      calculateAttendancePercentage(
        formValues.totalClasses,
        formValues.absences
      ),
    [formValues.totalClasses, formValues.absences]
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

  const removeGrade = (indexToRemove) => {
    setGrades((currentGrades) =>
      currentGrades.filter((_, index) => index !== indexToRemove)
    );
  };

  const validateAttendance = (nextErrors) => {
    const totalClasses = Number(formValues.totalClasses);
    const absences = Number(formValues.absences);

    if (formValues.totalClasses === '' || Number.isNaN(totalClasses)) {
      nextErrors.totalClasses = 'El total de clases es obligatorio.';
    } else if (totalClasses <= 0) {
      nextErrors.totalClasses = 'El total de clases debe ser mayor que 0.';
    }

    if (formValues.absences === '' || Number.isNaN(absences)) {
      nextErrors.absences = 'Las faltas son obligatorias.';
    } else if (absences < 0) {
      nextErrors.absences = 'Las faltas no pueden ser negativas.';
    } else if (!Number.isNaN(totalClasses) && totalClasses > 0 && absences > totalClasses) {
      nextErrors.absences = 'Las faltas no pueden superar el total de clases.';
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formValues.studentName.trim()) {
      nextErrors.studentName = 'El nombre del estudiante es obligatorio.';
    }

    if (!formValues.faculty.trim()) {
      nextErrors.faculty = 'La facultad es obligatoria.';
    }

    if (!formValues.course.trim()) {
      nextErrors.course = 'El curso es obligatorio.';
    }

    if (grades.length === 0) {
      nextErrors.grades = 'Ingresa al menos una nota para calcular el promedio.';
    }

    validateAttendance(nextErrors);

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
      onPredictionCreated({
        studentName: formValues.studentName.trim(),
        faculty: formValues.faculty.trim(),
        course: formValues.course.trim(),
        averageGrade,
        totalClasses: Number(formValues.totalClasses),
        absences: Number(formValues.absences),
        attendancePercentage,
        failedSubjects: payload.failed_subjects,
        socioeconomicLevel: payload.socioeconomic_level,
        riskPercentage: prediction.risk_percentage,
        riskLevel: prediction.risk_level,
      });
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
      <section className="form-section grid-section">
        <div className="field-control">
          <label htmlFor="studentName">Nombre del estudiante</label>
          <input
            id="studentName"
            name="studentName"
            type="text"
            value={formValues.studentName}
            onChange={updateField}
            placeholder="Ej: Laura Gómez"
          />
          {errors.studentName && (
            <p className="error-message">{errors.studentName}</p>
          )}
        </div>

        <div className="field-control">
          <label htmlFor="faculty">Facultad</label>
          <input
            id="faculty"
            name="faculty"
            type="text"
            value={formValues.faculty}
            onChange={updateField}
            placeholder="Ej: Ingeniería"
          />
          {errors.faculty && <p className="error-message">{errors.faculty}</p>}
        </div>

        <div className="field-control">
          <label htmlFor="course">Curso</label>
          <input
            id="course"
            name="course"
            type="text"
            value={formValues.course}
            onChange={updateField}
            placeholder="Ej: Programación I"
          />
          {errors.course && <p className="error-message">{errors.course}</p>}
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

      <section className="form-section">
        <div className="section-heading">
          <h2>Promedio académico</h2>
          <span>{averageGrade.toFixed(2)}</span>
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
          <span>{attendancePercentage.toFixed(2)}%</span>
        </div>

        <div className="grid-section">
          <div className="field-control">
            <label htmlFor="totalClasses">Total de clases</label>
            <input
              id="totalClasses"
              name="totalClasses"
              type="number"
              min="1"
              step="1"
              value={formValues.totalClasses}
              onChange={updateField}
              placeholder="Ej: 40"
            />
            {errors.totalClasses && (
              <p className="error-message">{errors.totalClasses}</p>
            )}
          </div>

          <div className="field-control">
            <label htmlFor="absences">Faltas</label>
            <input
              id="absences"
              name="absences"
              type="number"
              min="0"
              step="1"
              value={formValues.absences}
              onChange={updateField}
              placeholder="Ej: 4"
            />
            {errors.absences && <p className="error-message">{errors.absences}</p>}
          </div>
        </div>

        <p className="calculated-help">
          attendance_percentage = ((total_classes - absences) / total_classes) × 100
        </p>
      </section>

      <section className="form-section">
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
      </section>

      {errors.submit && <p className="error-message submit-error">{errors.submit}</p>}

      <button className="submit-button" type="submit">
        Calcular riesgo
      </button>
    </form>
  );
}

export default FormComponent;

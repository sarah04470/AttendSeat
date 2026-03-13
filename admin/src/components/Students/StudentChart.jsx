import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './StudentChart.css';

function StudentChart() {
  const [students, setStudents] = useState([]);
  const [year] = useState(2026);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('students/list', { params: { year, limit: 200 } });
        if (res.data.success) setStudents(res.data.data.list);
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
  }, []);

  const grades = [1, 2, 3];
  const classes = [1, 2, 3];

  const getStudents = (grade, cls) => {
    return students
      .filter(s => s.stu_grade === grade && s.stu_class === cls && s.stu_status === 'Y')
      .sort((a, b) => a.stu_number - b.stu_number);
  };

  const getClassInfo = (grade, cls) => {
    const list = getStudents(grade, cls);
    if (cls === 1) return { label: '음악', color: '#7a8cb5', bg: '#f2f5fa', border: '#e2e8f0' };
    return { label: '미술', color: '#a8899a', bg: '#f8f4f7', border: '#ebe3e8' };
  };

  const genderCount = (list, g) => list.filter(s => s.stu_gender === g).length;

  return (
    <div className="student-chart">
      {grades.map(grade => (
        <div className="chart-grade" key={grade}>
          <div className="grade-header">
            <span className="grade-title">{grade}학년</span>
            <span className="grade-count">{students.filter(s => s.stu_grade === grade && s.stu_status === 'Y').length}명</span>
          </div>
          <div className="grade-classes">
            {classes.map(cls => {
              const list = getStudents(grade, cls);
              const info = getClassInfo(grade, cls);
              const males = genderCount(list, 'M');
              const females = genderCount(list, 'F');

              return (
                <div className="class-card" key={cls}>
                  <div className="class-header" style={{ background: info.bg, borderColor: info.border }}>
                    <div className="class-title-row">
                      <span className="class-name" style={{ color: info.color }}>{cls}반</span>
                      <span className="class-major" style={{ color: info.color }}>{info.label}</span>
                    </div>
                    <div className="class-stats">
                      <span className="stat-total">{list.length}명</span>
                      <span className="stat-gender">
                        <span className="stat-male">남 {males}</span>
                        <span className="stat-divider">/</span>
                        <span className="stat-female">여 {females}</span>
                      </span>
                    </div>
                  </div>
                  <div className="class-students">
                    {list.map(stu => (
                      <div className="student-chip" key={stu.stu_idx}>
                        <span className="chip-number">{stu.stu_number}</span>
                        <span className="chip-name">{stu.stu_name}</span>
                        <span className={`chip-gender ${stu.stu_gender === 'M' ? 'male' : 'female'}`}>
                          {stu.stu_gender === 'M' ? '남' : '여'}
                        </span>
                        {stu.stu_sub_major && (
                          <span className="chip-sub-major">{stu.stu_sub_major}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentChart;

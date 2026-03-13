import React, { useState } from 'react';
import StudentList from './StudentList';
import StudentChart from './StudentChart';

function StudentPage() {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div>
      <div className="student-tab-bar">
        <button
          className={`student-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          학생 목록
        </button>
        <button
          className={`student-tab-btn ${activeTab === 'chart' ? 'active' : ''}`}
          onClick={() => setActiveTab('chart')}
        >
          반 조직도
        </button>
      </div>

      {activeTab === 'list' && <StudentList />}
      {activeTab === 'chart' && <StudentChart />}
    </div>
  );
}

export default StudentPage;

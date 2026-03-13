import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Pagination from '@mui/material/Pagination';
import api from '../../api/axios';
import './StudentList.css';

function StudentList() {
  const userAuth = useSelector(state => state.user.userData.auth);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pagerow] = useState(50);

  // 필터
  const [grade, setGrade] = useState('');
  const [cls, setCls] = useState('');
  const [major, setMajor] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // 수정 모달
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchList = async () => {
    try {
      const params = { page, limit: pagerow, year: 2026 };
      if (grade) params.grade = grade;
      if (cls) params.class = cls;
      if (keyword) params.keyword = keyword;

      const res = await api.get('students/list', { params });
      if (res.data.success) {
        let data = res.data.data.list;
        if (major) data = data.filter(s => s.stu_major === major);
        setList(data);
        setTotal(res.data.data.total);
      }
    } catch (error) {
      console.error('학생 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, grade, cls, major, keyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
    setPage(1);
  };

  const handleReset = () => {
    setGrade('');
    setCls('');
    setMajor('');
    setKeyword('');
    setSearchInput('');
    setPage(1);
  };

  const genderLabel = (g) => g === 'M' ? '남' : g === 'F' ? '여' : '-';
  const statusLabel = (s) => ({ Y: '재학', N: '졸업', T: '자퇴', R: '전학', D: '삭제' }[s] || s);

  // 수정 모달 열기
  const openEdit = (stu) => {
    if (userAuth < 8) return;
    setEditData({ ...stu });
    setEditModal(true);
  };

  const closeEdit = () => {
    setEditModal(false);
    setEditData(null);
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      const res = await api.put(`students/update/${editData.stu_idx}`, {
        stu_grade: editData.stu_grade,
        stu_class: editData.stu_class,
        stu_number: editData.stu_number,
        stu_name: editData.stu_name,
        stu_gender: editData.stu_gender,
        stu_major: editData.stu_major,
        stu_sub_major: editData.stu_sub_major,
        stu_status: editData.stu_status,
        stu_id: editData.stu_id,
        stu_memo: editData.stu_memo,
      });
      if (res.data.success) {
        alert('학생 정보가 수정되었습니다.');
        closeEdit();
        fetchList();
      }
    } catch (error) {
      alert(error.response?.data?.error?.message || '수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="student-list">
      {/* 필터 */}
      <div className="filter-container">
        <div className="filter-row">
          <div className="filter-cell">
            <span className="filter-label">학년</span>
            <div className="filter-group">
              <button className={`filter-btn ${grade === '' ? 'active' : ''}`} onClick={() => { setGrade(''); setCls(''); setPage(1); }}>전체</button>
              <button className={`filter-btn ${grade === 1 ? 'active' : ''}`} onClick={() => { setGrade(1); setCls(''); setPage(1); }}>1학년</button>
              <button className={`filter-btn ${grade === 2 ? 'active' : ''}`} onClick={() => { setGrade(2); setCls(''); setPage(1); }}>2학년</button>
              <button className={`filter-btn ${grade === 3 ? 'active' : ''}`} onClick={() => { setGrade(3); setCls(''); setPage(1); }}>3학년</button>
            </div>
          </div>
          <div className="filter-cell">
            <span className="filter-label">반</span>
            <div className="filter-group">
              <button className={`filter-btn ${cls === '' ? 'active' : ''}`} onClick={() => { setCls(''); setPage(1); }}>전체</button>
              <button className={`filter-btn ${cls === 1 ? 'active' : ''}`} onClick={() => { setCls(1); setPage(1); }}>1반</button>
              <button className={`filter-btn ${cls === 2 ? 'active' : ''}`} onClick={() => { setCls(2); setPage(1); }}>2반</button>
              <button className={`filter-btn ${cls === 3 ? 'active' : ''}`} onClick={() => { setCls(3); setPage(1); }}>3반</button>
            </div>
          </div>
          <div className="filter-cell">
            <span className="filter-label">전공</span>
            <div className="filter-group">
              <button className={`filter-btn major ${major === '' ? 'active' : ''}`} onClick={() => { setMajor(''); setPage(1); }}>전체</button>
              <button className={`filter-btn major ${major === '음악' ? 'active' : ''}`} onClick={() => { setMajor('음악'); setPage(1); }}>음악</button>
              <button className={`filter-btn major ${major === '미술' ? 'active' : ''}`} onClick={() => { setMajor('미술'); setPage(1); }}>미술</button>
            </div>
          </div>
        </div>
        <div className="filter-search-row">
          <form onSubmit={handleSearch} className="filter-search-form">
            <input
              type="text"
              className="search-input"
              placeholder="이름 또는 학번으로 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="search-btn">검색</button>
            <button type="button" className="filter-reset-btn" onClick={handleReset}>초기화</button>
          </form>
        </div>
      </div>

      {/* 목록 */}
      <div className="list-container">
        <div className="title-box">
          <span className="title">학생 목록</span>
          <span className="count">총 {list.length}명 {total > pagerow ? `(전체 ${total}명)` : ''}</span>
        </div>

        <table className="list-table">
          <thead>
            <tr>
              <th className="table-head" style={{width: 50}}>No</th>
              <th className="table-head" style={{width: 60}}>학년</th>
              <th className="table-head" style={{width: 50}}>반</th>
              <th className="table-head" style={{width: 50}}>번호</th>
              <th className="table-head" style={{width: 80}}>학번</th>
              <th className="table-head" style={{width: 90}}>이름</th>
              <th className="table-head" style={{width: 50}}>성별</th>
              <th className="table-head" style={{width: 70}}>전공</th>
              <th className="table-head" style={{width: 140}}>세부전공</th>
              <th className="table-head" style={{width: 70}}>상태</th>
              {userAuth >= 8 && <th className="table-head" style={{width: 60}}>관리</th>}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={userAuth >= 8 ? 11 : 10} className="no-data">학생 데이터가 없습니다.</td>
              </tr>
            ) : (
              list.map((stu, idx) => (
                <tr className="body-row" key={stu.stu_idx}>
                  <td className="table-data">{(page - 1) * pagerow + idx + 1}</td>
                  <td className="table-data">{stu.stu_grade}학년</td>
                  <td className="table-data">{stu.stu_class}반</td>
                  <td className="table-data">{stu.stu_number}</td>
                  <td className="table-data">
                    <span className="student-id">{stu.stu_id || '-'}</span>
                  </td>
                  <td className="table-data" style={{fontWeight: 600}}>{stu.stu_name}</td>
                  <td className="table-data">
                    {stu.stu_gender ? (
                      <span className={`gender-badge ${stu.stu_gender === 'M' ? 'male' : 'female'}`}>
                        {genderLabel(stu.stu_gender)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="table-data">
                    {stu.stu_major ? (
                      <span className={`major-badge ${stu.stu_major === '음악' ? 'music' : 'art'}`}>
                        {stu.stu_major}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="table-data">
                    <span className="sub-major-text">{stu.stu_sub_major || '-'}</span>
                  </td>
                  <td className="table-data">
                    <span className={`status-badge ${stu.stu_status === 'Y' ? 'active' : 'inactive'}`}>
                      {statusLabel(stu.stu_status)}
                    </span>
                  </td>
                  {userAuth >= 8 && (
                    <td className="table-data">
                      <button className="edit-btn" onClick={() => openEdit(stu)}>수정</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {total > pagerow && (
          <div className="pagination-wrap">
            <Pagination
              count={Math.ceil(total / pagerow)}
              page={page}
              onChange={(e, v) => setPage(v)}
              color="primary"
            />
          </div>
        )}
      </div>

      {/* 수정 모달 */}
      {editModal && editData && (
        <div className="edit-overlay" onClick={closeEdit}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <div className="edit-modal-header">
              <span className="edit-modal-title">학생 정보 수정</span>
              <button className="edit-modal-close" onClick={closeEdit}>&times;</button>
            </div>
            <div className="edit-modal-body">
              <div className="edit-row">
                <div className="edit-field">
                  <label className="edit-label">학년</label>
                  <select className="edit-select" value={editData.stu_grade} onChange={e => handleEditChange('stu_grade', Number(e.target.value))}>
                    <option value={1}>1학년</option>
                    <option value={2}>2학년</option>
                    <option value={3}>3학년</option>
                  </select>
                </div>
                <div className="edit-field">
                  <label className="edit-label">반</label>
                  <select className="edit-select" value={editData.stu_class} onChange={e => handleEditChange('stu_class', Number(e.target.value))}>
                    <option value={1}>1반</option>
                    <option value={2}>2반</option>
                    <option value={3}>3반</option>
                  </select>
                </div>
                <div className="edit-field">
                  <label className="edit-label">번호</label>
                  <input className="edit-input" type="number" value={editData.stu_number} onChange={e => handleEditChange('stu_number', Number(e.target.value))} />
                </div>
              </div>
              <div className="edit-row">
                <div className="edit-field wide">
                  <label className="edit-label">이름</label>
                  <input className="edit-input" type="text" value={editData.stu_name} onChange={e => handleEditChange('stu_name', e.target.value)} />
                </div>
                <div className="edit-field">
                  <label className="edit-label">성별</label>
                  <select className="edit-select" value={editData.stu_gender || ''} onChange={e => handleEditChange('stu_gender', e.target.value)}>
                    <option value="">-</option>
                    <option value="M">남</option>
                    <option value="F">여</option>
                  </select>
                </div>
              </div>
              <div className="edit-row">
                <div className="edit-field">
                  <label className="edit-label">전공</label>
                  <select className="edit-select" value={editData.stu_major || ''} onChange={e => handleEditChange('stu_major', e.target.value)}>
                    <option value="">-</option>
                    <option value="음악">음악</option>
                    <option value="미술">미술</option>
                  </select>
                </div>
                <div className="edit-field wide">
                  <label className="edit-label">세부전공</label>
                  <input className="edit-input" type="text" value={editData.stu_sub_major || ''} onChange={e => handleEditChange('stu_sub_major', e.target.value)} />
                </div>
              </div>
              <div className="edit-row">
                <div className="edit-field">
                  <label className="edit-label">학번</label>
                  <input className="edit-input" type="text" value={editData.stu_id || ''} onChange={e => handleEditChange('stu_id', e.target.value)} />
                </div>
                <div className="edit-field">
                  <label className="edit-label">상태</label>
                  <select className="edit-select" value={editData.stu_status} onChange={e => handleEditChange('stu_status', e.target.value)}>
                    <option value="Y">재학</option>
                    <option value="N">졸업</option>
                    <option value="T">자퇴</option>
                    <option value="R">전학</option>
                    <option value="D">삭제</option>
                  </select>
                </div>
              </div>
              <div className="edit-row">
                <div className="edit-field full">
                  <label className="edit-label">메모</label>
                  <textarea className="edit-textarea" rows={3} value={editData.stu_memo || ''} onChange={e => handleEditChange('stu_memo', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="edit-modal-footer">
              <button className="edit-cancel-btn" onClick={closeEdit}>취소</button>
              <button className="edit-save-btn" onClick={handleEditSave} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentList;

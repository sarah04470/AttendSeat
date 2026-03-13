import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import './DefaultRoom.css';

// 검색 가능한 장소 셀렉트
function RoomSearchSelect({ value, rooms, onChange, major }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentRoom = rooms.find(r => String(r.room_idx) === String(value));
  const filtered = search
    ? rooms.filter(r => r.room_name.toLowerCase().includes(search.toLowerCase()))
    : rooms;

  // 전공별 그룹
  const artRooms = filtered.filter(r => r.room_type === 'practice' && !r.room_name.startsWith('음악') && r.room_name !== '시창청음실' && r.room_name !== '거울실');
  const musicSpecial = filtered.filter(r => r.room_name === '시창청음실' || r.room_name === '거울실');
  const musicNumbered = filtered.filter(r => r.room_name.startsWith('음악')).sort((a, b) => {
    return parseInt((a.room_name.match(/\d+/) || [0])[0]) - parseInt((b.room_name.match(/\d+/) || [0])[0]);
  });
  const studyRooms = filtered.filter(r => r.room_type === 'study');

  // 전공 기준 순서
  let groups = [];
  if (major === '미술') {
    if (artRooms.length) groups.push({ label: '미술 실기실', items: artRooms });
    if (studyRooms.length) groups.push({ label: '어학실', items: studyRooms });
    if (musicSpecial.length || musicNumbered.length) groups.push({ label: '음악 연습실', items: [...musicSpecial, ...musicNumbered] });
  } else if (major === '음악') {
    if (musicSpecial.length || musicNumbered.length) groups.push({ label: '음악 연습실', items: [...musicSpecial, ...musicNumbered] });
    if (studyRooms.length) groups.push({ label: '어학실', items: studyRooms });
    if (artRooms.length) groups.push({ label: '미술 실기실', items: artRooms });
  } else {
    if (artRooms.length) groups.push({ label: '미술 실기실', items: artRooms });
    if (musicSpecial.length || musicNumbered.length) groups.push({ label: '음악 연습실', items: [...musicSpecial, ...musicNumbered] });
    if (studyRooms.length) groups.push({ label: '어학실', items: studyRooms });
  }

  const handleSelect = (room_idx) => {
    onChange(room_idx);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="room-search-select" ref={ref}>
      <div className={`rss-trigger ${value ? '' : 'empty'}`} onClick={() => setOpen(!open)}>
        <span>{currentRoom ? currentRoom.room_name : '미배정'}</span>
        <span className="rss-arrow">&#8250;</span>
      </div>
      {open && (
        <div className="rss-dropdown">
          <input
            className="rss-search"
            type="text"
            placeholder="장소 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className="rss-options">
            <div className="rss-option empty-opt" onClick={() => handleSelect('')}>미배정</div>
            {groups.map(g => (
              <div key={g.label}>
                <div className="rss-group-label">{g.label}</div>
                {g.items.map(r => (
                  <div
                    key={r.room_idx}
                    className={`rss-option ${String(r.room_idx) === String(value) ? 'selected' : ''}`}
                    onClick={() => handleSelect(r.room_idx)}
                  >
                    {r.room_name}
                    {r.room_floor && <span className="rss-floor">{r.room_floor}</span>}
                  </div>
                ))}
              </div>
            ))}
            {groups.length === 0 && <div className="rss-no-result">결과 없음</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function DefaultRoom() {
  const userAuth = useSelector(state => state.user.userData.auth);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [grade, setGrade] = useState(1);
  const [cls, setCls] = useState('');
  const [changes, setChanges] = useState({});
  const [saving, setSaving] = useState(false);
  const [openClasses, setOpenClasses] = useState({});

  const fetchData = async () => {
    try {
      const params = { grade };
      if (cls) params.class = cls;
      const [stuRes, roomRes] = await Promise.all([
        api.get('default-room/list', { params }),
        api.get('rooms/list'),
      ]);
      if (stuRes.data.success) setStudents(stuRes.data.data.list);
      if (roomRes.data.success) setRooms(roomRes.data.data.list);
    } catch (e) {
      console.error('데이터 조회 실패:', e);
    }
  };

  useEffect(() => {
    fetchData();
    setChanges({});
    setOpenClasses({});
  }, [grade, cls]);

  const handleRoomChange = (stu_idx, room_idx) => {
    setChanges(prev => ({ ...prev, [stu_idx]: room_idx }));
  };

  const getCurrentRoomIdx = (stu) => {
    if (changes[stu.stu_idx] !== undefined) return changes[stu.stu_idx];
    return stu.room_idx || '';
  };

  const hasChanges = Object.keys(changes).length > 0;

  const handleSave = async () => {
    const assignments = Object.entries(changes)
      .filter(([, room_idx]) => room_idx)
      .map(([stu_idx, room_idx]) => ({ stu_idx: Number(stu_idx), room_idx: Number(room_idx) }));

    if (assignments.length === 0) return;
    setSaving(true);
    try {
      const res = await api.post('default-room/bulk-assign', { assignments });
      if (res.data.success) {
        alert(res.data.message);
        setChanges({});
        fetchData();
      }
    } catch (e) {
      alert(e.response?.data?.error?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setChanges({});

  const grouped = {};
  students.forEach(s => {
    const key = s.stu_class;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  const assignedCount = students.filter(s => s.room_idx || changes[s.stu_idx]).length;

  const toggleClass = (classNum) => {
    setOpenClasses(prev => ({ ...prev, [classNum]: !prev[classNum] }));
  };

  const isClassOpen = (classNum) => openClasses[classNum] !== false; // 기본 열림

  return (
    <div className="default-room">
      <div className="dr-header">
        <div className="dr-title-row">
          <span className="dr-title">기본 배정</span>
          <span className="dr-subtitle">학생별 야자 기본 연습실 배정</span>
        </div>
        {userAuth >= 8 && hasChanges && (
          <div className="dr-action-row">
            <button className="dr-reset-btn" onClick={handleReset}>취소</button>
            <button className="dr-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? '저장 중...' : `${Object.keys(changes).length}건 저장`}
            </button>
          </div>
        )}
      </div>

      <div className="dr-filter">
        <div className="dr-filter-group">
          <span className="dr-filter-label">학년</span>
          {[1, 2, 3].map(g => (
            <button key={g} className={`dr-filter-btn ${grade === g ? 'active' : ''}`} onClick={() => { setGrade(g); setCls(''); }}>
              {g}학년
            </button>
          ))}
        </div>
        <div className="dr-filter-group">
          <span className="dr-filter-label">반</span>
          <button className={`dr-filter-btn ${cls === '' ? 'active' : ''}`} onClick={() => setCls('')}>전체</button>
          {[1, 2, 3].map(c => (
            <button key={c} className={`dr-filter-btn ${cls === c ? 'active' : ''}`} onClick={() => setCls(c)}>
              {c}반
            </button>
          ))}
        </div>
        <div className="dr-stats">
          배정 <strong>{assignedCount}</strong>/{students.length}
        </div>
      </div>

      {Object.keys(grouped).sort().map(classNum => (
        <div className="dr-class-section" key={classNum}>
          <div className="dr-class-header" onClick={() => toggleClass(classNum)}>
            <span className={`dr-class-arrow ${isClassOpen(classNum) ? 'open' : ''}`}>&#8250;</span>
            <span className="dr-class-title">{grade}-{classNum}</span>
            <span className="dr-class-count">{grouped[classNum].length}명</span>
          </div>
          {isClassOpen(classNum) && <table className="dr-table">
            <thead>
              <tr>
                <th className="dr-th" style={{width: 40}}>번호</th>
                <th className="dr-th" style={{width: 70}}>이름</th>
                <th className="dr-th" style={{width: 50}}>전공</th>
                <th className="dr-th" style={{width: 90}}>세부전공</th>
                <th className="dr-th" style={{width: 180}}>배정 장소</th>
              </tr>
            </thead>
            <tbody>
              {grouped[classNum].map(stu => {
                const currentRoom = getCurrentRoomIdx(stu);
                const isChanged = changes[stu.stu_idx] !== undefined;

                return (
                  <tr className={`dr-row ${isChanged ? 'changed' : ''}`} key={stu.stu_idx}>
                    <td className="dr-td">{stu.stu_number}</td>
                    <td className="dr-td name">{stu.stu_name}</td>
                    <td className="dr-td">
                      {stu.stu_major && <span className={`dr-major ${stu.stu_major === '음악' ? 'music' : 'art'}`}>{stu.stu_major}</span>}
                    </td>
                    <td className="dr-td sub-major">{stu.stu_sub_major || '-'}</td>
                    <td className="dr-td">
                      {userAuth >= 8 ? (
                        <RoomSearchSelect
                          value={currentRoom}
                          rooms={rooms}
                          major={stu.stu_major}
                          onChange={val => handleRoomChange(stu.stu_idx, val)}
                        />
                      ) : (
                        <span className="dr-room-label">{stu.room_name || '미배정'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>}
        </div>
      ))}

      {students.length === 0 && <div className="dr-no-data">학생 데이터가 없습니다.</div>}
    </div>
  );
}

export default DefaultRoom;

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import './RoomList.css';

function RoomList() {
  const userAuth = useSelector(state => state.user.userData.auth);
  const [rooms, setRooms] = useState([]);
  const [filterType, setFilterType] = useState('');

  // 수정/추가 모달
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchRooms = async () => {
    try {
      const params = {};
      if (filterType) params.type = filterType;
      const res = await api.get('rooms/list', { params });
      if (res.data.success) setRooms(res.data.data.list);
    } catch (e) {
      console.error('장소 목록 조회 실패:', e);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filterType]);

  const naturalSort = (a, b) => {
    const numA = parseInt((a.room_name.match(/\d+/) || [0])[0]);
    const numB = parseInt((b.room_name.match(/\d+/) || [0])[0]);
    if (numA !== numB) return numA - numB;
    return a.room_name.localeCompare(b.room_name);
  };

  const artRooms = rooms.filter(r => r.room_type === 'practice' && !r.room_name.startsWith('음악') && r.room_name !== '시창청음실' && r.room_name !== '거울실').sort(naturalSort);
  const musicSpecial = rooms.filter(r => r.room_name === '시창청음실' || r.room_name === '거울실');
  const musicNumbered = rooms.filter(r => r.room_type === 'practice' && r.room_name.startsWith('음악')).sort(naturalSort);
  const musicRooms = [...musicSpecial, ...musicNumbered];
  const studyRooms = rooms.filter(r => r.room_type === 'study');

  const openAdd = () => {
    setEditData({ room_name: '', room_floor: '', room_type: 'practice', room_capacity: '', room_status: 'Y' });
    setModal(true);
  };

  const openEdit = (room) => {
    setEditData({ ...room, room_floor: room.room_floor || '', room_capacity: room.room_capacity || '' });
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditData(null);
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editData.room_name.trim()) return alert('장소명을 입력하세요.');
    setSaving(true);
    try {
      if (editData.room_idx) {
        await api.put(`rooms/update/${editData.room_idx}`, {
          room_name: editData.room_name,
          room_floor: editData.room_floor || null,
          room_type: editData.room_type,
          room_capacity: editData.room_capacity || null,
          room_status: editData.room_status,
        });
        alert('장소가 수정되었습니다.');
      } else {
        await api.post('rooms/create', {
          room_name: editData.room_name,
          room_floor: editData.room_floor || null,
          room_type: editData.room_type,
          room_capacity: editData.room_capacity || null,
        });
        alert('장소가 등록되었습니다.');
      }
      closeModal();
      fetchRooms();
    } catch (e) {
      alert(e.response?.data?.error?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`"${room.room_name}" 장소를 삭제하시겠습니까?`)) return;
    try {
      await api.delete(`rooms/delete/${room.room_idx}`);
      fetchRooms();
    } catch (e) {
      alert(e.response?.data?.error?.message || '삭제에 실패했습니다.');
    }
  };

  const renderSection = (title, list, colorClass) => (
    <div className="room-section">
      <div className="room-section-header">
        <span className={`room-section-title ${colorClass}`}>{title}</span>
        <span className="room-section-count">{list.length}개</span>
      </div>
      <div className="room-card-grid">
        {list.map(room => (
          <div className="room-card" key={room.room_idx}>
            <div className="room-card-body">
              <span className="room-card-name">{room.room_name}</span>
              {room.room_floor && <span className="room-card-floor">{room.room_floor}</span>}
              {room.room_capacity && <span className="room-card-cap">{room.room_capacity}명</span>}
            </div>
            {userAuth >= 8 && (
              <div className="room-card-actions">
                <button className="room-edit-btn" onClick={() => openEdit(room)}>수정</button>
                <button className="room-delete-btn" onClick={() => handleDelete(room)}>삭제</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="room-list">
      <div className="room-list-header">
        <div className="room-list-title-row">
          <span className="room-list-title">장소 목록</span>
          <span className="room-list-total">총 {rooms.length}개</span>
        </div>
        {userAuth >= 8 && (
          <button className="room-add-btn" onClick={openAdd}>+ 장소 추가</button>
        )}
      </div>

      <div className="room-filter-row">
        <button className={`room-filter-btn ${filterType === '' ? 'active' : ''}`} onClick={() => setFilterType('')}>전체</button>
        <button className={`room-filter-btn ${filterType === 'practice' ? 'active' : ''}`} onClick={() => setFilterType('practice')}>실기실</button>
        <button className={`room-filter-btn ${filterType === 'study' ? 'active' : ''}`} onClick={() => setFilterType('study')}>어학실</button>
      </div>

      {(filterType === '' || filterType === 'practice') && artRooms.length > 0 && renderSection('미술 실기실', artRooms, 'art')}
      {(filterType === '' || filterType === 'practice') && musicRooms.length > 0 && renderSection('음악 연습실', musicRooms, 'music')}
      {(filterType === '' || filterType === 'study') && studyRooms.length > 0 && renderSection('어학실', studyRooms, 'study')}

      {rooms.length === 0 && <div className="room-no-data">등록된 장소가 없습니다.</div>}

      {/* 추가/수정 모달 */}
      {modal && editData && (
        <div className="edit-overlay" onClick={closeModal}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <div className="edit-modal-header">
              <span className="edit-modal-title">{editData.room_idx ? '장소 수정' : '장소 추가'}</span>
              <button className="edit-modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="edit-modal-body">
              <div className="edit-row">
                <div className="edit-field">
                  <label className="edit-label">장소명</label>
                  <input className="edit-input" type="text" value={editData.room_name} onChange={e => handleChange('room_name', e.target.value)} placeholder="예: 음악38" />
                </div>
              </div>
              <div className="edit-row">
                <div className="edit-field">
                  <label className="edit-label">유형</label>
                  <select className="edit-select" value={editData.room_type} onChange={e => handleChange('room_type', e.target.value)}>
                    <option value="practice">실기실</option>
                    <option value="study">어학실</option>
                  </select>
                </div>
                <div className="edit-field">
                  <label className="edit-label">층</label>
                  <input className="edit-input" type="text" value={editData.room_floor} onChange={e => handleChange('room_floor', e.target.value)} placeholder="예: 2층" />
                </div>
              </div>
              <div className="edit-row">
                <div className="edit-field">
                  <label className="edit-label">수용인원</label>
                  <input className="edit-input" type="number" value={editData.room_capacity} onChange={e => handleChange('room_capacity', e.target.value)} placeholder="선택사항" />
                </div>
                {editData.room_idx && (
                  <div className="edit-field">
                    <label className="edit-label">상태</label>
                    <select className="edit-select" value={editData.room_status} onChange={e => handleChange('room_status', e.target.value)}>
                      <option value="Y">활성</option>
                      <option value="N">비활성</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="edit-modal-footer">
              <button className="edit-cancel-btn" onClick={closeModal}>취소</button>
              <button className="edit-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : editData.room_idx ? '저장' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomList;

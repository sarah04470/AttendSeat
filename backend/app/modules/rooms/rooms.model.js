const roomModel = {};
const db = database();

roomModel.getRoomList = async (options = {}) => {
  try {
    const { type, status = 'Y' } = options;
    const query = db('wb_room').where('room_status', status);
    if (type) query.andWhere('room_type', type);
    const list = await query.orderBy('room_type', 'asc').orderBy('room_name', 'asc');
    return list;
  } catch (err) {
    console.error('Error in getRoomList:', err);
    return [];
  }
};

roomModel.getRoomByIdx = async (idx) => {
  try {
    return await db('wb_room').where('room_idx', idx).first();
  } catch (err) {
    console.error('Error in getRoomByIdx:', err);
    return null;
  }
};

roomModel.createRoom = async (data) => {
  try {
    const [idx] = await db('wb_room').insert(data);
    return idx;
  } catch (err) {
    console.error('Error in createRoom:', err);
    return null;
  }
};

roomModel.updateRoom = async (idx, data) => {
  try {
    await db('wb_room').where('room_idx', idx).update(data);
    return true;
  } catch (err) {
    console.error('Error in updateRoom:', err);
    return false;
  }
};

roomModel.deleteRoom = async (idx) => {
  try {
    await db('wb_room').where('room_idx', idx).update({ room_status: 'N' });
    return true;
  } catch (err) {
    console.error('Error in deleteRoom:', err);
    return false;
  }
};

roomModel.bulkCreateRooms = async (rows) => {
  try {
    await db('wb_room').insert(rows);
    return rows.length;
  } catch (err) {
    console.error('Error in bulkCreateRooms:', err);
    return 0;
  }
};

module.exports = roomModel;

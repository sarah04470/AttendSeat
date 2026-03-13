import * as React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { ExpandLess, ExpandMore, Home, Logout, EventSeat, MeetingRoom, People, FactCheck, Settings } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { Collapse, Popover, Avatar, Stack } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import './Dashboard.css';
import api from '../../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../../store/userSlice';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(7),
      },
    }),
  },
}));

const defaultTheme = createTheme({
  typography: {
    fontFamily: `'Pretendard-Regular', "Helvetica", "Arial", sans-serif`,
  },
});

export default function Dashboard() {
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.user.userData.loggedIn);
  const userAuth = useSelector((state) => state.user.userData.auth) || 0;

  const [userData, setUserData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const ud = sessionStorage.getItem('ud');
    if (ud) {
      try {
        setUserData(JSON.parse(ud));
      } catch (error) {
        console.error('사용자 정보 파싱 에러:', error);
      }
    }
  }, []);

  const handleUserClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserClose = () => {
    setAnchorEl(null);
  };

  // 관리자 권한이 필요한 경로 prefix
  const protectedPaths = [
    '/students/edit', '/students/default-room',
    '/attendance/manage',
    '/rooms/', '/settings/',
  ];

  const handleLogout = async () => {
    try {
      await api.post('members/auth/logout');
    } catch (error) {
      console.error('로그아웃 중 에러 발생:', error);
    }
    dispatch(logoutAction());
    sessionStorage.removeItem('ud');

    const currentPath = location.pathname;
    const needsRedirect = protectedPaths.some(p => currentPath.startsWith(p));
    if (needsRedirect) {
      navigate('/');
    }
  };

  const open = Boolean(anchorEl);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isActivePrefix = (prefix) => {
    return location.pathname.startsWith(prefix);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }} className={'main-box'}>
        <CssBaseline />
        <AppBar
          className='wed-app-bar'
          position="absolute"
          open={true}
          sx={{ boxShadow: 'unset', backgroundColor: '#4b89da' }}
        >
          <Toolbar sx={{ pr: '24px' }} className={'main-box-toolbar'}>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1, fontSize: '16px', fontWeight: 'bold' }}
            >
              AttendSeat
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {isLoggedIn && userData ? (
                <>
                  <Button
                    color="inherit"
                    onClick={handleUserClick}
                    startIcon={<AccountCircleIcon />}
                    sx={{
                      fontSize: '14px',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    {userData.name || '관리자'}
                  </Button>
                  <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleUserClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <Box sx={{ p: 3, minWidth: 250 }}>
                      <Stack spacing={2} alignItems="center">
                        <Avatar sx={{ width: 60, height: 60, bgcolor: '#4b89da' }}>
                          <AccountCircleIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {userData.name || '관리자'}
                        </Typography>
                        <Divider sx={{ width: '100%' }} />
                        <Stack spacing={1} sx={{ width: '100%' }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">권한</Typography>
                            <Typography variant="body2">
                              {userData.auth >= 10 ? '슈퍼관리자' : userData.auth >= 8 ? '중간관리자' : '뷰어'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Box>
                  </Popover>
                  <Button
                    color="inherit"
                    onClick={handleLogout}
                    startIcon={<Logout />}
                    sx={{
                      fontSize: '14px',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{
                    fontSize: '14px',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  로그인
                </Button>
              )}
            </Stack>
          </Toolbar>
        </AppBar>

        <Drawer className="main-aside-menu" variant="permanent" open={true}>
          <Toolbar
            className={'main-box-toolbar'}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: [1], minHeight: '48px' }}
          />
          <Divider />
          <List component="nav" className={'main-box-menu'}>
            {/* 대시보드 */}
            <ListItemButton component={NavLink} to="/" selected={isActive('/')}>
              <ListItemIcon><Home /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>

            {/* 출석 관리 - 비로그인도 조회 가능 */}
            <ListItemButton onClick={() => setAttendanceOpen(!attendanceOpen)}>
              <ListItemIcon><FactCheck /></ListItemIcon>
              <ListItemText primary="출석 관리" />
              {attendanceOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse className={'sub-menu'} in={attendanceOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton className="sub-menu-item" component={NavLink} to="/attendance/daily">
                  <ListItemIcon></ListItemIcon>
                  <ListItemText primary="일별 출석 현황" className={isActivePrefix('/attendance/daily') ? 'on' : ''} />
                </ListItemButton>
              </List>
              <List component="div" disablePadding>
                <ListItemButton className="sub-menu-item" component={NavLink} to="/attendance/seat-map">
                  <ListItemIcon></ListItemIcon>
                  <ListItemText primary="좌석 배치도" className={isActivePrefix('/attendance/seat-map') ? 'on' : ''} />
                </ListItemButton>
              </List>
              {userAuth >= 8 && (
                <List component="div" disablePadding>
                  <ListItemButton className="sub-menu-item" component={NavLink} to="/attendance/manage">
                    <ListItemIcon></ListItemIcon>
                    <ListItemText primary="자리 이동/수정" className={isActivePrefix('/attendance/manage') ? 'on' : ''} />
                  </ListItemButton>
                </List>
              )}
            </Collapse>

            {/* 학생 관리 - 목록 조회는 비로그인 가능, 수정/배정은 중간관리자 이상 */}
            <ListItemButton onClick={() => setStudentOpen(!studentOpen)}>
              <ListItemIcon><People /></ListItemIcon>
              <ListItemText primary="학생 관리" />
              {studentOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse className={'sub-menu'} in={studentOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton className="sub-menu-item" component={NavLink} to="/students/list">
                  <ListItemIcon></ListItemIcon>
                  <ListItemText primary="학생 목록" className={isActivePrefix('/students/list') ? 'on' : ''} />
                </ListItemButton>
              </List>
              {userAuth >= 8 && (
                <List component="div" disablePadding>
                  <ListItemButton className="sub-menu-item" component={NavLink} to="/students/default-room">
                    <ListItemIcon></ListItemIcon>
                    <ListItemText primary="기본 배정" className={isActivePrefix('/students/default-room') ? 'on' : ''} />
                  </ListItemButton>
                </List>
              )}
            </Collapse>

            {/* 장소 관리 - 슈퍼관리자 전용 */}
            {userAuth >= 10 && (
              <>
                <ListItemButton onClick={() => setRoomOpen(!roomOpen)}>
                  <ListItemIcon><MeetingRoom /></ListItemIcon>
                  <ListItemText primary="장소 관리" />
                  {roomOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse className={'sub-menu'} in={roomOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton className="sub-menu-item" component={NavLink} to="/rooms/list">
                      <ListItemIcon></ListItemIcon>
                      <ListItemText primary="장소 목록" className={isActivePrefix('/rooms/list') ? 'on' : ''} />
                    </ListItemButton>
                  </List>
                  <List component="div" disablePadding>
                    <ListItemButton className="sub-menu-item" component={NavLink} to="/rooms/seats">
                      <ListItemIcon></ListItemIcon>
                      <ListItemText primary="좌석 관리" className={isActivePrefix('/rooms/seats') ? 'on' : ''} />
                    </ListItemButton>
                  </List>
                </Collapse>
              </>
            )}

            {/* 설정 - 슈퍼관리자 전용 */}
            {userAuth >= 10 && (
              <>
                <ListItemButton onClick={() => setSettingOpen(!settingOpen)}>
                  <ListItemIcon><Settings /></ListItemIcon>
                  <ListItemText primary="설정" />
                  {settingOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse className={'sub-menu'} in={settingOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton className="sub-menu-item" component={NavLink} to="/settings/members">
                      <ListItemIcon></ListItemIcon>
                      <ListItemText primary="관리자 계정" className={isActivePrefix('/settings/members') ? 'on' : ''} />
                    </ListItemButton>
                  </List>
                </Collapse>
              </>
            )}
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{
            backgroundColor: '#fff',
            flexGrow: 1,
            height: 'auto',
            overflow: 'auto',
            padding: '55px 20px',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

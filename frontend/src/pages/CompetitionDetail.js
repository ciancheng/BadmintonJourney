import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  PhotoCamera,
  EmojiEvents,
  LocationOn,
  DateRange,
  ArrowBack,
  Close,
  ArrowBackIos,
  ArrowForwardIos,
  DeleteOutline,
  SelectAll,
  Clear,
  VideoCall,
  VideoLibrary,
  PlayArrow
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import competitionService from '../services/competitionService';
import matchService from '../services/matchService';
import gameService from '../services/gameService';
import { fetchCitiesFromAPI } from '../data/cities';
import { getMatchTypeText, getCompetitionResultText, getMatchResultText, getGameResultText } from '../utils/formatters';

function CompetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [competition, setCompetition] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchGames, setMatchGames] = useState({}); // 存储每个对战的局比赛数据
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMatchDialog, setOpenMatchDialog] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [cities, setCities] = useState([]);
  const [myScore, setMyScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [autoResult, setAutoResult] = useState('');
  
  // 每局比赛相关状态
  const [openGameDialog, setOpenGameDialog] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [currentMatchId, setCurrentMatchId] = useState(null);
  const [myGameScore, setMyGameScore] = useState('');
  const [opponentGameScore, setOpponentGameScore] = useState('');
  const [gameResult, setGameResult] = useState('');
  
  // 视频相关状态
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState('');
  
  // 照片相关状态
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photos, setPhotos] = useState([]);
  
  // 多选删除相关状态
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { control: gameControl, handleSubmit: handleGameSubmit, formState: { errors: gameErrors }, reset: resetGame } = useForm();

  useEffect(() => {
    loadData();
    loadCities();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [competitionData, matchesData] = await Promise.all([
        competitionService.getCompetition(id),
        matchService.getCompetitionMatches(id)
      ]);
      setCompetition(competitionData);
      setMatches(matchesData);
      
      // 加载每个对战的局比赛数据
      const gamesData = {};
      await Promise.all(
        matchesData.map(async (match) => {
          try {
            const games = await gameService.getMatchGames(match.id);
            gamesData[match.id] = games;
          } catch (err) {
            console.error(`Failed to load games for match ${match.id}:`, err);
            gamesData[match.id] = [];
          }
        })
      );
      setMatchGames(gamesData);
      
      // 设置照片列表
      if (competitionData.photos && competitionData.photos.length > 0) {
        setPhotos(competitionData.photos);
      } else {
        setPhotos([]);
      }
    } catch (err) {
      setError('加载数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const citiesData = await fetchCitiesFromAPI();
      setCities(citiesData);
    } catch (error) {
      console.error('获取城市列表失败:', error);
    }
  };

  // 监听分数变化，自动判断胜负
  useEffect(() => {
    if (myScore !== '' && opponentScore !== '') {
      const my = parseInt(myScore);
      const opponent = parseInt(opponentScore);
      
      if (my > opponent) {
        setAutoResult('WIN');
        setValue('result', 'WIN');
      } else if (my < opponent) {
        setAutoResult('LOSE');
        setValue('result', 'LOSE');
      } else {
        setAutoResult('');
        setValue('result', '');
      }
    } else {
      setAutoResult('');
      setValue('result', '');
    }
  }, [myScore, opponentScore, setValue]);

  // 监听局比赛分数变化，自动判断胜负
  useEffect(() => {
    if (myGameScore !== '' && opponentGameScore !== '') {
      const my = parseInt(myGameScore);
      const opponent = parseInt(opponentGameScore);
      
      if (my > opponent) {
        setGameResult('胜');
      } else if (my < opponent) {
        setGameResult('负');
      } else {
        setGameResult('平');
      }
    } else {
      setGameResult('');
    }
  }, [myGameScore, opponentGameScore]);

  const handleDeleteCompetition = async () => {
    if (window.confirm('确定要删除这场比赛吗？所有相关的对战记录也将被删除。')) {
      try {
        await competitionService.deleteCompetition(id);
        navigate('/');
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  const handleOpenMatchDialog = (match = null) => {
    if (match) {
      setEditingMatch(match);
      // 拆分比分
      if (match.score && match.score.includes(':')) {
        const [my, opponent] = match.score.split(':');
        setMyScore(my.trim());
        setOpponentScore(opponent.trim());
      } else {
        setMyScore('');
        setOpponentScore('');
      }
      
      // 找到对应的城市对象
      const cityObj = cities.find(c => c.name === match.opponentCity) || null;
      
      reset({
        matchType: match.matchType,
        opponentName: match.opponentName,
        opponentCity: cityObj,
        result: match.result,
        coachComment: match.coachComment || '',
        selfSummary: match.selfSummary || ''
      });
    } else {
      setEditingMatch(null);
      setMyScore('');
      setOpponentScore('');
      reset({
        matchType: '',
        opponentName: '',
        opponentCity: null,
        result: '',
        coachComment: '',
        selfSummary: ''
      });
    }
    setOpenMatchDialog(true);
  };

  const handleCloseMatchDialog = () => {
    setOpenMatchDialog(false);
    setEditingMatch(null);
    setMyScore('');
    setOpponentScore('');
    setAutoResult('');
  };

  const handleSaveMatch = async (data) => {
    try {
      // 验证分数
      if (myScore && opponentScore && myScore === opponentScore) {
        alert('请输入正确的比分，两队得分不能相同');
        return;
      }
      
      // 如果没有result，需要提示用户
      if (!data.result) {
        alert('请选择比赛结果或输入比分');
        return;
      }
      
      // 组合比分
      const score = myScore && opponentScore ? `${myScore}:${opponentScore}` : '';
      
      // 处理城市名称
      const matchData = {
        ...data,
        opponentCity: data.opponentCity?.name || data.opponentCity,
        score
      };
      
      if (editingMatch) {
        await matchService.updateMatch(editingMatch.id, matchData);
      } else {
        await matchService.createMatch({ ...matchData, competitionId: id });
      }
      handleCloseMatchDialog();
      loadData();
    } catch (err) {
      alert('保存失败');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm('确定要删除这场对战吗？')) {
      try {
        await matchService.deleteMatch(matchId);
        loadData();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  const handleUploadPhotos = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      try {
        await competitionService.uploadPhotos(id, files);
        loadData();
      } catch (err) {
        alert('上传失败');
      }
    }
  };

  // 照片相关处理函数
  const handleOpenPhotoViewer = (index) => {
    setCurrentPhotoIndex(index);
    setPhotoViewerOpen(true);
  };

  const handleClosePhotoViewer = () => {
    setPhotoViewerOpen(false);
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleDeletePhoto = async (photoPath) => {
    if (window.confirm('确定要删除这张照片吗？')) {
      try {
        await competitionService.deletePhoto(id, photoPath);
        loadData();
      } catch (err) {
        alert('删除照片失败');
      }
    }
  };

  // 多选删除相关函数
  const handleEnterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedPhotos(new Set());
  };

  const handleExitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedPhotos(new Set());
  };

  const handleSelectPhoto = (photoPath) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoPath)) {
      newSelected.delete(photoPath);
    } else {
      newSelected.add(photoPath);
    }
    setSelectedPhotos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos));
    }
  };

  const handleDeleteSelectedPhotos = async () => {
    if (selectedPhotos.size === 0) {
      alert('请先选择要删除的照片');
      return;
    }

    if (window.confirm(`确定要删除选中的${selectedPhotos.size}张照片吗？`)) {
      try {
        const photoPathsArray = Array.from(selectedPhotos);
        await competitionService.deletePhotos(id, photoPathsArray);
        setSelectionMode(false);
        setSelectedPhotos(new Set());
        loadData();
        alert(`成功删除${photoPathsArray.length}张照片`);
      } catch (err) {
        alert('批量删除照片失败');
      }
    }
  };

  // 键盘事件监听
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (photoViewerOpen) {
        if (event.key === 'ArrowLeft') {
          handlePrevPhoto();
        } else if (event.key === 'ArrowRight') {
          handleNextPhoto();
        } else if (event.key === 'Escape') {
          handleClosePhotoViewer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [photoViewerOpen, photos.length]);

  const getResultText = (result) => {
    return getCompetitionResultText(result);
  };

  // 每局比赛相关处理函数
  const handleOpenGameDialog = (matchId, game = null) => {
    setCurrentMatchId(matchId);
    if (game) {
      setEditingGame(game);
      // 拆分比分
      if (game.score && game.score.includes(':')) {
        const [my, opponent] = game.score.split(':');
        setMyGameScore(my.trim());
        setOpponentGameScore(opponent.trim());
      } else {
        setMyGameScore('');
        setOpponentGameScore('');
      }
      
      resetGame({
        gameNumber: game.gameNumber.toString(),
        coachComment: game.coachComment || '',
        selfSummary: game.selfSummary || ''
      });
    } else {
      setEditingGame(null);
      const existingGames = matchGames[matchId] || [];
      const nextGameNumber = existingGames.length + 1;
      setMyGameScore('');
      setOpponentGameScore('');
      resetGame({
        gameNumber: nextGameNumber.toString(),
        coachComment: '',
        selfSummary: ''
      });
    }
    setOpenGameDialog(true);
  };

  const handleCloseGameDialog = () => {
    setOpenGameDialog(false);
    setEditingGame(null);
    setCurrentMatchId(null);
    setMyGameScore('');
    setOpponentGameScore('');
    setGameResult('');
  };

  const handleSaveGame = async (data) => {
    try {
      // 组合比分
      const score = myGameScore && opponentGameScore ? `${myGameScore}:${opponentGameScore}` : '';
      
      // 根据比分自动判断结果
      let result = null;
      if (myGameScore !== '' && opponentGameScore !== '') {
        const my = parseInt(myGameScore);
        const opponent = parseInt(opponentGameScore);
        
        if (my > opponent) {
          result = 'WIN';
        } else if (my < opponent) {
          result = 'LOSE';
        }
        // 平局情况不设置result，保持null
      }
      
      const gameData = {
        ...data,
        gameNumber: parseInt(data.gameNumber),
        score,
        result
      };
      
      if (editingGame) {
        await gameService.updateGame(editingGame.id, gameData);
      } else {
        await gameService.createGame({ ...gameData, matchId: currentMatchId });
      }
      handleCloseGameDialog();
      loadData();
    } catch (err) {
      alert('保存失败');
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (window.confirm('确定要删除这局比赛吗？')) {
      try {
        await gameService.deleteGame(gameId);
        loadData();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  // 视频相关处理函数
  const handleUploadVideo = async (gameId, event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const formData = new FormData();
        Array.from(files).forEach(file => {
          formData.append('videos', file);
        });
        
        await gameService.uploadVideos(gameId, formData);
        loadData();
        alert(`成功上传${files.length}个视频`);
      } catch (err) {
        alert('视频上传失败');
      }
    }
    // 清空input值，允许重复上传相同文件
    event.target.value = '';
  };

  const handleRemoveVideo = async (gameId, videoPath) => {
    if (window.confirm('确定要删除这个视频吗？')) {
      try {
        await gameService.removeVideo(gameId, videoPath);
        loadData();
        alert('视频删除成功');
      } catch (err) {
        alert('视频删除失败');
      }
    }
  };

  const handlePlayVideo = (videoPath) => {
    setSelectedVideo(videoPath);
    setVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setVideoModalOpen(false);
    setSelectedVideo('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!competition) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">比赛不存在</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 返回比赛列表按钮 */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        返回比赛列表
      </Button>
      
      {/* 比赛基本信息 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">{competition.competitionName}</Typography>
          <Box>
            <IconButton onClick={() => navigate(`/competitions/${id}/edit`)}>
              <Edit />
            </IconButton>
            <IconButton onClick={handleDeleteCompetition} color="error">
              <Delete />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DateRange sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography>
                {dayjs(competition.startDate).format('YYYY年MM月DD日')} - 
                {dayjs(competition.endDate).format('MM月DD日')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography>{competition.city} {competition.venue}</Typography>
            </Box>
          </Grid>
        </Grid>

        {competition.result && (
          <Box sx={{ mt: 2 }}>
            <Chip
              icon={<EmojiEvents />}
              label={getResultText(competition.result)}
              color={competition.result === 'CHAMPION' ? 'error' : 'primary'}
            />
          </Box>
        )}

        {(competition.coachComment || competition.selfSummary) && (
          <Box sx={{ mt: 2 }}>
            {competition.coachComment && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>教练评语</Typography>
                <Typography variant="body2" color="text.secondary">
                  {competition.coachComment}
                </Typography>
              </Box>
            )}
            {competition.selfSummary && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>个人总结</Typography>
                <Typography variant="body2" color="text.secondary">
                  {competition.selfSummary}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="photo-upload"
            multiple
            type="file"
            onChange={handleUploadPhotos}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<PhotoCamera />}
            >
              上传照片
            </Button>
          </label>
        </Box>

        {/* 照片展示区域 */}
        {photos.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                比赛照片 ({photos.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {!selectionMode ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SelectAll />}
                    onClick={handleEnterSelectionMode}
                  >
                    多选删除
                  </Button>
                ) : (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedPhotos.size === photos.length}
                          indeterminate={selectedPhotos.size > 0 && selectedPhotos.size < photos.length}
                          onChange={handleSelectAll}
                        />
                      }
                      label={`已选${selectedPhotos.size}张`}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<Delete />}
                      onClick={handleDeleteSelectedPhotos}
                      disabled={selectedPhotos.size === 0}
                    >
                      删除选中 ({selectedPhotos.size})
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Clear />}
                      onClick={handleExitSelectionMode}
                    >
                      取消
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            <Grid container spacing={2}>
              {photos.map((photo, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '75%', // 4:3 aspect ratio
                      overflow: 'hidden',
                      borderRadius: 1,
                      cursor: selectionMode ? 'pointer' : 'pointer',
                      border: selectionMode && selectedPhotos.has(photo) ? '3px solid #1976d2' : 'none',
                      '&:hover .delete-btn': {
                        opacity: selectionMode ? 0 : 1
                      }
                    }}
                    onClick={() => {
                      if (selectionMode) {
                        handleSelectPhoto(photo);
                      } else {
                        handleOpenPhotoViewer(index);
                      }
                    }}
                  >
                    <img
                      src={`/api/uploads/photos/${photo.split('/').pop()}`}
                      alt={`比赛照片 ${index + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    
                    {/* 多选模式下的复选框 */}
                    {selectionMode && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          borderRadius: '50%',
                          padding: 0.5
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPhoto(photo);
                        }}
                      >
                        <Checkbox
                          checked={selectedPhotos.has(photo)}
                          size="small"
                          sx={{ padding: 0 }}
                        />
                      </Box>
                    )}
                    
                    {/* 单张删除按钮 - 只在非多选模式下显示 */}
                    {!selectionMode && (
                      <IconButton
                        className="delete-btn"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          '&:hover': {
                            backgroundColor: 'rgba(255,0,0,0.8)'
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo);
                        }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* 对战列表 */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">对战记录</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenMatchDialog()}
          >
            添加对战
          </Button>
        </Box>

        {matches.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            暂无对战记录
          </Typography>
        ) : (
          <List>
            {matches.map((match, index) => (
              <React.Fragment key={match.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">
                          {getMatchTypeText(match.matchType)}
                        </Typography>
                        <Typography variant="body1">vs {match.opponentName}</Typography>
                        <Chip
                          label={getMatchResultText(match.result)}
                          color={match.result === 'WIN' ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          来自{match.opponentCity?.name || match.opponentCity} | 比分 {match.score || '-'}
                        </Typography>
                        {match.coachComment && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            教练评语：{match.coachComment}
                          </Typography>
                        )}
                        {match.selfSummary && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            个人总结：{match.selfSummary}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMatchDialog(match);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMatch(match.id);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                
                {/* 每局比赛信息 - 平铺显示 */}
                {matchGames[match.id] && matchGames[match.id].length > 0 && (
                  <Box sx={{ ml: 4, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        每局比赛记录：
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => handleOpenGameDialog(match.id)}
                      >
                        添加一局
                      </Button>
                    </Box>
                    {matchGames[match.id].map((game, gameIndex) => (
                      <Box key={game.id} sx={{ 
                        ml: 2, 
                        mb: 1, 
                        p: 1.5, 
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        borderRadius: 1,
                        border: '1px solid rgba(0,0,0,0.08)',
                        position: 'relative'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            第{game.gameNumber}局
                          </Typography>
                          <Typography variant="body2">
                            比分：{game.score}
                          </Typography>
                          {game.result && (
                            <Chip
                              label={getGameResultText(game.result)}
                              color={game.result === 'WIN' ? 'success' : 'error'}
                              size="small"
                              sx={{ height: 20, fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                        
                        {/* 视频区域 */}
                        {game.videos && game.videos.length > 0 && (
                          <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {game.videos.map((videoPath, index) => (
                              <Box
                                key={index}
                                sx={{
                                  position: 'relative',
                                  width: 120,
                                  height: 80,
                                  cursor: 'pointer',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  border: '2px solid #1976d2',
                                  '&:hover': {
                                    opacity: 0.8
                                  }
                                }}
                              >
                                <video
                                  width="100%"
                                  height="100%"
                                  style={{ objectFit: 'cover' }}
                                  onClick={() => handlePlayVideo(videoPath)}
                                >
                                  <source src={`/api/uploads/videos/${videoPath.split('/').pop()}`} />
                                </video>
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    color: 'white',
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    borderRadius: '50%',
                                    width: 32,
                                    height: 32,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  onClick={() => handlePlayVideo(videoPath)}
                                >
                                  <PlayArrow />
                                </Box>
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 2,
                                    right: 2,
                                    color: 'white',
                                    backgroundColor: 'rgba(255,0,0,0.7)',
                                    width: 20,
                                    height: 20,
                                    '&:hover': {
                                      backgroundColor: 'rgba(255,0,0,0.9)',
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveVideo(game.id, videoPath);
                                  }}
                                >
                                  <Close fontSize="small" sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                        
                        {game.coachComment && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                            教练评语：{game.coachComment}
                          </Typography>
                        )}
                        {game.selfSummary && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                            个人总结：{game.selfSummary}
                          </Typography>
                        )}
                        
                        {/* 操作按钮 */}
                        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                          <input
                            accept="video/*"
                            style={{ display: 'none' }}
                            id={`video-upload-${game.id}`}
                            type="file"
                            multiple
                            onChange={(e) => handleUploadVideo(game.id, e)}
                          />
                          <label htmlFor={`video-upload-${game.id}`}>
                            <IconButton component="span" size="small" color="primary" title="上传视频">
                              <VideoCall fontSize="small" />
                            </IconButton>
                          </label>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenGameDialog(match.id, game)}
                            title="编辑"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteGame(game.id)}
                            color="error"
                            title="删除"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
                
                {/* 如果没有每局比赛记录，显示添加按钮 */}
                {(!matchGames[match.id] || matchGames[match.id].length === 0) && (
                  <Box sx={{ ml: 4, mb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleOpenGameDialog(match.id)}
                    >
                      添加一局
                    </Button>
                  </Box>
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* 添加/编辑对战对话框 */}
      <Dialog open={openMatchDialog} onClose={handleCloseMatchDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(handleSaveMatch)}>
          <DialogTitle>{editingMatch ? '编辑对战' : '添加对战'}</DialogTitle>
          <DialogContent>
            <Controller
              name="matchType"
              control={control}
              rules={{ required: '请选择比赛类型' }}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.matchType}>
                  <InputLabel>比赛类型</InputLabel>
                  <Select {...field} label="比赛类型">
                    <MenuItem value="GROUP_STAGE_1">小组赛1</MenuItem>
                    <MenuItem value="GROUP_STAGE_2">小组赛2</MenuItem>
                    <MenuItem value="GROUP_STAGE_3">小组赛3</MenuItem>
                    <MenuItem value="KNOCKOUT_1">淘汰赛1</MenuItem>
                    <MenuItem value="KNOCKOUT_2">淘汰赛2</MenuItem>
                    <MenuItem value="KNOCKOUT_3">淘汰赛3</MenuItem>
                    <MenuItem value="KNOCKOUT_4">淘汰赛4</MenuItem>
                    <MenuItem value="KNOCKOUT_5">淘汰赛5</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="opponentName"
              control={control}
              rules={{ required: '请输入对手姓名' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="对手姓名"
                  error={!!errors.opponentName}
                  helperText={errors.opponentName?.message}
                />
              )}
            />

            <Controller
              name="opponentCity"
              control={control}
              rules={{ required: '请选择对手城市' }}
              render={({ field: { onChange, value, ...field } }) => (
                <Autocomplete
                  {...field}
                  value={value}
                  onChange={(event, newValue) => onChange(newValue)}
                  options={cities}
                  filterOptions={(options, { inputValue }) => {
                    const input = inputValue.toLowerCase();
                    return options.filter(option => 
                      option.name.toLowerCase().includes(input) ||
                      option.province.toLowerCase().includes(input) ||
                      option.pinyin.toLowerCase().includes(input) ||
                      option.pinyin.toLowerCase().replace(/\s/g, '').includes(input.replace(/\s/g, ''))
                    );
                  }}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option ? `${option.name} (${option.province})` : '';
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      margin="normal"
                      required
                      fullWidth
                      label="对手城市"
                      placeholder="搜索城市（支持中文/拼音）..."
                      error={!!errors.opponentCity}
                      helperText={errors.opponentCity?.message}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => {
                    if (typeof value === 'string') return option.name === value;
                    return option.id === value?.id;
                  }}
                />
              )}
            />

            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="body2" gutterBottom>大比分</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl sx={{ minWidth: 80 }} error={!!(myScore && opponentScore && myScore === opponentScore)}>
                  <InputLabel>我方</InputLabel>
                  <Select
                    value={myScore}
                    onChange={(e) => setMyScore(e.target.value)}
                    label="我方"
                    size="small"
                  >
                    <MenuItem value="">-</MenuItem>
                    {[...Array(4).keys()].map(i => (
                      <MenuItem key={i} value={i.toString()}>{i}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Typography variant="h6" sx={{ mx: 1 }}>:</Typography>
                
                <FormControl sx={{ minWidth: 80 }} error={!!(myScore && opponentScore && myScore === opponentScore)}>
                  <InputLabel>对方</InputLabel>
                  <Select
                    value={opponentScore}
                    onChange={(e) => setOpponentScore(e.target.value)}
                    label="对方"
                    size="small"
                  >
                    <MenuItem value="">-</MenuItem>
                    {[...Array(4).keys()].map(i => (
                      <MenuItem key={i} value={i.toString()}>{i}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {autoResult && (
                  <Chip
                    label={getMatchResultText(autoResult)}
                    color={autoResult === 'WIN' ? 'success' : 'error'}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
              {myScore && opponentScore && myScore === opponentScore && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  请输入正确的比分
                </Typography>
              )}
            </Box>

            <Controller
              name="result"
              control={control}
              rules={{ 
                required: myScore && opponentScore && myScore !== opponentScore ? '请选择比赛结果' : false,
                validate: value => {
                  if (myScore && opponentScore && myScore === opponentScore) {
                    return '比分相同时无法确定胜负';
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />

            <Controller
              name="coachComment"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  fullWidth
                  label="教练评语"
                  multiline
                  rows={2}
                />
              )}
            />

            <Controller
              name="selfSummary"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  fullWidth
                  label="个人总结"
                  multiline
                  rows={2}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMatchDialog}>取消</Button>
            <Button type="submit" variant="contained">
              {editingMatch ? '保存' : '添加'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 每局比赛对话框 */}
      <Dialog open={openGameDialog} onClose={handleCloseGameDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleGameSubmit(handleSaveGame)}>
          <DialogTitle>{editingGame ? '编辑局' : '添加新局'}</DialogTitle>
          <DialogContent>
            <Controller
              name="gameNumber"
              control={gameControl}
              rules={{ required: '请选择局数' }}
              render={({ field }) => (
                <FormControl>
                  <FormLabel>第几局</FormLabel>
                  <RadioGroup
                    {...field}
                    row
                  >
                    <FormControlLabel value="1" control={<Radio />} label="第1局" />
                    <FormControlLabel value="2" control={<Radio />} label="第2局" />
                    <FormControlLabel value="3" control={<Radio />} label="第3局" />
                  </RadioGroup>
                </FormControl>
              )}
            />

            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="body2" gutterBottom>小分</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl sx={{ minWidth: 80 }}>
                  <InputLabel>我方</InputLabel>
                  <Select
                    value={myGameScore}
                    onChange={(e) => setMyGameScore(e.target.value)}
                    label="我方"
                    size="small"
                  >
                    <MenuItem value="">-</MenuItem>
                    {[...Array(31).keys()].map(i => (
                      <MenuItem key={i} value={i.toString()}>{i}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Typography variant="h6" sx={{ mx: 1 }}>:</Typography>
                
                <FormControl sx={{ minWidth: 80 }}>
                  <InputLabel>对方</InputLabel>
                  <Select
                    value={opponentGameScore}
                    onChange={(e) => setOpponentGameScore(e.target.value)}
                    label="对方"
                    size="small"
                  >
                    <MenuItem value="">-</MenuItem>
                    {[...Array(31).keys()].map(i => (
                      <MenuItem key={i} value={i.toString()}>{i}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {gameResult && (
                  <Chip
                    label={gameResult}
                    color={gameResult === '胜' ? 'success' : gameResult === '负' ? 'error' : 'default'}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
            </Box>

            <Controller
              name="coachComment"
              control={gameControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  fullWidth
                  label="教练评语"
                  multiline
                  rows={3}
                />
              )}
            />

            <Controller
              name="selfSummary"
              control={gameControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  fullWidth
                  label="个人总结"
                  multiline
                  rows={3}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseGameDialog}>取消</Button>
            <Button type="submit" variant="contained">
              {editingGame ? '保存' : '添加'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 照片查看器模态框 */}
      <Dialog 
        open={photoViewerOpen} 
        onClose={handleClosePhotoViewer} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 1
          }}
        >
          <Typography variant="h6">
            照片 {currentPhotoIndex + 1} / {photos.length}
          </Typography>
          <IconButton onClick={handleClosePhotoViewer} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {photos.length > 0 && (
            <>
              <img
                src={`/api/uploads/photos/${photos[currentPhotoIndex]?.split('/').pop()}`}
                alt={`比赛照片 ${currentPhotoIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
              
              {/* 左箭头 */}
              {photos.length > 1 && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                  onClick={handlePrevPhoto}
                >
                  <ArrowBackIos />
                </IconButton>
              )}
              
              {/* 右箭头 */}
              {photos.length > 1 && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                  onClick={handleNextPhoto}
                >
                  <ArrowForwardIos />
                </IconButton>
              )}
              
              {/* 删除按钮 */}
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  backgroundColor: 'rgba(255,0,0,0.7)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,0,0,0.9)'
                  }
                }}
                onClick={() => {
                  const photoToDelete = photos[currentPhotoIndex];
                  handleDeletePhoto(photoToDelete);
                  handleClosePhotoViewer();
                }}
              >
                <DeleteOutline />
              </IconButton>

              {/* 键盘提示 */}
              {photos.length > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  使用 ← → 键切换照片，ESC 键关闭
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 视频模态框 */}
      <Dialog
        open={videoModalOpen}
        onClose={handleCloseVideoModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 1
          }}
        >
          <Typography variant="h6">
            视频播放
          </Typography>
          <IconButton onClick={handleCloseVideoModal} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selectedVideo && (
            <video
              src={`/api/uploads/videos/${selectedVideo.split('/').pop()}`}
              controls
              autoPlay
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            >
              <source src={`/api/uploads/videos/${selectedVideo.split('/').pop()}`} type="video/mp4" />
              <source src={`/api/uploads/videos/${selectedVideo.split('/').pop()}`} type="video/avi" />
              <source src={`/api/uploads/videos/${selectedVideo.split('/').pop()}`} type="video/mov" />
              您的浏览器不支持视频播放。
            </video>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default CompetitionDetail;


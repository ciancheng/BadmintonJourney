import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  VideoLibrary,
  VideoCall,
  Close
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import matchService from '../services/matchService';
import gameService from '../services/gameService';
import { getMatchTypeText, getMatchResultText, getGameResultText } from '../utils/formatters';

function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [match, setMatch] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openGameDialog, setOpenGameDialog] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [myGameScore, setMyGameScore] = useState('');
  const [opponentGameScore, setOpponentGameScore] = useState('');
  const [gameResult, setGameResult] = useState('');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState('');
  
  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  useEffect(() => {
    loadData();
  }, [id]);

  // 监听比分变化，自动判断胜负
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

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchData, gamesData] = await Promise.all([
        matchService.getMatch(id),
        gameService.getMatchGames(id)
      ]);
      setMatch(matchData);
      setGames(gamesData);
    } catch (err) {
      setError('加载数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGameDialog = (game = null) => {
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
      
      reset({
        gameNumber: game.gameNumber.toString(),
        coachComment: game.coachComment || '',
        selfSummary: game.selfSummary || ''
      });
    } else {
      setEditingGame(null);
      const nextGameNumber = games.length + 1;
      setMyGameScore('');
      setOpponentGameScore('');
      reset({
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
        await gameService.createGame({ ...gameData, matchId: id });
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

  if (!match) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">比赛不存在</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 返回按钮 */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/competitions/${match.competitionId}`)}
        sx={{ mb: 2 }}
      >
        返回比赛详情
      </Button>

      {/* 对战基本信息 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {getMatchTypeText(match.matchType)}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h5">
            vs {match.opponentName}
          </Typography>
          <Chip
            label={getMatchResultText(match.result)}
            color={match.result === 'WIN' ? 'success' : 'error'}
          />
        </Box>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          对手来自：{match.opponentCity}
        </Typography>
        
        {match.score && (
          <Typography variant="h6" sx={{ mt: 2 }}>
            比分：{match.score}
          </Typography>
        )}

        {(match.coachComment || match.selfSummary) && (
          <Box sx={{ mt: 3 }}>
            {match.coachComment && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>教练评语</Typography>
                  <Typography variant="body2">{match.coachComment}</Typography>
                </CardContent>
              </Card>
            )}
            {match.selfSummary && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>个人总结</Typography>
                  <Typography variant="body2">{match.selfSummary}</Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </Paper>

      {/* 每局比赛列表 */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">每局比赛记录</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenGameDialog()}
          >
            添加一局
          </Button>
        </Box>

        {games.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            暂无比赛记录
          </Typography>
        ) : (
          <List>
            {games.map((game, index) => (
              <React.Fragment key={game.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6">
                          第{game.gameNumber}局
                        </Typography>
                        <Typography variant="body1">
                          比分：{game.score}
                        </Typography>
                        {game.result && (
                          <Chip
                            label={getGameResultText(game.result)}
                            color={game.result === 'WIN' ? 'success' : 'error'}
                            size="small"
                          />
                        )}
                        {game.videos && game.videos.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {game.videos.map((videoPath, index) => (
                              <Box
                                key={index}
                                sx={{
                                  position: 'relative',
                                  width: 80,
                                  height: 60,
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
                                  onClick={() => handlePlayVideo(`/api/uploads/videos/${videoPath.split('/').pop()}`)}
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
                                    width: 24,
                                    height: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  onClick={() => handlePlayVideo(`/api/uploads/videos/${videoPath.split('/').pop()}`)}
                                >
                                  <VideoLibrary fontSize="small" />
                                </Box>
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 2,
                                    right: 2,
                                    color: 'white',
                                    backgroundColor: 'rgba(255,0,0,0.7)',
                                    width: 18,
                                    height: 18,
                                    '&:hover': {
                                      backgroundColor: 'rgba(255,0,0,0.9)',
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveVideo(game.id, videoPath);
                                  }}
                                >
                                  <Close fontSize="small" sx={{ fontSize: 12 }} />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {game.coachComment && (
                          <Typography variant="body2" color="text.secondary">
                            教练评语：{game.coachComment}
                          </Typography>
                        )}
                        {game.selfSummary && (
                          <Typography variant="body2" color="text.secondary">
                            个人总结：{game.selfSummary}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <input
                      accept="video/*"
                      style={{ display: 'none' }}
                      id={`video-upload-${game.id}`}
                      type="file"
                      multiple
                      onChange={(e) => handleUploadVideo(game.id, e)}
                    />
                    <label htmlFor={`video-upload-${game.id}`}>
                      <IconButton component="span" color="primary">
                        <VideoCall />
                      </IconButton>
                    </label>
                    <IconButton
                      onClick={() => handleOpenGameDialog(game)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteGame(game.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* 添加/编辑局对话框 */}
      <Dialog open={openGameDialog} onClose={handleCloseGameDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(handleSaveGame)}>
          <DialogTitle>{editingGame ? '编辑局' : '添加新局'}</DialogTitle>
          <DialogContent>
            <Controller
              name="gameNumber"
              control={control}
              rules={{ 
                required: '请选择局数'
              }}
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
              control={control}
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
              control={control}
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

      {/* 视频播放模态框 */}
      <Dialog 
        open={videoModalOpen} 
        onClose={handleCloseVideoModal} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'black'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          比赛视频
          <IconButton onClick={handleCloseVideoModal} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedVideo && (
            <video
              width="100%"
              height="auto"
              controls
              autoPlay
              style={{ maxHeight: '70vh' }}
            >
              <source src={selectedVideo} type="video/mp4" />
              <source src={selectedVideo} type="video/avi" />
              <source src={selectedVideo} type="video/mov" />
              您的浏览器不支持视频播放。
            </video>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default MatchDetail; 
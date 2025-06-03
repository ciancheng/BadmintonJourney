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
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  VideoLibrary,
  VideoCall
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import matchService from '../services/matchService';
import gameService from '../services/gameService';

function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [match, setMatch] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openGameDialog, setOpenGameDialog] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadData();
  }, [id]);

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
      reset({
        gameNumber: game.gameNumber,
        score: game.score,
        coachComment: game.coachComment || '',
        selfSummary: game.selfSummary || ''
      });
    } else {
      setEditingGame(null);
      const nextGameNumber = games.length + 1;
      reset({
        gameNumber: nextGameNumber,
        score: '',
        coachComment: '',
        selfSummary: ''
      });
    }
    setOpenGameDialog(true);
  };

  const handleCloseGameDialog = () => {
    setOpenGameDialog(false);
    setEditingGame(null);
  };

  const handleSaveGame = async (data) => {
    try {
      if (editingGame) {
        await gameService.updateGame(editingGame.id, data);
      } else {
        await gameService.createGame({ ...data, matchId: id });
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
    const file = event.target.files[0];
    if (file) {
      try {
        await gameService.uploadVideo(gameId, file);
        loadData();
        alert('视频上传成功');
      } catch (err) {
        alert('视频上传失败');
      }
    }
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
        onClick={() => navigate(`/competitions/${match.competition.id}`)}
        sx={{ mb: 2 }}
      >
        返回比赛详情
      </Button>

      {/* 对战基本信息 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {match.matchType === 'GROUP_STAGE' ? '小组赛' : match.matchType.replace('KNOCKOUT_', '淘汰赛')}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h5">
            vs {match.opponentName}
          </Typography>
          <Chip
            label={match.result === 'WIN' ? '胜' : '负'}
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
                        {game.videoPath && (
                          <Chip
                            icon={<VideoLibrary />}
                            label="已上传视频"
                            size="small"
                            color="primary"
                          />
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
                required: '请输入局数',
                min: { value: 1, message: '局数必须大于0' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  type="number"
                  label="第几局"
                  error={!!errors.gameNumber}
                  helperText={errors.gameNumber?.message}
                />
              )}
            />

            <Controller
              name="score"
              control={control}
              rules={{ required: '请输入比分' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="比分"
                  placeholder="例：21:19"
                  error={!!errors.score}
                  helperText={errors.score?.message}
                />
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
    </Container>
  );
}

export default MatchDetail; 
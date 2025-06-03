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
  ListItemSecondaryAction
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  PhotoCamera,
  EmojiEvents,
  LocationOn,
  DateRange
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import competitionService from '../services/competitionService';
import matchService from '../services/matchService';

function CompetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [competition, setCompetition] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMatchDialog, setOpenMatchDialog] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadData();
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
    } catch (err) {
      setError('加载数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      reset({
        matchType: match.matchType,
        opponentName: match.opponentName,
        opponentCity: match.opponentCity,
        score: match.score,
        result: match.result,
        coachComment: match.coachComment || '',
        selfSummary: match.selfSummary || ''
      });
    } else {
      setEditingMatch(null);
      reset({
        matchType: '',
        opponentName: '',
        opponentCity: '',
        score: '',
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
  };

  const handleSaveMatch = async (data) => {
    try {
      if (editingMatch) {
        await matchService.updateMatch(editingMatch.id, data);
      } else {
        await matchService.createMatch({ ...data, competitionId: id });
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

  const getResultText = (result) => {
    const resultMap = {
      'GROUP_NOT_QUALIFIED': '小组未出线',
      'GROUP_QUALIFIED': '小组出线',
      'TOP_32': '32强',
      'TOP_16': '16强',
      'TOP_8': '8强',
      'TOP_4': '4强',
      'THIRD_PLACE': '第三名',
      'SECOND_PLACE': '第二名',
      'CHAMPION': '冠军'
    };
    return resultMap[result] || '';
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
                <ListItem
                  button
                  onClick={() => navigate(`/matches/${match.id}`)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">
                          {match.matchType === 'GROUP_STAGE' ? '小组赛' : match.matchType.replace('KNOCKOUT_', '淘汰赛')}
                        </Typography>
                        <Typography variant="body1">vs {match.opponentName}</Typography>
                        <Chip
                          label={match.result === 'WIN' ? '胜' : '负'}
                          color={match.result === 'WIN' ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          来自{match.opponentCity} | 比分 {match.score || '-'}
                        </Typography>
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
                    <MenuItem value="GROUP_STAGE">小组赛</MenuItem>
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
              rules={{ required: '请输入对手城市' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="对手城市"
                  error={!!errors.opponentCity}
                  helperText={errors.opponentCity?.message}
                />
              )}
            />

            <Controller
              name="score"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  fullWidth
                  label="比分"
                  placeholder="例：2:1"
                />
              )}
            />

            <Controller
              name="result"
              control={control}
              rules={{ required: '请选择比赛结果' }}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.result}>
                  <InputLabel>比赛结果</InputLabel>
                  <Select {...field} label="比赛结果">
                    <MenuItem value="WIN">胜</MenuItem>
                    <MenuItem value="LOSE">负</MenuItem>
                  </Select>
                </FormControl>
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
    </Container>
  );
}

export default CompetitionDetail; 
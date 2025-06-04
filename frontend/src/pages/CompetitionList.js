import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Fab,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  IconButton
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import competitionService from '../services/competitionService';

function CompetitionList() {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadCompetitions();
  }, [page]);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await competitionService.getCompetitions(page, 10);
      setCompetitions(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('加载比赛列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1);
  };

  const handleDeleteCompetition = async (competitionId, competitionName, event) => {
    event.stopPropagation();
    if (window.confirm(`确定要删除比赛"${competitionName}"吗？此操作不可撤销。`)) {
      try {
        await competitionService.deleteCompetition(competitionId);
        loadCompetitions(); // 重新加载列表
      } catch (err) {
        alert('删除失败，请重试');
        console.error(err);
      }
    }
  };

  const getResultColor = (result) => {
    if (!result) return 'default';
    if (result === 'CHAMPION') return 'error';
    if (result === 'SECOND_PLACE' || result === 'THIRD_PLACE') return 'warning';
    if (result === 'TOP_4' || result === 'TOP_8') return 'success';
    return 'default';
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

  if (loading && competitions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        我的比赛
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {competitions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            还没有比赛记录
          </Typography>
          <Typography variant="body2" color="text.secondary">
            点击右下角的按钮添加你的第一场比赛
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {competitions.map((competition) => (
              <Grid item xs={12} sm={6} md={4} key={competition.id}>
                <Card sx={{ position: 'relative' }}>
                  {/* 删除按钮 - 右上角 */}
                  <IconButton
                    color="error"
                    aria-label="delete"
                    onClick={(event) => handleDeleteCompetition(competition.id, competition.competitionName, event)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                  
                  <CardActionArea onClick={() => navigate(`/competitions/${competition.id}`)}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {competition.competitionName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {dayjs(competition.startDate).format('YYYY年MM月DD日')} - 
                        {dayjs(competition.endDate).format('MM月DD日')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {competition.city}
                      </Typography>
                      {competition.venue && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {competition.venue}
                        </Typography>
                      )}
                      {competition.result && (
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={getResultText(competition.result)}
                            color={getResultColor(competition.result)}
                            size="small"
                          />
                        </Box>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/competitions/new')}
      >
        <Add />
      </Fab>
    </Container>
  );
}

export default CompetitionList; 
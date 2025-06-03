import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import competitionService from '../services/competitionService';

function CompetitionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      competitionName: '',
      startDate: null,
      endDate: null,
      city: '',
      venue: '',
      result: '',
      coachComment: '',
      selfSummary: ''
    }
  });

  useEffect(() => {
    if (isEdit) {
      loadCompetition();
    }
  }, [id]);

  const loadCompetition = async () => {
    try {
      setLoadingData(true);
      const data = await competitionService.getCompetition(id);
      reset({
        competitionName: data.competitionName,
        startDate: dayjs(data.startDate),
        endDate: dayjs(data.endDate),
        city: data.city,
        venue: data.venue || '',
        result: data.result || '',
        coachComment: data.coachComment || '',
        selfSummary: data.selfSummary || ''
      });
    } catch (err) {
      setError('加载比赛信息失败');
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      
      const formData = {
        ...data,
        startDate: data.startDate.format('YYYY-MM-DD'),
        endDate: data.endDate.format('YYYY-MM-DD')
      };

      if (isEdit) {
        await competitionService.updateCompetition(id, formData);
      } else {
        const newCompetition = await competitionService.createCompetition(formData);
        navigate(`/competitions/${newCompetition.id}`);
        return;
      }
      
      navigate(`/competitions/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {isEdit ? '编辑比赛' : '添加新比赛'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="competitionName"
            control={control}
            rules={{ required: '请输入比赛名称' }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="比赛名称"
                error={!!errors.competitionName}
                helperText={errors.competitionName?.message}
              />
            )}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: '请选择开始日期' }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="开始日期"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.startDate}
                      helperText={errors.startDate?.message}
                    />
                  )}
                />
              )}
            />

            <Controller
              name="endDate"
              control={control}
              rules={{ 
                required: '请选择结束日期',
                validate: (value, formValues) => {
                  if (!formValues.startDate || !value) return true;
                  return value >= formValues.startDate || '结束日期不能早于开始日期';
                }
              }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="结束日期"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.endDate}
                      helperText={errors.endDate?.message}
                    />
                  )}
                />
              )}
            />
          </Box>

          <Controller
            name="city"
            control={control}
            rules={{ required: '请输入比赛城市' }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="比赛城市"
                error={!!errors.city}
                helperText={errors.city?.message}
              />
            )}
          />

          <Controller
            name="venue"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                fullWidth
                label="具体比赛地点"
              />
            )}
          />

          {isEdit && (
            <>
              <Controller
                name="result"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>比赛结果</InputLabel>
                    <Select {...field} label="比赛结果">
                      <MenuItem value="">无</MenuItem>
                      <MenuItem value="GROUP_NOT_QUALIFIED">小组未出线</MenuItem>
                      <MenuItem value="GROUP_QUALIFIED">小组出线</MenuItem>
                      <MenuItem value="TOP_32">32强</MenuItem>
                      <MenuItem value="TOP_16">16强</MenuItem>
                      <MenuItem value="TOP_8">8强</MenuItem>
                      <MenuItem value="TOP_4">4强</MenuItem>
                      <MenuItem value="THIRD_PLACE">第三名</MenuItem>
                      <MenuItem value="SECOND_PLACE">第二名</MenuItem>
                      <MenuItem value="CHAMPION">冠军</MenuItem>
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
            </>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(isEdit ? `/competitions/${id}` : '/')}
            >
              取消
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default CompetitionForm; 
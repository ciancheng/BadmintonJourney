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
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import competitionService from '../services/competitionService';
import { fetchCitiesFromAPI } from '../data/cities';

function CompetitionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [cities, setCities] = useState([]);
  
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      competitionName: '',
      startDate: dayjs(),
      endDate: dayjs(),
      city: null,
      venue: '',
      result: '',
      coachComment: '',
      selfSummary: ''
    }
  });

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    if (isEdit && cities.length > 0) {
      loadCompetition();
    }
  }, [id, cities]);

  const loadCities = async () => {
    try {
      const citiesData = await fetchCitiesFromAPI();
      setCities(citiesData);
    } catch (error) {
      console.error('获取城市列表失败:', error);
    }
  };

  const loadCompetition = async () => {
    try {
      setLoadingData(true);
      const data = await competitionService.getCompetition(id);
      
      // 找到对应的城市对象，支持多种匹配方式
      let cityObj = null;
      if (data.city && cities.length > 0) {
        // 首先尝试按名称精确匹配
        cityObj = cities.find(c => c.name === data.city);
        
        // 如果没找到，尝试按名称包含匹配
        if (!cityObj) {
          cityObj = cities.find(c => c.name.includes(data.city) || data.city.includes(c.name));
        }
        
        // 如果仍然没找到，创建一个临时对象以显示原始城市名
        if (!cityObj) {
          cityObj = { name: data.city, province: '未知' };
        }
      }
      
      reset({
        competitionName: data.competitionName,
        startDate: dayjs(data.startDate),
        endDate: dayjs(data.endDate),
        city: cityObj,
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
      
      // 处理城市数据 - 确保提取正确的城市名称
      let cityName = '';
      if (data.city) {
        if (typeof data.city === 'string') {
          cityName = data.city;
        } else if (data.city.name) {
          cityName = data.city.name;
        }
      }
      
      const formData = {
        competitionName: data.competitionName,
        startDate: data.startDate.format('YYYY-MM-DD'),
        endDate: data.endDate.format('YYYY-MM-DD'),
        city: cityName,
        venue: data.venue,
        result: data.result || null,
        coachComment: data.coachComment,
        selfSummary: data.selfSummary
      };

      // 清理空值
      Object.keys(formData).forEach(key => {
        if (formData[key] === null || formData[key] === '') {
          delete formData[key];
        }
      });

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

  if (loadingData || (isEdit && cities.length === 0)) {
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
                  minDate={watch('startDate')}
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
            rules={{ required: '请选择比赛城市' }}
            render={({ field: { onChange, value, ...field } }) => (
              <Autocomplete
                {...field}
                value={value}
                onChange={(event, newValue) => onChange(newValue)}
                options={cities}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  if (typeof option === 'string') return option;
                  if (option.name && option.province) {
                    return option.province === '未知' ? option.name : `${option.name} (${option.province})`;
                  }
                  return option.name || '';
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    required
                    fullWidth
                    label="比赛城市"
                    placeholder="搜索城市（支持中文/拼音）..."
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                )}
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return option === value;
                  if (typeof value === 'string') return option.name === value;
                  return option.name === value.name;
                }}
                freeSolo={false}
                filterOptions={(options, params) => {
                  const input = params.inputValue.toLowerCase();
                  return options.filter(option =>
                    option.name.toLowerCase().includes(input) ||
                    option.province.toLowerCase().includes(input) ||
                    option.pinyin.toLowerCase().includes(input) ||
                    option.pinyin.toLowerCase().replace(/\s/g, '').includes(input.replace(/\s/g, ''))
                  );
                }}
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
                placeholder="例如：市体育中心羽毛球馆"
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
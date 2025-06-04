// 中国城市数据
export const chinaCities = [
  // 直辖市
  { name: '北京', province: '北京市', id: 'beijing', pinyin: 'beijing' },
  { name: '上海', province: '上海市', id: 'shanghai', pinyin: 'shanghai' },
  { name: '天津', province: '天津市', id: 'tianjin', pinyin: 'tianjin' },
  { name: '重庆', province: '重庆市', id: 'chongqing', pinyin: 'chongqing' },
  
  // 省会城市
  { name: '广州', province: '广东省', id: 'guangzhou', pinyin: 'guangzhou' },
  { name: '成都', province: '四川省', id: 'chengdu', pinyin: 'chengdu' },
  { name: '杭州', province: '浙江省', id: 'hangzhou', pinyin: 'hangzhou' },
  { name: '武汉', province: '湖北省', id: 'wuhan', pinyin: 'wuhan' },
  { name: '西安', province: '陕西省', id: 'xian', pinyin: 'xian' },
  { name: '南京', province: '江苏省', id: 'nanjing', pinyin: 'nanjing' },
  { name: '长沙', province: '湖南省', id: 'changsha', pinyin: 'changsha' },
  { name: '合肥', province: '安徽省', id: 'hefei', pinyin: 'hefei' },
  { name: '济南', province: '山东省', id: 'jinan', pinyin: 'jinan' },
  { name: '郑州', province: '河南省', id: 'zhengzhou', pinyin: 'zhengzhou' },
  { name: '昆明', province: '云南省', id: 'kunming', pinyin: 'kunming' },
  { name: '南宁', province: '广西', id: 'nanning', pinyin: 'nanning' },
  { name: '海口', province: '海南省', id: 'haikou', pinyin: 'haikou' },
  { name: '贵阳', province: '贵州省', id: 'guiyang', pinyin: 'guiyang' },
  { name: '南昌', province: '江西省', id: 'nanchang', pinyin: 'nanchang' },
  { name: '福州', province: '福建省', id: 'fuzhou', pinyin: 'fuzhou' },
  { name: '石家庄', province: '河北省', id: 'shijiazhuang', pinyin: 'shijiazhuang' },
  { name: '太原', province: '山西省', id: 'taiyuan', pinyin: 'taiyuan' },
  { name: '沈阳', province: '辽宁省', id: 'shenyang', pinyin: 'shenyang' },
  { name: '长春', province: '吉林省', id: 'changchun', pinyin: 'changchun' },
  { name: '哈尔滨', province: '黑龙江省', id: 'harbin', pinyin: 'haerbin' },
  { name: '兰州', province: '甘肃省', id: 'lanzhou', pinyin: 'lanzhou' },
  { name: '西宁', province: '青海省', id: 'xining', pinyin: 'xining' },
  { name: '银川', province: '宁夏', id: 'yinchuan', pinyin: 'yinchuan' },
  { name: '乌鲁木齐', province: '新疆', id: 'urumqi', pinyin: 'wulumuqi' },
  { name: '呼和浩特', province: '内蒙古', id: 'hohhot', pinyin: 'huhehaote' },
  { name: '拉萨', province: '西藏', id: 'lhasa', pinyin: 'lasa' },
  
  // 副省级城市和计划单列市
  { name: '深圳', province: '广东省', id: 'shenzhen', pinyin: 'shenzhen' },
  { name: '大连', province: '辽宁省', id: 'dalian', pinyin: 'dalian' },
  { name: '青岛', province: '山东省', id: 'qingdao', pinyin: 'qingdao' },
  { name: '宁波', province: '浙江省', id: 'ningbo', pinyin: 'ningbo' },
  { name: '厦门', province: '福建省', id: 'xiamen', pinyin: 'xiamen' },
  
  // 其他重要城市
  { name: '苏州', province: '江苏省', id: 'suzhou', pinyin: 'suzhou' },
  { name: '无锡', province: '江苏省', id: 'wuxi', pinyin: 'wuxi' },
  { name: '常州', province: '江苏省', id: 'changzhou', pinyin: 'changzhou' },
  { name: '南通', province: '江苏省', id: 'nantong', pinyin: 'nantong' },
  { name: '徐州', province: '江苏省', id: 'xuzhou', pinyin: 'xuzhou' },
  { name: '扬州', province: '江苏省', id: 'yangzhou', pinyin: 'yangzhou' },
  { name: '盐城', province: '江苏省', id: 'yancheng', pinyin: 'yancheng' },
  { name: '镇江', province: '江苏省', id: 'zhenjiang', pinyin: 'zhenjiang' },
  { name: '泰州', province: '江苏省', id: 'taizhou_js', pinyin: 'taizhou' },
  { name: '淮安', province: '江苏省', id: 'huaian', pinyin: 'huaian' },
  
  { name: '温州', province: '浙江省', id: 'wenzhou', pinyin: 'wenzhou' },
  { name: '嘉兴', province: '浙江省', id: 'jiaxing', pinyin: 'jiaxing' },
  { name: '绍兴', province: '浙江省', id: 'shaoxing', pinyin: 'shaoxing' },
  { name: '金华', province: '浙江省', id: 'jinhua', pinyin: 'jinhua' },
  { name: '台州', province: '浙江省', id: 'taizhou_zj', pinyin: 'taizhou' },
  
  { name: '东莞', province: '广东省', id: 'dongguan', pinyin: 'dongguan' },
  { name: '佛山', province: '广东省', id: 'foshan', pinyin: 'foshan' },
  { name: '珠海', province: '广东省', id: 'zhuhai', pinyin: 'zhuhai' },
  { name: '惠州', province: '广东省', id: 'huizhou', pinyin: 'huizhou' },
  { name: '中山', province: '广东省', id: 'zhongshan', pinyin: 'zhongshan' },
  { name: '江门', province: '广东省', id: 'jiangmen', pinyin: 'jiangmen' },
  { name: '肇庆', province: '广东省', id: 'zhaoqing', pinyin: 'zhaoqing' },
  { name: '汕头', province: '广东省', id: 'shantou', pinyin: 'shantou' },
  { name: '潮州', province: '广东省', id: 'chaozhou', pinyin: 'chaozhou' },
  { name: '湛江', province: '广东省', id: 'zhanjiang', pinyin: 'zhanjiang' },
  { name: '茂名', province: '广东省', id: 'maoming', pinyin: 'maoming' },
  
  { name: '烟台', province: '山东省', id: 'yantai', pinyin: 'yantai' },
  { name: '淄博', province: '山东省', id: 'zibo', pinyin: 'zibo' },
  { name: '潍坊', province: '山东省', id: 'weifang', pinyin: 'weifang' },
  { name: '临沂', province: '山东省', id: 'linyi', pinyin: 'linyi' },
  { name: '济宁', province: '山东省', id: 'jining', pinyin: 'jining' },
  { name: '威海', province: '山东省', id: 'weihai', pinyin: 'weihai' },
  
  { name: '洛阳', province: '河南省', id: 'luoyang', pinyin: 'luoyang' },
  { name: '开封', province: '河南省', id: 'kaifeng', pinyin: 'kaifeng' },
  { name: '新乡', province: '河南省', id: 'xinxiang', pinyin: 'xinxiang' },
  { name: '南阳', province: '河南省', id: 'nanyang', pinyin: 'nanyang' },
  
  { name: '唐山', province: '河北省', id: 'tangshan', pinyin: 'tangshan' },
  { name: '保定', province: '河北省', id: 'baoding', pinyin: 'baoding' },
  { name: '邯郸', province: '河北省', id: 'handan', pinyin: 'handan' },
  { name: '秦皇岛', province: '河北省', id: 'qinhuangdao', pinyin: 'qinhuangdao' },
  
  { name: '芜湖', province: '安徽省', id: 'wuhu', pinyin: 'wuhu' },
  { name: '马鞍山', province: '安徽省', id: 'maanshan', pinyin: 'maanshan' },
  { name: '安庆', province: '安徽省', id: 'anqing', pinyin: 'anqing' },
  
  { name: '宜昌', province: '湖北省', id: 'yichang', pinyin: 'yichang' },
  { name: '襄阳', province: '湖北省', id: 'xiangyang', pinyin: 'xiangyang' },
  { name: '荆州', province: '湖北省', id: 'jingzhou', pinyin: 'jingzhou' },
  
  { name: '株洲', province: '湖南省', id: 'zhuzhou', pinyin: 'zhuzhou' },
  { name: '湘潭', province: '湖南省', id: 'xiangtan', pinyin: 'xiangtan' },
  { name: '岳阳', province: '湖南省', id: 'yueyang', pinyin: 'yueyang' },
  { name: '衡阳', province: '湖南省', id: 'hengyang', pinyin: 'hengyang' },
  
  { name: '泉州', province: '福建省', id: 'quanzhou', pinyin: 'quanzhou' },
  { name: '漳州', province: '福建省', id: 'zhangzhou', pinyin: 'zhangzhou' },
  { name: '莆田', province: '福建省', id: 'putian', pinyin: 'putian' },
  
  { name: '赣州', province: '江西省', id: 'ganzhou', pinyin: 'ganzhou' },
  { name: '九江', province: '江西省', id: 'jiujiang', pinyin: 'jiujiang' },
  
  { name: '绵阳', province: '四川省', id: 'mianyang', pinyin: 'mianyang' },
  { name: '德阳', province: '四川省', id: 'deyang', pinyin: 'deyang' },
  { name: '南充', province: '四川省', id: 'nanchong', pinyin: 'nanchong' },
  { name: '宜宾', province: '四川省', id: 'yibin', pinyin: 'yibin' },
  
  { name: '大理', province: '云南省', id: 'dali', pinyin: 'dali' },
  { name: '丽江', province: '云南省', id: 'lijiang', pinyin: 'lijiang' },
  { name: '曲靖', province: '云南省', id: 'qujing', pinyin: 'qujing' },
  
  { name: '桂林', province: '广西', id: 'guilin', pinyin: 'guilin' },
  { name: '柳州', province: '广西', id: 'liuzhou', pinyin: 'liuzhou' },
  
  { name: '宝鸡', province: '陕西省', id: 'baoji', pinyin: 'baoji' },
  { name: '咸阳', province: '陕西省', id: 'xianyang', pinyin: 'xianyang' },
  { name: '延安', province: '陕西省', id: 'yanan', pinyin: 'yanan' },
  
  { name: '包头', province: '内蒙古', id: 'baotou', pinyin: 'baotou' },
  { name: '鄂尔多斯', province: '内蒙古', id: 'ordos', pinyin: 'eerduosi' },
  
  { name: '三亚', province: '海南省', id: 'sanya', pinyin: 'sanya' },
].sort((a, b) => a.pinyin.localeCompare(b.pinyin));

// 通过API获取城市列表（如果有可用的API）
export const fetchCitiesFromAPI = async () => {
  try {
    // 这里可以替换为实际的城市API
    // 例如：高德地图API、百度地图API等
    // const response = await axios.get('https://api.example.com/cities');
    // return response.data;
    
    // 目前返回静态数据
    return chinaCities;
  } catch (error) {
    console.error('获取城市API失败，使用本地数据:', error);
    return chinaCities;
  }
}; 
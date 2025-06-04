// 比赛类型中文映射
export const getMatchTypeText = (matchType) => {
  const matchTypeMap = {
    'GROUP_STAGE_1': '小组赛1',
    'GROUP_STAGE_2': '小组赛2', 
    'GROUP_STAGE_3': '小组赛3',
    'KNOCKOUT_1': '淘汰赛1',
    'KNOCKOUT_2': '淘汰赛2',
    'KNOCKOUT_3': '淘汰赛3',
    'KNOCKOUT_4': '淘汰赛4',
    'KNOCKOUT_5': '淘汰赛5'
  };
  return matchTypeMap[matchType] || matchType;
};

// 比赛结果中文映射
export const getCompetitionResultText = (result) => {
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

// 对战结果中文映射
export const getMatchResultText = (result) => {
  const resultMap = {
    'WIN': '胜',
    'LOSE': '负'
  };
  return resultMap[result] || result;
};

// 局比赛结果中文映射
export const getGameResultText = (result) => {
  const resultMap = {
    'WIN': '胜',
    'LOSE': '负'
  };
  return resultMap[result] || result;
}; 
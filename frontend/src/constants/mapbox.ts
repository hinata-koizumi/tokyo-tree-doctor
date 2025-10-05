// Mapbox configuration constants
export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGluYXRhMDYwNCIsImEiOiJjbWVtYmhoZDMwNTRnMmtzYWtjdm5zc3ZxIn0.Ajt7AYOjSJA6RciVRByYDg';

export const DEFAULT_VIEW_STATE = {
  longitude: 139.5,
  latitude: 35.6,
  zoom: 8
};

export const DEFAULT_MAP_STYLE = 'mapbox://styles/mapbox/streets-v12?optimize=true';

// Map style options
export const MAP_STYLES = [
  {
    id: 'streets',
    name: '標準地図',
    style: 'mapbox://styles/mapbox/streets-v12?optimize=true',
    description: '一般的な道路地図'
  },
  {
    id: 'satellite',
    name: '衛星写真',
    style: 'mapbox://styles/mapbox/satellite-v9?optimize=true',
    description: '衛星画像ベースの地図'
  },
  {
    id: 'satellite-streets',
    name: '衛星+道路',
    style: 'mapbox://styles/mapbox/satellite-streets-v12?optimize=true',
    description: '衛星画像に道路を重ねた地図'
  },
  {
    id: 'outdoors',
    name: 'アウトドア',
    style: 'mapbox://styles/mapbox/outdoors-v12?optimize=true',
    description: 'アウトドア活動向けの地図'
  },
  {
    id: 'light',
    name: 'ライト',
    style: 'mapbox://styles/mapbox/light-v11?optimize=true',
    description: '明るい色調の地図'
  },
  {
    id: 'dark',
    name: 'ダーク',
    style: 'mapbox://styles/mapbox/dark-v11?optimize=true',
    description: '暗い色調の地図'
  }
];

// Tokyo parks data
export const TOKYO_PARKS = [
  {
    id: 'sakuragaoka',
    name: '桜ヶ丘公園',
    coordinates: [139.461844, 35.637694], // 東京都多摩市連光寺3丁目・5丁目
    description: '東京都多摩市連光寺3丁目・5丁目'
  },
  {
    id: 'naganuma',
    name: '長沼公園',
    coordinates: [139.368333, 35.638333], // 東京都八王子市長沼町・下柚木
    description: '東京都八王子市長沼町・下柚木'
  },
  {
    id: 'hirayama',
    name: '平山城址公園',
    coordinates: [139.381389, 35.638611], // 東京都八王子市堀之内
    description: '東京都八王子市堀之内'
  },
  {
    id: 'koyamada',
    name: '小山田緑地',
    coordinates: [139.418611, 35.596389], // 東京都町田市下小山田町・上小山田町
    description: '東京都町田市下小山田町・上小山田町'
  },
  {
    id: 'koyanaidai',
    name: '小山内裏公園',
    coordinates: [139.366417, 35.606139], // 東京都町田市小山ヶ丘4丁目4番地
    description: '東京都町田市小山ヶ丘4丁目4番地'
  },

];

// Park-specific data
export const PARK_DATA = {
  sakuragaoka: {
    damageStats: {
      total: 1247,
      healthy: 374, // 低リスクのみ（30%）
      warning: 748, // 中リスクと未分類（60%）
      danger: 125,  // 高リスク（10%）
      healthyPercent: 30.0,
      warningPercent: 60.0,
      dangerPercent: 10.0
    },
    causeAnalysis: {
      mainCause: 'カシナガキクイムシ被害',
      mainCausePercent: 75,
      climateImpact: '+2.1℃',
      rainfallDecrease: '-12%',
      description: '南向き斜面の乾燥地帯で被害が拡大。特にナラ科樹木の被害が深刻。'
    },
    proposals: {
      emergency: 45,
      preventionRange: '300m',
      improvements: 8,
      priority: '高',
      description: '緊急防除と土壌改良による長期的改善策を実施。'
    }
  },
  naganuma: {
    damageStats: {
      total: 892,
      healthy: 178, // 低リスクのみ（20%）
      warning: 536, // 中リスクと未分類（60%）
      danger: 178,  // 高リスク（20%）
      healthyPercent: 20.0,
      warningPercent: 60.0,
      dangerPercent: 20.0
    },
    causeAnalysis: {
      mainCause: '気候変動の影響',
      mainCausePercent: 65,
      climateImpact: '+2.5℃',
      rainfallDecrease: '-18%',
      description: '高温少雨により樹木の抵抗力が低下。土壌水分の不足が深刻。'
    },
    proposals: {
      emergency: 32,
      preventionRange: '400m',
      improvements: 12,
      priority: '中',
      description: '灌水設備の整備と耐乾燥性樹種への植え替えを推進。'
    }
  },
  hirayama: {
    damageStats: {
      total: 1568,
      healthy: 235, // 低リスクのみ（15%）
      warning: 862, // 中リスクと未分類（55%）
      danger: 471,  // 高リスク（30%）
      healthyPercent: 15.0,
      warningPercent: 55.0,
      dangerPercent: 30.0
    },
    causeAnalysis: {
      mainCause: '複合要因',
      mainCausePercent: 82,
      climateImpact: '+2.8℃',
      rainfallDecrease: '-20%',
      description: '害虫被害と気候変動が複合的に作用。特に高齢樹木の被害が顕著。'
    },
    proposals: {
      emergency: 58,
      preventionRange: '500m',
      improvements: 15,
      priority: '高',
      description: '包括的な樹木管理システムの導入と緊急対応体制の構築。'
    }
  },
  koyamada: {
    damageStats: {
      total: 734,
      healthy: 514, // 70%
      warning: 147, // 20%
      danger: 73,   // 10%
      healthyPercent: 50.0,
      warningPercent: 30.0,
      dangerPercent: 20.0
    },
    causeAnalysis: {
      mainCause: '土壌環境の悪化',
      mainCausePercent: 58,
      climateImpact: '+1.9℃',
      rainfallDecrease: '-10%',
      description: '土壌の酸性化と栄養不足により樹木の成長が阻害されている。'
    },
    proposals: {
      emergency: 25,
      preventionRange: '250m',
      improvements: 6,
      priority: '中',
      description: '土壌改良と施肥管理の強化による環境改善を実施。'
    }
  },
  koyanaidai: {
    damageStats: {
      total: 1023,
      healthy: 307, // 30%
      warning: 512, // 50%
      danger: 204,  // 20%
      healthyPercent: 50.0,
      warningPercent: 30.0,
      dangerPercent: 20.0
    },
    causeAnalysis: {
      mainCause: '都市化の影響',
      mainCausePercent: 72,
      climateImpact: '+2.2℃',
      rainfallDecrease: '-15%',
      description: '都市化による熱島効果と大気汚染が樹木に悪影響を与えている。'
    },
    proposals: {
      emergency: 38,
      preventionRange: '350m',
      improvements: 10,
      priority: '中',
      description: '都市緑化の推進と大気浄化機能の強化を図る。'
    }
  }
};

// ドローン調査データの型定義
export interface DroneSurveyPoint {
  id: string;
  coordinates: [number, number];
  surveyDate: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  treeCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

// 全公園のドローン調査データ（デモ用）- 各公園に2つの範囲、より細かい位置調整
export const DRONE_SURVEY_DATA: Record<string, DroneSurveyPoint[]> = {
  sakuragaoka: [
    {
      id: 'sakuragaoka-001',
      coordinates: [139.4622, 35.6382], // 北東側（より中心に近い）
      surveyDate: '2025-08-20',
      status: 'completed',
      treeCount: 52,
      riskLevel: 'medium',
      description: '北東側エリア - 中リスクエリア（黄）'
    },
    {
      id: 'sakuragaoka-002',
      coordinates: [139.4612, 35.6368], // 南西側（より中心に近い）
      surveyDate: '2025-08-25',
      status: 'scheduled',
      treeCount: 38,
      riskLevel: 'high',
      description: '南西側エリア - 高リスクエリア（赤）'
    },
    {
      id: 'sakuragaoka-003',
      coordinates: [139.4632, 35.6372], // 北西側（低リスクエリア）
      surveyDate: '2025-08-22',
      status: 'completed',
      treeCount: 35,
      riskLevel: 'low',
      description: '北西側エリア - 低リスクエリア（緑）'
    }
  ],
  naganuma: [
    {
      id: 'naganuma-001',
      coordinates: [139.3688, 35.6388], // 北西側（より中心に近い）
      surveyDate: '2025-08-20',
      status: 'completed',
      treeCount: 45,
      riskLevel: 'medium',
      description: '北西側エリア - 中リスクエリア（黄）'
    },
    {
      id: 'naganuma-002',
      coordinates: [139.3678, 35.6378], // 南東側（より中心に近い）
      surveyDate: '2025-08-26',
      status: 'scheduled',
      treeCount: 28,
      riskLevel: 'critical',
      description: '南東側エリア - 緊急リスクエリア（濃い赤）'
    },
    {
      id: 'naganuma-003',
      coordinates: [139.3698, 35.6398], // 北東側（低リスクエリア）
      surveyDate: '2025-08-23',
      status: 'completed',
      treeCount: 32,
      riskLevel: 'low',
      description: '北東側エリア - 低リスクエリア（緑）'
    }
  ],
  hirayama: [
    {
      id: 'hirayama-001',
      coordinates: [139.3818, 35.6388], // 北東側（より控えめ）
      surveyDate: '2025-08-20',
      status: 'completed',
      treeCount: 48,
      riskLevel: 'medium',
      description: '北東側エリア - 中リスクエリア（黄）'
    },
    {
      id: 'hirayama-002',
      coordinates: [139.3828, 35.6398], // 北西側（低リスクエリア）
      surveyDate: '2025-08-24',
      status: 'completed',
      treeCount: 25,
      riskLevel: 'low',
      description: '北西側エリア - 低リスクエリア（緑）'
    }
  ],
  koyamada: [
    {
      id: 'koyamada-001',
      coordinates: [139.4192, 35.5972], // 北東側（より中心に近い）
      surveyDate: '2025-08-20',
      status: 'completed',
      treeCount: 42,
      riskLevel: 'critical',
      description: '北東側エリア - 緊急リスクエリア（濃い赤）'
    },
    {
      id: 'koyamada-002',
      coordinates: [139.4178, 35.5958], // 南西側（より中心に近い）
      surveyDate: '2025-08-27',
      status: 'scheduled',
      treeCount: 31,
      riskLevel: 'medium',
      description: '南西側エリア - 中リスクエリア（黄）'
    },
    {
      id: 'koyamada-003',
      coordinates: [139.4202, 35.5982], // 北西側（低リスクエリア）
      surveyDate: '2025-08-25',
      status: 'completed',
      treeCount: 28,
      riskLevel: 'low',
      description: '北西側エリア - 低リスクエリア（緑）'
    }
  ],
  koyanaidai: [
    {
      id: 'koyanaidai-001',
      coordinates: [139.3672, 35.6072], // 北東側（より中心に近い）
      surveyDate: '2025-08-20',
      status: 'completed',
      treeCount: 39,
      riskLevel: 'high',
      description: '北東側エリア - 高リスクエリア（赤）'
    },
    {
      id: 'koyanaidai-002',
      coordinates: [139.3682, 35.6082], // 北西側（低リスクエリア）
      surveyDate: '2025-08-26',
      status: 'completed',
      treeCount: 22,
      riskLevel: 'low',
      description: '北西側エリア - 低リスクエリア（緑）'
    }
  ]
};

// 後方互換性のため
export const NAGANUMA_DRONE_SURVEY_DATA = DRONE_SURVEY_DATA.naganuma;

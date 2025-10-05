/**
 * ハザードマップ用APIサービス
 */

// 環境変数から取得、フォールバックを設定
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.225:8001/api/v1';

// HTTPメソッドとヘッダーの定数化
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

const CACHE_DURATION = 5 * 60 * 1000; // 5分間のキャッシュ

// エラーメッセージの定数化
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  NOT_FOUND: 'データが見つかりません',
  SERVER_ERROR: 'サーバーエラーが発生しました',
  INVALID_RESPONSE: '不正なレスポンス形式です',
  TIMEOUT: 'リクエストがタイムアウトしました'
} as const;

// API エンドポイントの定数化
const API_ENDPOINTS = {
  HAZARD_MESH: '/hazard-map',
  HAZARD_STATISTICS: '/hazard-statistics',
  HAZARD_PARKS: '/hazard-parks',
  HAZARD_MESH_SAMPLE: '/hazard-mesh-sample',
  // AI分析用エンドポイント
  AI_HAZARD_ANALYSIS: '/ai-hazard-analysis',
  AI_HAZARD_GEOJSON: '/ai-hazard-geojson',
  AI_HAZARD_RECOMMENDATIONS: '/ai-hazard-recommendations',
  AI_HAZARD_DETAILED: '/ai-hazard-detailed'
} as const;

export interface HazardMeshData {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: {
      mesh_id: string;
      risk_score: number;
      forest_score: number;
      weather_score: number;
      tree_count: number;
      center_lat: number;
      center_lng: number;
    };
  }>;
}

// AI分析結果の型定義
export interface AIHazardAnalysisData {
  park_info: {
    park_id: string;
    name: string;
    area_ha: number;
    perimeter_m: number;
    centroid: {
      lat: number;
      lng: number;
    };
  };
  risk_assessment: {
    overall_risk_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    risk_distribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    total_hazard_zones: number;
  };
  tree_health_summary: {
    total_trees: number;
    tree_density_ha: number;
    species_count: Record<string, number>;
    health_status: {
      healthy: number;
      warning: number;
      danger: number;
    };
    health_ratio: {
      healthy: number;
      warning: number;
      danger: number;
    };
    diameter_distribution: {
      small: number;
      medium: number;
      large: number;
    };
    susceptible_ratio: number;
    average_diameter: number;
  };
  weather_impact: {
    temperature_trend: string;
    rainfall_trend: string;
    humidity_trend: string;
    weather_risk_score: number;
    seasonal_analysis: {
      spring: number;
      summer: number;
      autumn: number;
      winter: number;
    };
  };
  recommendations: string[];
  geojson?: any;
}

// キャッシュ管理
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>();

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

// エラーハンドリング
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTPクライアント
class HttpClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: DEFAULT_HEADERS,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new ApiError(
          response.statusText || ERROR_MESSAGES.SERVER_ERROR,
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError) {
        throw new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 0);
      }
      
      throw new ApiError(ERROR_MESSAGES.SERVER_ERROR, 500);
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// ハザードマップサービス
class HazardMapService {
  private http = new HttpClient();
  private cache = new CacheManager();

  /**
   * ハザードメッシュデータを取得
   */
  async getHazardMeshData(parkId?: string): Promise<HazardMeshData> {
    const cacheKey = `hazard-mesh-${parkId || 'all'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const endpoint = parkId 
      ? `${API_ENDPOINTS.HAZARD_MESH}/${parkId}`
      : API_ENDPOINTS.HAZARD_MESH;
    
    const data = await this.http.get<HazardMeshData>(endpoint);
    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * 公園のハザード統計情報を取得
   */
  async getParkHazardStatistics(parkId: string): Promise<any> {
    const cacheKey = `hazard-stats-${parkId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const endpoint = `${API_ENDPOINTS.HAZARD_STATISTICS}/${parkId}`;
    const data = await this.http.get<any>(endpoint);
    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * 利用可能な公園のリストを取得
   */
  async getAvailableParks(): Promise<{ parks: any[] }> {
    const cacheKey = 'available-parks';
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const data = await this.http.get<{ parks: any[] }>(API_ENDPOINTS.HAZARD_PARKS);
    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * AIハザード分析を実行
   */
  async getAIHazardAnalysis(
    parkId: string,
    options: {
      includeRecommendations?: boolean;
      includeGeoJSON?: boolean;
    } = {}
  ): Promise<AIHazardAnalysisData> {
    const { includeRecommendations = true, includeGeoJSON = true } = options;
    const cacheKey = `ai-hazard-${parkId}-${includeRecommendations}-${includeGeoJSON}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      include_recommendations: includeRecommendations.toString(),
      include_geojson: includeGeoJSON.toString(),
    });

    const endpoint = `${API_ENDPOINTS.AI_HAZARD_ANALYSIS}/${parkId}?${params}`;
    const data = await this.http.get<AIHazardAnalysisData>(endpoint);
    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * AI分析結果のGeoJSONデータのみを取得
   */
  async getAIHazardGeoJSON(parkId: string): Promise<any> {
    const cacheKey = `ai-hazard-geojson-${parkId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const endpoint = `${API_ENDPOINTS.AI_HAZARD_GEOJSON}/${parkId}`;
    const data = await this.http.get<any>(endpoint);
    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * AI分析の推奨事項のみを取得
   */
  async getAIHazardRecommendations(parkId: string): Promise<string[]> {
    const cacheKey = `ai-hazard-recommendations-${parkId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const endpoint = `${API_ENDPOINTS.AI_HAZARD_RECOMMENDATIONS}/${parkId}`;
    const data = await this.http.get<{ recommendations: string[] }>(endpoint);
    this.cache.set(cacheKey, data.recommendations);
    return data.recommendations;
  }

  /**
   * ハザードメッシュのサンプルデータを取得（デバッグ用）
   */
  async getHazardMeshSample(): Promise<any> {
    const data = await this.http.get<any>(API_ENDPOINTS.HAZARD_MESH_SAMPLE);
    return data;
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// シングルトンインスタンスをエクスポート
export const hazardMapService = new HazardMapService();

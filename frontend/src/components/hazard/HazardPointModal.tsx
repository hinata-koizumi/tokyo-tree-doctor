import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trees, Thermometer, MapPin, Calendar } from 'lucide-react';

interface HazardPoint {
  properties: {
    mesh_id: string;
    risk_score: number;
    forest_score: number;
    weather_score: number;
    tree_count: number;
    center_lat: number;
    center_lng: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface HazardPointModalProps {
  point: HazardPoint | null;
  isOpen: boolean;
  onClose: () => void;
  onDispatchDrone?: (coordinates: [number, number]) => void;
}

const HazardPointModal: React.FC<HazardPointModalProps> = ({
  point,
  isOpen,
  onClose,
  onDispatchDrone
}) => {
  if (!point) return null;

  const { properties } = point;
  const coordinates = point.geometry.coordinates;

  const getRiskLevelInfo = (level: string) => {
    switch (level) {
      case 'low':
        return { label: '低リスク', color: '#10b981', bgColor: '#d1fae5' };
      case 'medium':
        return { label: '中リスク', color: '#fbbf24', bgColor: '#fef3c7' };
      case 'high':
        return { label: '高リスク', color: '#f59e0b', bgColor: '#fed7aa' };
      case 'critical':
        return { label: '緊急', color: '#ef4444', bgColor: '#fee2e2' };
      default:
        return { label: '不明', color: '#6b7280', bgColor: '#f3f4f6' };
    }
  };

  const riskInfo = getRiskLevelInfo(properties.risk_level);

  const handleDispatchDrone = () => {
    if (onDispatchDrone) {
      onDispatchDrone(coordinates);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景オーバーレイ */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* モーダルコンテンツ */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: riskInfo.color }}
                />
                <h2 className="text-xl font-bold text-gray-900">
                  危険箇所詳細
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* コンテンツ */}
            <div className="p-6 space-y-6">
              {/* リスクレベル */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900">リスクレベル</h3>
                </div>
                <div 
                  className="px-4 py-3 rounded-lg border-2"
                  style={{ 
                    backgroundColor: riskInfo.bgColor,
                    borderColor: riskInfo.color
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg" style={{ color: riskInfo.color }}>
                      {riskInfo.label}
                    </span>
                    <span className="text-2xl font-bold" style={{ color: riskInfo.color }}>
                      {properties.risk_score.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 詳細情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">詳細情報</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Trees className="w-4 h-4" />
                      <span>森林スコア</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {properties.forest_score.toFixed(1)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Thermometer className="w-4 h-4" />
                      <span>気象スコア</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {properties.weather_score.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Trees className="w-4 h-4" />
                    <span>対象樹木数</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {properties.tree_count.toLocaleString()} 本
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>座標</span>
                  </div>
                  <div className="text-sm font-mono text-gray-700">
                    {coordinates[1].toFixed(6)}, {coordinates[0].toFixed(6)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>メッシュID</span>
                  </div>
                  <div className="text-sm font-mono text-gray-700">
                    {properties.mesh_id}
                  </div>
                </div>
              </div>

              {/* アクション */}
              {onDispatchDrone && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">アクション</h3>
                  <button
                    onClick={handleDispatchDrone}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    ドローンを派遣
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    この危険箇所にドローンを派遣して詳細調査を行います
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HazardPointModal;

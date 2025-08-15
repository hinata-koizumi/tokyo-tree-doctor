# ランダムシード
RANDOM_SEED = 42

# 3クラスの事前確率（合計1.0）
CLASS_PRIORS = {"H": 0.5, "E": 0.3, "D": 0.2}

# クラス×特徴ごとのレンジ
FEATURE_RANGES = {
    "H": {
        "green_ratio":        (0.45, 0.85),  
        "yellow_brown_ratio": (0.00, 0.35), 
        "color_std":          (0.05, 0.18), 
        "hue_mean":           (75, 130),   
        "ndvi_avg":           (0.55, 0.88),  
        "ndvi_std":           (0.03, 0.12),  
        "ndvi_min":           (0.30, 0.75),
        "ndvi_max":           (0.70, 0.95),
        "leaf_temp_mean":     (24, 33),     
    },
    "E": {
        "green_ratio":        (0.25, 0.75),
        "yellow_brown_ratio": (0.10, 0.65),
        "color_std":          (0.08, 0.22),
        "hue_mean":           (55, 115),
        "ndvi_avg":           (0.30, 0.80),
        "ndvi_std":           (0.05, 0.20),
        "ndvi_min":           (0.15, 0.60),
        "ndvi_max":           (0.55, 0.92),
        "leaf_temp_mean":     (26, 36),
    },
    "D": {
        "green_ratio":        (0.05, 0.60),  
        "yellow_brown_ratio": (0.20, 0.90),
        "color_std":          (0.06, 0.24),  
        "hue_mean":           (35, 105), 
        "ndvi_avg":           (0.05, 0.60),
        "ndvi_std":           (0.04, 0.16),
        "ndvi_min":           (0.05, 0.45),
        "ndvi_max":           (0.45, 0.85),
        "leaf_temp_mean":     (28, 41),
    },
}

# 特徴ごとのノイズσと“はみ出し”率
NOISE = {
    "green_ratio":          0.10,
    "yellow_brown_ratio":   0.08,
    "color_std":            0.05,
    "hue_mean":             10.0,  #（度）
    "ndvi_avg":             0.1,
    "ndvi_std":             0.13,
    "ndvi_min":             0.17,
    "ndvi_max":             0.16,
    "leaf_temp_mean":       2.3,   #（℃）
    "spillover_rate":       0.35,
    "ndvi_avg_spill":       0.28,
    "leaf_temp_mean_spill": 5.0,
}

# 簡易相関の係数
CORRELATION = {
    "yellow_brown_vs_ndvi": 0.8,
    "leaf_temp_vs_ndvi":    8.0,
}

# 分類パラメーター
VARI_HEALTHY_MIN   = 0.17   # 健康の下限（論文準拠）
VARI_WARN_MIN      = 0.06   # 要注意の下限（論文準拠）
VARI_WARN_SPLIT    = 0.07   # ←要注意(0.06–0.16)の内部で危険に寄せる閾値（調整点）
MIN_VEG_RATIO_VALID = 0.75  # ←植生被覆率がこれ未満ならN/A（3%）
MIN_VEG_PIXELS_ABS  = 30    # ←有効にするための最低植生画素数（絶対）
MIN_VEG_PIXELS_REL  = 0.002 # ←同（相対）：タイル画素の0.2%
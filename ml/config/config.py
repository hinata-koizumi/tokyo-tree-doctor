# ランダムシード
RANDOM_SEED = 42

# 3クラスの事前確率（合計1.0）
CLASS_PRIORS = {
    "危険":   0.20,
    "要注意": 0.30,
    "健康":   0.45,
    "N/A":    0.05,
}

# クラス別の温度レンジ（単位：摂氏）
# ここはプロジェクトの仮説・文献に合わせて調整してください。
FEATURE_RANGES = {
    "危険": {
        "leaf_temp_mean":   (30.0, 36.0),
        "leaf_temp_min":    (28.0, 33.0),
        "leaf_temp_max":    (34.0, 40.0),
        "leaf_temp_median": (29.5, 36.5),
        "leaf_temp_std":    (0.8,  2.5),
    },
    "要注意": {
        "leaf_temp_mean":   (27.0, 32.0),
        "leaf_temp_min":    (25.0, 30.0),
        "leaf_temp_max":    (31.0, 36.0),
        "leaf_temp_median": (26.5, 32.5),
        "leaf_temp_std":    (0.6,  2.0),
    },
    "健康": {
        "leaf_temp_mean":   (22.0, 27.0),
        "leaf_temp_min":    (20.0, 25.0),
        "leaf_temp_max":    (26.0, 31.0),
        "leaf_temp_median": (21.5, 27.5),
        "leaf_temp_std":    (0.4,  1.6),
    },
    "N/A": {
        # N/Aは空欄出力。値は使いませんが項目は残しておくと安心
        "leaf_temp_mean":   (None, None),
        "leaf_temp_min":    (None, None),
        "leaf_temp_max":    (None, None),
        "leaf_temp_median": (None, None),
        "leaf_temp_std":    (None, None),
    },
}

# ノイズ/クリップなどの挙動
NOISE = {
    # ガウスノイズのσ（列ごと）
    "leaf_temp_mean":   0.4,
    "leaf_temp_min":    0.3,
    "leaf_temp_max":    0.5,
    "leaf_temp_median": 0.3,
    "leaf_temp_std":    0.15,

    # スピルオーバー（外乱混入）の割合と強さ
    "spillover_rate":      0.05,  # 5%に追加ノイズ
    "leaf_temp_spill_sigma": 0.8, # そのときのσ

    # 物理的クリップ（温度の下限/上限）
    "physical_clip_lo": 15.0,
    "physical_clip_hi": 50.0,

    # 標準偏差カラムのクリップ
    "std_clip_lo": 0.0,
    "std_clip_hi": 10.0,
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
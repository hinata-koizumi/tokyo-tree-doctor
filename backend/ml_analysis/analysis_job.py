"""
分析ジョブ管理システム

VARI分析ジョブの状態管理、結果の保存・取得を行うモジュール
"""

import os
import json
import glob
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)


class AnalysisJobProcessor:
    """分析ジョブ管理クラス"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.results_dir = "data/vari_results"
        os.makedirs(self.results_dir, exist_ok=True)
    
    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        分析ジョブの状態を取得
        
        Args:
            job_id: ジョブID
            
        Returns:
            ジョブ状態の辞書、見つからない場合はNone
        """
        try:
            # ジョブ結果ファイルを検索
            result_file = self._find_job_result_file(job_id)
            
            if not result_file:
                return None
            
            # 結果ファイルを読み込み
            with open(result_file, 'r', encoding='utf-8') as f:
                result_data = json.load(f)
            
            # 状態情報を抽出
            status = {
                'job_id': result_data.get('job_id'),
                'state': result_data.get('state', 'unknown'),
                'submitted_at': result_data.get('submitted_at'),
                'finished_at': result_data.get('finished_at'),
                'error': result_data.get('error'),
                'metadata': result_data.get('drone_metadata'),
                'progress': self._calculate_progress(result_data.get('state', 'unknown'))
            }
            
            return status
            
        except Exception as e:
            self.logger.error(f"Error getting job status for {job_id}: {str(e)}")
            return None
    
    def get_analysis_results(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        分析結果を取得
        
        Args:
            job_id: ジョブID
            
        Returns:
            分析結果の辞書、見つからない場合はNone
        """
        try:
            # ジョブ結果ファイルを検索
            result_file = self._find_job_result_file(job_id)
            
            if not result_file:
                return None
            
            # 結果ファイルを読み込み
            with open(result_file, 'r', encoding='utf-8') as f:
                result_data = json.load(f)
            
            return result_data
            
        except Exception as e:
            self.logger.error(f"Error getting analysis results for {job_id}: {str(e)}")
            return None
    
    def list_jobs(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        分析ジョブの一覧を取得
        
        Args:
            limit: 取得件数制限
            
        Returns:
            ジョブ一覧のリスト
        """
        try:
            jobs = []
            
            # 結果ファイルを検索
            pattern = os.path.join(self.results_dir, "vari_analysis_*.json")
            result_files = glob.glob(pattern)
            
            # ファイルの更新日時でソート（新しい順）
            result_files.sort(key=os.path.getmtime, reverse=True)
            
            # 制限件数まで処理
            for file_path in result_files[:limit]:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        result_data = json.load(f)
                    
                    job_info = {
                        'job_id': result_data.get('job_id'),
                        'state': result_data.get('state'),
                        'submitted_at': result_data.get('submitted_at'),
                        'finished_at': result_data.get('finished_at'),
                        'drone_id': result_data.get('drone_metadata', {}).get('drone_id'),
                        'flight_id': result_data.get('drone_metadata', {}).get('flight_id'),
                        'file_path': file_path
                    }
                    
                    jobs.append(job_info)
                    
                except Exception as e:
                    self.logger.warning(f"Error reading result file {file_path}: {str(e)}")
                    continue
            
            return jobs
            
        except Exception as e:
            self.logger.error(f"Error listing jobs: {str(e)}")
            return []
    
    def delete_job(self, job_id: str) -> bool:
        """
        分析ジョブを削除
        
        Args:
            job_id: ジョブID
            
        Returns:
            削除成功時True
        """
        try:
            # ジョブ結果ファイルを検索
            result_file = self._find_job_result_file(job_id)
            
            if not result_file:
                return False
            
            # ファイルを削除
            os.remove(result_file)
            self.logger.info(f"Deleted job result file: {result_file}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error deleting job {job_id}: {str(e)}")
            return False
    
    def get_job_statistics(self) -> Dict[str, Any]:
        """
        分析ジョブの統計情報を取得
        
        Returns:
            統計情報の辞書
        """
        try:
            # 全ジョブを取得
            jobs = self.list_jobs(limit=1000)
            
            # 統計を計算
            total_jobs = len(jobs)
            completed_jobs = len([j for j in jobs if j.get('state') == 'completed'])
            failed_jobs = len([j for j in jobs if j.get('state') == 'failed'])
            processing_jobs = len([j for j in jobs if j.get('state') == 'processing'])
            
            # 完了率を計算
            completion_rate = (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0
            
            # 最近のジョブ（過去24時間）
            from datetime import datetime, timedelta
            cutoff_time = datetime.now() - timedelta(hours=24)
            recent_jobs = []
            
            for job in jobs:
                submitted_at = job.get('submitted_at')
                if submitted_at:
                    try:
                        if isinstance(submitted_at, str):
                            job_time = datetime.fromisoformat(submitted_at.replace('Z', '+00:00'))
                        else:
                            job_time = submitted_at
                        
                        if job_time > cutoff_time:
                            recent_jobs.append(job)
                    except:
                        continue
            
            return {
                'total_jobs': total_jobs,
                'completed_jobs': completed_jobs,
                'failed_jobs': failed_jobs,
                'processing_jobs': processing_jobs,
                'completion_rate': completion_rate,
                'recent_jobs_24h': len(recent_jobs)
            }
            
        except Exception as e:
            self.logger.error(f"Error getting job statistics: {str(e)}")
            return {
                'total_jobs': 0,
                'completed_jobs': 0,
                'failed_jobs': 0,
                'processing_jobs': 0,
                'completion_rate': 0,
                'recent_jobs_24h': 0
            }
    
    def _find_job_result_file(self, job_id: str) -> Optional[str]:
        """
        ジョブ結果ファイルを検索
        
        Args:
            job_id: ジョブID
            
        Returns:
            ファイルパス、見つからない場合はNone
        """
        try:
            pattern = os.path.join(self.results_dir, f"vari_analysis_{job_id}_*.json")
            files = glob.glob(pattern)
            
            if files:
                # 最新のファイルを返す
                return max(files, key=os.path.getmtime)
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error finding job result file for {job_id}: {str(e)}")
            return None
    
    def _calculate_progress(self, state: str) -> int:
        """
        分析状態から進捗パーセンテージを計算
        
        Args:
            state: 分析状態
            
        Returns:
            進捗パーセンテージ (0-100)
        """
        progress_map = {
            "queued": 0,
            "processing": 50,
            "completed": 100,
            "failed": 0
        }
        return progress_map.get(state, 0)

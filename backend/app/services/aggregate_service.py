from sqlalchemy import func

from app.db.config import SessionLocal
from app.models.analysis import AreaTile
from app.schemas.dashboard import SummaryKPI


def get_summary_kpi() -> SummaryKPI:  # noqa: WPS231
    session = SessionLocal()
    try:
        danger = session.query(func.count(AreaTile.id)).filter(AreaTile.class_label == "危険").scalar() or 0
        warning = session.query(func.count(AreaTile.id)).filter(AreaTile.class_label == "要注意").scalar() or 0
        safe = session.query(func.count(AreaTile.id)).filter(AreaTile.class_label == "健康").scalar() or 0
        total = danger + warning + safe
        return SummaryKPI(danger=danger, warning=warning, safe=safe, total=total)
    finally:
        session.close()

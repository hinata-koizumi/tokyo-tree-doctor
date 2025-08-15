from app.db.base import Base
from app.db.config import get_engine


def init_db():
    engine = get_engine()
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()

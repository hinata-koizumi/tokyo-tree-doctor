from pydantic import BaseModel


class SummaryKPI(BaseModel):
    danger: int
    warning: int
    safe: int
    total: int

from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class SessionBase(BaseModel):
    date_session: date
    heure_session: time
    id_classe: int
    semestre: int

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    date_session: Optional[date] = None
    heure_session: Optional[time] = None
    id_classe: Optional[int] = None
    semestre: Optional[int] = None

class Session(SessionBase):
    id: int
    class Config:
        from_attributes = True
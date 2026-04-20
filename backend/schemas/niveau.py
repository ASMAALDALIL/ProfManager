from pydantic import BaseModel

class NiveauBase(BaseModel):
    code: str
    cycle_id: int

class NiveauCreate(NiveauBase):
    pass

class NiveauResponse(BaseModel):
    id: int
    label: str
    cycle_id: int

    class Config:
        from_attributes = True

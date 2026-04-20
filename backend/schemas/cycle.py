from pydantic import BaseModel

class CycleBase(BaseModel):
    code: str

class CycleCreate(CycleBase):
    pass

class CycleResponse(BaseModel):
    id: int
    label: str

    class Config:
        from_attributes = True

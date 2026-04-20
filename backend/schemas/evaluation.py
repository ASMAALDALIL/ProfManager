from pydantic import BaseModel, Field
from typing import List, Optional

class EvaluationBase(BaseModel):
    id_classe: int
    id_session: int
    id_etudiant: int
    absences: bool = True
    participation: int = Field(default=0, ge=0, le=5)
    comportement: int = Field(default=0, ge=0, le=5)
    organisation_oublis: bool = False
    devoirs_non_fait: bool = False

class EvaluationCreate(EvaluationBase):
    pass

class Evaluation(EvaluationBase):
    id: int
    class Config:
        from_attributes = True

class StudentEvalInput(BaseModel):
    id_etudiant: int
    absences: bool = True
    participation: int = Field(0, ge=0, le=5)
    comportement: int = Field(5, ge=0, le=5)
    organisation_oublis: bool = False
    devoirs_non_fait: bool = False

class BulkEvalInput(BaseModel):
    id_session: int
    id_classe: int
    evaluations: List[StudentEvalInput]
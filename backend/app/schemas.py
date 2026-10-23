from pydantic import BaseModel

from typing import Literal



class IncidentCreate(BaseModel):

    title:str

    severity:Literal["low","medium","high","critical"]
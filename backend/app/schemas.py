from pydantic import BaseModel

from typing import Literal



class IncidentCreate(BaseModel):

    title:str

    severity:Literal["low","medium","high","critical"]

# defines the structure of an incident returned by the API

class IncidentResponse(BaseModel):

    # stores the incident's unique database ID.

    id:int

    # stores the incident title.

    title:str

    #stores the incident severity

    severity:Literal["low","meedium","high","critical"]

    #stores the current incident status.
    status:str

    #allows pydantic to read data dirsctly from the SQLAlchemy object
    model_config={"from_attributes":True}
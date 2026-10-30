
# Imports SQLAlchemy column types and database functions.
from sqlalchemy import Column, Integer, String, Text, DateTime, func

# Imports the shared SQLAlchemy Base.
from app.database.connection import Base


# Database model for application incidents.
class Incident(Base):

    # PostgreSQL table name.
    __tablename__ = "incidents"

    # Unique incident ID.
    id = Column(Integer, primary_key=True, index=True)

    # Incident title.
    title = Column(String, nullable=False)

    # Incident severity.
    severity = Column(String, nullable=False)

    # Current incident status.
    status = Column(String, nullable=False, default="open")


# Database model for application logs.
class Log(Base):

    # PostgreSQL table name.
    __tablename__ = "logs"

    # Unique log ID.
    id = Column(Integer, primary_key=True, index=True)

    # Log level: INFO, WARNING, ERROR, or CRITICAL.
    level = Column(String, nullable=False)

    # Detailed log message.
    message = Column(Text, nullable=False)

    # Name of the application or service generating the log.
    source = Column(String, nullable=False, default="application")

    # Automatically records when the log is created.
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

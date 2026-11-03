# Imports SQLAlchemy column types and database functions.
from sqlalchemy import Column, Integer, String, Text, DateTime, func

# Imports the shared SQLAlchemy Base.
from app.database.connection import Base


# import floating-point and date/time database types.

from sqlalchemy import Float, DateTime, func


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
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


 




# Database model for system monitoring metrics.
class Metric(Base):
    # PostgreSQL table name.
    __tablename__ = "metrics"

    # Unique metric record ID.
    id = Column(Integer, primary_key=True, index=True)

    # CPU utilization percentage.
    cpu_usage = Column(Float, nullable=False)

    # RAM utilization percentage.
    memory_usage = Column(Float, nullable=False)

    # Total RAM in GB.
    memory_total_gb = Column(Float, nullable=False)

    # Available RAM in GB.
    memory_available_gb = Column(Float, nullable=False)

    # Disk utilization percentage.
    disk_usage = Column(Float, nullable=False)

    # Total disk capacity in GB.
    disk_total_gb = Column(Float, nullable=False)

    # Available disk space in GB.
    disk_free_gb = Column(Float, nullable=False)

    # Automatically records when metrics are collected.
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

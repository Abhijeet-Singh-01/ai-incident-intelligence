# Imports create_engine to connect Python to PostgreSQL.
from sqlalchemy import create_engine

# Imports sessionmaker to create database sessions.
from sqlalchemy.orm import sessionmaker

# Imports the base class used to define database tables.
from sqlalchemy.orm import declarative_base

# Imports tools for reading environment variables.
import os
from dotenv import load_dotenv

# Loads environment variables from the .env file.
load_dotenv()

# Reads the database URL from the environment.
DATABASE_URL = os.getenv("DATABASE_URL")

# Stops execution if the database URL is missing.
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing from the .env file")

# Creates the database engine.
engine = create_engine(DATABASE_URL)

# Creates a factory for database sessions.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Creates the base class for database table models.
Base = declarative_base()


def get_db():

    db=SessionLocal()


    try:

        yield db

    finally:

        db.close()
"""
SQLAlchemy ORM models for TRACE-X relational schema.
"""

from sqlalchemy import (
    Column, Integer, BigInteger, String, Float, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    transaction_id = Column(BigInteger, unique=True, nullable=False, index=True)
    time_step = Column(Integer, nullable=False, index=True)
    known_label = Column(String(16), nullable=False, index=True)  # 'ILLICIT', 'LICIT', 'UNKNOWN'
    prediction = Column(String(16), nullable=True, index=True)    # 'ILLICIT', 'LICIT', NULL
    prediction_probability = Column(Float, nullable=True)
    risk_score = Column(Integer, nullable=True, index=True)       # 0 to 100
    risk_level = Column(String(16), nullable=True, index=True)    # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    in_degree = Column(Integer, default=0)
    out_degree = Column(Integer, default=0)
    total_degree = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TransactionFeature(Base):
    __tablename__ = "transaction_features"

    transaction_id = Column(BigInteger, primary_key=True)
    # Stored as JSON or comma-delimited array for cross-DB compatibility
    features = Column(Text, nullable=False)
    feature_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TransactionEdge(Base):
    __tablename__ = "transaction_edges"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    source_transaction_id = Column(BigInteger, nullable=False, index=True)
    destination_transaction_id = Column(BigInteger, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ModelPrediction(Base):
    __tablename__ = "model_predictions"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    transaction_id = Column(BigInteger, nullable=False, index=True)
    model_name = Column(String(64), nullable=False, index=True)
    prediction = Column(String(16), nullable=False)
    probability = Column(Float, nullable=False)
    risk_score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    model_name = Column(String(64), nullable=False, index=True)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1 = Column(Float, nullable=False)
    roc_auc = Column(Float, nullable=False)
    pr_auc = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    evaluation_strategy = Column(String(128), nullable=False)
    details = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InvestigationCase(Base):
    __tablename__ = "investigation_cases"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    case_name = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(32), default="OPEN")  # 'OPEN', 'UNDER REVIEW', 'CLOSED'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    transactions = relationship("CaseTransaction", back_populates="case", cascade="all, delete-orphan")
    notes = relationship("InvestigationNote", back_populates="case", cascade="all, delete-orphan")


class CaseTransaction(Base):
    __tablename__ = "case_transactions"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    case_id = Column(BigInteger, ForeignKey("investigation_cases.id", ondelete="CASCADE"), nullable=False)
    transaction_id = Column(BigInteger, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    case = relationship("InvestigationCase", back_populates="transactions")


class InvestigationNote(Base):
    __tablename__ = "investigation_notes"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    case_id = Column(BigInteger, ForeignKey("investigation_cases.id", ondelete="CASCADE"), nullable=False)
    transaction_id = Column(BigInteger, nullable=True)
    note = Column(Text, nullable=False)
    author = Column(String(64), default="Investigator")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    case = relationship("InvestigationCase", back_populates="notes")


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    dataset_name = Column(String(128), nullable=False)
    status = Column(String(32), nullable=False)  # 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
    rows_processed = Column(BigInteger, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)

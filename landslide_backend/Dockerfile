# Use the official slim Python 3.12 image
FROM python:3.12.11-slim

# Set environment variables for safety and performance
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Set working directory
WORKDIR /app

# Install OS dependencies needed for pip packages (e.g. grpc, zstandard, uvicorn, numpy, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libffi-dev \
    libpq-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Upgrade pip and install Python packages
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Now copy the full app code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run the FastAPI app (edit "main:app" if your entry point is different)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

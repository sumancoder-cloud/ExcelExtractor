# Use Node.js LTS as base image
FROM node:22-bookworm

# Install Python 3 and required system dependencies for PDF processing
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages for PDF processing
RUN pip3 install --no-cache-dir pdfplumber pillow

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]

FROM rasa/rasa:3.6.20-full

WORKDIR /app

# Install system dependencies
USER root
RUN apt-get update && \
    apt-get install -y build-essential gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Copy your requirements.txt for actions
COPY ./actions/requirements.txt ./

# Install any additional dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy your actions code
COPY ./actions /app/actions

# Ensure the required directories exist
RUN mkdir -p /app/models /app/data /app/tests

# Set permissions for the app directory
RUN chmod -R 755 /app

# Ensure we stay as root user
USER root

ENTRYPOINT ["rasa"]
CMD ["run", "actions", "--auto-reload"]

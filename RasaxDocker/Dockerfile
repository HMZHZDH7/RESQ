FROM rasa/rasa-sdk:3.6.2

WORKDIR /app

# Install system dependencies
USER root
RUN apt-get update && \
    apt-get install -y build-essential gcc g++ curl && \
    rm -rf /var/lib/apt/lists/*

COPY ./actions/requirements.txt ./

# Upgrade pip to avoid any potential issues with package installations
RUN pip install --upgrade pip

# Install remaining dependencies
RUN pip install -r requirements.txt

COPY ./actions /app/actions

# Ensure the user `rasa` (with UID 1001) has access to these files
RUN chown -R 1001:1001 /app/actions
RUN chmod -R 755 /app/actions

# Switch to non-root user
USER 1001

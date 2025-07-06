# Use an official OpenJDK runtime as a parent image
FROM eclipse-temurin:11-jre-focal

# Install Xvfb and other necessary packages for virtual display and logging
RUN apt-get update && apt-get install -y \
    xvfb \
    x11-utils \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the server JAR file into the container at /app
# The JAR will be copied into this directory by the run script
COPY robocode-tankroyale-gui.jar tank-royale-server.jar

# Create logs directory
RUN mkdir -p /app/logs

# Make port 7655 available to the world outside this container
EXPOSE 7655

# Create a comprehensive startup script with enhanced logging
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Enhanced logging functions\n\
log() {\n\
    echo "[$(date "+%Y-%m-%d %H:%M:%S")] $1" | tee -a /app/logs/startup.log\n\
}\n\
\n\
error() {\n\
    echo "[$(date "+%Y-%m-%d %H:%M:%S")] ERROR: $1" | tee -a /app/logs/startup.log >&2\n\
}\n\
\n\
log "🚀 Starting Tank Royale Server Container"\n\
log "Container: $(hostname)"\n\
log "Working Directory: $(pwd)"\n\
log "Java Version: $(java -version 2>&1 | head -n 1)"\n\
\n\
# Check if JAR file exists\n\
if [ ! -f "/app/tank-royale-server.jar" ]; then\n\
    error "Tank Royale JAR file not found at /app/tank-royale-server.jar"\n\
    exit 1\n\
fi\n\
\n\
log "📁 JAR file found: $(ls -lh /app/tank-royale-server.jar)"\n\
\n\
# Clean up any existing X server lock files\n\
log "🧹 Cleaning up X server lock files..."\n\
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 2>/dev/null || true\n\
\n\
# Start Xvfb in the background with logging\n\
log "🖥️  Starting virtual display (Xvfb)..."\n\
Xvfb :99 -screen 0 1024x768x24 > /app/logs/xvfb.log 2>&1 &\n\
XVFB_PID=$!\n\
export DISPLAY=:99\n\
\n\
# Wait for Xvfb to start and verify\n\
sleep 3\n\
if ! kill -0 $XVFB_PID 2>/dev/null; then\n\
    error "Xvfb failed to start"\n\
    log "📋 Xvfb log contents:"\n\
    cat /app/logs/xvfb.log\n\
    exit 1\n\
fi\n\
log "✅ Xvfb started successfully (PID: $XVFB_PID)"\n\
\n\
# Test display\n\
if command -v xdpyinfo >/dev/null 2>&1; then\n\
    log "🔍 Display info: $(xdpyinfo -display :99 | grep "dimensions" || echo "Could not get display info")" \n\
fi\n\
\n\
# Java runtime options for better logging and performance (Java 11 compatible)\n\
JAVA_OPTS="\n\
-Djava.awt.headless=false \n\
-Djava.util.logging.config.file=/app/logging.properties \n\
-Dfile.encoding=UTF-8 \n\
-Djava.net.preferIPv4Stack=true \n\
-XX:+UseG1GC \n\
-Xlog:gc:/app/logs/gc.log:time,tags\n\
"\n\
\n\
log "☕ Java Options: $JAVA_OPTS"\n\
log "🎮 Starting Tank Royale Server..."\n\
log "🌐 Server will be available on port 7655"\n\
log "📋 Server properties will be loaded from current directory"\n\
\n\
# Cleanup function for graceful shutdown\n\
cleanup() {\n\
    log "🛑 Received shutdown signal"\n\
    if [ ! -z "$SERVER_PID" ]; then\n\
        log "⏹️  Stopping Tank Royale Server (PID: $SERVER_PID)"\n\
        kill -TERM $SERVER_PID 2>/dev/null || true\n\
        wait $SERVER_PID 2>/dev/null || true\n\
    fi\n\
    if [ ! -z "$XVFB_PID" ]; then\n\
        log "⏹️  Stopping Xvfb (PID: $XVFB_PID)"\n\
        kill -TERM $XVFB_PID 2>/dev/null || true\n\
    fi\n\
    log "🏁 Container shutdown complete"\n\
    exit 0\n\
}\n\
\n\
# Set up signal handlers\n\
trap cleanup SIGTERM SIGINT\n\
\n\
# Copy mounted config files if available\n\
if [ -d "/app/config" ]; then\n\
    log "📁 Copying configuration files from mounted directory..."\n\
    cp -v /app/config/*.properties /app/ 2>/dev/null || log "ℹ️  No .properties files found in config directory"\n\
fi\n\
\n\
# List available config files\n\
log "📋 Available configuration files:"\n\
ls -la /app/*.properties 2>/dev/null || log "ℹ️  No .properties files found"\n\
\n\
# Start Tank Royale server with enhanced logging\n\
log "🚀 Launching Tank Royale server..."\n\
java $JAVA_OPTS -jar tank-royale-server.jar --server 2>&1 | tee /app/logs/server.log &\n\
SERVER_PID=$!\n\
\n\
log "🎯 Tank Royale Server started (PID: $SERVER_PID)"\n\
log "📊 Monitoring server process..."\n\
\n\
# Monitor the server process\n\
while kill -0 $SERVER_PID 2>/dev/null; do\n\
    sleep 5\n\
done\n\
\n\
error "Tank Royale Server process has stopped unexpectedly"\n\
log "📋 Last few lines of server log:"\n\
tail -n 20 /app/logs/server.log\n\
exit 1\n\
' > /app/start-server.sh && chmod +x /app/start-server.sh

# Create Java logging configuration
RUN echo '# Tank Royale Server Logging Configuration\n\
# Root logger level\n\
.level = INFO\n\
\n\
# Console handler\n\
handlers = java.util.logging.ConsoleHandler, java.util.logging.FileHandler\n\
\n\
# Console handler configuration\n\
java.util.logging.ConsoleHandler.level = INFO\n\
java.util.logging.ConsoleHandler.formatter = java.util.logging.SimpleFormatter\n\
\n\
# File handler configuration\n\
java.util.logging.FileHandler.pattern = /app/logs/tank-royale-%u.log\n\
java.util.logging.FileHandler.level = ALL\n\
java.util.logging.FileHandler.formatter = java.util.logging.SimpleFormatter\n\
java.util.logging.FileHandler.append = true\n\
java.util.logging.FileHandler.count = 5\n\
java.util.logging.FileHandler.limit = 10485760\n\
\n\
# Formatter configuration\n\
java.util.logging.SimpleFormatter.format = [%1$tF %1$tT] %4$s: %2$s - %5$s%6$s%n\n\
\n\
# Package-specific logging levels\n\
dev.robocode.level = ALL\n\
robocode.level = ALL\n\
\n\
# Network and WebSocket logging\n\
io.ktor.level = INFO\n\
org.eclipse.jetty.level = INFO\n\
' > /app/logging.properties

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:7655/ || exit 1

# Run the startup script when the container launches
CMD ["/app/start-server.sh"]

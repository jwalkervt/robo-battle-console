# Use an official OpenJDK runtime as a parent image
FROM eclipse-temurin:11-jre-focal

# Install Xvfb and other necessary packages for virtual display
RUN apt-get update && apt-get install -y \
    xvfb \
    x11-utils \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the server JAR file into the container at /app
# The JAR will be copied into this directory by the run script
COPY robocode-tankroyale-gui.jar tank-royale-server.jar

# Make port 7655 available to the world outside this container
EXPOSE 7655

# Create a startup script that runs Xvfb and then the Tank Royale server
RUN echo '#!/bin/bash\n\
# Start Xvfb in the background\n\
Xvfb :99 -screen 0 1024x768x24 &\n\
export DISPLAY=:99\n\
\n\
# Wait a moment for Xvfb to start\n\
sleep 2\n\
\n\
# Start Tank Royale server\n\
exec java -jar tank-royale-server.jar --server\n\
' > /app/start-server.sh && chmod +x /app/start-server.sh

# Run the startup script when the container launches
CMD ["/app/start-server.sh"]

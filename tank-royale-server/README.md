# Tank Royale Server Runner

This script automates the process of downloading and running the Tank Royale server using Docker.

## Prerequisites

1. **Python 3.7+** with pip
2. **Docker** installed and running
3. **Internet connection** to download the Tank Royale JAR file

## Installation

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Ensure Docker is installed and running:
   ```bash
   docker --version
   ```

## Usage

Simply run the script:

```bash
python3 run_server.py
```

The script will:
1. Find the latest Tank Royale release from GitHub
2. Download the GUI JAR file (which contains the server)
3. Build a Docker image
4. Run the server in a Docker container on port 7655

## Server Access

Once running, the Tank Royale server will be accessible at:
- **WebSocket**: `ws://localhost:7655`
- **HTTP**: `http://localhost:7655`

## Managing the Server

- **Stop the server**: `docker stop tank-royale-server`
- **Remove the container**: `docker rm tank-royale-server`
- **View logs**: `docker logs tank-royale-server`
- **Restart**: Run the script again (it will clean up old containers automatically)

## Troubleshooting

### Common Issues

1. **"No Tank Royale GUI JAR file found"**
   - Check your internet connection
   - Verify the Tank Royale repository has releases at: https://github.com/robocode-dev/tank-royale/releases

2. **Docker command not found**
   - Install Docker from: https://docs.docker.com/get-docker/
   - Ensure Docker is running

3. **Port 7655 already in use**
   - Stop any existing Tank Royale servers: `docker stop tank-royale-server`
   - Or kill the process using the port: `lsof -ti:7655 | xargs kill -9`

4. **Permission denied (Docker)**
   - On Linux, you may need to run with sudo or add your user to the docker group:
     ```bash
     sudo usermod -aG docker $USER
     ```
   - Then log out and back in.

### Manual Server Start

If you prefer to run the server manually without Docker:

```bash
# Download the JAR file manually from GitHub releases
# Then run:
java -jar robocode-tankroyale-gui-*.jar --server
```

## Files

- `run_server.py` - Main script that downloads and runs the server
- `docker/Dockerfile` - Docker configuration for the server container
- `requirements.txt` - Python dependencies
- `README.md` - This documentation

## Tank Royale Documentation

For more information about Tank Royale, visit:
- Official docs: https://robocode-dev.github.io/tank-royale/
- GitHub repository: https://github.com/robocode-dev/tank-royale 
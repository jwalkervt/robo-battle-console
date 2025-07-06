#!/usr/bin/env python3
"""
run_tank_royale_server.py
--------------------------
This script automates downloading and running the Tank Royale server using Docker.

It performs the following steps:
1.  Finds the latest release of the Tank Royale server from the GitHub API.
2.  Downloads the server JAR file if it's not already present.
3.  Builds a Docker image using the provided Dockerfile.
4.  Runs the Docker container to start the server on port 7654.

Usage:
    python run_tank_royale_server.py
"""
import os
import platform
import subprocess
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print("Error: 'requests' library is not installed.")
    print("Please install it by running: pip install requests")
    print("Or install all dependencies: pip install -r requirements.txt")
    sys.exit(1)

# --- Configuration ---
API_URL = "https://api.github.com/repos/robocode-dev/tank-royale/releases/latest"
JAR_FILENAME = "robocode-tankroyale-gui.jar"  # Will be renamed after download
DOCKER_IMAGE_NAME = "tank-royale-server"
DOCKERFILE_DIR = "docker"
SERVER_PORT = 7655  # Using different port to avoid conflict

# --- ANSI Color Codes ---
class Colors:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    GREEN = "\033[92m"
    BLUE = "\033[94m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    CYAN = "\033[96m"

# --- Helper Functions for Logging ---
def print_step(message: str) -> None:
    print(f"{Colors.CYAN}{Colors.BOLD}==> {message}{Colors.RESET}")

def print_success(message: str) -> None:
    print(f"{Colors.GREEN}{Colors.BOLD}✓ {message}{Colors.RESET}")

def print_warning(message: str) -> None:
    print(f"{Colors.YELLOW}⚠ {message}{Colors.RESET}")

def print_error(message: str) -> None:
    print(f"{Colors.RED}✗ {message}{Colors.RESET}")

def print_info(message: str) -> None:
    print(f"{Colors.BLUE}  {message}{Colors.RESET}")

# --- Core Functions ---
def run_command(cmd: list[str], cwd: Path, check: bool = True) -> subprocess.CompletedProcess:
    """Runs a shell command and handles errors."""
    print_info(f"Executing: {' '.join(cmd)}")
    try:
        return subprocess.run(cmd, cwd=cwd, check=check, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        print_error(f"Command failed with exit code {e.returncode}")
        print_error(f"Stderr: {e.stderr.strip()}")
        raise
    except FileNotFoundError:
        print_error(f"Command not found: {cmd[0]}. Is Docker installed and in your PATH?")
        raise

def get_latest_release_url() -> tuple[str, str]:
    """Fetches the download URL for the latest server JAR from GitHub."""
    print_step("Finding latest Tank Royale server release...")
    try:
        response = requests.get(API_URL)
        response.raise_for_status()  # Raise an exception for bad status codes
        release_data = response.json()

        # Look for the GUI JAR file which contains the server
        for asset in release_data.get("assets", []):
            asset_name = asset["name"]
            if asset_name.startswith("robocode-tankroyale-gui-") and asset_name.endswith(".jar"):
                url = asset["browser_download_url"]
                print_success(f"Found latest release: {release_data['tag_name']}")
                print_info(f"GUI JAR file: {asset_name}")
                return url, asset_name

        raise ValueError("No Tank Royale GUI JAR file found in the latest release.")

    except requests.exceptions.RequestException as e:
        print_error(f"Failed to fetch release information from GitHub: {e}")
        raise
    except ValueError as e:
        print_error(str(e))
        raise

def download_server_jar(url: str, dest: Path, original_filename: str) -> None:
    """Downloads the server JAR if it doesn't already exist."""
    if dest.exists():
        print_success(f"Server JAR already exists at: {dest}")
        return

    print_step(f"Downloading {original_filename}...")
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            total_size = int(r.headers.get('content-length', 0))
            with open(dest, "wb") as f:
                if total_size > 0:
                    # Show progress bar
                    chunk_size = 8192
                    num_bars = 25
                    for chunk in r.iter_content(chunk_size=chunk_size):
                        f.write(chunk)
                        downloaded = f.tell()
                        progress = (downloaded / total_size)
                        bar = '█' * int(progress * num_bars)
                        spaces = ' ' * (num_bars - len(bar))
                        sys.stdout.write(f"\r    [{bar}{spaces}] {progress:.1%}")
                        sys.stdout.flush()
                    sys.stdout.write("\n")
                else:
                    # Stream without progress if size is unknown
                    f.write(r.content)

        print_success(f"Downloaded server JAR to: {dest}")

    except requests.exceptions.RequestException as e:
        print_error(f"Failed to download JAR file: {e}")
        if dest.exists():
            os.remove(dest)  # Clean up partial download
        raise

def build_docker_image(work_dir: Path) -> None:
    """Builds the Docker image for the server."""
    print_step(f"Building Docker image: {DOCKER_IMAGE_NAME}...")
    try:
        dockerfile_path = work_dir / DOCKERFILE_DIR
        jar_source = work_dir / JAR_FILENAME
        jar_dest = dockerfile_path / JAR_FILENAME
        
        # Copy the JAR file into the docker directory for build context
        if jar_source.exists():
            import shutil
            shutil.copy2(jar_source, jar_dest)
            print_info(f"Copied JAR file to Docker build context: {jar_dest}")
        else:
            raise FileNotFoundError(f"JAR file not found: {jar_source}")
            
        run_command(["docker", "build", "-t", DOCKER_IMAGE_NAME, "."], cwd=dockerfile_path)
        print_success("Docker image built successfully.")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_error("Failed to build Docker image.")
        raise

def run_docker_container(work_dir: Path) -> None:
    """Runs the Docker container to start the server."""
    print_step("Starting Tank Royale server in Docker...")

    # Check if a container with the same name is already running
    container_name = DOCKER_IMAGE_NAME
    try:
        result = run_command(["docker", "ps", "-q", "-f", f"name={container_name}"], cwd=work_dir)
        if result.stdout.strip():
            print_warning(f"Container '{container_name}' is already running. Stopping and removing it.")
            run_command(["docker", "stop", container_name], cwd=work_dir)
            run_command(["docker", "rm", container_name], cwd=work_dir)

        # Check for exited containers with the same name
        result = run_command(["docker", "ps", "-aq", "-f", f"name={container_name}"], cwd=work_dir)
        if result.stdout.strip():
            print_warning(f"Removing exited container '{container_name}'.")
            run_command(["docker", "rm", container_name], cwd=work_dir)

    except (subprocess.CalledProcessError, FileNotFoundError):
        print_error("Failed to check for existing Docker containers. Please check your Docker installation.")
        raise

    try:
        # Determine the correct host based on the OS
        host = "host.docker.internal" if platform.system() != "Linux" else "172.17.0.1"

        cmd = [
            "docker", "run", "-d", "--name", container_name,
            "-p", f"127.0.0.1:{SERVER_PORT}:{SERVER_PORT}",
            "--add-host", f"{host}:host-gateway",
            DOCKER_IMAGE_NAME
        ]
        run_command(cmd, cwd=work_dir)
        print_success(f"Server container '{container_name}' started.")
        print_info(f"Forwarding port: 127.0.0.1:{SERVER_PORT} -> container:{SERVER_PORT}")

    except (subprocess.CalledProcessError, FileNotFoundError):
        print_error("Failed to start Docker container.")
        raise

def main():
    """Main execution flow."""
    # The script should be run from the `tank-royale-server` directory.
    work_dir = Path(__file__).parent.resolve()

    print(f"\n{Colors.BOLD}{Colors.GREEN}Tank Royale Server Runner{Colors.RESET}")
    print("-" * 40)

    try:
        # 1. Get the latest release URL
        release_url, original_filename = get_latest_release_url()

        # 2. Download the server JAR (rename it to the expected filename)
        jar_path = work_dir / JAR_FILENAME
        download_server_jar(release_url, jar_path, original_filename)

        # 3. Build the Docker image
        build_docker_image(work_dir)

        # 4. Run the Docker container
        run_docker_container(work_dir)

        print_success("Tank Royale server is now running!")
        print_info(f"Server is accessible at: http://localhost:{SERVER_PORT}")
        print_info("To stop the server, run: docker stop tank-royale-server")

    except Exception as e:
        print_error(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

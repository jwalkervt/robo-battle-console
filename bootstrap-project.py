#!/usr/bin/env python3
"""
bootstrap_tank_royale_gui.py
---------------------------------
Minimal bootstrapper for a browser-first Tank Royale GUI.

Usage:
    python bootstrap_tank_royale_gui.py --name my-gui
"""
import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

REPO_URL = "https://github.com/robocode-dev/tank-royale.git"
DEFAULT_GUI_NAME = "tank-royale-webgui"
CORE_NPM_DEPS = [
    # runtime
    "pixi.js",
    "zustand",
    "zod",
    # dev
    "--save-dev",
    "typescript",
    "@types/node",
    "quicktype"
]

def run(cmd: list[str], cwd: Path | None = None, check: bool = True) -> None:
    """Helper that prints and executes shell commands."""
    print(f"+ {' '.join(cmd)}")
    subprocess.run(cmd, cwd=cwd, check=check)


def create_next_app(project_dir: Path) -> None:
    run(["npx", "--yes", "create-next-app@latest", project_dir.name,
         "--typescript", "--eslint", "--tailwind", "false", "--src-dir", "true", "--app"],
        cwd=project_dir.parent)


def install_deps(project_dir: Path) -> None:
    run(["npm", "install"] + CORE_NPM_DEPS, cwd=project_dir)


def clone_repo(target_root: Path) -> Path:
    repo_path = target_root / "tank-royale"
    if repo_path.exists():
        print("Repo already cloned, skipping.")
        return repo_path
    run(["git", "clone", "--depth", "1", REPO_URL], cwd=target_root)
    return repo_path


def generate_types(schema_dir: Path, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for yaml_file in schema_dir.glob("*.yaml"):
        ts_file = out_dir / f"{yaml_file.stem}.ts"
        run([
            "npx", "quicktype",
            "--lang", "ts",
            "--src-lang", "schema",
            "--just-types",
            "--alphabetize-properties",
            "--out", str(ts_file),
            str(yaml_file)
        ])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--name", default=DEFAULT_GUI_NAME,
                        help="Folder (and package) name for the new GUI.")
    parser.add_argument("--generate-types", action="store_true",
                        help="Generate TypeScript models from the YAML schemas.")
    args = parser.parse_args()

    root = Path.cwd()
    gui_dir = root / args.name
    if gui_dir.exists():
        sys.exit(f"Directory {gui_dir} already exists — aborting.")

    # 1. Clone repo for easy schema access & local server.
    repo_dir = clone_repo(root)

    # 2. Scaffold Next.js app (creates folder).
    create_next_app(gui_dir)

    # 3. Install runtime + dev deps.
    install_deps(gui_dir)

    # 4. Optional: generate type-safe models from the schema YAMLs.
    if args.generate_types:
        schema_src = repo_dir / "schema" / "schemas"
        dest = gui_dir / "src" / "generated"
        print(f"Generating TS models from {schema_src} → {dest}")
        generate_types(schema_src, dest)

    # 5. Final tip.
    print("\n🎉  All set!  Next steps:")
    print(f"   cd {gui_dir}")
    print("   npm run dev   # start the GUI on http://localhost:3000")
    print("\nTo run the Tank Royale server locally (optional):")
    print(f"   cd {repo_dir}/runner && ./gradlew :server:run")

if __name__ == "__main__":
    main()


#!/usr/bin/env python3
"""
MP4 to WebM Converter
Converts an MP4 file to WebM format using ffmpeg.
"""

import sys
import os
import subprocess


def convert_mp4_to_webm(input_file, output_file=None):
    """
    Convert an MP4 file to WebM format.
    
    Args:
        input_file: Path to the input MP4 file
        output_file: Path to the output WebM file (optional)
    """
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: File '{input_file}' not found.")
        return None
    
    # Generate output filename if not provided
    if output_file is None:
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}.webm"
    
    # Ensure output file has .webm extension
    if not output_file.endswith('.webm'):
        output_file += '.webm'
    
    print(f"Converting: {input_file}")
    print(f"Output: {output_file}")
    
    # ffmpeg command for high-quality conversion
    command = [
        'ffmpeg',
        '-i', input_file,
        '-c:v', 'libvpx-vp9',  # VP9 video codec
        '-crf', '30',           # Quality (lower = better, 15-35 recommended)
        '-b:v', '0',            # Variable bitrate
        '-c:a', 'libopus',      # Opus audio codec
        '-b:a', '128k',         # Audio bitrate
        '-y',                   # Overwrite output file if exists
        output_file
    ]
    
    try:
        # Run ffmpeg
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"\n✓ Conversion complete: {output_file}")
        return output_file
    except subprocess.CalledProcessError as e:
        print(f"\n✗ Error during conversion: {e}")
        print(f"Error output: {e.stderr}")
        return None
    except FileNotFoundError:
        print("\n✗ Error: ffmpeg is not installed or not in PATH.")
        print("Install ffmpeg:")
        print("  Ubuntu/Debian: sudo apt install ffmpeg")
        print("  macOS: brew install ffmpeg")
        print("  Windows: https://ffmpeg.org/download.html")
        return None


def main():
    """Main function to handle command-line usage."""
    if len(sys.argv) < 2:
        print("Usage: python mp4_to_webm.py <input.mp4> [output.webm]")
        print("Example: python mp4_to_webm.py video.mp4")
        print("Example: python mp4_to_webm.py video.mp4 converted.webm")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    result = convert_mp4_to_webm(input_file, output_file)
    
    if not result:
        sys.exit(1)


if __name__ == "__main__":
    main()
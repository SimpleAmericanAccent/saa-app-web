# Python Scripts and Tools

This directory contains Python scripts and tools for various tasks.

## Audio Transcription Tool

The `scripts` directory contains a tool for downloading and transcribing audio files from public URLs using OpenAI's Whisper model.

### Features

- Download audio files from public URLs with progress bar
- Transcribe audio using OpenAI's Whisper model
- Save transcripts in both text and JSON formats
- Support for different model sizes (tiny, base, small, medium, large)

### Setup

1. Create a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

### Usage

1. Basic usage with the example script:

```python
from scripts.transcribe_audio import AudioTranscriber

# Initialize the transcriber with a specific model size
# Available sizes: tiny, base, small, medium, large
transcriber = AudioTranscriber(model_size="base")

# Example S3 URL
url = "https://saaclientaudio.s3.us-east-2.amazonaws.com/2025+03+18+sheila+nicholson.mp3"

# Download and transcribe
audio_path = transcriber.download_audio(url)
result = transcriber.transcribe_audio(audio_path)

# Print the transcript
print(result["text"])
```

2. Or run the example script directly:

```bash
python scripts/example.py
```

### Model Sizes

- **tiny**: Fastest, least accurate, ~1GB memory
- **base**: Fast, moderate accuracy, ~1GB memory
- **small**: Good balance, ~2GB memory
- **medium**: More accurate, ~5GB memory
- **large**: Most accurate, ~10GB memory

### Output Files

The transcription process generates two files in the `output` directory:

- `transcript.txt`: Simple text transcript
- `transcript_full.json`: Detailed JSON with timing information

## Directory Structure

- `scripts/` - Standalone Python scripts
  - `transcribe_audio.py` - Main transcription functionality
  - `example.py` - Example usage with Sheila Nicholson's audio
- `tools/` - Reusable Python tools and utilities
- `tests/` - Test files
- `data/` - Data files used by scripts
- `notebooks/` - Jupyter notebooks

## Usage

Add specific usage instructions for your Python scripts and tools here.

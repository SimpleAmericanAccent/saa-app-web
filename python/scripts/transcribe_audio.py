import requests
from pathlib import Path
import os
from tqdm import tqdm
import whisper  # Using OpenAI's Whisper for transcription

class AudioTranscriber:
    def __init__(self, model_size="base"):
        """Initialize with specified Whisper model size.
        Available sizes: tiny, base, small, medium, large"""
        print(f"Loading Whisper {model_size} model...")
        self.model = whisper.load_model(model_size)
    
    def download_audio(self, url: str, output_dir: str = "output") -> str:
        """Download audio file from URL with progress bar."""
        # Create output directory
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Get filename from URL or use default
        filename = os.path.basename(url.split('?')[0]) or "audio.mp3"
        local_path = os.path.join(output_dir, filename)
        
        print(f"Downloading audio from {url}...")
        response = requests.get(url, stream=True)
        total_size = int(response.headers.get('content-length', 0))
        
        # Download with progress bar
        with open(local_path, 'wb') as file, \
             tqdm(total=total_size, unit='B', unit_scale=True) as pbar:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    file.write(chunk)
                    pbar.update(len(chunk))
        
        return local_path
    
    def transcribe_audio(self, audio_path: str, output_dir: str = "output") -> dict:
        """Transcribe audio file and save results."""
        print(f"Transcribing {audio_path}...")
        
        # Transcribe the audio
        result = self.model.transcribe(audio_path)
        
        # Save the transcript
        transcript_path = os.path.join(output_dir, "transcript.txt")
        with open(transcript_path, 'w', encoding='utf-8') as f:
            f.write(result["text"])
        
        # Save the full result (includes segments, timing, etc.)
        import json
        full_result_path = os.path.join(output_dir, "transcript_full.json")
        with open(full_result_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"Transcript saved to: {transcript_path}")
        print(f"Full result saved to: {full_result_path}")
        
        return result

def main():
    # Initialize transcriber with desired model size
    transcriber = AudioTranscriber(model_size="base")
    
    # Replace with your public S3 URL
    url = "your-public-s3-url"
    
    # Download and transcribe
    audio_path = transcriber.download_audio(url)
    result = transcriber.transcribe_audio(audio_path)
    
    # Print the transcript
    print("\nTranscript:")
    print(result["text"])

if __name__ == "__main__":
    main() 
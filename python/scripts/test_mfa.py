import os
import subprocess
import shutil
import requests
from tqdm import tqdm
from transcribe_audio import AudioTranscriber

def run_mfa_command(command, error_msg="MFA command failed"):
    """Run an MFA command and handle its output."""
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"\nError: {error_msg}")
        print("Command output:")
        print(result.stdout)
        print("Error output:")
        print(result.stderr)
        return False
    return True

def format_transcript_for_mfa(text, filename):
    """Format transcript text for MFA consumption.
    
    Args:
        text: The transcript text
        filename: The base filename (without extension) that matches the audio file
                 in the corpus directory
    """
    # Clean up the text
    text = text.strip()
    # Ensure proper spacing
    text = ' '.join(text.split())
    # Format as: filename transcript
    return f"{filename} {text}"

def test_mfa():
    print("Testing Montreal Forced Aligner (MFA) setup...")
    
    try:
        # Check if MFA is installed and accessible
        print("\nChecking MFA installation...")
        if not run_mfa_command(["mfa", "version"], "Failed to get MFA version"):
            return False
        print("✓ MFA is installed and accessible")
        
        # Define directories and filenames
        base_dir = "output/test"
        corpus_dir = os.path.join(base_dir, "mfa_corpus")
        aligned_dir = os.path.join(base_dir, "mfa_aligned")
        
        # Create necessary directories
        os.makedirs(corpus_dir, exist_ok=True)
        os.makedirs(aligned_dir, exist_ok=True)
        
        # Define filenames
        s3_url = "https://saaclientaudio.s3.us-east-2.amazonaws.com/2025+03+18+sheila+nicholson.mp3"
        mfa_base_name = "sheila"  # Base name used in MFA (without extension)
        mfa_audio = f"{mfa_base_name}.mp3"  # Audio file in MFA corpus
        mfa_transcript = f"{mfa_base_name}.txt"  # Transcript file in MFA corpus
        
        # Check if files already exist
        target_audio = os.path.join(corpus_dir, mfa_audio)
        transcript_path = os.path.join(corpus_dir, mfa_transcript)
        
        # Check if audio file exists
        if os.path.exists(target_audio):
            print(f"\n✓ Audio file already exists at {target_audio}")
            file_size = os.path.getsize(target_audio)
            print(f"  File size: {file_size / 1024 / 1024:.2f} MB")
        else:
            # Initialize transcriber
            print("\nInitializing AudioTranscriber...")
            transcriber = AudioTranscriber(model_size="base")
            
            # Download the audio file from S3 using AudioTranscriber
            print(f"\nDownloading audio from S3: {s3_url}")
            try:
                # First try direct download to check file integrity
                print("Checking S3 file accessibility...")
                response = requests.head(s3_url)
                if response.status_code != 200:
                    print(f"Error: S3 file not accessible (HTTP {response.status_code})")
                    return False
                print("✓ S3 file is accessible")
                
                # Now download using AudioTranscriber
                downloaded_audio = transcriber.download_audio(s3_url, output_dir=corpus_dir)
                print(f"✓ Downloaded audio file to {downloaded_audio}")
                
                # Verify the downloaded file
                if not os.path.exists(downloaded_audio):
                    print(f"Error: Downloaded file not found at {downloaded_audio}")
                    return False
                
                file_size = os.path.getsize(downloaded_audio)
                print(f"✓ Downloaded file size: {file_size / 1024 / 1024:.2f} MB")
                
                # Rename the downloaded file to match our MFA naming convention
                if downloaded_audio != target_audio:
                    shutil.move(downloaded_audio, target_audio)
                    print(f"✓ Renamed audio file to {target_audio}")
                
                # Verify the final file
                if not os.path.exists(target_audio):
                    print(f"Error: Target file not found at {target_audio}")
                    return False
                print(f"✓ Final audio file verified at {target_audio}")
                
            except Exception as e:
                print(f"Error during audio download: {str(e)}")
                return False
        
        # Check if transcript file exists
        if os.path.exists(transcript_path):
            print(f"\n✓ Transcript file already exists at {transcript_path}")
            with open(transcript_path, "r", encoding='utf-8') as f:
                formatted_transcript = f.read().strip()
            print(f"  Using existing transcript: {formatted_transcript}")
        else:
            # Use AudioTranscriber to transcribe the audio
            print("\nTranscribing audio with Whisper...")
            try:
                transcriber = AudioTranscriber(model_size="base")
                result = transcriber.transcribe_audio(target_audio, output_dir=corpus_dir)
                transcript_text = result["text"].strip()
                print(f"✓ Whisper transcription: {transcript_text}")
            except Exception as e:
                print(f"Error transcribing audio: {str(e)}")
                print("Using a simple transcript instead...")
                transcript_text = "This is a test transcript for the Montreal Forced Aligner."
                print(f"Using transcript: {transcript_text}")
            
            # Create matching transcript file for MFA
            formatted_transcript = format_transcript_for_mfa(transcript_text, mfa_base_name)
            with open(transcript_path, "w", encoding='utf-8') as f:
                f.write(formatted_transcript)
            print("✓ Created MFA transcript file")
            print(f"  Using base name: {mfa_base_name}")
            print(f"  Transcript format: {formatted_transcript}")
        
        # Print diagnostic information for the transcript
        words = formatted_transcript.split()
        print(f"  Transcript length: {len(formatted_transcript)} characters")
        print(f"  Number of words: {len(words)}")
        print(f"  First few words: {' '.join(words[:5])}")
        
        # Run MFA validate with the correct command format
        print("\nRunning MFA validate...")
        # The correct format is: mfa validate CORPUS_DIRECTORY DICTIONARY_PATH
        if not run_mfa_command(
            ["mfa", "validate", corpus_dir, "english_us_mfa"],
            "MFA validate failed"
        ):
            return False
        print("✓ MFA validate completed")
        
        # Run MFA align with the correct command format
        print("\nRunning MFA align...")
        # The correct format is: mfa align CORPUS_DIRECTORY DICTIONARY_PATH ACOUSTIC_MODEL_PATH OUTPUT_DIRECTORY
        if not run_mfa_command(
            ["mfa", "align", corpus_dir, "english_us_mfa", "english_mfa", aligned_dir],
            "MFA align failed"
        ):
            return False
        print("✓ MFA align completed")
        
        # Check if alignment files were created
        alignment_file = os.path.join(aligned_dir, f"{mfa_base_name}.TextGrid")
        if os.path.exists(alignment_file):
            print("✓ Alignment file created successfully")
            print(f"  Alignment file: {alignment_file}")
            return True
        else:
            print("✗ Alignment file not found")
            return False
        
    except Exception as e:
        print(f"Error during MFA testing: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_mfa()
    if success:
        print("\nAll MFA tests passed! MFA is working correctly.")
    else:
        print("\nMFA tests failed. Please check the error messages above.")
        exit(1) 
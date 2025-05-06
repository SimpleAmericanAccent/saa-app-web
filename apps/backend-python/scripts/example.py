from transcribe_audio import AudioTranscriber

def main():
    # Initialize the transcriber with a specific model size
    # Available sizes: tiny, base, small, medium, large
    # - tiny/base: faster but less accurate
    # - medium/large: more accurate but slower and use more memory
    transcriber = AudioTranscriber(model_size="base")
    
    # S3 URL for Sheila Nicholson's audio
    url = "https://saaclientaudio.s3.us-east-2.amazonaws.com/2025+03+18+sheila+nicholson.mp3"
    
    try:
        # Download and transcribe the audio
        audio_path = transcriber.download_audio(url)
        result = transcriber.transcribe_audio(audio_path)
        
        # Print the transcript
        print("\nTranscript:")
        print(result["text"])
        
        # The script also saves:
        # 1. transcript.txt - Just the text
        # 2. transcript_full.json - Full result with timing information
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main() 
from transcribe_audio import AudioTranscriber
import os

def test_environment():
    print("Testing environment setup...")
    
    # Test URL - Using a different audio sample that should work
    test_url = "https://saaclientaudio.s3.us-east-2.amazonaws.com/2025+03+18+sheila+nicholson.mp3"
    
    try:
        # Initialize transcriber
        transcriber = AudioTranscriber(model_size="tiny")  # Using tiny model for quick test
        
        # Test download
        print("\nTesting audio download...")
        audio_path = transcriber.download_audio(test_url, output_dir="output/test")
        assert os.path.exists(audio_path), "Audio file not downloaded"
        print("✓ Download successful")
        
        # Test transcription
        print("\nTesting transcription...")
        result = transcriber.transcribe_audio(audio_path, output_dir="output/test")
        assert result["text"], "No transcription produced"
        print("✓ Transcription successful")
        
        print("\nTranscript preview:")
        print(result["text"][:100] + "...")
        
        print("\nAll tests passed! Environment is working correctly.")
        
    except Exception as e:
        print(f"Error during testing: {str(e)}")
        raise

if __name__ == "__main__":
    test_environment() 
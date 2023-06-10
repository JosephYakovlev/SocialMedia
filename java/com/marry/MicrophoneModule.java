package com.marry;

import android.Manifest;
import android.content.pm.PackageManager; 
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import android.media.AudioManager; 
import android.content.Context;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.media.AudioRecordingConfiguration;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import android.util.Log;
import java.util.List;
import java.util.HashMap;


public class MicrophoneModule extends ReactContextBaseJavaModule {
    private boolean isMicOn = false;
    private AudioRecord audioRecord;
    private Callback callback;
    private static final int RECORD_AUDIO_PERMISSION_REQUEST_CODE = 100;

    public MicrophoneModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "MicrophoneModule";
    }

    @ReactMethod
    // public void isMicrophoneOn(Callback callback) {
    //     this.callback = callback;

    //     Log.d("MicrophoneModule", "Microphone is on: -1");

    //     if (ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
    //         Log.d("MicrophoneModule", "Microphone permission not granted. Requesting permission...");

    //         if (getCurrentActivity() != null) {
    //             ActivityCompat.requestPermissions(getCurrentActivity(), new String[]{Manifest.permission.RECORD_AUDIO}, RECORD_AUDIO_PERMISSION_REQUEST_CODE);
    //         }

    //         sendMicStatus(false);
    //         return;
    //     }

    //     initializeAudioRecord();
    //     checkMicrophoneStatus();
    // }

    public void isMicrophoneOn(Callback callback) {
        Log.d("MicrophoneModule", "Microphone is on: -1");

        int audioSource = MediaRecorder.AudioSource.MIC;
        int sampleRateInHz = 44100;
        int channelConfig = android.media.AudioFormat.CHANNEL_IN_MONO;
        int audioFormat = android.media.AudioFormat.ENCODING_PCM_16BIT;
        int bufferSizeInBytes = AudioRecord.getMinBufferSize(sampleRateInHz, channelConfig, audioFormat);

        try {
            audioRecord = new AudioRecord(audioSource, sampleRateInHz, channelConfig, audioFormat, bufferSizeInBytes);
            audioRecord.startRecording();

            int state = audioRecord.getState();
            int recordingState = audioRecord.getRecordingState();
            Log.d("MicrophoneModule", "Microphone state: " + state);
            Log.d("MicrophoneModule", "Microphone recording state: " + recordingState);

            if (recordingState == 3) {
                Log.d("MicrophoneModule", "Microphone is on: FALSE");
                isMicOn = false;
            } else {
                Log.d("MicrophoneModule", "Microphone is on: TRUE");
                isMicOn = true;
            }
        } catch (Exception e) {
            e.printStackTrace();
            isMicOn = false;
        } finally {
            if (audioRecord != null) {
                audioRecord.release();
            }
        }

        Log.d("MicrophoneModule", "Microphone is on: " + isMicOn);
        callback.invoke(isMicOn);
    }

    private void sendMicStatus(boolean isMicOn) {
        if (callback != null) {
            callback.invoke(isMicOn);
            callback = null;
        }
    }

    private void initializeAudioRecord() {
        int audioSource = MediaRecorder.AudioSource.MIC;
        int sampleRateInHz = 44100;
        int channelConfig = android.media.AudioFormat.CHANNEL_IN_MONO;
        int audioFormat = android.media.AudioFormat.ENCODING_PCM_16BIT;
        int bufferSizeInBytes = AudioRecord.getMinBufferSize(sampleRateInHz, channelConfig, audioFormat);

        try {
            audioRecord = new AudioRecord(audioSource, sampleRateInHz, channelConfig, audioFormat, bufferSizeInBytes);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void checkMicrophoneStatus() {
        if (audioRecord == null) {
            Log.d("MicrophoneModule", "Failed to initialize AudioRecord.");
            sendMicStatus(false);
            return;
        }

        audioRecord.startRecording();

        int state = audioRecord.getState();
        int recordingState = audioRecord.getRecordingState();
        Log.d("MicrophoneModule", "Microphone state: " + state);
        Log.d("MicrophoneModule", "Microphone recording state: " + recordingState);

        if (recordingState == AudioRecord.RECORDSTATE_RECORDING) {
            Log.d("MicrophoneModule", "Microphone is on: TRUE");
            sendMicStatus(true);
        } else {
            Log.d("MicrophoneModule", "Microphone is on: FALSE");
            sendMicStatus(false);
        }

        audioRecord.stop();
        audioRecord.release();
    }

    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == RECORD_AUDIO_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d("MicrophoneModule", "Microphone permission granted.");
                initializeAudioRecord();
                checkMicrophoneStatus();
            } else {
                Log.d("MicrophoneModule", "Microphone permission denied.");
                sendMicStatus(false);
            }
        }
    }
}
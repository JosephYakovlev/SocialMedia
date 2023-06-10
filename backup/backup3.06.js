import React from 'react';
import {SafeAreaView,StyleSheet,Text,TouchableOpacity,View,PermissionsAndroid, NativeEventEmitter, NativeModules, Alert, } from 'react-native';
import Voice from '@react-native-voice/voice'
import RNFS from 'react-native-fs';
import {PorcupineManager} from '@picovoice/porcupine-react-native';
import Tts from 'react-native-tts'
import BackgroundJob from 'react-native-background-actions';
import RNFetchBlob from 'rn-fetch-blob';
import { startRecordingRedux, stopRecordingRedux, isRecordingRedux } from './redux/reduxHelper';
import { useSelector} from 'react-redux';

    const VoiceModule = NativeModules.VoiceModule;
    const eventEmitter = new NativeEventEmitter(VoiceModule);
    const ttsEventEmitter = new NativeEventEmitter()
    const { MicrophoneModule } = NativeModules
    const event2Emitter = new NativeEventEmitter(NativeModules.RCTDeviceEventEmitter);

    const AndroidParams = {
      KEY_PARAM_PAN: -1,
      KEY_PARAM_VOLUME: 0.9,
      KEY_PARAM_STREAM: 'STREAM_MUSIC',
    }


    
    const documentDir = RNFetchBlob.fs.dirs.DocumentDir
    const documentDir1 = RNFetchBlob.fs.asset('hello-marry_en_android_v2_2_0.ppn')
    const KEYWORD_FILE_NAME = 'Привет-Анна_ru_android_v2_2_0.ppn';
    const MODEL_FILE_NAME = 'porcupine_params_ru.pv';
    const filePath = `${documentDir}/${KEYWORD_FILE_NAME}`;
    const modelPath = `${documentDir}/${MODEL_FILE_NAME}`
    console.log(documentDir);
    console.log(documentDir1)
    console.log(modelPath);

    const assetFilePath = 'Привет-Анна_ru_android_v2_2_0.ppn';
    const destFilePath = `${RNFS.DocumentDirectoryPath}/${assetFilePath}`;

    const modelFilePath = 'porcupine_params_ru.pv';
    const destModelPath = `${RNFS.DocumentDirectoryPath}/${modelFilePath}`;

    RNFetchBlob.fs.exists(filePath)
    .then((exist) => {
        if(!exist) {
          RNFS.copyFileAssets(assetFilePath, destFilePath)
          .then(() => {
            console.log('File copied successfully.');
            // You can now use the copied file at destFilePath
          })
          .catch((error) => {
            console.log(`Error copying file: ${error}`);
          });
        }
        console.log(`file ${exist ? '' : 'not'} exists and not copied`)
    })
    .catch(() => { })

    RNFetchBlob.fs.exists(modelPath)
    .then((exist) => {
        if(!exist) {

          RNFS.copyFileAssets(modelFilePath, destModelPath)
          .then(() => {
            console.log('model copied successfully.');
            // You can now use the copied file at destFilePath
          })
          .catch((error) => {
            console.log(`Error copying model: ${error}`);
          });

        }
        console.log(`model ${exist ? '' : 'not'} exists and not copied`)
    })
    .catch(() => { })

    RNFetchBlob.fs.ls(documentDir)
    .then(files => console.log(`Files in directory: ${files}`))
    .catch(error => console.log(`Error: ${error}`));

    const requestMicrophonePermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message: 'App needs access to your microphone.',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Microphone permission granted.');
          // Выполняйте необходимые действия, когда разрешение предоставлено
          // ...
        } else {
          console.log('Microphone permission denied.');
          // Обработайте случай, когда разрешение не предоставлено
          // ...
        }
      } catch (error) {
        console.log('Error while requesting microphone permission:', error);
      }
    };

    requestMicrophonePermission()

  
    
    let detectionCallback = async (keywordIndex) => {
      
      await porcupineManager.stop()

      if (keywordIndex === 0) {
        event2Emitter.removeAllListeners('audioFocusChange')
        
        Tts.speak('Я вас слушаю!', { androidParams: AndroidParams})
    
        await porcupineManager.stop().then(()=>{
          console.log('Porcupine heard HELLO MARRY')
        })
      }
    };




    const processErrorCallback = (error) => {
      console.error(error);
    };


    let porcupineManager

    const initializePorcupine = async () => {
      porcupineManager =  await PorcupineManager.fromKeywordPaths(
        "Wh5HniwAuj+xkzozNeBu8Hg1jMaQSsXoo5hED1293v/eu9u7dKb9FA==",
        [filePath],
        detectionCallback,
        processErrorCallback,
        modelPath
      );


      const ttsStarter = ttsEventEmitter.addListener('tts-finish', (event) => {
        startRecording()
        console.log('Speech finished' + event);
      });


                              // О Б Р А Б О Т К А      У С Л Ы Ш А Н Н О Г О      Т Е К С Т А

      eventEmitter.addListener('onSpeechError', async (event) => {
        try {
          console.log('TRYEING TO START');
          await porcupineManager.start()
          console.log('Successful start')
        } catch (e) {
          console.log('Error', e);
        }
      })

      eventEmitter.addListener('onSpeechResults', async (event) => {
        if (event.value[0]==='отбой') {
          ttsEventEmitter.removeAllListeners('tts-finish')
          Voice.stop()
          Tts.speak('Перехожу в фоновый режим', { androidParams: AndroidParams})
          eventEmitter.addListener('tts-finish', (event) => {
            eventEmitter.removeAllListeners('tts-finish')
            eventEmitter.addListener('tts-finish', (event) => {
              startRecording()
              console.log('Speech finished' + event);
            })
          })
          try {
            console.log('TRYEING TO START');
            await porcupineManager.start().then(() =>console.log('Successful start'));
          } catch (e) {
            console.log('Error', e);
          }

        } else if (event.value[0]==='Какие мои задачи на сегодня') {
          Tts.speak('Ваши задачи на сегодня такие,такие и такие', { androidParams: AndroidParams })

        } else if (event.value[0]==='исчезни') {
          try {
            await porcupineManager.stop()
            ttsEventEmitter.removeAllListeners('tts-finish')
            stopRecordingRedux()
            await BackgroundJob.stop()
            Voice.stop()
            Tts.speak('исчезаю', { androidParams: AndroidParams })
          } catch (error) {
            Alert.alert('Ошибка исчезновения', error.message);
          }
    
        } else {
            Tts.speak(event.value[0], { androidParams: AndroidParams })
        }

      });


      console.log('Porcupine ANNA Listener Initialised')
      
      eventEmitter.addListener('tts-finish', (event) => {
          startRecording()
          console.log('Speech finished' + event);
      })

      console.log('TTS_FINISH_ANNA_LISTENER OK')

    }


    initializePorcupine();




    const startRecording = async () => {

        console.log('RN-Voice/Voice starting')
      
      await porcupineManager.stop()

      try {
        console.log('rus')
        await Voice.start('ru-RU').then(()=> console.log('Started Voice'))
        
      } catch (error) {
        console.log(error)
      }
    }


    const sleep = time => new Promise(resolve => setTimeout ( () => resolve() , time)) 

    const WakeWordTask = async taskData => {
      
      await porcupineManager.start()
      
      await new Promise( async resolve => {
        const {delay} = taskData
        console.log(BackgroundJob.isRunning(), delay)
        const subscription = event2Emitter.addListener('audioFocusChange', async (focusChange) => {
          console.log(typeof focusChange);
          console.log(focusChange);

          if (focusChange === 'AUDIOFOCUS_LOSS') {
            await porcupineManager.stop();
            console.log('hello marry Finished LOSS');
            const checkMicrophone = () => {
              console.log('CHECKING_MICROPHONE');
              MicrophoneModule.isMicrophoneOn(async (isMicOn) => {
                console.log(isMicOn)
                
                if (isMicOn) {
                    setTimeout(checkMicrophone, 10000);
                } else {
                    await porcupineManager.start().then(()=> 'started micro')
                }

              });
            };
              
            setTimeout(async () => {
              console.log('LoopingStartFunction');
              checkMicrophone();
            }, 10000);
          } 

          else if (focusChange === "AUDIOFOCUS_LOSS_TRANSIENT") {
            await porcupineManager.stop()
            console.log('hello marry Finished LOSS_TRANSIENT ')
          } 
            
          else if (focusChange === "AUDIOFOCUS_GAIN") {
            console.log('AUFIOFOCUS_GAIN Start')
          } 

          else if (focusChange === "AUDIOFOCUS_GAIN_TRANSIENT") {
                console.log('AUDIOFOCUS_GAIN_TRANSIENT')

          } else {
              await porcupineManager.start()
              console.log('hello marry start')
          }
        });

        await BackgroundJob.updateNotification({
            taskDesc: 'Помощник активирован',
            progressBar: 2,
          })
        for (let i=0; BackgroundJob.isRunning(); i++) {
         
          console.log('Runned ->', i);
  
          await sleep(delay)
        }
      })
    }


    const options = {
      taskName: 'Анна',
      taskTitle: 'Анна',
      taskDesc: 'Анна, голосовой менеджер',
      taskIcon: {
          name: 'ic_launcher',
          type: 'mipmap',
      },
      color: '#ff00ff',
      linkingURI: 'exampleScheme://chat/jane', // See Deep Linking for more info
      parameters: {
        delay: 1000,
      },
    };

    const runStartBackground = async () => {
      if (!BackgroundJob.isRunning()) {
        try {
          console.log('TRYING TO START');
          startRecordingRedux();
          const ttsStarter = eventEmitter.addListener('tts-finish', (event) => {
            startRecording();
            console.log('Speech finished' + event);
          });
          await BackgroundJob.start(WakeWordTask, options);
          console.log('Successful start');
        } catch (error) {
          console.log('Error', error);
        }
      } else {
        console.log('Stopping');
        try {
          await BackgroundJob.stop();
          console.log('Stop background service');
          await porcupineManager.stop();
          console.log('Stop recording');
          stopRecordingRedux();
        } catch (error) {
          console.log('Error', error);
        }
      }
    };


  function App() {


    const isRecording = useSelector((state) => state.recording.isRecording);
     
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.status}>
          <Text style={styles.statusText}>
            {isRecording ? 'Приложение работает' : 'Приложение неактивно '}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => runStartBackground()}
          style={{...styles.recordButton, backgroundColor: isRecording === true ? 'red' : 'green' }}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Остановить' : 'Начать'}
          </Text>
          <Text style={styles.recordButtonText}>
            запись
          </Text>
        </TouchableOpacity>

      </SafeAreaView>
    );
  }


const styles = StyleSheet.create({
  container: {
  flex: 1,
  },
  status: {
  alignSelf: 'center',
  marginTop: 110,
  },
  statusText: {
  fontSize: 20,
  color: 'black'
  },
  recordButton: {
  alignSelf: 'center',
  marginTop: 150,
  backgroundColor: 'lightgreen',
  height: 200,
  width: 200,
  borderRadius: 100,
  alignItems: 'center',
  justifyContent: 'center',
  },
  recordButtonText: {
  fontSize: 24,
  fontWeight: 'bold',
  color: 'white'
  },
  buttonRow: {
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'space-evenly',
  marginTop: 50,
  },
  button: {
  width: '40%',
  height: 40,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'lightblue',
  },
  buttonText: {
  fontSize: 16,
  },
  });

export default App;
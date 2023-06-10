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
import { createUserRecord, getAllUsers, deleteAllUsers, deleteUserRecord, updateUserRecord} from './RealmDB/Actions';

    const VoiceModule = NativeModules.VoiceModule;
    const eventEmitter = new NativeEventEmitter(VoiceModule);
    const ttsEventEmitter = new NativeEventEmitter()
    const { MicrophoneModule } = NativeModules
    const eventAudioFocusEmitter = new NativeEventEmitter(NativeModules.RCTDeviceEventEmitter);

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

    RNFS.copyFileAssets(assetFilePath, destFilePath)
    .then(() => {
      console.log('File copied successfully.');
      // You can now use the copied file at destFilePath
    })
    .catch((error) => {
      console.log(`Error copying file: ${error}`);
    });
  

  RNFS.copyFileAssets(modelFilePath, destModelPath)
    .then(() => {
      console.log('Model copied successfully.');
      // You can now use the copied file at destFilePath
    })
    .catch((error) => {
      console.log(`Error copying file: ${error}`);
    });
  

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
        eventAudioFocusEmitter.removeAllListeners('audioFocusChange')
        
        Tts.speak('Слушаю!', { androidParams: AndroidParams})
    
        await porcupineManager.stop().then(()=>{
          console.log('Porcupine heard HELLO MARRY')
        })
      }
    };

    const tasks = [
      { id: 1, description: 'Task 1' },
      { id: 2, description: 'Task 2' },
    ];
    



    const processErrorCallback = (error) => {
      console.error(error);
    };

    
              //  Инициализация picovoice porcupine слова активации, внутри функции активации 
              //  вызываются слушатели событий  tts-finish и onSpeechResults, и их выключатели
              //  в функциях обработки команд, позволяя перезагружать слушатели при каждом
              //  включении фонового процеса.


    let porcupineManager

    const initializePorcupine = async () => {
      porcupineManager =  await PorcupineManager.fromKeywordPaths(
        "wy8+gQYT6xyFB9ayvJzSUPZKn+ujbUlBC9VJKXMMURXBUv7XzgQlKg==",
        [filePath],
        detectionCallback,
        processErrorCallback,
        modelPath,
        [0.3]

      );
                  // О Б Р А Б О Т К А      У С Л Ы Ш А Н Н О Г О      Т Е К С Т А

      const ttsStarter = ttsEventEmitter.addListener('tts-finish', (event) => {
        startRecording()
        console.log('Speech finished' + event);
      });

      

      eventEmitter.addListener('onSpeechError', async (event) => {
        try {
          console.log('TRYEING TO START on ERROR');
         
          // eventEmitter.removeAllListeners('onSpeechError')
          // console.log('DD')

          await porcupineManager.start()
          
          console.log('Successful start')
        } catch (e) {
          console.log('Error', e);
        }
      })

      eventEmitter.addListener('onSpeechResults', async (event) => {
        console.log(event.value[0]);
        if (event.value[0]==='отбой') {
          ttsEventEmitter.removeAllListeners('tts-finish')
          Voice.stop()
          eventAudioFocusEmitter.removeAllListeners('audioFocusChange')
          eventAudioFocusEmitter.addListener('audioFocusChange', async (focusChange) => {
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
                      setTimeout(checkMicrophone, 5000);
                  } else {
                      await porcupineManager.start().then(()=> console.log('started micro'))
                  }
  
                });
              };
                
              setTimeout(async () => {
                console.log('LoopingStartFunction');
                checkMicrophone();
              }, 5000);
            } 
  
            else if (focusChange === "AUDIOFOCUS_LOSS_TRANSIENT") {
              await porcupineManager.stop()
              console.log('hello marry Finished LOSS_TRANSIENT ')
            } 
              
            else if (focusChange === "AUDIOFOCUS_GAIN") {
              await porcupineManager.start()
              console.log('AUFIOFOCUS_GAIN Start')
            } 
  
            else if (focusChange === "AUDIOFOCUS_GAIN_TRANSIENT") {
                await porcupineManager.start()
                  console.log('AUDIOFOCUS_GAIN_TRANSIENT')
  
            } else {
                await porcupineManager.start()
                console.log('hello marry start')
            }
          });

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

        } else if (['какие мои задачи на сегодня', 'какие задачи у меня', 'какие у меня задачи', 'какие мои задачи', 'какие задачи на сегодня','какие у меня задачи на сегодня','какие задачи на сегодня'].includes(event.value[0].toLowerCase())) {
          
          const users = getAllUsers();
          console.log(users);
          if (users.length === 0) {
            Tts.speak('У вас пока нет задач', { androidParams: AndroidParams })
          }
          const names = users.map((item, index) => 'задача номер' + (index+1) + ' ' + item.name).join(', ');
          Tts.speak(names, { androidParams: AndroidParams })

        } else if (['добавь задачу', 'запиши задачу'].some(str => event.value[0].toLowerCase().includes(str.toLowerCase()))) {

          createUserRecord(1, event.value[0].substring(13));
          Tts.speak('Добавила' + event.value[0].substring(13), { androidParams: AndroidParams })

        }
        else if (['удали задачу номер '].some(str => event.value[0].toLowerCase().includes(str.toLowerCase()))) {

          deleteUserRecord(event.value[0].substring(19));
          Tts.speak('Удалила' + event.value[0].substring(13), { androidParams: AndroidParams })

        }
        else if (['исправь задачу номер','исправь задачи номер'].some(str => event.value[0].toLowerCase().includes(str))) {
          if (['один',].some(str => event.value[0].substring(21,28).toLowerCase().includes(str))) { 
            updateUserRecord(0, event.value[0].substring(29));
            Tts.speak('Исправила задачу номер один на' + event.value[0].substring(29), { androidParams: AndroidParams })

          } else if (['два',].some(str => event.value[0].substring(21,28).toLowerCase().includes(str))) { 
            updateUserRecord(1, event.value[0].substring(28));
            Tts.speak('Исправила задачу номер два на' + event.value[0].substring(28), { androidParams: AndroidParams })

          } else if (['три',].some(str => event.value[0].substring(21,28).toLowerCase().includes(str))) { 
            updateUserRecord(2, event.value[0].substring(28));
            Tts.speak('Исправила задачу номер три на' + event.value[0].substring(28), { androidParams: AndroidParams })

          } else if (['четыре',].some(str => event.value[0].substring(21,28).toLowerCase().includes(str))) { 
            updateUserRecord(3, event.value[0].substring(31));
            Tts.speak('Исправила задачу номер четыре на' + event.value[0].substring(31), { androidParams: AndroidParams })

          } else if (['пять',].some(str => event.value[0].substring(21,28).toLowerCase().includes(str))) { 
            updateUserRecord(4, event.value[0].substring(29));
            Tts.speak('Исправила задачу номер пять на' + event.value[0].substring(29), { androidParams: AndroidParams })

          } else if (['шесть',].some(str => event.value[0].substring(21,28).toLowerCase().includes(str))) { 
            updateUserRecord(5, event.value[0].substring(30));
            Tts.speak('Исправила задачу номер шесть на' + event.value[0].substring(30), { androidParams: AndroidParams })

          } else if (['семь'].some(str => event.value[0].substring(21,28).toLowerCase().includes(str)) && !['восемь'].some(str => event.value[0].toLowerCase().includes(str))) {
            updateUserRecord(6, event.value[0].substring(29));
            Tts.speak('Исправила задачу номер семь на' + event.value[0].substring(29), { androidParams: AndroidParams })

          } else if (['восемь',].some(str => event.value[0].substring(21,28).toLowerCase().includes(str))) { 
            updateUserRecord(7, event.value[0].substring(31));
            Tts.speak('Исправила задачу номер восемь на' + event.value[0].substring(31), { androidParams: AndroidParams })

          } else if (['девять',].some(str => event.value[0].substring(21,28).toLowerCase().includes(str))) { 
            updateUserRecord(8, event.value[0].substring(31));
            Tts.speak('Исправила задачу номер девять на' + event.value[0].substring(31), { androidParams: AndroidParams })
          } else {
            updateUserRecord(+event.value[0].substring(21,23)-1, event.value[0].substring(27));
            Tts.speak('Исправила задачу номер '+event.value[0].substring(21,23)+'на' + event.value[0].substring(27), { androidParams: AndroidParams })
          }

        } 
        else if (['измени задачу номер','измени задачи номер','извини задачу номер','извини задачи номер'].some(str => event.value[0].toLowerCase().includes(str))) {
          if (['один',].some(str => event.value[0].substring(20,27).toLowerCase().includes(str))) { 
            updateUserRecord(0, event.value[0].substring(28));
            Tts.speak('Изменила задачу номер один на' + event.value[0].substring(28), { androidParams: AndroidParams })

          } else if (['два',].some(str => event.value[0].substring(20,27).toLowerCase().includes(str))) { 
            updateUserRecord(1, event.value[0].substring(27));
            Tts.speak('Изменила задачу номер два на' + event.value[0].substring(27), { androidParams: AndroidParams })

          } else if (['три',].some(str => event.value[0].substring(20,27).toLowerCase().includes(str))) { 
            updateUserRecord(2, event.value[0].substring(27));
            Tts.speak('Изменила задачу номер три на' + event.value[0].substring(27), { androidParams: AndroidParams })

          } else if (['четыре',].some(str => event.value[0].substring(20,27).toLowerCase().includes(str))) { 
            updateUserRecord(3, event.value[0].substring(30));
            Tts.speak('Изменила задачу номер четыре на' + event.value[0].substring(30), { androidParams: AndroidParams })

          } else if (['пять',].some(str => event.value[0].substring(20,27).toLowerCase().includes(str))) { 
            updateUserRecord(4, event.value[0].substring(28));
            Tts.speak('Изменила задачу номер пять на' + event.value[0].substring(28), { androidParams: AndroidParams })

          } else if (['шесть',].some(str => event.value[0].substring(20,27).toLowerCase().includes(str))) { 
            updateUserRecord(5, event.value[0].substring(29));
            Tts.speak('Изменила задачу номер шесть на' + event.value[0].substring(29), { androidParams: AndroidParams })

          } else if (['семь'].some(str => event.value[0].substring(20,27).toLowerCase().includes(str)) && !['восемь'].some(str => event.value[0].toLowerCase().includes(str))) {
            updateUserRecord(6, event.value[0].substring(28));
            Tts.speak('Изменила задачу номер семь на' + event.value[0].substring(28), { androidParams: AndroidParams })

          } else if (['восемь',].some(str => event.value[0].substring(20,27).toLowerCase().includes(str))) { 
            updateUserRecord(7, event.value[0].substring(30));
            Tts.speak('Изменила задачу номер восемь на' + event.value[0].substring(30), { androidParams: AndroidParams })

          } else if (['девять',].some(str => event.value[0].substring(20,27).toLowerCase().includes(str))) { 
            updateUserRecord(8, event.value[0].substring(30));
            Tts.speak('Изменила задачу номер девять на' + event.value[0].substring(30), { androidParams: AndroidParams })
          } else {
            updateUserRecord(+event.value[0].substring(20,22)-1, event.value[0].substring(26));
            Tts.speak('Изменила задачу номер '+event.value[0].substring(20,22)+'на' + event.value[0].substring(26), { androidParams: AndroidParams })
          }

        }
        else if (event.value[0]==='исчезни') {
          try {
            await porcupineManager.stop()
            ttsEventEmitter.removeAllListeners('tts-finish')
            eventEmitter.removeAllListeners('onSpeechError')
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

    // createUserRecord(2, 'John Dueo');
    // const users = getAllUsers();
    // console.log(users);


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



    const WakeWordTask = async taskData => {
      
      await porcupineManager.start()

      await new Promise( async resolve => {
        const {delay} = taskData
        console.log(BackgroundJob.isRunning(), delay)
        eventAudioFocusEmitter.removeAllListeners('audioFocusChange')
        const subscription = eventAudioFocusEmitter.addListener('audioFocusChange', async (focusChange) => {
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
                    setTimeout(checkMicrophone, 5000);
                } else {
                    await porcupineManager.start().then(()=> console.log('started micro'))
                }

              });
            };
              
            setTimeout(async () => {
              console.log('LoopingStartFunction');
              checkMicrophone();
            }, 5000);
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
        // for (let i=0; BackgroundJob.isRunning(); i++) {
         
        //   console.log('Runned ->', i);
  
        //   await sleep(delay)
        // }
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
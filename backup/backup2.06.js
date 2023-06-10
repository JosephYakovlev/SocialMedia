import React, {useState, useEffect} from 'react';
import {SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TouchableOpacity,AppRegistry,View,PermissionsAndroid, Platform , NativeEventEmitter, NativeModules, RCTNativeAppEventEmitter } from 'react-native';
import Voice from '@react-native-voice/voice'
import RNFS from 'react-native-fs';
import {PorcupineManager, BuiltInKeywords, Porcupine} from '@picovoice/porcupine-react-native';
import Tts from 'react-native-tts'
import BackgroundJob from 'react-native-background-actions';
import RNFetchBlob from 'rn-fetch-blob';
import { startRecordingRedux, stopRecordingRedux, isRecordingRedux } from './redux/reduxHelper';
import { useSelector, useDispatch } from 'react-redux';

const VoiceModule = NativeModules.VoiceModule;

const RCTVoiceProcessor = NativeModules.PvVoiceProcessor
const eventEmitter = new NativeEventEmitter(VoiceModule);
const ttsEventEmitter = new NativeEventEmitter()
const { MicrophoneModule } = NativeModules
  
const event2Emitter = new NativeEventEmitter(NativeModules.RCTDeviceEventEmitter);


console.log("gasgdagaf")
console.log(isRecordingRedux()); // Get the current recording state


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

 


  eventEmitter.addListener('audioRecordRequest', () => {
    console.log('Received audio record request');
    // Здесь вы можете выполнить нужные вам действия при получении запроса на запись аудио
  });

        // О Б Р А Б О Т К А       С Л О В А       А К Т И В А Ц И И 


  // let detectionCallback = async (keywordIndex) => {

  //   porcupineStopper()
  //   .then(() => {
  //   if (keywordIndex === 0) {
  //     event2Emitter.removeAllListeners('audioFocusChange');
  //     console.log('Porcupine heard HELLO MARRY');
  //     Tts.speak('Я вас слушаю!', {
  //       androidParams: {
  //         KEY_PARAM_PAN: -1,
  //         KEY_PARAM_VOLUME: 0.9,
  //         KEY_PARAM_STREAM: 'STREAM_MUSIC',
  //       },
  //     });
  
  //     const handleTtsFinish = (event) => {
  //       eventEmitter.removeAllListeners('tts-finish');
  //       eventEmitter.addListener('tts-finish', (event) => {
  //         startRecording();
  //         console.log('Speech finished' + event);
  //       });
  //     };
  
  //     timeoutId = setTimeout(async () => {

  //       const checkMicrophone = () => {
  //         console.log('CHECKING_MICROPHONE');
  //         MicrophoneModule.isMicrophoneOn(async (isMicOn) => {
  //           console.log(isMicOn)
  //           if (isMicOn) {
  //             // Microphone is on, execute your function here
  //             porcupineStopper()
  //             setTimeout(checkMicrophone, 10000);
  //           } else {
  //             // Microphone is off, schedule the next check after 10 seconds
  //             ttsEventEmitter.removeAllListeners('tts-finish');
  //             Voice.stop();
  //             Tts.speak('Перехожу в фоновый режим', {
  //               androidParams: {
  //                 KEY_PARAM_PAN: -1,
  //                 KEY_PARAM_VOLUME: 0.9,
  //                 KEY_PARAM_STREAM: 'STREAM_MUSIC',
  //               },
  //             });
        
  //             eventEmitter.addListener('tts-finish', handleTtsFinish);
        
  //             try {
  //               console.log('Переход в фоновый режим после ничего на старте');
  //               await porcupineManager.start();
  //               console.log('Успешный старт после ничего');
  //             } catch (e) {
  //               console.log('Error', e);
  //             }
              
  //           }
  //         });
  //       };
      
  //       setTimeout(async () => {
  //         console.log('LoopingStartFunction');
  //         checkMicrophone();
  //       }, 10000);
  //     }, 6000);
  //   }})
  // };



  let detectionCallback = async (keywordIndex) => {

    porcupineManager.stop()
    if (keywordIndex === 0) {
      event2Emitter.removeAllListeners('audioFocusChange')
      //  BackgroundJob.stop()
        Tts.speak('Я вас слушаю!', {
          androidParams: {
            KEY_PARAM_PAN: -1,
            KEY_PARAM_VOLUME: 0.9,
            KEY_PARAM_STREAM: 'STREAM_MUSIC',
          },
        }),
    
    
        await porcupineManager.stop().then(()=>{
          console.log('Porcupine heard HELLO MARRY')
        })
      
    }
  };


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

console.log('123123');
console.log('Andrey' < 'Vladislav');
console.log('Andrey' > 'Vladislav');

RNFS.copyFileAssets(modelFilePath, destModelPath)
  .then(() => {
    console.log('File copied successfully.');
    // You can now use the copied file at destFilePath
  })
  .catch((error) => {
    console.log(`Error copying file: ${error}`);
  });

RNFetchBlob.fs.exists(filePath)
.then((exist) => {
    console.log(`file ${exist ? '' : 'not'} exists`)
})
.catch(() => { })

RNFetchBlob.fs.exists(modelPath)
.then((exist) => {
    console.log(`model ${exist ? '' : 'not'} exists`)
})
.catch(() => { })

RNFetchBlob.fs.ls(documentDir)
.then(files => console.log(`Files in directory: ${files}`))
.catch(error => console.log(`Error: ${error}`));

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
        await porcupineManager.start().then(() =>console.log('Successful start'));
        
 
      } catch (e) {
        console.log('Error', e);
        
      }
  })

  


  eventEmitter.addListener('onSpeechResults', async (event) => {

    if (event.value[0]==='отбой') {
      ttsEventEmitter.removeAllListeners('tts-finish')
      // handleAudioFocusStarter()
      Voice.stop()
        Tts.speak('Перехожу в фоновый режим', {
        androidParams: {
          KEY_PARAM_PAN: -1,
          KEY_PARAM_VOLUME: 0.9,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
          
        }
      })

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

        Tts.speak('Ваши задачи на сегодня такие,такие и такие', {
        androidParams: {
          KEY_PARAM_PAN: -1,
          KEY_PARAM_VOLUME: 0.9,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
          
        }
      })

    } else if (event.value[0]==='исчезни') {


      ttsEventEmitter.removeAllListeners('tts-finish')
      porcupineManager.stop()
      stopRecordingRedux()
      BackgroundJob.stop()
      Voice.stop()
      Tts.speak('исчезаю', {
        androidParams: {
          KEY_PARAM_PAN: -1,
          KEY_PARAM_VOLUME: 0.9,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
          
        }
      })
      
    } else {
      Tts.speak(event.value[0], {
        androidParams: {
          KEY_PARAM_PAN: -1,
          KEY_PARAM_VOLUME: 0.9,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
          
        }
      })
    }

});






  // eventEmitter.addListener('onSpeechResults', async (event) => {
  //   clearTimeout(timeoutId);
  //   console.log('Speech Got');
  //   console.log(event.value[0]);
  
  //   let params = {
  //     KEY_PARAM_PAN: -1,
  //     KEY_PARAM_VOLUME: 0.9,
  //     KEY_PARAM_STREAM: 'STREAM_MUSIC'
  //   };
  
  //   const handleTtsFinish = (event) => {
  //     eventEmitter.removeAllListeners('tts-finish');
  //     eventEmitter.addListener('tts-finish', (event) => {
  //       startRecording();
  //       console.log('Speech finished' + event);
  //     });
  //   };
  
  //   if (event.value[0] === 'отбой') {
  //     ttsEventEmitter.removeAllListeners('tts-finish');
  //     Voice.stop();
  //     Tts.speak('Перехожу в фоновый режим', { androidParams: params });
  
  //     eventEmitter.addListener('tts-finish', handleTtsFinish);
  
  //     try {
  //       console.log('Переход в фоновый режим после Отбой');
  //       await porcupineManager.start();
  //       console.log('Старт после Отбой');
  //     } catch (e) {
  //       console.log('Error', e);
  //     }
  //   } else if (event.value[0] === 'Какие мои задачи на сегодня') {
  //     ttsEventEmitter.removeAllListeners('tts-finish');
  //     Tts.speak('Ваши задачи на сегодня такие, такие и такие', { androidParams: params });
  //     eventEmitter.addListener('tts-finish', (event) => {
  //       startRecording();
  //       console.log('Speech finished' + event);
  //     });
  //   } else if (event.value[0] === 'исчезни') {
  //     ttsEventEmitter.removeAllListeners('tts-finish');
  //     porcupineManager.stop();
  //     stopRecordingRedux();
  //     BackgroundJob.stop();
  //     Voice.stop();
  //     Tts.speak('исчезаю', { androidParams: params });
  //   } else {
  //     ttsEventEmitter.removeAllListeners('tts-finish');
  //     Tts.speak(event.value[0], { androidParams: params });
  //     eventEmitter.addListener('tts-finish', (event) => {
  //       startRecording();
  //       console.log('Speech finished' + event);
  //     });


  //     setTimeout(async () => {
  //       await Voice.stop()
  //     }, 7900);

  //     timeoutId = setTimeout(async () => {
  //       ttsEventEmitter.removeAllListeners('tts-finish');
  
  //       Tts.speak('Перехожу в фоновый режим', { androidParams: params });
        
  //       try {
  //         console.log('Переход в фоновый режим после ничего');
  //         await porcupineManager.start();
  //         console.log('Successful start');
  //       } catch (e) {
  //         console.log('Error', e);
  //       }
  //     }, 8000);
  //   }
  // });
  



  console.log('Porcupine Jarvis Listener Initialised')
  // BackgroundJob.start(WakeWordTask,options).then(() =>console.log('Successful start in initialize porcupine'))


  eventEmitter.addListener('tts-finish', (event) => {

    startRecording()
    console.log('Speech finished' + event);
    
  })
  console.log('POTKUPIL')


}
  const porcupineStarter = async () => await porcupineManager.start();
  const porcupineStopper = async () => await porcupineManager.stop();

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
      if (Platform.OS === 'ios') {
        console.warn('WARNED')
      } 

   
      console.log('Stated Tasking')
      console.log(RCTVoiceProcessor);


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
                    // Microphone is on, execute your function here
                    setTimeout(checkMicrophone, 10000);
                  } else {
                    // Microphone is off, schedule the next check after 10 seconds
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
           
              console.log('hello marry after AUFIOFOCUS_GAIN Start')

            } 

            else if (focusChange === "AUDIOFOCUS_GAIN_TRANSIENT") {
           
              console.log('hello marry false Start')

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

      
      
          if(!BackgroundJob.isRunning()) {
            try {
              console.log('TRYEING TO START');
              startRecordingRedux()
              const ttsStarter = eventEmitter.addListener('tts-finish', (event) => {
      
                startRecording()
                console.log('Speech finished' + event);
                
              });
              await BackgroundJob.start(WakeWordTask,options).then(() =>console.log('Successful start'));
              
            } catch (e) {
              console.log('Error', e);
              
            }
          } else {
            console.log('Stopping');
            
            await BackgroundJob.stop()
              porcupineManager.stop()
            .then(()=> console.log('Stop background service'), stopRecordingRedux())
          }
      
      
        }


        // AppRegistry.registerHeadlessTask('SomeTaskName', () => 
        //   console.log('12313888'),
        //   runStartBackground()
        // )

   

    const runStartBackgroundBootCompleted = async () => {

        try {
          console.log('TRYEING TO START 2222222');
          await BackgroundJob.start(WakeWordTask,options).then(() =>console.log('Successful start'));
          
        } catch (e) {
          console.log('Error', e);
          
        }
  
  
    }


function App() {
  const isRecording = useSelector((state) => state.recording.isRecording);
     
  const event2Emitter = new NativeEventEmitter(NativeModules.RCTDeviceEventEmitter);

  const [porcupineState, setPorcupineState] = useState('stopped');


  const { MicrophoneModule } = NativeModules
  console.log(MicrophoneModule);

  const checkMicrophone = () => {

    console.log('CHECKING_MICROPHONE');
    MicrophoneModule.isMicrophoneOn((isMicOn) => {
      console.log(isMicOn);
      
      return isMicOn
    });
  };
  
 checkMicrophone()
  

  const VoiceModule = NativeModules.VoiceModule;

  const eventEmitter = new NativeEventEmitter(VoiceModule);
  

//   eventEmitter.addListener('onSpeechStart', (event) => {
   
//     console.log('Speech Started');
    
// });



const handleButtonClick = () => {
  const ttsStarter = eventEmitter.addListener('tts-finish', (event) => {

    startRecording()
    console.log('Speech finished' + event);
    
  });
};

  return (
<SafeAreaView style={styles.container}>
<View style={styles.status}>
<Text style={styles.statusText}>
  {isRecording ? 'Приложение работает' : 'Приложение неактивно '}
</Text>
</View>



  <TouchableOpacity
    onPress={() =>
      runStartBackground()
    }
    style={{...styles.recordButton, backgroundColor: isRecording === true ? 'red' : 'green' }}>
    <Text style={styles.recordButtonText}>
      {isRecording ? 'Остановить' : 'Начать'}
    </Text>
    <Text style={styles.recordButtonText}>
      запись
    </Text>
  </TouchableOpacity>

  {/* <View style={styles.buttonRow}>
    <TouchableOpacity
      onPress={porcupineStarter}
      style={styles.button}>
      <Text style={styles.buttonText}>Start</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={porcupineStopper}
      style={styles.button}>
      <Text style={styles.buttonText}>Stop</Text>
    </TouchableOpacity>
  </View>

  <View style={styles.buttonRow}>
    <TouchableOpacity
       onPress={() => {
    runStartBackground();
  }}
      style={styles.button}>
      <Text style={styles.buttonText}>Start in Background</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={checkMicrophone}
      style={styles.button}>
      <Text style={styles.buttonText}>Stop in Background</Text>
    </TouchableOpacity>
  </View> */}
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
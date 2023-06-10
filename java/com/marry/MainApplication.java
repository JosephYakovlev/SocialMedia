package com.marry;

import android.os.Handler;
import android.os.HandlerThread;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.view.accessibility.AccessibilityManager;
import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.view.accessibility.AccessibilityEvent;
import android.media.AudioRouting;
import android.media.AudioManager;
import android.media.AudioRecord;
import android.app.Application;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.Context;
import android.content.BroadcastReceiver;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.util.Log;
import java.util.List;

import java.util.SortedMap;
import java.util.TreeMap;


public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          packages.add(new MyAppPackage());
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }


 

 public void onCreate() {
  super.onCreate();
  SoLoader.init(this, /* native exopackage */ false);


    // Получение экземпляра AudioManager
    AudioManager audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);


    // Регистрация слушателя аудиофокуса
   final AudioManager.OnAudioFocusChangeListener audioFocusChangeListener = new AudioManager.OnAudioFocusChangeListener() {


        
        @Override
        public void onAudioFocusChange(int focusChange) {
                ReactApplication application = (ReactApplication) getApplicationContext();
                ReactInstanceManager reactInstanceManager = application.getReactNativeHost().getReactInstanceManager();
                ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
                AudioManager audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
                AccessibilityManager accessibilityManager = (AccessibilityManager) getSystemService(Context.ACCESSIBILITY_SERVICE);
                List<AccessibilityServiceInfo> installedServices = accessibilityManager.getEnabledAccessibilityServiceList(AccessibilityEvent.TYPES_ALL_MASK);
                String runningPackage = null;

           for (AccessibilityServiceInfo serviceInfo : installedServices) {
            Log.d("MainApplication", "MainApplication accessibilityManager 2222" );
    if (serviceInfo.getResolveInfo().serviceInfo.packageName.equals(getPackageName())) {
        runningPackage = serviceInfo.getResolveInfo().serviceInfo.packageName;
        Log.d("MainApplication", "MainApplication accessibilityManager " + runningPackage);
        break;
    }
}

               Log.d("MainApplication", "MainApplication accessibilityManager " + accessibilityManager);
            Log.d("MainApplication", "MainApplication installedServices size: " + installedServices.size());
            Log.d("MainApplication", "MainApplication runningPackage: " + runningPackage);
            Log.d("MainApplication", "MainApplication AudioFocus " + focusChange);
        if (reactContext != null) {
            String event;

            switch (focusChange) {

               
              
                case AudioManager.AUDIOFOCUS_GAIN:
                    event = "AUDIOFOCUS_GAIN";
                    break;
                case AudioManager.AUDIOFOCUS_GAIN_TRANSIENT:
                    event = "AUDIOFOCUS_GAIN_TRANSIENT";
                    break;
                case AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE:
                    event = "AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE";
                    break; 
                case AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK:
                    event = "AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK";
                    break;
                case AudioManager.AUDIOFOCUS_LOSS:
                      event = "AUDIOFOCUS_LOSS";
                        Log.d("MainApplication", "AudioFocus Loss");

                        Handler handler = new Handler();

                            final AudioManager.OnAudioFocusChangeListener audioFocusChangeListenerHandler = this;

                            final Runnable checkAudioRunnable = new Runnable() {
                                @Override
                                public void run() {
                                    // Проверка, используется ли аудиофокус другими приложениями
                                    boolean isMusicActive = audioManager.isMusicActive();
                                    Log.d("MainApplication", "Is Music Active: " + isMusicActive);
                                     Log.d("MainApplication", "SLISHIM LI MI" + audioFocusChangeListenerHandler);


                                    // Использование результата проверки
                                    if (isMusicActive) {
                                        // Аудиофокус используется другими приложениями
                                        Log.d("MainApplication", "Music is active. Retry after 5 seconds.");
                                        // Перезапуск проверки через 10 секунд
                                        handler.postDelayed(this, 5000);
                                    } else {
                                        // Аудиофокус не используется другими приложениями
                                        Log.d("MainApplication", "Music is not active. Requesting audio focus.");
                                        // Запрос аудиофокуса
                                        int result = audioManager.requestAudioFocus(
                                            audioFocusChangeListenerHandler,
                                            AudioManager.STREAM_MUSIC,
                                            AudioManager.AUDIOFOCUS_GAIN
                                        );
                                        Log.d("MainApplication", "AudioFocus requested. Result: " + result);
                                    }
                                }
                            };

                        // Выполнение первой проверки через 5 секунд
                        Log.d("MainApplication", "Starting audio focus check in 5 seconds.");
                        handler.postDelayed(checkAudioRunnable, 5000);
                  
                    break;
                case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT:
                    event = "AUDIOFOCUS_LOSS_TRANSIENT";
                    break;
                case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK:
                    event = "AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK";
                    break;                                      
                default:
                    event = "UNKNOWN";
                    break;
            }

            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("audioFocusChange", event);
                // audioManager.abandonAudioFocus(this);
        }
        }
    };
    

        

    audioManager.requestAudioFocus(audioFocusChangeListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
     

 // Создание экземпляра слушателя маршрутизации аудио
        AudioRouting.OnRoutingChangedListener routingChangedListener = new AudioRouting.OnRoutingChangedListener() {
            @Override
            public void onRoutingChanged(AudioRouting router) {
                // Обработка изменений маршрутизации аудио

                // Эмит события на сторону React Native
                ReactApplication application = (ReactApplication) getApplicationContext();
                ReactInstanceManager reactInstanceManager = application.getReactNativeHost().getReactInstanceManager();
                ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

                if (reactContext != null) {
                    reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("routingChanged", null);
                }
            }
        };

    // audioManager.requestAudioFocus(audioFocusChangeListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);
    // audioManager.requestAudioFocus(audioFocusChangeListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK);

    // audioManager.requestAudioFocus(audioFocusChangeListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_LOSS);
    // audioManager.requestAudioFocus(audioFocusChangeListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_LOSS_TRANSIENT);
    // audioManager.requestAudioFocus(audioFocusChangeListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK);


//   // Получение экземпляра AudioManager
//     AudioManager audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
// Log.d("MainApplication", "Сообщение дл22я console.log()");
//     // Регистрация слушателя аудиофокуса
//     AudioManager.OnAudioFocusChangeListener audioFocusChangeListener = new AudioManager.OnAudioFocusChangeListener() {
//         @Override
//         public void onAudioFocusChange(int focusChange) {
//           Log.d("MainApplication", "Сообщение для console.log()");
//              ReactApplication application = (ReactApplication) getApplicationContext();
//         ReactInstanceManager reactInstanceManager = application.getReactNativeHost().getReactInstanceManager();
//         ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

//         if (reactContext != null) {
//             reactContext
//                 .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
//                 .emit("audioFocusChange", focusChange);
//         }
//         }
//     };
    

//     audioManager.requestAudioFocus(audioFocusChangeListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
    // Регистрация BroadcastReceiver для прослушивания изменений микрофона
    BroadcastReceiver microphoneBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            Log.d("MainApplication", "Сообщение для console.log()");
             ReactApplication application = (ReactApplication) getApplicationContext();
        ReactInstanceManager reactInstanceManager = application.getReactNativeHost().getReactInstanceManager();
        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

        if (reactContext != null) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("audioFocusChange2", intent);
        }
        }
    };
    IntentFilter intentFilter = new IntentFilter();
    // Добавьте нужные действия для прослушивания (например, AudioManager.ACTION_MICROPHONE_MUTE_CHANGED)
    registerReceiver(microphoneBroadcastReceiver, intentFilter);


  // Register the BootReceiver class to listen for BOOT_COMPLETED action
  IntentFilter filter = new IntentFilter(Intent.ACTION_BOOT_COMPLETED);
  filter.addCategory(Intent.CATEGORY_DEFAULT);
  BootReceiver bootReceiver = new BootReceiver();
  registerReceiver(bootReceiver, filter);

  if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
    // If you opted-in for the New Architecture, we load the native entry point for this app.
    DefaultNewArchitectureEntryPoint.load();
  }
  ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
}
  
 



}

package com.marry;

import android.content.BroadcastReceiver;
import android.content.Intent;
import android.content.Context;
import android.os.Bundle;


public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {

     
        if (intent.getAction().equals(Intent.ACTION_BOOT_COMPLETED)) {


            Intent serviceIntent = new Intent(context, MyTaskService.class);
            Bundle bundle = new Bundle();

            bundle.putString("foo", "bar");
            serviceIntent.putExtras(bundle);

            context.startService(serviceIntent);
            // context.startService(serviceIntent);
            // HeadlessJsTaskService.acquireWakeLockNow(context);
            // MainApplication application = (MainApplication) context.getApplicationContext();
            // ReactNativeHost reactNativeHost = application.getReactNativeHost();
            // ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();
            // ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

            // if (reactContext != null) {
            //     reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            //     .emit("myEvent", null); // Emit an event to trigger the function in JavaScript side
            // }
            // Data inputData = new Data.Builder()
            //     .putString("message", "Task has executed")
            //     .build();
            // OneTimeWorkRequest headlessJsTaskWorkRequest =
            //     new OneTimeWorkRequest.Builder(MyTaskWorker.class)
            //         .setInputData(inputData)
            //         .build();
            // WorkManager.getInstance(context).enqueue(headlessJsTaskWorkRequest);
        }
    }
}
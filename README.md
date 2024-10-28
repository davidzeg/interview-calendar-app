# Calendar App

React Native application created on Windows 11, using Android Studio and an android phone emulator, since I have an iPhone, but not a Mac nor an Android phone.

## Software Used

- Node.js v22.7.0
- React Native v0.76
- Android Studio Android Studio Ladybug | 2024.2.1 Patch 1
- JDK 17.0.12.7

### Minimum Requirements

- Android 24 or higher for running the APK

## Running the App

You have two options to run this app:

1. **Download the APK (Recommended)**

   - Go to the [Releases](../../releases) section of this repository
   - Download the latest APK file
   - Install it on your Android device (Android 24 or higher)
   - Allow installation from unknown sources if prompted

2. **Build it yourself**
   - Install all the software listed in "Software Used" section
   - Clone this repository
   - Run `npm install` or `yarn install`
   - Connect an Android device or start an emulator
   - Run `npx react-native run-android` for development build
   - Or follow [Release Build Instructions](https://reactnative.dev/docs/signed-apk-android) for creating your own APK

### Additional Notes

Due to time constraints, I could not implement the Google Calendar integration or the notifications system.

#### Planned Features

1. **Google Calendar Integration**

   Technical implementation overview:

   - Add OAuth 2.0 user authentication with google account
   - Use Google Calendar API
   - Implement webhooks to receive real-time updates from Google Calendar
   - Use Google Cloud Functions to handle webhook events and trigger appropriate notifications

2. **Notifications System**

   Technical implementation overview:

   - Use Firebase Cloud Messaging for handling push notifications

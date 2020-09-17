import React, { useState } from 'react';
import { Text, View, Image, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import { styles } from './style'
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';

export default function App() {

  const [isLoggedin, setLoggedinStatus] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isImageLoading, setImageLoadStatus] = useState(false);
  const [isFb, setIsFb] = useState(false);
  Facebook.setAutoInitEnabledAsync(true);
  Facebook.initializeAsync('2043479812451629', 'rn-auth');

  const facebookLogIn = async () => {
    try {
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions,
      } = await Facebook.logInWithReadPermissionsAsync('2043479812451629', {
        permissions: ['public_profile'],
      });
      if (type === 'success') {
        fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture.height(500)`)
          .then(response => response.json())
          .then(data => {
            setIsFb(true);
            setLoggedinStatus(true);
            setUserData(data);
          })
          .catch(e => console.log(e))
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }

  const signInWithGoogle = async () => {
    try {
      const result = await Google.logInAsync({
        behavior: 'web',
        iosClientId: '846656445879-kqmv8t74o8vaikuulc398ihlpj1iper5.apps.googleusercontent.com',
        androidClientId: '846656445879-rbv34n0bub82bf1qndj3f91nk6qqll5q.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      });
      if (result.type === 'success') {
        setLoggedinStatus(true);
        setUserData(result.user);
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      return { error: true };
    }
  }

  const logout = () => {
    setLoggedinStatus(false);
    setUserData(null);
    setIsFb(false);
    setImageLoadStatus(false);
  }

  return (
    isLoggedin ?
      userData ?
        <View style={styles.container}>
          <Image
            style={{ width: 200, height: 200 }}
            source={{ uri: isFb ? userData.picture.data.url : userData.photoUrl }}
            onLoadEnd={() => setImageLoadStatus(true)} />
          <ActivityIndicator size="large" color="#0000ff" animating={!isImageLoading} style={{ position: "absolute" }} />
          <Text style={{ fontSize: 22 }}>Wesh {userData.name} le sang</Text>
          <Text> mail : {userData.email}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={{ color: "#fff" }}>Logout</Text>
          </TouchableOpacity>
        </View> :
        null
      :
      <View style={styles.container}>
        <TouchableOpacity style={styles.loginBtn} onPress={facebookLogIn}>
          <Text style={{ color: "#fff" }}>Login with Facebook</Text>
        </TouchableOpacity>
        <Button onPress={() => signInWithGoogle()} title="Sign in with Google" />
      </View>
  );
}
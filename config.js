import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'

const firebaseConfig ={
  apiKey: "AIzaSyC062QuzUfhJBmgdu--k3AV9n3E022trdY",
  authDomain: "mobileapp-ee6f0.firebaseapp.com",
  projectId: "mobileapp-ee6f0",
  storageBucket: "mobileapp-ee6f0.appspot.com",
  messagingSenderId: "651295499573",
  appId: "1:651295499573:web:0bc3169f02aadbc3da587c",
  measurementId: "G-L33903J481"
}

if (!firebase.apps.length){
    firebase.initializeApp(firebaseConfig)
}

export {firebase};
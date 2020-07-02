import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/database";
import "firebase/auth";

const config = {
    apiKey: "AIzaSyA3SvUxoN7vXxSaWonI_SQzByTrQkMCBHo",
    authDomain: "meetupmaddie.firebaseapp.com",
    databaseURL: "https://meetupmaddie.firebaseio.com",
    projectId: "meetupmaddie",
    storageBucket: "meetupmaddie.appspot.com",
    messagingSenderId: "866748950106",
    appId: "1:866748950106:web:149026c14f1af319dbda63",
    measurementId: "G-HD91W5866L"
};

firebase.initializeApp(config);

let uid = null;

setUid = (userId) => {
    uid = userId;
}


export default firebase;

export function setUid;

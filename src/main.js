import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueTextareaAutosize from 'vue-textarea-autosize';
import firebase from 'firebase/app'
import 'firebase/firestore'

Vue.use(VueTextareaAutosize);

Vue.config.productionTip = false;

firebase.initializeApp({
  apiKey: "AIzaSyBbMsz7hprW_S05AkYzMM8NUAh-2YbfPLk",
  authDomain: "vue-calenda.firebaseapp.com",
  databaseURL: "https://vue-calenda.firebaseio.com",
  projectId: "vue-calenda",
  storageBucket: "vue-calenda.appspot.com",
  messagingSenderId: "45465338262",
  appId: "1:45465338262:web:52b9c606a9c9c7f89a5db7"
});

export const db = firebase.firestore();


new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app');

import React, { Component } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  KeyboardAvoidingView
} from "react-native";
import firebase from "firebase";

const bgImage = require("../assets/background1.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: ""
    };
  }

  handleLogin = (email, password) => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        this.props.navigation.navigate("BottomTab");
      })
      .catch(error => {
        Alert.alert(error.message);
      });
  };


render(){
return(
<KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ImageBackground source={bgImage} style={styles.bgImage}>
          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>

<TextInput 
placeholder="    Email"
style={styles.textinput}
value={this.state.email}
onChangeText={(text)=>{
 this.setState({
   email:text
 }) 
}}
/>
 
<TextInput 
placeholder="   Password"
style={styles.textinput}
value={this.state.password}
secureTextEntry={true}
onChangeText={(text)=>{
 this.setState({
   password:text
 }) 
}}
/>


<TouchableOpacity onPress={()=>{this.handleLogin(this.state.email,this.state.password)}} style={styles.button}>
<Text style={styles.buttonText}>LOGIN</Text>
</TouchableOpacity>

</View>
        </ImageBackground>
      </KeyboardAvoidingView>
)

}



}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },

  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  appIcon: {
    width: 280,
    height: 280,
    resizeMode: "contain",
    marginTop: 80
  },
  appName: {
    width: 130,
    height: 130,
    resizeMode: "contain"
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  textinput: {
    width: "75%",
    height: 55,
    padding: 10,
    borderColor: "#FFFFFF",
    borderWidth: 4,
    borderRadius: 10,
    fontSize: 18,
    color: "red",
    fontFamily: "Rajdhani_600SemiBold",
    backgroundColor: "lightgrey"
  },
  button: {
    width: "43%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F48D20",
    borderRadius: 15
  },
  buttonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontFamily: "Rajdhani_600SemiBold"
  }
});

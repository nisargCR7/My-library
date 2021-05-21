import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  ToastAndroid
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import firebase from "firebase";
import db from "../config";

const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class TransactionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookid: "",
      studentid: "",
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false,
      bookName: "",
      studentName: ""
    };
  }

  getCameraPermissions = async domState => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    const { domState } = this.state;

    if (domState === "bookid") {
      this.setState({
        bookid: data,
        domState: "normal",
        scanned: true
      });
    } else if (domState === "studentid") {
      this.setState({
        studentid: data,
        domState: "normal",
        scanned: true
      });
    }
  };

  handleTransaction = async () => {
    var { bookid, studentid } = this.state;
    await this.getBookDetails(bookid);
    await this.getStudentDetails(studentid);

    var transactionType = await this.checkBookAvailability(bookid);

    if (!transactionType) {
      this.setState({ bookid: "", studentid: "" });

      ToastAndroid.show("The book doesn't exist in the library database!",ToastAndroid.SHORT);
    } else if (transactionType === "issue") {
      var isEligible = await this.checkStudentEligibilityForBookIssue(
        studentid
      );

      if (isEligible) {
        var { bookName, studentName } = this.state;
        this.initiateBookIssue(bookid, studentid, bookName, studentName);
      }
      ToastAndroid.show("Book issued to the student!",ToastAndroid.SHORT);
    } else {
      var isEligible = await this.checkStudentEligibilityForBookReturn(
        bookid,
        studentid
      );

      if (isEligible) {
        var { bookName, studentName } = this.state;
        this.initiateBookReturn(bookid, studentid, bookName, studentName);
      }

      ToastAndroid.show("Book returned to the library!",ToastAndroid.SHORT);
    }
  };

  getBookDetails = bookid => {
    bookid = bookid.trim();
    db.collection("books")
      .where("bookid", "==", bookid)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            bookName: doc.data().details.bookname
          });
        });
      });
  };

  getStudentDetails = studentid => {
    studentid = studentid.trim();
    db.collection("students")
      .where("studentid", "==", studentid)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            studentName: doc.data().details.name
          });
        });
      });
  };

  checkBookAvailability = async bookid => {
    const bookRef = await db
      .collection("books")
      .where("bookid", "==", bookid)
      .get();

    var transactionType = "";
    if (bookRef.docs.length == 0) {
      transactionType = false;
    } else {
      bookRef.docs.map(doc => {
        //if the book is available then transaction type will be issue
        // otherwise it will be return
        transactionType = doc.data().availaibility ? "issue" : "return";
      });
    }

// ToastAndroid.show(transactionType,ToastAndroid.SHORT)
    return transactionType;
  };

  checkStudentEligibilityForBookIssue = async studentid => {
    const studentRef = await db
      .collection("students")
      .where("studentid", "==", studentid)
      .get();

    var isStudentEligible = "";
    if (studentRef.docs.length == 0) {
      this.setState({
        bookid: "",
        studentid: ""
      });
      isStudentEligible = false;
      ToastAndroid.show("The student id doesn't exist in the database!",ToastAndroid.SHORT);
    } else {
      studentRef.docs.map(doc => {
        if (doc.data().noofbooksissued < 2) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          ToastAndroid.show("The student has already issued 2 books!",ToastAndroid.SHORT);
          this.setState({
            bookid: "",
            studentid: ""
          });
        }
      });
    }
    return isStudentEligible;
  };

  checkStudentEligibilityForBookReturn = async (bookid, studentid) => {
    const transactionRef = await db
      .collection("transactions")
      .where("bookid", "==", bookid)
      .limit(1)
      .get();
    var isStudentEligible = "";
    transactionRef.docs.map(doc => {
      var lastBookTransaction = doc.data();
      if (lastBookTransaction.studentid === studentid) {
        isStudentEligible = true;
      } else {
        isStudentEligible = false;
        ToastAndroid.show("The book wasn't issued by this student!",ToastAndroid.SHORT);
        this.setState({
          bookid: "",
          studentid: ""
        });
      }
    });
    return isStudentEligible;
  };

  initiateBookIssue = async (bookid, studentid, bookName, studentName) => {
    //add a transaction
    db.collection("transactions").add({
      studentid: studentid,
      name: studentName,
      bookid: bookid,
      bookname: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "issue"
    });
    //change book status
    db.collection("books")
      .doc(bookid)
      .update({
        availaibility: false
      });
    //change number  of issued books for student
    db.collection("students")
      .doc(studentid)
      .update({
        noofbooksissued: firebase.firestore.FieldValue.increment(1)
      });

    // Updating local state
    this.setState({
      bookid: "",
      studentid: ""
    });
  };

  initiateBookReturn = async (bookid, studentid, bookName, studentName) => {
    //add a transaction
    db.collection("transactions").add({
      studentid: studentid,
      student_name: studentName,
      bookid: bookid,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "return"
    });
    //change book status
    db.collection("books")
      .doc(bookid)
      .update({
        availaibility: true
      });
    //change number  of issued books for student
    db.collection("students")
      .doc(studentid)
      .update({
        noofbooksissued: firebase.firestore.FieldValue.increment(-1)
      });

    // Updating local state
    this.setState({
      bookid: "",
      studentid: ""
    });
  };

  render() {
    const { bookid, studentid, domState, scanned } = this.state;
    if (domState !== "normal") {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ImageBackground source={bgImage} style={styles.bgImage}>
          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>
            <View style={styles.textinputContainer}>
              <TextInput
                style={styles.textinput}
                onChangeText={text => this.setState({ bookid: text })}
                placeholder={"Book Id"}
                placeholderTextColor={"#FFFFFF"}
                value={bookid}
              />
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("bookid")}
              >
                <Text style={styles.scanbuttonText}>Scan</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.textinputContainer, { marginTop: 25 }]}>
              <TextInput
                style={styles.textinput}
                onChangeText={text => this.setState({ studentid: text })}
                placeholder={"Student Id"}
                placeholderTextColor={"#FFFFFF"}
                value={studentid}
              />
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("studentid")}
              >
                <Text style={styles.scanbuttonText}>Scan</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, { marginTop: 25 }]}
              onPress={this.handleTransaction}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
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
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80
  },
  appName: {
    width: 80,
    height: 80,
    resizeMode: "contain"
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 24,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold"
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

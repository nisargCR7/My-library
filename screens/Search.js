import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
} from "react-native";
import * as firebase from "firebase";
import db from "../config";

export default class SearchScreen extends Component {
  constructor(){
    super();
    this.state={
    search:'',
    all_transactions:[],
    last_visible_transaction:null,
    }
  }
  
  searchTransaction=async(searchtext)=>{

var searchtext=searchtext.toUpperCase();
var first_alphebet=searchtext.split('')[0]

if(first_alphebet=='B'){
const transaction = await db.collection('transactions').where('bookid','==',searchtext).limit(3).get()
transaction.docs.map((doc)=>{
 this.setState({
   all_transactions:[...this.state.all_transactions,doc.data()],
   last_visible_transaction:doc
 }) 
})
}else if(first_alphebet=='R'){
  const transaction =await db.collection('transactions').where('studentid','==',searchtext).limit(3).get()
  transaction.docs.map((doc)=>{
   this.setState({
     all_transactions:[...this.state.all_transactions,doc.data()],
     last_visible_transaction:doc
   }) 
  })

}
console.log(this.state.last_visible_transaction.id)
console.log(this.state.all_transactions.length)
  }
  
fetchMore=async()=>{
 var searchtext=this.state.search.toUpperCase()
  var first_alphebet=searchtext.split('')[0]
  
  if(first_alphebet=='B'){
  const transaction = await db.collection('transactions').where('bookid','==',searchtext).startAfter(this.state.last_visible_transaction).limit(3).get()
  transaction.docs.map((doc)=>{
   this.setState({
     all_transactions:[...this.state.all_transactions,doc.data()],
     last_visible_transaction:doc
   }) 
  })
  }else if(first_alphebet=='R'){
    const transaction =await db.collection('transactions').where('studentid','==',searchtext).startAfter(this.state.last_visible_transaction).limit(3).get()
    transaction.docs.map((doc)=>{
     this.setState({
       all_transactions:[...this.state.all_transactions,doc.data()],
       last_visible_transaction:doc
     }) 
    })
  

}
}


  render() {
    return(
     <View>
      <TextInput 
      placeholder="    Search"
      style={{height:50,width:300,borderWidth:3}}
      onChangeText={(text)=>{
       this.setState({
         search:text
       }) 
      }}
      />
      
      
      <TouchableOpacity onPress={()=>{this.searchTransaction(this.state.search)}}> 
        <Text>Search</Text>
        
        </TouchableOpacity>
        <FlatList
        onEndReached={()=>{
          this.fetchMore()
        }}
        data={this.state.all_transactions}
        keyExtractor={(item,index)=>{
        index.toString
        }}
        renderItem={({item})=>(
         <View style={{borderBottomWidth:5}}>
  <Text>
   {'Book_id-'+item.bookid}
  </Text>
  <Text>
   {'Student_id-'+item.studentid}
  </Text>
  <Text>
   {'Book_Name-'+item.bookname}
  </Text>
  <Text>
   {'Time-'+item.date.toDate()}
  </Text>
  <Text>
   {'Student_Name-'+item.name}
  </Text>
  <Text>
   {'TransactionType-'+item.transaction_type}
  </Text>
         </View>
        )}

        />
    </View>
    )
    
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5653D4"
  },
  
});

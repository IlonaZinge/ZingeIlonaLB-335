import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Keyboard, ScrollView, TouchableWithoutFeedback, SafeAreaView, Image} from 'react-native';
import { firebase } from './config';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL} from 'firebase/storage';




export default function App() {
  let cameraRef = useRef();

  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [addData, setAddData] = useState('');
  const [addDetails, setAddDetails] = useState('');
  const [changeTitle, setChangeTitle] = useState('');
  const [todos, setTodos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const todoRef = firebase.firestore().collection('todos');
  const [photo, setPhoto] = useState();
  const [isCameraVisible, setIsCameraVisible] = useState(false);



  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === 'granted');
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');
    })();
  }, []);

  useEffect(() => {
    todoRef.onSnapshot(querySnapshot => {
      const todos = [];
      querySnapshot.forEach((doc) => {
        const { heading, details, category, status } = doc.data();
        todos.push({ id: doc.id, heading, details, category, status });
      });
      setTodos(todos);
    });
  }, []);

  if (hasCameraPermission === undefined){
    return <Text>Requesting permissions...</Text>
  }else if (!hasCameraPermission) {
    return <text>Permission for camera not granted. Please change this in settings.</text>
  }

  const handleAddTodo = () => {
    if(addData && addData.length > 0){
      const data = {
        heading: addData,
        details: '',
        category: '',
        status: 'Todo',
      };

      todoRef
        .add(data)
        .then(() => {
          setAddData('');
          Keyboard.dismiss();
        });
    }
  }
  
  const handleTextPress = (todo) => {
    setSelectedTodo(todo);
    setChangeTitle(todo.heading);
    setAddDetails(todo.details);
    setModalVisible(true); 
  };

  const handleDetailsClosed = () => {
    setModalVisible(false);
    setSelectedTodo(null); 
  };

  const handleChangeTitle = () => {
    if(changeTitle && changeTitle.length > 0 ){
      todoRef
        .doc(selectedTodo.id)
        .update({
          heading: changeTitle,
        })
        .then(() => {
          setChangeTitle('');
          Keyboard.dismiss();
        });
    }
  }

  const handleAddDetails = () => {
    if(addDetails && addDetails.length > 0 ){
      todoRef
        .doc(selectedTodo.id)
        .update({
          details: addDetails,
        })
        .then(() => {
          setAddDetails('');
          Keyboard.dismiss();
        });
    }
  }
  const handleSchool = () => {
    if (selectedTodo && selectedTodo.id && selectedTodo.category != 'School') {
      todoRef
        .doc(selectedTodo.id)
        .update({ category: 'School' }) 
        .then(() => {
          console.log("Category updated to School");
        })
    }else if (selectedTodo && selectedTodo.id && selectedTodo.category === 'School'){
      todoRef
      .doc(selectedTodo.id)
      .update({ category: '' }) 
      .then(() => {
        console.log("Category updated to None");
      })
    }
  };

  const handleWork = () => {
    if(selectedTodo && selectedTodo.id && selectedTodo.category != 'Work' ){
      todoRef
        .doc(selectedTodo.id)
        .update({ category: 'Work' }) 
    }else if (selectedTodo && selectedTodo.id && selectedTodo.category === 'Work'){
      todoRef
      .doc(selectedTodo.id)
      .update({ category: '' }) 
    }
  }

  const handleMisc = () => {
    if(selectedTodo && selectedTodo.id && selectedTodo.category != 'Misc' ){
      todoRef
        .doc(selectedTodo.id)
        .update({ category: 'Misc' }) 
    }else if (selectedTodo && selectedTodo.id && selectedTodo.category === 'Misc'){
      todoRef
      .doc(selectedTodo.id)
      .update({ category: '' }) 
    }
  }

  const handleChore = () => {
    if(selectedTodo && selectedTodo.id && selectedTodo.category != 'Chore'){
      todoRef
        .doc(selectedTodo.id)
        .update({ category: 'Chore' }) 
    }else if (selectedTodo && selectedTodo.id && selectedTodo.category === 'Chore'){
      todoRef
      .doc(selectedTodo.id)
      .update({ category: '' }) 
    }
  }

  const handleDone = () => {
    setModalVisible(false);
    if(selectedTodo && selectedTodo.id && selectedTodo.status != 'Done' ){
      alert("🎉 You go girl! You did it! 🥳")
      todoRef
        .doc(selectedTodo.id)
        .update({ status: 'Done' }) 
    }else if (selectedTodo && selectedTodo.id && selectedTodo.status === 'Done'){
      todoRef
      .doc(selectedTodo.id)
      .update({ status: 'Todo' }) 
    }
  }

  const getColorForCategory = (category) => {
    switch (category) {
      case 'School':
        return '#CDF0EA'; 
      case 'Work':
        return '#FFDDAA'; 
      case 'Misc':
        return '#DFCCFB'; 
      case 'Chore':
        return '#A0E9FF'; 
      default:
        return 'pink'; 
    }
  };

  const checkStatus = (status) => {
    if (status === 'Done'){
      return { textDecorationLine: 'line-through' };
    }
    else if (status === 'Todo'){
      return { textDecorationLine: 'none' };
    }
  };


  const handleDeleteToDo = () => {
    if (selectedTodo && selectedTodo.id)
    todoRef
      .doc(selectedTodo.id)
      .delete()
      .then(() => {
        alert("Your To-Do has been deleted.")
        setModalVisible(false);
        selectedTodo(null);
      })
  }

  let handlePhoto = () => {
    setIsCameraVisible(true);
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 0.5, base64: true };
        const photo = await cameraRef.current.takePictureAsync(options);
        setPhoto(photo);
        setIsCameraVisible(false);
      } catch (error) {
        console.error("Error taking picture: ", error);
      }
    } else {
      console.log("Camera ref not set");
    }
  };
  

  if (photo) {

    let savePhoto = () =>{
      MediaLibrary.saveToLibraryAsync(photo.uri).then(()=>{
        setPhoto(undefined);
      });
    };

    return(
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{uri: "data:image/jpg;base64," + photo.base64}}/>
        {hasMediaLibraryPermission ? <Button title="Save" onPress={savePhoto} /> :undefined}
        <Button title="Discard" onPress={()=> setPhoto(undefined)} />
      </SafeAreaView>
    );
  }
  

  return (
    <View style={styles.container}>
        <Text style={styles.title}>My To-Do List</Text>

      <TextInput
        placeholder="Enter a to-do"
        value={addData}
        onChangeText={(heading) => setAddData(heading)}
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Add"
          onPress={handleAddTodo}
          style={styles.addButton}
          color= 'pink'
        />
      </View>

      <View style={styles.list}>
          {todos.map((todo, index) => (
            <View key={index} style={styles.ListContainer}>
              <TouchableOpacity onPress={() => handleTextPress(todo)}>
              <Text style={[styles.ListText, {color: getColorForCategory(todo.category)}, checkStatus(todo.status)]}>
                ~ {todo.heading}</Text>
              </TouchableOpacity>
            </View>
        ))}
      </View>
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
      >
        <KeyboardAvoidingView style={styles.detailContainer}>

          <Text style={styles.detailsTitle}>To-Do Details</Text>

          <TextInput
            placeholder="Enter a new title"
            value={changeTitle}
            onChangeText={(text) => setChangeTitle(text)}
            style={styles.inputtitle}
          />

          <TextInput
            placeholder="Enter details"
            value={addDetails}
            onChangeText={(details) => setAddDetails(details)}
            style={styles.inputdetails}
            multiline={true}
          />


          <View style={styles.photoContainer}>
            {isCameraVisible ? (
              <View style={styles.cameraContainer}>
                <Camera style={styles.cameraStyle} ref={cameraRef} />
                <Button title="Take Photo" color='pink' onPress={takePicture} />
                <Button title="Close Camera" color='pink'onPress={() => setIsCameraVisible(false)} />
              </View>
            ) : (
              <View style={styles.PbuttonContainer}>
                <Button title="Add Photo" color='pink' onPress={handlePhoto} />
              </View>
            )}
          </View>

          <View style={styles.catergoryContainer}>
            <View style={styles.SchoolContainer}>
              <Button 
                title="School" 
                style={styles.addButton}
                onPress= {handleSchool}
                color= 'gray'
              />
            </View>
            <View style={styles.WorkContainer}>
              <Button 
                title="Work" 
                style={styles.addButton} 
                onPress={handleWork}
                color= 'gray'
              />
            </View>
          </View>

          <View style={styles.catergoryContainer}>
            <View style={styles.choreContainer}>
              <Button 
                title="Chore" 
                style={styles.addButton}
                onPress={handleChore}
                color= 'gray'
              />
            </View>
            <View style={styles.miscContainer}>
              <Button 
                title="Misc" 
                style={styles.addButton} 
                onPress={handleMisc}
                color= 'gray'
              />
            </View>
          </View>

          <View style={styles.restContainer}>
            <View style={styles.checkContainer}>
              <Button 
                title="✔" 
                style={styles.addButton}
                onPress={handleDone}
                color= 'gray'
              />
            </View>
            <View style={styles.delContainer}>
              <Button 
                title="✘" 
                style={styles.addButton} 
                color= 'gray'
                onPress= {handleDeleteToDo}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button 
              title="Save" 
              onPress={() => {
                handleDetailsClosed();
                handleChangeTitle();
                handleAddDetails();
              }}
              style={styles.addButton} 
              color= 'pink'
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20, 
    color: "pink",
    textDecorationLine: 'underline',
    textDecorationStyle:'dotted'
  },
  input: {
    borderColor: 'pink', 
    borderWidth: 1, 
    borderRadius: 30, 
    paddingHorizontal: 10, 
    color: 'gray',
    fontSize: 20,
    height: 40,
    width: '32%'
  },
  buttonContainer: {
    borderColor: 'pink', 
    borderWidth: 1, 
    borderRadius: 10, 
    paddingHorizontal: 10, 
    marginTop: 10
  },
  PbuttonContainer:{
    marginTop: 5
  },
  addButton: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  ListContainer:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  ListText:{
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5, 
  },
  detailContainer:{
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  detailsTitle:{
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40, 
    marginBottom: 20, 
    color: "pink",
    textDecorationLine: 'underline',
    textDecorationStyle:'dotted'
  },
  backButton:{
    fontWeight: 'bold',
    fontSize: 18,
  },
  inputtitle: {
    borderColor: 'pink', 
    borderWidth: 1, 
    borderRadius: 30, 
    paddingHorizontal: 10, 
    color: 'gray',
    fontSize: 20,
    height: 40,
    width: '80%',
  },
  inputdetails: {
    borderColor: 'pink', 
    borderWidth: 1, 
    borderRadius: 20, 
    paddingHorizontal: 10, 
    paddingVertical: 100,
    color: 'gray',
    fontSize: 20,
    height: 200,
    width: '80%',
    marginTop: 10,
  },
  catergoryContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '80%',
    marginTop: 10
  },
  WorkContainer:{
    borderColor: 'pink', 
    borderWidth: 2, 
    borderRadius: 10, 
    paddingHorizontal: 10, 
    marginTop: 10,
    backgroundColor: '#FFDDAA',
    width: '40%'
  },
  SchoolContainer:{
    backgroundColor: '#CDF0EA',
    borderColor: 'pink', 
    borderWidth: 2, 
    borderRadius: 10, 
    paddingHorizontal: 10, 
    marginTop: 10,
    width: '40%'
  },

  choreContainer:{
    borderColor: 'pink', 
    borderWidth: 2, 
    borderRadius: 10, 
    paddingHorizontal: 10, 
    marginTop: 10,
    backgroundColor: '#A0E9FF',
    width: '40%'
  },
  miscContainer:{
    backgroundColor: '#DFCCFB',
    borderColor: 'pink', 
    borderWidth: 2, 
    borderRadius: 10, 
    paddingHorizontal: 10, 
    marginTop: 10,
    width: '40%'
  },
  restContainer:{
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '40%',
    marginTop: 10
  },
  checkContainer:{
    borderColor: 'gray', 
    borderWidth: 2, 
    borderRadius: 100, 
    paddingHorizontal: 10, 
    marginTop: 10,
    backgroundColor: '#B9F3E4',
  },
  delContainer:{
    borderColor: 'gray', 
    borderWidth: 2, 
    borderRadius: 100, 
    paddingHorizontal: 10, 
    marginTop: 10,
    backgroundColor: '#FFAACF',
  },
  photoContainer:{
    borderColor: 'pink', 
    borderWidth: 1, 
    borderRadius: 20, 
    color: 'gray',
    height: 300,
    width: '80%',
    marginTop: 10,
  },
  imageStyle: {
    width: 200,  
    height: 200, 
    borderRadius: 10, 
  },
  cameraStyle: {
    width: '100%', 
    height:'75%',
    borderRadius: 20,    
  },
});

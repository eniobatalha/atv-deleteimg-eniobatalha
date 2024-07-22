import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, uploadBytes, deleteObject, list } from "firebase/storage";

const ImagePickerExample = () => {
  const [imageUri, setImageUri] = useState("https://previews.123rf.com/images/mironovak/mironovak1508/mironovak150800047/44239635-textura-de-tela-branca-ou-textura-de-padr%C3%A3o-de-grade-de-linho.jpg");
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [visible, setVisible] = useState(false);

  const firebaseConfig = {
    apiKey: "AIzaSyD6HE0AiWGfH5GZWi8DYI7b19LNxbOM83w",
    authDomain: "atv-upload.firebaseapp.com",
    projectId: "atv-upload",
    storageBucket: "atv-upload.appspot.com",
    messagingSenderId: "401034745075",
    appId: "1:401034745075:web:fce41998a8e59d98099386",
    measurementId: "G-6GKH4GXGZM"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  //Armazena a imagem para o upload e exibe a imagem
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
      console.log(result.assets);
    }
  };

  function getRandom(max) {
    return Math.floor(Math.random() * max + 1)
  }

  //Método para realizar upload para o Firebase
  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('Selecione uma imagem antes de enviar.');
      return;
    }

    setUploading(true);

    // Create a root reference
    const storage = getStorage();

    var name = getRandom(200);
    // Create a reference to 'mountains.jpg'
    const mountainsRef = ref(storage, name + '.jpg');

    const response = await fetch(imageUri);
    const blob = await response.blob();

    uploadBytes(mountainsRef, blob).then((snapshot) => {
      console.log(snapshot);

      // Adicionar a nova imagem à lista de imagens
      const newImageLink = `https://firebasestorage.googleapis.com/v0/b/${snapshot.metadata.bucket}/o/${snapshot.metadata.fullPath}?alt=media`;
      setImages((prevImages) => [...prevImages, newImageLink]);

      alert('Imagem enviada com sucesso!!');
    }).finally(() => {
      setUploading(false);
    });
  };

  //Listar no console as imagens salvas no storage
  async function LinkImage() {
    // Create a reference under which you want to list
    const storage = getStorage();
    const listRef = ref(storage);

    // Fetch the first page of 100.
    const firstPage = await list(listRef, { maxResults: 100 });
    var lista = [];
    firstPage.items.map((item) => {
      var link = ('https://firebasestorage.googleapis.com/v0/b/' +
        item.bucket + '/o/' + item.fullPath + '?alt=media');
      lista.push(link);
    })
    setImages(lista);
    setVisible(true);
    console.log(images);
  }

  const deleteItem = async (img) => {
    try {
      const storage = getStorage();
      const imageRef = ref(storage, img);
      await deleteObject(imageRef);

      // Atualizar a lista de imagens após a exclusão
      setImages((prevImages) => prevImages.filter((image) => image !== img));

    } catch (erro) {
      alert('Erro!!');
    } finally {
      alert('Operação de deleção realizada!!');
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 30 }}>
      <Button title="Escolher Imagem" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginVertical: 20 }} />}
      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={{ marginBottom: 10 }}>
          <Button title="Enviar Imagem" onPress={uploadImage} disabled={!imageUri} />
        </View>
      )}
      <View style={{ marginBottom: 30 }}>
        <Button title="Ver Imagens" onPress={LinkImage} />
      </View>
      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ display: 'flex', flexDirection: 'row', gap: 20, marginBottom: 20, alignItems: 'center' }}>
            <Image source={{ uri: item }} style={{ width: 100, height: 100 }} />
            <Button title="Deletar" onPress={() => deleteItem(item)} />
          </View>
        )}
      />
    </View>
  );
};

export default ImagePickerExample;

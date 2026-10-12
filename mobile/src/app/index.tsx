import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#efd2c7",
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          color: "#AD4E4F",
          marginBottom: 30,
        }}
      >
        POLET PLUS
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/login")}
        style={{
          backgroundColor: "#AD4E4F",
          paddingVertical: 14,
          paddingHorizontal: 30,
          borderRadius: 10,
          marginBottom: 15,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Iniciar sesión
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/registro")}
        style={{
          borderWidth: 1,
          borderColor: "#AD4E4F",
          paddingVertical: 14,
          paddingHorizontal: 30,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#AD4E4F", fontWeight: "bold" }}>
          Registrarse
        </Text>
      </TouchableOpacity>
    </View>
  );
}
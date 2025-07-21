import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1, // el contenedor ocupa toda la pantalla
    justifyContent: "flex-start",
    alignItems: "center",
  },
  Maintitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 15,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: -15,
  },
  line: {
    height: 2.5,
    backgroundColor: "#000",
    width: "90%",
    marginVertical: 12,
    marginBottom: 10,
  },
});

//COMPONENTE DE CITAS
export const cardCitas = StyleSheet.create({
  scrollContent: {
    padding: 16,
    alignItems: "center",
    minWidth: "100%",
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 5,
    width: "95%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 16,
    fontWeight: "500",
  },
  doctor: {
    fontSize: 14,
    marginTop: 4,
    color: "#555",
  },
  location: {
    marginTop: 10,
    fontWeight: "500",
  },
  status: {
    marginTop: 3,
    fontWeight: "700",
    alignSelf: "flex-end",
  },
});

export const addButton = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "#1e88e5",
    borderRadius: 50,
    padding: 13,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6, // Android sombra
    shadowColor: "#000", // iOS sombra
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    zIndex: 999, // Asegura que esté al frente
  },
});

export const switchSelector = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#0066ff",
  },
  tabText: {
    color: "#333",
    fontWeight: "600",
  },
  activeText: {
    color: "#fff",
  },
});

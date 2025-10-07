import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
  },
  Maintitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 15,
    textAlign: "center",
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: -15,
    alignSelf: "center",
  },
  line: {
    height: 2.5,
    backgroundColor: "#000",
    width: "90%",
    alignSelf: "center",
    marginVertical: 12,
    marginBottom: 10,
  },
});

// COMPONENTE DE CITAS
export const cardCitas = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 5,
    padding: 8, // menos padding
    paddingLeft: 15,
    marginVertical: 6, // menos espacio entre tarjetas
    width: "94%", // un poco más angosta
    alignSelf: "center", // 👈 antes "center"
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
  id: {
    color: "#000",
    fontWeight: "700",
    fontSize: 12,
  },
});

export const addButton = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "#1e88e5",
    borderRadius: 50,
    padding: 13,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    zIndex: 999,
    alignSelf: "center",
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

import { StyleSheet } from "react-native";

// === ESTILOS GENERALES ===
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    justifyContent: "flex-start",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  Maintitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2e3a59",
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3b4664",
    marginTop: 12,
    marginBottom: 15,
    textAlign: "center",
  },
  logo: {
    width: 220,
    height: 220,
    resizeMode: "contain",
    marginBottom: -10,
    alignSelf: "center",
  },
  line: {
    height: 2,
    backgroundColor: "#e0e4eb",
    width: "88%",
    alignSelf: "center",
    marginVertical: 14,
  },
});

// === COMPONENTE DE CITAS ===
export const cardCitas = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    width: "92%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#eef0f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  id: {
    color: "#2e3a59",
    fontWeight: "700",
    fontSize: 13,
  },
  date: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e3a59",
  },
  doctor: {
    fontSize: 14,
    marginTop: 4,
    color: "#6b7280",
  },
  location: {
    marginTop: 10,
    fontWeight: "500",
    color: "#3b4664",
  },
  status: {
    marginTop: 6,
    fontWeight: "700",
    alignSelf: "flex-end",
    color: "#2e3a59",
  },
});

// === BOTÓN FLOTANTE ===
export const addButton = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 25,
    backgroundColor: "#2e3a59",
    borderRadius: 50,
    padding: 15,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    zIndex: 999,
    alignSelf: "center",
  },
});

// === SWITCH SELECTOR (TABS) ===
export const switchSelector = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#eef0f5",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
    alignSelf: "center",
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    color: "#3b4664",
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
  },
  activeText: {
    color: "#fff",
    fontWeight: "700",
  },
});

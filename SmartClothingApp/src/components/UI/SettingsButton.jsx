import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { AppStyle } from "../../constants/themes";

const SettingsButton = ({ onPress, title, description }) => {
  return (
    <TouchableOpacity
      style={[styles.selectBtn, { justifyContent: "center" }]}
      onPress={onPress}
    >
      <Text style={[styles.btnText, AppStyle.textPrimary]}>{title}</Text>
      <Text style={[styles.adnText]}>{description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  selectBtn: {
    borderRadius: 10,
    width: "85%",
    height: 90,
    alignItems: "flex-start",
    padding: 15,
    backgroundColor: "#EAF0F8",
    elevation: 4,
  },
  btnText: {
    fontSize: 21,
  },
  adnText: {
    fontSize: 14,
    color: "#7D7A7A",
    paddingTop: 5,
  },
});

export default SettingsButton;

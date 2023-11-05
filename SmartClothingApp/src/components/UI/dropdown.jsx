import { Dropdown } from "react-native-element-dropdown";
import { StyleSheet } from "react-native";
import { useState } from "react";

const MyDropdown = (props) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <>
      <Dropdown
        style={[
          styles.dropdown,
          isFocus && { borderColor: "#1560a4", borderWidth: 2.3 },
          props.style,
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        search
        data={props.data}
        value={props.value}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? props.placeholder : "..."}
        searchPlaceholder="Search..."
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={props.onChange}
      />
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 8,
    backgroundColor: "white",
    paddingLeft: 15,
    fontFamily: "sans-serif",
  },
  placeholderStyle: {
    fontSize: 17,
  },
  selectedTextStyle: {
    fontSize: 17,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default MyDropdown;

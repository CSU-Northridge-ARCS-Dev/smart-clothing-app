import React from "react";
import { Button, Dialog, Portal, Text } from "react-native-paper";
const PromptModal = (props) => {
  return (
    <Portal>
      <Dialog visible={props.visible}>
        {props.title && <Dialog.Title>{props.title}</Dialog.Title>}
        <Dialog.Content>
          <Text variant="bodyMedium">{props.message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button 
            mode="contained" 
            onPress={() => props.prompt(true)}
            testID="yes-sign-out-button"
            >
            Yes
          </Button>
          <Button 
            onPress={() => props.prompt(false)}
            testID="no-sign-out-button"
            >
            No
            </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default PromptModal;

import React from 'react';
import { Text, TextInput, ScrollView } from 'react-native';
import renderer from 'react-test-renderer';
import SigninScreen from '../src/screens/SigninScreen/index.jsx';

// Mock dependencies or Redux actions as needed
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
// mocks userActions.js module 
//    functions: setLoginWithEmail and SetAuthError 
jest.mock('../src/actions/userActions.js', () => ({
  startLoginWithEmail: jest.fn(),
  setAuthError: jest.fn(),
}));

// test Suite
describe('SigninScreen Component', () => {
  // Test Case 1: if component renders correctly
  it('renders correctly', () => {
    // renders SigninScreen with mocked navigation prop and converts it to JSON to save Snapshot
    const tree = renderer.create(<SigninScreen navigation={{ navigate: jest.fn() }} />).toJSON();
    expect(tree).toMatchSnapshot(); // compares last Snapshot to detect changes in component code
  });

  // Test Case 2: Tests if SigninScreen component handles user input correctly
  it('handles user input correctly', () => {
    // renders SigninScreen with mock navigation prop and get instance of component's rendered tree
    const component = renderer.create(<SigninScreen navigation={{ navigate: jest.fn() }} />);
    const instance = component.root;

    // Simulate user input for email and password
    instance.findByType(TextInput).props.onChangeText('test@example.com', 'email');
    instance.findByType(TextInput).props.onChangeText('password123', 'password');

    // Ensure state is updated correctly
    expect(component.getInstance().state.user.email).toEqual('test@example.com');
    expect(component.getInstance().state.user.password).toEqual('password123');
  });
});

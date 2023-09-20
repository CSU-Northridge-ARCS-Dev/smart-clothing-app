import React from 'react';
import { Text, TextInput, ScrollView } from 'react-native';
import renderer from 'react-test-renderer';
import SigninScreen from './SigninScreen/index.jsx';

// Mock dependencies or Redux actions as needed
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('../actions/userActions.js', () => ({
  startLoginWithEmail: jest.fn(),
  setAuthError: jest.fn(),
}));

describe('SigninScreen Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<SigninScreen navigation={{ navigate: jest.fn() }} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('handles user input correctly', () => {
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

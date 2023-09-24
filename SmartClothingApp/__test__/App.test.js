import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App';

describe('App component <App />', () => {
    it('renders correctly', () => {
        const tree = renderer.create(<App />).toJSON(); 
        expect(tree).toMatchSnapshot();
    });
});
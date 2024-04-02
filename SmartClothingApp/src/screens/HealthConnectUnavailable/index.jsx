import React from 'react';
import { Button } from 'react-native';

const HealthConnectUnavailable = () => {
    return (
        <div>
            <h1>Health Connect Unavailable</h1>
            <p>
                We're sorry, but the Health Connect SDK is currently unavailable on your device.
            </p>
            <p>
                This may be due to the following reasons:
            </p>
            <ul>
                <li>Your device does not meet the minimum requirements for the Health Connect SDK.</li>
                <li>The Health Connect SDK is not installed on your device.</li>
                <li>There is an issue with the Health Connect SDK integration.</li>
            </ul>
            <p>
                Please ensure that your device meets the requirements and try again later.
            </p>
            <Button title="Go Back" onPress={() => navigation.goBack()} />
        </div>
    );
};

export default HealthConnectUnavailable;
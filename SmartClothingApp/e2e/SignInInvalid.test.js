describe('Sign-in with Invalid Credentials', () => {
    beforeAll(async () => {
      await device.launchApp({
        newInstance: true,
        launchArgs: { isDetoxTest: true },
      });
    });
  
    it('should display an error for invalid credentials', async () => {
      // Navigate to the sign-in screen and input invalid credentials
        await waitFor(element(by.id('email-input')))
            .toBeVisible()
            .withTimeout(5000);
        await element(by.id('email-input')).tap();
        await element(by.id('email-input')).typeText('invalid@example.com');
        
        await waitFor(element(by.id('password-input')))
            .toBeVisible()
            .whileElement(by.id('scrollViewId')) // Replace with your ScrollView's testID
            .scroll(400, 'down');
        await element(by.id('password-input')).tap();
        await element(by.id('password-input')).typeText('wrongPassword');
    
            // To close the keyboard (temp until figure out how to disable log warnings)
        if (device.getPlatform() === 'android') {
            await device.pressBack();
        }

        // Submit the form
        await waitFor(element(by.id('sign-in-button')))
            .toBeVisible()
            .withTimeout(5000);
        await element(by.id('sign-in-button')).tap();
    
        // Verify that an error message is displayed
        await waitFor(element(by.text('Invalid credentials')))
            .toBeVisible()
            .withTimeout(5000);
        });
  });
  
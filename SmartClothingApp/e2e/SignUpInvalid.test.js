describe('Sign-up with Invalid Credentials', () => {
    beforeAll(async () => {
      await device.launchApp({
        newInstance: true,
        launchArgs: { isDetoxTest: true },
      });
    });
  
    it('should not allow sign up without accepting TOS', async () => {
        // Navigate to the sign-up screen and fill in the details except for TOS
        await new Promise(resolve => setTimeout(resolve, 10000));

        await waitFor(element(by.id('signup-link')))
            .toBeVisible()
            .withTimeout(5000);
        await element(by.id('signup-link')).tap();
    
        await element(by.id('signup-fname-input')).typeText('John');
        await waitFor(element(by.id('signup-lname-input')))
            .toBeVisible()
            .whileElement(by.id('scrollViewId'))
            .scroll(400, 'down');
        await element(by.id('signup-lname-input')).typeText('Doe');
        await element(by.id('signup-email-input')).typeText(`johndoe${Date.now()}@example.com`);
        await element(by.id('signup-password-input')).typeText('password123');
        await element(by.id('signup-repassword-input')).typeText('password123');
    
        if (device.getPlatform() === 'android') {
            await device.pressBack();
        }

        // Attempt to submit the form without accepting TOS
        await element(by.id('signup-submit-button')).tap();
    
        // Verify that an error message is displayed or the user remains on the sign-up page
        await waitFor(element(by.id('signup-submit-button')))
            .toBeVisible()
            .withTimeout(10000); // Adjust according to your app's error handling
        await element(by.id('signup-submit-button')).tap();
        // Optionally, check for a specific error message if your app provides one
        });
  });
  



function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}


describe('Sign-up flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: { isDetoxTest: true }
    });
  });

  it('should allow a user to sign up and delete the account after', async () => {
    
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Wait for the sign-up link to be visible
    await waitFor(element(by.id('signup-link'))).toBeVisible().withTimeout(10000);

    // Introduce a delay (e.g., 2000 milliseconds)
    await new Promise(resolve => setTimeout(resolve, 10000));
    await element(by.id('signup-link')).tap();

    await waitFor(element(by.id('signup-fname-input'))).toBeVisible().withTimeout(5000);
    await element(by.id('signup-fname-input')).typeText('TestFirstName');

    await waitFor(element(by.id('signup-lname-input')))
      .toBeVisible()
      .whileElement(by.id('scrollViewId'))
      .scroll(400, 'down');
    await element(by.id('signup-lname-input')).typeText('TestLastName');

    await waitFor(element(by.id('signup-email-input'))).toBeVisible().withTimeout(5000);
    // const testEmail = `test${new Date().getTime()}@example.com`; // Dynamic email to avoid conflicts
    await element(by.id('signup-email-input')).typeText('testEmail@gmail.com');
    //await element(by.id('signup-email-input')).typeText(`test${Date.now()}@example.com`);

    await waitFor(element(by.id('signup-password-input'))).toBeVisible().withTimeout(5000);
    await element(by.id('signup-password-input')).typeText('password123');

    await waitFor(element(by.id('signup-repassword-input'))).toBeVisible().withTimeout(5000);
    await element(by.id('signup-repassword-input')).typeText('password123');

    if (device.getPlatform() === 'android') {
      await device.pressBack(); // to close the keyboard
    }

    // Accepting terms and conditions
    await element(by.id('signup-terms-checkbox')).tap();
    //await element(by.id('signup-terms-checkbox')).tap();

    // Use the delay function before scrolling
    await delay(30000); // Waits for 50 seconds

    await waitFor(element(by.id('signup-terms-modal')))
      .toBeVisible()
      .whileElement(by.id('scrollViewModal'))
      .scrollTo('bottom');
      //.scroll(400, 'down');
    //await element(by.id('signup-terms-modal-checkbox')).tap();
    await element(by.id('signup-terms-checkbox')).tap();

    //  await waitFor(element(by.id('signup-terms-modal'))).toBeVisible().withTimeout(5000);

    await element(by.id('close-modal-button')).tap();



    // Attempt to scroll a significant distance down
    //await element(by.id('scrollViewModal')).scroll(200, 'down');

    // await waitFor(element(by.id('signup-terms-modal-checkbox')))
    //   .toBeVisible()
    //   .whileElement(by.id('scrollViewModal'))
    //   .scroll(400, 'down');

    //await element(by.id('signup-terms-modal-checkbox')).tap();

    await waitFor(element(by.id('signup-submit-button'))).toBeVisible().withTimeout(5000);
    await element(by.id('signup-submit-button')).tap();

    // Assuming you navigate to a "success" screen after sign up
    await waitFor(element(by.id('signup-success-message'))).toBeVisible().withTimeout(10000);

    // Here, you should add validation that the sign-up was successful
    // For example, checking for a welcome message or successful navigation

    // **Teardown - Deleting the test account**
    // This step assumes you have a mechanism to trigger account deletion via an API or direct backend call
    // The implementation of this would be specific to your backend and not provided here
  }, 300000);

  afterAll(async () => {
    // Cleanup: delete the account if your test created one.
    // This is pseudocode and would need to be adapted to your application's context.
    // await deleteTestAccount(testEmail, 'password123');
  });
});

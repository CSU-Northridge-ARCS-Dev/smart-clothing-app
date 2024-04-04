describe('Sign in flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should allow a user to sign in', async () => {
    // Wait for email input to be visible
    await waitFor(element(by.id('email-input')))
      .toBeVisible()
      .withTimeout(50000);
    await element(by.id('email-input')).tap();
    await element(by.id('email-input')).typeText('test5@gmail.com');

    // Wait for password input to be visible
    // await waitFor(element(by.id('password-input')))
    //   .toBeVisible()
    //   .withTimeout(5000);

     // Scroll down to ensure password input is visible
    await waitFor(element(by.id('password-input')))
     .toBeVisible()
     .whileElement(by.id('scrollViewId')) // Replace with your ScrollView's testID
     .scroll(200, 'down');

    await element(by.id('password-input')).tap();
    await element(by.id('password-input')).typeText('password123');

    // Wait for the Sign In button to be visible
    await waitFor(element(by.id('sign-in-button')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('sign-in-button')).tap();

    // Wait for the greeting text to be visible on the home screen
    // await waitFor(element(by.id('greeting-text')))
    //   .toBeVisible()
    //   .withTimeout(500000);

    // // Optionally, you can capture the greeting text and assert its content
    // const greetingText = await element(by.id('greeting-text')).getAttributes();
    // expect(greetingText.text).toContain('Hello,');

  });
});

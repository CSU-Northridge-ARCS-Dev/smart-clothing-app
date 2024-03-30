describe('Sign in flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should allow a user to sign in', async () => {
    // Wait for email input to be visible
    await waitFor(element(by.id('email-input')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('email-input')).tap();
    await element(by.id('email-input')).typeText('user@example.com');

    // Wait for password input to be visible
    await waitFor(element(by.id('password-input')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('password-input')).tap();
    await element(by.id('password-input')).typeText('password123');

    // Wait for the Sign In button to be visible
    await waitFor(element(by.id('sign-in-button')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('sign-in-button')).tap();

    // Here, add assertions to check if the sign-in was successful.
    // This could be waiting for a welcome message, user avatar, or navigating to the home screen.
    // Example:
    // await waitFor(element(by.id('welcome-message')))
    //   .toBeVisible()
    //   .withTimeout(5000);
  });
});

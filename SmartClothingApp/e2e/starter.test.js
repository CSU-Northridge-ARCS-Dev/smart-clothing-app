describe('Sign in flow', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
    //await device.launchApp({newInstance: true});
  });

  it('should allow a user to sign in', async () => {
    // Enter email
    await element(by.id('email-input')).tap();
    await element(by.id('email-input')).typeText('user@example.com');

    // Enter password
    await element(by.id('password-input')).tap();
    await element(by.id('password-input')).typeText('password123');

    // Tap the Sign In button
    await element(by.id('sign-in-button')).tap();

    // You can add more checks here to confirm that the login was successful
    // For example, checking for an element that's only visible when the user is logged in
  });
});
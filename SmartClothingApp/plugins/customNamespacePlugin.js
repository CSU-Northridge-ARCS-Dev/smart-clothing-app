const { withAndroidManifest, withAppBuildGradle } = require('@expo/config-plugins');

// Define withCustomNamespace function
function withCustomNamespace(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // Remove the package attribute from AndroidManifest.xml
    if (manifest.manifest.$['package']) {
      delete manifest.manifest.$['package'];
    }

    return config;
  });
}

// Define withCustomBuildGradle function
function withCustomBuildGradle(config) {
    return withAppBuildGradle(config, (config) => {
      let contents = config.modResults.contents;
  
      // Log the current contents for debugging
      // console.log('Current build.gradle contents:', contents);
  
      // Updated regex to match "namespace" with or without equals sign
      const regex = /namespace\s*=?\s*['"]([^'"]*)['"]/;
  
      // Check if the regex matches
    //   const match = contents.match(regex);
    //   if (match) {
    //     console.log('Matched namespace:', match[1]); // Log the current namespace
    //   } else {
    //     console.log('No namespace match found');
    //   }
  
      // Replace the namespace, whether it has an equals sign or not
      contents = contents.replace(regex, 'namespace "com.arcs.smartclothingapp"');
      config.modResults.contents = contents;
  
      // Log the updated contents
      console.log('Updated build.gradle contents:', contents);
  
      return config;
    });
}
  
  
  

// Chain the plugins together
function withCustomConfig(config) {
  config = withCustomNamespace(config);
  config = withCustomBuildGradle(config);
  return config;
}

// Export the chained configuration as the plugin
module.exports = withCustomConfig;

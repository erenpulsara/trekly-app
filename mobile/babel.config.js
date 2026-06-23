module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        // Force hermes-v0 transform profile so private class fields (#field)
        // are always compiled away by Babel. hermes-v1 skips this and relies
        // on native Hermes support, which isn't stable on SDK 54.
        { unstable_transformProfile: 'hermes-v0' },
      ],
    ],
  };
};

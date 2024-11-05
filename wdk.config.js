const { consumedFacets, producedFacets } = require('./facets');

module.exports = {
  wrapper: './wrapper.tsx',
  onCreateBabelConfig: ({ baseConfig }) => {
    baseConfig.presets.push('@babel/preset-typescript');
    baseConfig.plugins.push('@babel/plugin-proposal-optional-chaining');

    return baseConfig;
  },
  onCreateWebpackConfig: ({ mode, baseConfig }) => {
    if (mode === 'production') {
      baseConfig.externals['@sevone/insight-connect'] = {
        root: 'insightConnect',
        commonjs2: '@sevone/insight-connect',
        commonjs: '@sevone/insight-connect',
        amd: '@sevone/insight-connect'
      };
    }

    return baseConfig;
  },
  onCreateWidgetMeta: ({ baseMeta }) => {
    const customMeta = { ...baseMeta };

    customMeta.consumedFacets = Object.values(consumedFacets);
    customMeta.producedFacets = Object.values(producedFacets);

    return customMeta;
  }
};

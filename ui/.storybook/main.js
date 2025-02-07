module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-postcss",
    "@storybook/preset-create-react-app",
    "storybook-zeplin/register"    
  ],
  "framework": "@storybook/react",
  "staticDirs": ['../src/shared/css', '../public']
}
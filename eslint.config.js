import antfu from '@antfu/eslint-config'

export default antfu({
  settings: {
    'import/core-modules': ['vue-router/auto', 'vue-router/auto-routes'],
  },
  rules: {
    'no-console': 'warn',
    'no-unused-expressions': 'off',
    'ts/no-unused-expressions': 'off',
  },
})

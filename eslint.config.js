import antfu from '@antfu/eslint-config'

export default antfu({
  settings: {
    'import/core-modules': ['vue-router/auto', 'vue-router/auto-routes'],
  },
})

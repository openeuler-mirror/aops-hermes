import Workflow from '@/views/diagnosis/Workflow.vue';
import MyPageHeaderWrapper from '@/views/utils/MyPageHeaderWrapper';
import DescriptionTips from '@/components/DescriptionTips';
import VueRouter from 'vue-router';
import {mount, createLocalVue} from '@vue/test-utils';
import {asyncRouterMap} from '@/config/router.config.js';
const localVue = createLocalVue();
localVue.use(VueRouter);
describe('workflow.component.test', () => {
  const router = new VueRouter({routes: asyncRouterMap});
  const wrapper = mount(Workflow, {localVue, router});
  // 测试子组件是否存在
  it('Test whether the subcomponent exists', () => {
    expect(wrapper.findComponent(MyPageHeaderWrapper).exists()).toBe(true);
    expect(wrapper.findComponent(DescriptionTips).exists()).toBe(true);
  });
  // 测试组件名是否规范
  it('Test whether the component name is standardized', () => {
    expect(wrapper.name()).toBe('Workflow');
  });

  // 测试刷新工作流表loading状态是否为true
  it('Test table refresh', () => {
    const tableRefresh = wrapper.find({ref: 'tableRefresh'});
    tableRefresh.trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.tableIsLoading).toEqual(true);
    });
  });

  // 测试刷新APP列表loading状态是否为true
  it('Test app refresh', () => {
    const appRefresh = wrapper.find({ref: 'appRefresh'});
    appRefresh.trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.appIsLoading).toEqual(true);
    });
  });
});

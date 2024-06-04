<script lang="ts" setup>
import GlobalFooter from '@/components/GlobalFooter.vue'
</script>

<template>
  <div id="userLayout" class="user-layout-wrapper">
    <div class="container">
      <a-row style="height: 100vh" type="flex">
        <a-col class="left-side" :xs="{ span: 24, order: 2 }" :lg="{ span: 12, order: 1 }">
          <img src="@/assets/imgs/loginPage.png">
        </a-col>
        <a-col class="right-side" :xs="{ span: 24, order: 1 }" :lg="{ span: 12, order: 2 }">
          <header class="header">
            <a href="/">
              <img src="@/assets/imgs/vertical-left.png" class="logo" alt="logo">
            </a>
            <div class="desc">
              欢迎来到A-Ops系统
            </div>
          </header>
          <router-view class="main" />
          <footer class="footer">
            <GlobalFooter />
          </footer>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<style lang="less" scoped>
#userLayout.user-layout-wrapper {
  height: 100%;

  .container {
    width: 100%;
    min-height: 100%;
    background-size: 100%;
    position: relative;

    .left-side {
      height: 100%;
      background: #edeff3;
      img {
        width: 500px;
        display: block;
        position: relative;
        margin: auto;
        top: 50vh;
        margin-top: -150px;
      }
    }
    .right-side {
      height: 100%;
      background: #fff;
      padding-top: 18vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      .header {
        .logo {
          height: 80px;
          vertical-align: top;
          border-style: none;
        }

        .desc {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
          margin-top: 12px;
          margin-bottom: 40px;
        }
      }
      .main {
        width: 368px;
        margin: 0 auto;
      }
    }

    .footer {
      bottom: 0;
      padding: 0 16px;
      margin: 30px 0 10px 0;
      text-align: center;
    }

    a {
      text-decoration: none;
    }
  }
}
</style>

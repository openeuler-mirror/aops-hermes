<script lang="ts" setup>
import GlobalFooter from '@/components/GlobalFooter.vue'
import LangCheck from '@/components/GlobalHeader/LangCheck.vue'
</script>

<template>
  <div id="userLayout" class="user-layout-wrapper">
    <div class="container">
      <LangCheck class="lang" />      <a-row style="height: 100vh" type="flex">
        <a-col class="left-side" :xs="{ span: 24, order: 2 }" :lg="{ span: 12, order: 1 }">
          <img src="@/assets/imgs/loginPage.png">
        </a-col>
        <a-col class="right-side" :xs="{ span: 24, order: 1 }" :lg="{ span: 12, order: 2 }">
          <header class="header">
            <a href="/">
              <div class="logo">
                <img src="@/assets/imgs/openeuler_logo.png" class="openeuler-logo" alt="logo">
                <img src="@/assets/imgs/openeuler.png" class="openeuler" alt="logo">
              </div>
            </a>
            <div class="desc">
              {{ $t('common.welcomeAops') }}
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

    .lang {
      position: absolute;
      right: 20px;
      top: 10px;
      z-index: 2;
    }

    .left-side {
      height: 100%;
      background:var(--background-third-color);

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
      background:var(--background-secondary-color);

      padding-top: 16vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      .header {
        .logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          .openeuler-logo {
            height: 50px
          }
          .openeuler {
            height: 30px;
            filter: var(--openeuler-logo-filter)
          }

        }

        .desc {
          font-size: 14px;
          color: var(--text-color);
          margin-top: 12px;
          margin-bottom: 40px;
        }
      }
      .main {
        width: 400px;
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

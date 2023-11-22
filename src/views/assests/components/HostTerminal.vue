<template>
  <div>
    <div class="ssh-container" ref="terminal"></div>
  </div>
</template>

<script>
import axios from 'axios';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import {debounce} from 'lodash';
const packStdin = (data) =>
  JSON.stringify({
    Op: 'stdin',
    Data: data
  });

const packResize = (cols, rows) =>
  JSON.stringify({
    Op: 'resize',
    Cols: cols,
    Rows: rows
  });
export default {
  name: 'HostTerminal',
  components: {
    Terminal
  },
  data() {
    return {
      initText: '连接中...\r\n',
      first: true,
      term: null,
      fitAddon: null,
      ws: null,
      socketUrl: 'ws://127.0.0.1:92',
      // socketUrl: 'ws://172.168.88.197:92',
      option: {
        lineHeight: 1.0,
        cursorBlink: true,
        cursorStyle: 'block', // 光标样式 'block' | 'underline' | 'bar'
        fontSize: 18,
        fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
        theme: {
          background: '#181d28'
        },
        cols: 30 // 初始化的时候不要设置fit，设置col为较小值（最小为可展示initText初始文字即可）方便屏幕缩放
      }
    };
  },
  methods: {
    changeInfo(data) {
      axios({
        method: 'post',
        url: 'http://127.0.0.1:8080/info',
        // url: 'http://172.168.88.197:8080/info',
        data: data
      }).then((res) => {
        // 前端发起请求更改ssh连接对象后重新连接socket
        this.initSocket();
      });
    },
    isWsOpen() {
      return this.ws && this.ws.readyState === 1;
    },
    initTerm() {
      this.term = new Terminal(this.option);
      this.fitAddon = new FitAddon();
      this.term.loadAddon(this.fitAddon);
      this.term.open(this.$refs.terminal);
      // this.fitAddon.fit() // 初始化的时候不要使用fit
      setTimeout(() => {
        this.fitAddon.fit();
      }, 500); // 必须延时处理
    },
    onTerminalKeyPress() {
      this.term.onData((data) => {
        this.isWsOpen() && this.ws.send(packStdin(data));
      });
    },
    // resize 相关
    resizeRemoteTerminal() {
      const {cols, rows} = this.term;
      // 调整后端终端大小 使后端与前端终端大小一致
      this.isWsOpen() && this.ws.send(packResize(cols, rows));
    },
    onResize: debounce(function () {
      this.fitAddon.fit();
    }, 500),
    onTerminalResize() {
      window.addEventListener('resize', this.onResize);
      this.term.onResize(this.resizeRemoteTerminal);
    },
    removeResizeListener() {
      window.removeEventListener('resize', this.onResize);
    },
    // socket
    initSocket() {
      this.term.write(this.initText);
      this.ws = new WebSocket(this.socketUrl, ['OK']);
      this.onOpenSocket();
      this.onCloseSocket();
      this.onErrorSocket();
      this.onMessageSocket();
    },
    // 打开连接
    onOpenSocket() {
      this.ws.onopen = () => {
        this.term.reset();
        setTimeout(() => {
          this.resizeRemoteTerminal();
        }, 500);
      };
    },
    // 关闭连接
    onCloseSocket() {
      this.ws.onclose = () => {
        this.term.write('未连接， 3秒后重连...\r\n');
        setTimeout(() => {
          this.initSocket();
        }, 3000);
      };
    },
    // 连接错误
    onErrorSocket() {
      this.ws.onerror = () => {
        this.$message.error('websoket连接失败，请刷新！');
      };
    },
    // 接收消息
    onMessageSocket() {
      this.ws.onmessage = (res) => {
        const data = res.data;
        const term = this.term;
        // 第一次连接成功将 initText 清空
        if (this.first) {
          this.first = false;
          term.reset();
          term.element && term.focus();
          this.resizeRemoteTerminal();
        }
        term.write(data);
      };
    }
  },
  created() {},
  mounted() {
    this.initTerm();
    this.initSocket();

    this.onTerminalResize();
    this.onTerminalKeyPress();
  },
  beforeDestroy() {
    this.removeResizeListener();
    this.term && this.term.dispose();
  }
};
</script>

<style lang="scss">
.ssh-container {
  overflow: hidden;
  height: 60vh;
  border-radius: 4px;
  background: rgb(24, 29, 40);
  padding: 0px;
  color: rgb(255, 255, 255);
  .xterm-scroll-area::-webkit-scrollbar-thumb {
    background-color: blue;
    /* 滚动条的背景颜色 */
  }
}
</style>

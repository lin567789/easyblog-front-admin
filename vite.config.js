import { defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
// 根据api匹配，路由前置加上api
export default defineConfig({
  plugins: [vue()],
  server: {
    hmr: true,
    port: 3001,
    proxy: {
      '/api': {
        target: "http://localhost:8081/",  //目标代理接口地址
        secure: false,
        changeOrigin: true,//开启代理，在本地创建一个虚拟服务器
        pathRewrite: {
          '^/api':'/api',
        },
      },
    },
  },
  resolve: {
    // 配置路径别名,即使用 @表示路由在src层,即引路径时不需要../../
  //   alias: {
  //    '@': path.resolve(__dirname,'./src'),
  //  },
  },
})

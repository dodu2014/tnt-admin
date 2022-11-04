# vue vite 加载本地证书，开发模式开启 https

> 注意：不同机器生成的证书不一致，需要单独生成

## 通过 mkcert 创建本地证书

1. 安装 mkcert

   - 安装方式：npm
   - 包地址：[https://www.npmjs.com/package/mkcert](https://www.npmjs.com/package/mkcert)
   - 安装命令：`npm install -g mkcert`
   - 判断是否安装成功，输入命令：`mkcert --version`，如果能看到版本号，说明安装成功，可以进行下一步

2. 生成证书

   - 生成一个 ca 证书，`mkcert create-ca`，生成之后会看到一个 ca.crt 和 ca.key 文件
   - 利用刚刚生成的 ca 证书，再生成 cert 证书，`mkcert create-cert`，会在刚刚的路径下生成 cert.crt 和 cert.key 文件

3. 怎么使用（关键）

   需要将刚刚生成的 ca.crt 安装到电脑受信任的根证书中

   1. mac 安装方式

      - 双击 ca.cert，在弹出的界面中选择刚刚的 Test CA，如下图

        ![img](https://img-blog.csdnimg.cn/8f3c5e23343442ab8fb0f0c59f9c17ed.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA5r2H5rSS5ZOlR0c=,size_20,color_FFFFFF,t_70,g_se,x_16)

      - 双击上图中的 Test CA 证书，出现下面的界面，选择“信任”，然后选择“始终信任”，关闭窗口，需要输入密码确认即可

        ![img](https://img-blog.csdnimg.cn/91478d96bba64f6c802ca301af107e4d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA5r2H5rSS5ZOlR0c=,size_17,color_FFFFFF,t_70,g_se,x_16)

   2. window 安装方式

      - 直接双击刚刚生成的 ca.crt 文件，弹出的界面中选择安装证书

        ![img](https://img-blog.csdnimg.cn/468818a202be4cb287565edbeb2155f7.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA5r2H5rSS5ZOlR0c=,size_16,color_FFFFFF,t_70,g_se,x_16)

      - 下一步弹窗中，选择“当前用户”或“本地计算机”均可，主要是下一步，选择“将所有的证书都放入下列存储”，并且选择为“受信任的根证书颁发机构”

        ![img](https://img-blog.csdnimg.cn/484d0d793f7543129aed1a8bdc4a1f66.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA5r2H5rSS5ZOlR0c=,size_20,color_FFFFFF,t_70,g_se,x_16)

      - 一路点击完成，最后弹出点击“是”即可，到此证书安装成功了。

   3. 在 vue 中使用刚刚的证书

      - 将刚刚生成的 cert.crt 和 cert.key 两个拷贝到项目的 src/ssl 文件夹中，没有可以新建一个 ssl 目录

      - vue2 在 vue.config.js 中写入以下关键代码

        ```js
        const path = require('path')
        const fs = require('fs')

        module.exports = {
          devServer: {
            open: true,
            https: {
              cert: fs.readFileSync(path.join(__dirname, 'src/ssl/cert.crt')),
              key: fs.readFileSync(path.join(__dirname, 'src/ssl/cert.key')),
            },
          },
        }
        ```

      - vue3 在 vite.config.js 中写入以下关键代码

        ```js
        import { defineConfig } from 'vite'
        import vue from '@vitejs/plugin-vue'

        const fs = require('fs')
        const path = require('path')

        // https://vitejs.dev/config/
        export default defineConfig({
          plugins: [vue()],
          resolve: {
            alias: {
              '@': path.join(__dirname, 'src'),
            },
          },
          server: {
            open: true,
            https: {
              // 主要是下面两行的配置文件，不要忘记引入 fs 和 path 两个对象
              cert: fs.readFileSync(path.join(__dirname, 'src/ssl/cert.crt')),
              key: fs.readFileSync(path.join(__dirname, 'src/ssl/cert.key')),
            },
          },
        })
        ```

   4. 到此，证书生成安装结束了，项目跑起来就 ok 了，感谢各位看官看到了最后，文章虽然啰嗦，但是“细”啊。

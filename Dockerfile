# 选择之前下载的node基础镜像 node:<version>
FROM node:9
#将当前文件夹下所有文件加入需要制作的镜像中, 在 'manage' 文件夹中.
#ADD . /manage
#  下载所需要的包
#RUN cd /manage;
# RUN cd /home
# RUN mkdir app

# COPY . /home/app

# WORKDIR /home/app
# 定义程序默认端口
COPY . /app
EXPOSE 3004
# RUN cd /home/app
# 运行程序命令(manage是ADD添加的文件夹名称, server.js是自己的程序启动入口文件)
CMD ["node","./index.js"]
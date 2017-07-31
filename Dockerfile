FROM node:latest
MAINTAINER 17 <https://github.com/miss61008596>
# copy 程序代码到容器的下
ADD ./production ./testServer/production
ADD ./package.json ./testServer/package.json
#install ntp
#RUN apt-get upgrade -y
#RUN apt-get update -y && apt-get install -y --no-install-recommends apt-utils
#RUN apt-get install -y ntp
#RUN apt-get install -y ntpdate
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime
#RUN ntpdate -s 202.120.2.101

RUN cd /testServer; npm install --production; npm install forever -g

EXPOSE 3000
EXPOSE 3001

CMD ["forever", "/testServer/production/server.js"]
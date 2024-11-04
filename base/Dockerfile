FROM node:latest
MAINTAINER lucknell <lucknell3@gmail.com>
ENV TZ "America/Los_Angeles"
RUN mkdir -p /src/bot/ && mkdir -p /home/itezz
WORKDIR /src/bot
ENV LC_ALL en_US.utf8
ENV LANG en_US.utf8
ENV LANGUAGE en_US.utf8
RUN npm install --save gtts discord.js @discordjs/opus utf8 luxon cassandra-driver

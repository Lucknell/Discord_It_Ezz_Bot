FROM node:buster
MAINTAINER <lucknell3@gmail.com>
RUN mkdir -p /src/bot/
WORKDIR /src/bot
COPY . /src/bot
ENV LC_ALL en_US.utf8
ENV LANG en_US.utf8
ENV LANGUAGE en_US.utf8
RUN npm install gtts discord.js @discordjs/opus utf8
RUN apt update
RUN apt install -y ffmpeg locales locales-all
CMD ["node", "it-ezz.js"] 